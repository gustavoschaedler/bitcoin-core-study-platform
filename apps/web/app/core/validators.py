"""Input validators shared across routes."""

from __future__ import annotations

import re
from decimal import Decimal, InvalidOperation
from typing import Any

from fastapi import HTTPException

from . import config, rpc

ADDRESS_RE = re.compile(r"^[A-Za-z0-9]{14,90}$")
TXID_RE = re.compile(r"^[0-9a-fA-F]{64}$")
RAW_TX_HEX_RE = re.compile(r"^[0-9a-fA-F]{40,400000}$")


def wallet_name(name: str) -> str:
    name = name.strip()
    if not config.WALLET_NAME_RE.fullmatch(name):
        raise HTTPException(
            status_code=400,
            detail="Wallet name must be 1-64 chars: letters, digits, dot, dash, underscore.",
        )
    return name


def signet_address(address: str) -> str:
    address = address.strip()
    if not ADDRESS_RE.fullmatch(address):
        raise HTTPException(status_code=400, detail="Invalid address format")
    if not (address.startswith("tb1") or address[0] in ("m", "n", "2")):
        raise HTTPException(status_code=400, detail="Address is not Signet/testnet")
    if not bool(rpc.call("validateaddress", [address]).get("isvalid")):
        raise HTTPException(status_code=400, detail="Address rejected by node")
    return address


def txid(value: str) -> str:
    value = value.strip()
    if not TXID_RE.fullmatch(value):
        raise HTTPException(status_code=400, detail="Invalid transaction id")
    return value


def raw_tx_hex(value: str) -> str:
    value = value.strip()
    if not RAW_TX_HEX_RE.fullmatch(value):
        raise HTTPException(status_code=400, detail="Invalid raw transaction hex")
    return value


def amount_btc(value: Any) -> Decimal:
    try:
        decimal_value = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise HTTPException(status_code=400, detail="Invalid amount") from exc
    if decimal_value <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")
    if decimal_value > config.MAX_WALLET_SEND_BTC:
        raise HTTPException(
            status_code=400,
            detail=f"Amount exceeds lab limit of {config.MAX_WALLET_SEND_BTC} sBTC",
        )
    return decimal_value
