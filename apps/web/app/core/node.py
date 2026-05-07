"""High-level node helpers built on the JSON-RPC client."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from . import config, rpc


def signet_amount_label(value: Any) -> str:
    if value is None:
        return "-"
    amount = Decimal(str(value))
    return f"{amount:.8f} sBTC / {int(amount * Decimal(100_000_000)):,} s-sats"


def summary() -> dict[str, Any]:
    """Build the small status payload shown on the home page and the API."""
    try:
        blockchain = rpc.call("getblockchaininfo")
        network = rpc.call("getnetworkinfo")
        mempool = rpc.call("getmempoolinfo")
        zmq = rpc.call("getzmqnotifications")

        wallet_balance: Any = None
        try:
            info = rpc.call("getwalletinfo", wallet=config.FAUCET_WALLET_NAME)
            wallet_balance = info.get("balance")
        except Exception:
            wallet_balance = None

        return {
            "ok": True,
            "chain": blockchain.get("chain"),
            "blocks": blockchain.get("blocks"),
            "headers": blockchain.get("headers"),
            "verificationprogress": round(
                float(blockchain.get("verificationprogress", 0)) * 100, 2
            ),
            "initialblockdownload": blockchain.get("initialblockdownload"),
            "peers": network.get("connections"),
            "mempool": mempool.get("size"),
            "mempool_bytes": mempool.get("bytes"),
            "mempool_usage": mempool.get("usage"),
            "mempool_min_fee": mempool.get("mempoolminfee"),
            "wallet_balance": wallet_balance,
            "wallet_balance_display": signet_amount_label(wallet_balance),
            "zmq": zmq,
        }
    except Exception as exc:  # noqa: BLE001 - intentional: surface as page error
        return {"ok": False, "error": str(exc)}
