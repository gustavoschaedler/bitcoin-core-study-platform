"""Read-only RPC pass-throughs: status, blocks, ZMQ, RPC help."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from ..core import node, rpc, validators

router = APIRouter()


@router.get("/api/status")
def status() -> dict[str, Any]:
    return node.summary()


@router.get("/api/zmq")
def zmq() -> Any:
    return rpc.call("getzmqnotifications")


@router.get("/api/rpc-help")
def rpc_help(command: str = "getblockchaininfo") -> Any:
    if not command.replace("_", "").replace("-", "").isalnum() or len(command) > 64:
        raise HTTPException(status_code=400, detail="Invalid command name")
    return rpc.call("help", [command])


@router.get("/api/blocks/recent")
def recent_blocks(limit: int = Query(6, ge=1, le=50)) -> dict[str, Any]:
    info = rpc.call("getblockchaininfo")
    height = int(info.get("blocks", 0))
    blocks: list[dict[str, Any]] = []
    for block_height in range(height, max(-1, height - limit), -1):
        try:
            block_hash = rpc.call("getblockhash", [block_height])
            block = rpc.call("getblock", [block_hash, 2])
            fee_rates: list[float] = []
            total_fees = Decimal("0")
            for tx in block.get("tx", []):
                if "fee" not in tx:
                    continue
                fee = Decimal(str(tx.get("fee") or "0"))
                vsize = Decimal(str(tx.get("vsize") or "0"))
                total_fees += fee
                if vsize:
                    fee_rates.append(round(float((fee * Decimal(100_000_000)) / vsize), 2))
            blocks.append(
                {
                    "height": block.get("height", block_height),
                    "hash": block_hash,
                    "time": block.get("time"),
                    "tx_count": block.get("nTx"),
                    "size": block.get("size"),
                    "weight": block.get("weight"),
                    "fees": float(total_fees),
                    "min_fee_rate": min(fee_rates, default=0),
                    "max_fee_rate": max(fee_rates, default=0),
                    "avg_fee_rate": round(sum(fee_rates) / len(fee_rates), 2)
                    if fee_rates
                    else 0,
                }
            )
        except HTTPException:
            continue
    return {"tip": height, "blocks": blocks}


@router.get("/api/blocks/{height}/txs")
def mined_block_transactions(height: int) -> dict[str, Any]:
    if height < 0:
        raise HTTPException(status_code=400, detail="Invalid block height")
    block_hash = rpc.call("getblockhash", [height])
    block = rpc.call("getblock", [block_hash, 2])
    txs = []
    for tx in block.get("tx", []):
        outputs = tx.get("vout", [])
        value_out = sum(float(v.get("value", 0)) for v in outputs)
        vsize = tx.get("vsize") or tx.get("size") or 0
        fee = tx.get("fee")
        fee_rate = None
        if fee is not None and vsize:
            fee_rate = round((float(fee) * 100_000_000) / float(vsize), 2)
        txs.append(
            {
                "txid": tx.get("txid"),
                "vin": len(tx.get("vin", [])),
                "vout": len(outputs),
                "vsize": vsize,
                "weight": tx.get("weight"),
                "fee": fee,
                "fee_rate": fee_rate,
                "value_out": round(value_out, 8),
                "time": tx.get("time"),
            }
        )
    return {
        "kind": "mined",
        "height": block.get("height", height),
        "hash": block_hash,
        "time": block.get("time"),
        "tx_count": block.get("nTx"),
        "size": block.get("size"),
        "weight": block.get("weight"),
        "transactions": txs,
    }


# Re-exported helper for the mempool router
def tx_list_item(tx_id: str, raw: dict[str, Any], fee_btc: Any = None, fee_rate: Any = None) -> dict[str, Any]:
    outputs = raw.get("vout", [])
    value_out = sum(float(v.get("value", 0)) for v in outputs)
    vsize = raw.get("vsize") or raw.get("size") or 0
    computed_fee_rate = fee_rate
    if computed_fee_rate is None and fee_btc is not None and vsize:
        computed_fee_rate = round((float(fee_btc) * 100_000_000) / float(vsize), 2)
    return {
        "txid": tx_id,
        "vin": len(raw.get("vin", [])),
        "vout": len(outputs),
        "vsize": vsize,
        "weight": raw.get("weight"),
        "fee": fee_btc,
        "fee_rate": computed_fee_rate,
        "value_out": round(value_out, 8),
        "time": raw.get("time"),
    }
