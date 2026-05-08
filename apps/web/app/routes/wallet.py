"""Wallet lab: create / load / delete wallets, generate addresses, sign and broadcast PSBTs."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Form, HTTPException, Request

from ..core import config, rpc, validators

router = APIRouter()

_hidden_wallets: set[str] = set()


@router.get("/api/wallet/list")
def wallet_list() -> Any:
    return rpc.call("listwallets")


@router.get("/api/wallet/overview")
def wallet_overview() -> dict[str, Any]:
    loaded = set(rpc.call("listwallets"))
    _hidden_wallets.difference_update(loaded)
    directory = rpc.call("listwalletdir").get("wallets", [])
    names = [item.get("name") for item in directory if item.get("name")]
    for name in loaded:
        if name not in names:
            names.append(name)

    wallets = []
    for name in names:
        if not config.WALLET_NAME_RE.fullmatch(name):
            continue
        if name in _hidden_wallets:
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
                if not addresses:
                    known = set()
                    descs = rpc.call("listdescriptors", wallet=name).get("descriptors", [])
                    for d in descs:
                        if d.get("internal"):
                            continue
                        nxt = d.get("next", 0)
                        if d.get("range") is None or nxt <= 0:
                            continue
                        try:
                            addrs = rpc.call("deriveaddresses", [d["desc"], [0, nxt - 1]])
                            for addr in addrs:
                                if addr not in known:
                                    known.add(addr)
                                    addresses.append({"address": addr, "label": "", "amount": 0, "confirmations": 0})
                        except HTTPException:
                            pass
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
    _hidden_wallets.discard(name)
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
        result = rpc.call("unloadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
        _hidden_wallets.add(name)
        return {"wallet": name, "deleted": True, "result": result}
    except HTTPException as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to unload wallet: {exc.detail}",
        ) from exc


@router.get("/api/wallet/export")
def wallet_export(name: str = "") -> dict[str, Any]:
    name = validators.wallet_name(name)
    loaded = set(rpc.call("listwallets"))
    if name not in loaded:
        rpc.call("loadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
    descriptors = rpc.call("listdescriptors", [True], wallet=name)
    info = rpc.call("getwalletinfo", wallet=name)
    return {
        "wallet": name,
        "descriptors": descriptors.get("descriptors", []),
        "descriptor_checksum": descriptors.get("checksum", ""),
        "balance": info.get("balance"),
    }


@router.get("/api/wallet/export-all")
def wallet_export_all() -> dict[str, Any]:
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
        if name not in loaded:
            try:
                rpc.call("loadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
                loaded.add(name)
            except HTTPException:
                continue
        try:
            descriptors = rpc.call("listdescriptors", [True], wallet=name)
            info = rpc.call("getwalletinfo", wallet=name)
            wallets.append({
                "wallet": name,
                "descriptors": descriptors.get("descriptors", []),
                "descriptor_checksum": descriptors.get("checksum", ""),
                "balance": info.get("balance"),
            })
        except HTTPException:
            continue
    return {"wallets": wallets}


@router.post("/api/wallet/import")
async def wallet_import(request: Request) -> dict[str, Any]:
    body = await request.json()

    entries: list[dict[str, Any]] = []
    if "wallets" in body:
        entries = body["wallets"]
    elif "wallet" in body and "descriptors" in body:
        entries = [body]
    else:
        raise HTTPException(status_code=400, detail="Invalid import format.")

    results = []
    loaded = set(rpc.call("listwallets"))

    for entry in entries:
        name = validators.wallet_name(entry.get("wallet", ""))
        descriptors = entry.get("descriptors", [])
        if not descriptors:
            results.append({"wallet": name, "error": "No descriptors found."})
            continue

        wallet_ready = name in loaded
        if not wallet_ready:
            try:
                rpc.call("loadwallet", [name], timeout=config.RPC_TIMEOUT_WRITE)
                wallet_ready = True
            except HTTPException:
                pass

        if not wallet_ready:
            try:
                rpc.call(
                    "createwallet",
                    [name, False, True, "", False, True],
                    timeout=config.RPC_TIMEOUT_WRITE,
                )
                wallet_ready = True
            except HTTPException as exc:
                results.append({"wallet": name, "error": str(exc.detail)})
                continue

        import_requests = []
        for desc in descriptors:
            req: dict[str, Any] = {
                "desc": desc["desc"],
                "active": desc.get("active", True),
                "timestamp": desc.get("timestamp", "now"),
                "internal": desc.get("internal", False),
            }
            if desc.get("range") is not None:
                req["range"] = desc["range"]
            if desc.get("next_index") is not None:
                req["next_index"] = desc["next_index"]
            elif desc.get("next") is not None and desc["next"] > 0:
                req["next_index"] = desc["next"]
            import_requests.append(req)

        try:
            result = rpc.call(
                "importdescriptors", [import_requests], wallet=name, timeout=config.RPC_TIMEOUT_WRITE
            )
            results.append({"wallet": name, "imported": True, "result": result})
        except HTTPException as exc:
            results.append({"wallet": name, "error": str(exc.detail)})

    return {"results": results}


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
