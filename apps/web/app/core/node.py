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
        faucet_address: str | None = None
        try:
            info = rpc.call("getwalletinfo", wallet=config.FAUCET_WALLET_NAME)
            wallet_balance = info.get("balance")
            # Pick the address labelled "faucet", else the one with most received
            received = rpc.call(
                "listreceivedbyaddress", [0, True, True],
                wallet=config.FAUCET_WALLET_NAME,
            )
            if received:
                labelled = [r for r in received if r.get("label") == "faucet"]
                pool = labelled or received
                best = max(pool, key=lambda r: r.get("amount", 0))
                faucet_address = best.get("address")
        except Exception:
            wallet_balance = None
            faucet_address = None

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
            "faucet_address": faucet_address,
            "zmq": zmq,
        }
    except Exception as exc:  # noqa: BLE001 - intentional: surface as page error
        return {"ok": False, "error": str(exc)}
