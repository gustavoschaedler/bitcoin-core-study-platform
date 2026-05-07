"""Address lookup with rate-limit and bounded scantxoutset usage.

Originally any client could trigger a full UTXO-set scan via ``?refresh=true``,
which is expensive on Signet. We now:

  * rate-limit per-IP (config.SEARCH_RATE_PER_MIN);
  * always serve from Redis cache when possible;
  * gate ``refresh=true`` behind a stricter rate limit;
  * skip ``scantxoutset`` when wallets already cover the address.
"""

from __future__ import annotations

import json
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request

from ..core import cache, config, rpc, validators
from ..core.security import client_ip

router = APIRouter()


def _empty_stats() -> dict[str, Any]:
    return {
        "funded_txo_count": 0,
        "funded_txo_sum": 0.0,
        "spent_txo_count": 0,
        "spent_txo_sum": 0.0,
        "tx_count": 0,
    }


def _classify_address(validation: dict[str, Any]) -> str:
    witness_program = validation.get("witness_program") or ""
    if validation.get("iswitness") and validation.get("witness_version") == 0 and len(witness_program) == 40:
        return "P2WPKH"
    if validation.get("iswitness") and validation.get("witness_version") == 0 and len(witness_program) == 64:
        return "P2WSH"
    if validation.get("iswitness") and validation.get("witness_version") == 1:
        return "P2TR"
    if validation.get("isscript"):
        return "P2SH"
    return "P2PKH"


def _raw_tx_summary(tx_id: str, address: str, source: str, amount: Any = None, height: Any = None) -> dict[str, Any] | None:
    try:
        raw = rpc.call("getrawtransaction", [tx_id, True])
    except HTTPException:
        return None

    funded_outputs = []
    funded_sum = Decimal("0")
    for output in raw.get("vout", []):
        script = output.get("scriptPubKey", {}) or {}
        if script.get("address") != address:
            continue
        value = Decimal(str(output.get("value", 0)))
        funded_sum += value
        funded_outputs.append(
            {
                "n": output.get("n"),
                "value": float(value),
                "type": script.get("type"),
            }
        )

    spent_inputs = []
    spent_sum = Decimal("0")
    for vin in raw.get("vin", []):
        if vin.get("txid") is None or vin.get("vout") is None:
            continue
        try:
            prev = rpc.call("getrawtransaction", [vin["txid"], True])
            prevout = prev.get("vout", [])[int(vin["vout"])]
            script = prevout.get("scriptPubKey", {}) or {}
            if script.get("address") != address:
                continue
            value = Decimal(str(prevout.get("value", 0)))
            spent_sum += value
            spent_inputs.append(
                {
                    "txid": vin.get("txid"),
                    "vout": vin.get("vout"),
                    "value": float(value),
                }
            )
        except (HTTPException, IndexError, ValueError):
            continue

    block_height = height
    block_time = raw.get("time")
    block_hash = raw.get("blockhash")
    if block_hash:
        try:
            header = rpc.call("getblockheader", [block_hash, True])
            block_height = header.get("height", block_height)
            block_time = header.get("time", block_time)
        except HTTPException:
            pass

    return {
        "txid": tx_id,
        "source": source,
        "status": "confirmed" if block_hash or height else "mempool",
        "block_height": block_height,
        "block_time": block_time,
        "vin": len(raw.get("vin", [])),
        "vout": len(raw.get("vout", [])),
        "vsize": raw.get("vsize"),
        "funded_outputs": funded_outputs,
        "spent_inputs": spent_inputs,
        "value_to_address": float(funded_sum),
        "value_from_address": float(spent_sum),
        "amount": amount,
    }


@router.get("/api/search/address/{address}")
def search_address(address: str, request: Request, refresh: bool = Query(False)) -> dict[str, Any]:
    ip = client_ip(request)
    cache.rate_limit(f"search:{ip}", config.SEARCH_RATE_PER_MIN)
    if refresh:
        # cache-bust is more expensive: gate it tighter.
        cache.rate_limit(f"search-refresh:{ip}", max(1, config.SEARCH_RATE_PER_MIN // 2))

    address = address.strip()
    if not validators.ADDRESS_RE.fullmatch(address):
        raise HTTPException(status_code=400, detail="Invalid address")

    validation = rpc.call("validateaddress", [address])
    if validation.get("isvalid") is False:
        raise HTTPException(status_code=400, detail="Invalid address")

    cache_key = f"address-search:{address}"
    cached = cache.client.get(cache_key)
    if cached and not refresh:
        return json.loads(cached)

    matches: list[dict[str, Any]] = []
    verbose_mempool = rpc.call("getrawmempool", [True])
    for tx_id in verbose_mempool.keys():
        if len(matches) >= 25:
            break
        try:
            raw = rpc.call("getrawtransaction", [tx_id, True])
            outputs = raw.get("vout", [])
            output_matches = [
                {
                    "n": output.get("n"),
                    "value": output.get("value"),
                    "type": output.get("scriptPubKey", {}).get("type"),
                }
                for output in outputs
                if output.get("scriptPubKey", {}).get("address") == address
            ]
            if output_matches:
                matches.append({"source": "mempool", "txid": tx_id, "outputs": output_matches})
        except HTTPException:
            continue

    wallet_matches: list[dict[str, Any]] = []
    wallet_utxos: list[dict[str, Any]] = []
    try:
        loaded = set(rpc.call("listwallets"))
        for wallet in loaded:
            if not config.WALLET_NAME_RE.fullmatch(wallet):
                continue
            try:
                received = rpc.call("listreceivedbyaddress", [0, True, True], wallet=wallet)
                for row in received:
                    if row.get("address") == address:
                        wallet_matches.append(
                            {
                                "source": "wallet",
                                "wallet": wallet,
                                "amount": row.get("amount"),
                                "confirmations": row.get("confirmations"),
                                "label": row.get("label", ""),
                                "txids": row.get("txids", []),
                            }
                        )
                for item in rpc.call("listunspent", [0, 9999999, [address]], wallet=wallet):
                    wallet_utxos.append(
                        {
                            "txid": item.get("txid"),
                            "vout": item.get("vout"),
                            "amount": item.get("amount"),
                            "height": item.get("height"),
                            "confirmations": item.get("confirmations"),
                            "wallet": wallet,
                        }
                    )
            except HTTPException:
                continue
    except HTTPException:
        pass

    utxos: list[dict[str, Any]] = []
    if wallet_utxos:
        utxos = wallet_utxos[:25]
    else:
        try:
            scan = rpc.call(
                "scantxoutset", ["start", [{"desc": f"addr({address})"}]], timeout=60
            )
            utxos = [
                {
                    "txid": item.get("txid"),
                    "vout": item.get("vout"),
                    "amount": item.get("amount"),
                    "height": item.get("height"),
                }
                for item in scan.get("unspents", [])
            ][:25]
        except HTTPException:
            utxos = []

    summaries: dict[str, dict[str, Any]] = {}
    for match in matches:
        summary = _raw_tx_summary(match["txid"], address, "mempool")
        if summary:
            summaries[match["txid"]] = summary
    for match in wallet_matches:
        for tx_id in match.get("txids", []):
            summary = _raw_tx_summary(
                tx_id, address, f"wallet {match.get('wallet')}", match.get("amount")
            )
            if summary:
                summaries[tx_id] = summary
    for utxo in utxos:
        tx_id = utxo.get("txid")
        if not tx_id:
            continue
        summary = summaries.get(tx_id) or _raw_tx_summary(
            tx_id, address, "utxo", utxo.get("amount"), utxo.get("height")
        )
        if summary:
            summary["source"] = "utxo"
            summary["amount"] = utxo.get("amount")
            summary["block_height"] = summary.get("block_height") or utxo.get("height")
            summaries[tx_id] = summary

    transactions = sorted(
        summaries.values(),
        key=lambda item: (
            item.get("block_height") or 10**12,
            item.get("block_time") or 10**12,
            item.get("txid") or "",
        ),
        reverse=True,
    )

    chain_stats = _empty_stats()
    mempool_stats = _empty_stats()
    for tx in transactions:
        stats = mempool_stats if tx.get("status") == "mempool" else chain_stats
        stats["tx_count"] += 1
        stats["funded_txo_count"] += len(tx.get("funded_outputs", []))
        stats["funded_txo_sum"] += float(tx.get("value_to_address") or 0)
        stats["spent_txo_count"] += len(tx.get("spent_inputs", []))
        stats["spent_txo_sum"] += float(tx.get("value_from_address") or 0)

    result = {
        "address": address,
        "address_type": _classify_address(validation),
        "script_pubkey": validation.get("scriptPubKey"),
        "mempool": matches,
        "wallets": wallet_matches,
        "utxos": utxos,
        "lookup_method": "wallet" if wallet_utxos else "utxo_scan",
        "transactions": transactions,
        "chain_stats": chain_stats,
        "mempool_stats": mempool_stats,
        "balance": round(
            chain_stats["funded_txo_sum"]
            - chain_stats["spent_txo_sum"]
            + mempool_stats["funded_txo_sum"]
            - mempool_stats["spent_txo_sum"],
            8,
        ),
    }
    cache.client.setex(cache_key, 60, json.dumps(result))
    return result
