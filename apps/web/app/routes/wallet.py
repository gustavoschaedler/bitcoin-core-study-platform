"""Wallet lab: create / load / delete wallets, generate addresses, sign and broadcast PSBTs."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Form, HTTPException

from ..core import config, rpc, validators

router = APIRouter()


@router.get("/api/wallet/list")
def wallet_list() -> Any:
    return rpc.call("listwallets")


@router.get("/api/wallet/overview")
def wallet_overview() -> dict[str, Any]:
    loaded = set(rpc.call("listwallets"))
    directory = rpc.call("listwalletdir").get("wallets", [])
    names = [item.get("name") for item in directory if item.get("name")]
    for name in loaded:
        if name not in names:
            names.append(name)

    wallets = []
    for name in names:
        if not config.WALLET_NAME_RE.fullmatch(name):
            continue
        load_error: str | None = None
        if name not in loaded:
            try:
                rpc.call("loadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
                loaded.add(name)
            except HTTPException as exc:
                load_error = str(exc.detail)

        balance = None
        addresses: list[dict[str, Any]] = []
        if load_error is None:
            try:
                info = rpc.call("getwalletinfo", wallet=name)
                balance = info.get("balance")
                received = rpc.call(
                    "listreceivedbyaddress", [0, True, True], wallet=name
                )
                addresses = [
                    {
                        "address": row.get("address"),
                        "label": row.get("label", ""),
                        "amount": row.get("amount", 0),
                        "confirmations": row.get("confirmations", 0),
                    }
                    for row in received
                ]
            except HTTPException as exc:
                load_error = str(exc.detail)

        wallets.append(
            {
                "name": name,
                "loaded": name in loaded,
                "balance": balance,
                "addresses": addresses,
                "error": load_error,
            }
        )
    return {"wallets": wallets}


@router.post("/api/wallet/create")
def wallet_create(name: str = Form(...)) -> Any:
    name = validators.wallet_name(name)
    try:
        return rpc.call("createwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
    except HTTPException as exc:
        if "Database already exists" in str(exc.detail):
            return rpc.call("loadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
        raise


@router.post("/api/wallet/create-faucet")
def wallet_create_faucet() -> dict[str, Any]:
    name = validators.wallet_name(config.FAUCET_WALLET_NAME)
    try:
        result = rpc.call("createwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
    except HTTPException as exc:
        if "Database already exists" in str(exc.detail):
            result = rpc.call("loadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
        else:
            raise
    address = rpc.call("getnewaddress", ["faucet"], wallet=name)
    return {"wallet": name, "result": result, "address": address}


@router.post("/api/wallet/load")
def wallet_load(name: str = Form(...)) -> Any:
    name = validators.wallet_name(name)
    return rpc.call("loadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)


@router.post("/api/wallet/delete")
def wallet_delete(name: str = Form(...)) -> dict[str, Any]:
    name = validators.wallet_name(name)
    try:
        if name not in set(rpc.call("listwallets")):
            rpc.call("loadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
        info = rpc.call("getwalletinfo", wallet=name)
        balance = Decimal(str(info.get("balance", 0)))
    except HTTPException as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to inspect wallet before deletion: {exc.detail}",
        ) from exc

    if balance > 0:
        raise HTTPException(
            status_code=400,
            detail="Wallet has balance. Move funds before deleting it.",
        )

    try:
        return {
            "wallet": name,
            "deleted": True,
            "result": rpc.call("deletewallet", [name], timeout=config.RPC_TIMEOUT_WRITE),
        }
    except HTTPException as exc:
        if "Method not found" not in str(exc.detail):
            raise
        result = rpc.call("unloadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
        return {
            "wallet": name,
            "deleted": False,
            "unloaded": True,
            "result": result,
            "warning": (
                "This Bitcoin Core RPC set does not expose deletewallet; "
                "wallet was unloaded but files were not removed."
            ),
        }


@router.post("/api/wallet/address")
def wallet_address(wallet: str = Form(...), label: str = Form("")) -> dict[str, Any]:
    wallet = validators.wallet_name(wallet)
    label = label.strip()[:80]
    return {
        "wallet": wallet,
        "address": rpc.call("getnewaddress", [label], wallet=wallet),
    }


@router.post("/api/wallet/sign")
def wallet_sign(
    wallet: str = Form(...),
    to_address: str = Form(...),
    amount: str = Form(...),
) -> dict[str, Any]:
    wallet = validators.wallet_name(wallet)
    to_address = validators.signet_address(to_address)
    amount_value = validators.amount_btc(amount)
    psbt = rpc.call(
        "walletcreatefundedpsbt",
        [
            [],
            [{to_address: str(amount_value)}],
            0,
            {"subtractFeeFromOutputs": [0]},
            True,
        ],
        wallet=wallet,
        timeout=config.RPC_TIMEOUT_WRITE,
    )
    processed = rpc.call(
        "walletprocesspsbt", [psbt["psbt"]], wallet=wallet, timeout=config.RPC_TIMEOUT_WRITE
    )
    finalized = rpc.call(
        "finalizepsbt", [processed["psbt"]], timeout=config.RPC_TIMEOUT_WRITE
    )
    return {
        "wallet": wallet,
        "to_address": to_address,
        "amount": str(amount_value),
        "psbt": psbt,
        "processed": processed,
        "finalized": finalized,
        "note": "Raw transaction is signed but not broadcast by this endpoint.",
    }


@router.post("/api/wallet/broadcast")
def wallet_broadcast(hex_tx: str = Form(...)) -> dict[str, Any]:
    hex_tx = validators.raw_tx_hex(hex_tx)
    return {"txid": rpc.call("sendrawtransaction", [hex_tx], timeout=config.RPC_TIMEOUT_WRITE)}
