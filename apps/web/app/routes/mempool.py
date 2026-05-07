"""Mempool API: list, txs, blocks, projected blocks, tx detail."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request

from ..core import cache, config, rpc, validators
from ..core.security import client_ip
from .blockchain import tx_list_item

router = APIRouter()


@router.get("/api/mempool")
def mempool_info() -> Any:
    return rpc.call("getmempoolinfo")


@router.get("/api/mempool/raw")
def mempool_raw(verbose: bool = False) -> Any:
    return rpc.call("getrawmempool", [verbose])


@router.get("/api/mempool/txs")
def mempool_txs(limit: int = Query(80, ge=1, le=300)) -> dict[str, Any]:
    verbose_mempool = rpc.call("getrawmempool", [True])
    current_tip = int(rpc.call("getblockchaininfo").get("blocks") or 0)

    def entry_fee_rate(item: tuple[str, dict[str, Any]]) -> float:
        entry = item[1]
        fee_btc = (entry.get("fees") or {}).get("base")
        vsize = entry.get("vsize") or 0
        if fee_btc is None or not vsize:
            return 0
        return (float(fee_btc) * 100_000_000) / float(vsize)

    projected_heights: dict[str, int] = {}
    projected_vbytes = 0
    for tx_id, entry in sorted(verbose_mempool.items(), key=entry_fee_rate, reverse=True):
        block_index = int(projected_vbytes // 1_000_000) + 1
        projected_heights[tx_id] = current_tip + block_index
        projected_vbytes += int(entry.get("vsize") or 0)

    txids = [
        tx_id
        for tx_id, _ in sorted(
            verbose_mempool.items(),
            key=lambda item: (int(item[1].get("time") or 0), item[0]),
            reverse=True,
        )
    ][:limit]
    txs = []
    for tx_id in txids:
        try:
            entry = verbose_mempool[tx_id]
            raw = rpc.call("getrawtransaction", [tx_id, True])
            if raw.get("blockhash") or raw.get("confirmations") or raw.get("in_active_chain"):
                continue
            outputs = raw.get("vout", [])
            value_out = sum(float(v.get("value", 0)) for v in outputs)
            addresses = sorted(
                {
                    output.get("scriptPubKey", {}).get("address")
                    for output in outputs
                    if output.get("scriptPubKey", {}).get("address")
                }
            )
            fee_btc = entry.get("fees", {}).get("base")
            vsize = entry.get("vsize") or 0
            fee_rate = None
            if fee_btc is not None and vsize:
                fee_rate = round((float(fee_btc) * 100_000_000) / vsize, 2)
            txs.append(
                {
                    "txid": tx_id,
                    "vsize": vsize,
                    "weight": entry.get("weight"),
                    "fee": fee_btc,
                    "fee_rate": fee_rate,
                    "modified_fee": entry.get("fees", {}).get("modified"),
                    "time": entry.get("time"),
                    "height": entry.get("height"),
                    "projected_block_height": projected_heights.get(tx_id),
                    "depends": entry.get("depends", []),
                    "spentby": entry.get("spentby", []),
                    "vin": len(raw.get("vin", [])),
                    "vout": len(outputs),
                    "value_out": round(value_out, 8),
                    "addresses": addresses[:20],
                }
            )
        except HTTPException as exc:
            txs.append({"txid": tx_id, "error": exc.detail})
    return {"count": len(txs), "txs": txs}


@router.get("/api/mempool/tx/{tx_id}")
def mempool_tx_detail(tx_id: str, request: Request) -> dict[str, Any]:
    cache.rate_limit(f"mempool-tx:{client_ip(request)}", config.MEMPOOL_DETAIL_RATE_PER_MIN)
    tx_id = validators.txid(tx_id)
    try:
        raw = rpc.call("getrawtransaction", [tx_id, True])
    except HTTPException as exc:
        raise HTTPException(status_code=404, detail=f"Transaction not found: {exc.detail}") from exc

    try:
        entry = rpc.call("getmempoolentry", [tx_id])
    except HTTPException:
        entry = None

    outputs = []
    total_out = Decimal("0")
    for output in raw.get("vout", []):
        value = Decimal(str(output.get("value", 0)))
        total_out += value
        script = output.get("scriptPubKey", {}) or {}
        outputs.append(
            {
                "n": output.get("n"),
                "value": str(value),
                "address": script.get("address"),
                "type": script.get("type"),
                "script": script.get("hex"),
            }
        )

    inputs = []
    total_in: Decimal | None = Decimal("0")
    for vin in raw.get("vin", []):
        item: dict[str, Any] = {
            "txid": vin.get("txid"),
            "vout": vin.get("vout"),
            "sequence": vin.get("sequence"),
            "coinbase": vin.get("coinbase"),
            "witness_items": len(vin.get("txinwitness", []) or []),
            "prevout": None,
        }
        if vin.get("txid") is not None and vin.get("vout") is not None:
            try:
                prev = rpc.call("getrawtransaction", [vin["txid"], True])
                prevout = prev.get("vout", [])[int(vin["vout"])]
                prev_value = Decimal(str(prevout.get("value", 0)))
                prev_script = prevout.get("scriptPubKey", {}) or {}
                item["prevout"] = {
                    "value": str(prev_value),
                    "address": prev_script.get("address"),
                    "type": prev_script.get("type"),
                }
                if total_in is not None:
                    total_in += prev_value
            except (HTTPException, IndexError, ValueError):
                total_in = None
        inputs.append(item)

    fee = None
    fee_rate = None
    if entry:
        fee = Decimal(str((entry.get("fees") or {}).get("base", 0)))
    elif total_in is not None:
        fee = total_in - total_out

    vsize = raw.get("vsize") or 0
    if fee is not None and vsize:
        fee_rate = round((float(fee) * 100_000_000) / int(vsize), 2)

    return {
        "txid": tx_id,
        "hash": raw.get("hash"),
        "status": "mempool" if entry else "confirmed_or_unknown",
        "version": raw.get("version"),
        "locktime": raw.get("locktime"),
        "size": raw.get("size"),
        "vsize": raw.get("vsize"),
        "weight": raw.get("weight"),
        "fee": str(fee) if fee is not None else None,
        "fee_rate": fee_rate,
        "total_in": str(total_in) if total_in is not None else None,
        "total_out": str(total_out),
        "time": entry.get("time") if entry else raw.get("time"),
        "height": entry.get("height") if entry else raw.get("height"),
        "depends": entry.get("depends", []) if entry else [],
        "spentby": entry.get("spentby", []) if entry else [],
        "inputs": inputs,
        "outputs": outputs,
        "hex": raw.get("hex"),
    }


@router.get("/api/mempool/blocks")
def mempool_blocks() -> dict[str, Any]:
    verbose_mempool = rpc.call("getrawmempool", [True])
    clean = []
    for tx_id, entry in verbose_mempool.items():
        fee_btc = entry.get("fees", {}).get("base")
        vsize = entry.get("vsize") or 0
        fee_rate = 0.0
        if fee_btc is not None and vsize:
            fee_rate = round((float(fee_btc) * 100_000_000) / vsize, 2)
        clean.append({"txid": tx_id, "vsize": vsize, "fee": fee_btc, "fee_rate": fee_rate})
    clean.sort(key=lambda x: x.get("fee_rate") or 0, reverse=True)
    blocks = []
    chunk = 40
    for i in range(0, min(len(clean), 240), chunk):
        part = clean[i : i + chunk]
        blocks.append(
            {
                "index": len(blocks) + 1,
                "tx_count": len(part),
                "vbytes": sum(int(t.get("vsize") or 0) for t in part),
                "fees": round(sum(float(t.get("fee") or 0) for t in part), 8),
                "min_fee_rate": min((t.get("fee_rate") or 0 for t in part), default=0),
                "max_fee_rate": max((t.get("fee_rate") or 0 for t in part), default=0),
            }
        )
    return {"blocks": blocks}


@router.get("/api/mempool/projected-block/{index}")
def projected_block_transactions(index: int, request: Request) -> dict[str, Any]:
    cache.rate_limit(
        f"projected-block:{client_ip(request)}", config.MEMPOOL_DETAIL_RATE_PER_MIN
    )
    if index < 1:
        raise HTTPException(status_code=400, detail="Invalid projected block index")
    verbose_mempool = rpc.call("getrawmempool", [True])
    clean = []
    for tx_id, entry in verbose_mempool.items():
        fee_btc = entry.get("fees", {}).get("base")
        vsize = entry.get("vsize") or 0
        fee_rate = 0.0
        if fee_btc is not None and vsize:
            fee_rate = round((float(fee_btc) * 100_000_000) / vsize, 2)
        clean.append(
            {
                "txid": tx_id,
                "vsize": vsize,
                "fee": fee_btc,
                "fee_rate": fee_rate,
                "time": entry.get("time"),
            }
        )
    clean.sort(key=lambda x: x.get("fee_rate") or 0, reverse=True)
    chunk = 40
    start = (index - 1) * chunk
    part = clean[start : start + chunk]
    if not part:
        raise HTTPException(status_code=404, detail="Projected block not found")
    txs = []
    for item in part:
        try:
            raw = rpc.call("getrawtransaction", [item["txid"], True])
            txs.append(tx_list_item(item["txid"], raw, item.get("fee"), item.get("fee_rate")))
        except HTTPException as exc:
            txs.append({"txid": item["txid"], "error": exc.detail})
    return {
        "kind": "projected",
        "index": index,
        "tx_count": len(txs),
        "vbytes": sum(int(t.get("vsize") or 0) for t in txs),
        "fees": round(sum(float(t.get("fee") or 0) for t in txs), 8),
        "transactions": txs,
    }
