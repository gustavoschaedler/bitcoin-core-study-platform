"""Signet faucet: send sBTC, history, per-IP and per-address cooldowns."""

from __future__ import annotations

import time
from typing import Any

import requests
from fastapi import APIRouter, Form, HTTPException, Request

from ..core import cache, config, rpc, validators
from ..core.security import client_ip

router = APIRouter()


def _verify_turnstile(token: str | None, ip: str) -> bool:
    if not config.TURNSTILE_ENABLED:
        return True
    if not config.TURNSTILE_SECRET_KEY or not token:
        return False
    try:
        res = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": config.TURNSTILE_SECRET_KEY,
                "response": token,
                "remoteip": ip,
            },
            timeout=10,
        )
        return bool(res.json().get("success"))
    except (requests.RequestException, ValueError):
        return False


def _enforce_rate_limit(ip: str, address: str) -> None:
    day_key = f"faucet:ip:{ip}:{time.strftime('%Y%m%d')}"
    count = cache.client.incr(day_key)
    if count == 1:
        cache.client.expire(day_key, 86400)
    if count > config.FAUCET_MAX_PER_IP_PER_DAY:
        raise HTTPException(status_code=429, detail="IP daily limit reached")

    address_key = f"faucet:addr:{address}"
    ttl = cache.client.ttl(address_key)
    if ttl > 0:
        raise HTTPException(
            status_code=429,
            detail=f"Address cooldown active. Try again in {ttl} seconds.",
        )
    cache.client.setex(address_key, config.FAUCET_COOLDOWN_SECONDS, "1")


@router.post("/api/request")
def request_coins(
    request: Request,
    address: str = Form(...),
    cf_turnstile_response: str | None = Form(None, alias="cf-turnstile-response"),
) -> dict[str, Any]:
    ip = client_ip(request)
    if not _verify_turnstile(cf_turnstile_response, ip):
        raise HTTPException(status_code=400, detail="CAPTCHA failed")
    address = validators.signet_address(address)
    _enforce_rate_limit(ip, address)
    tx_id = rpc.call(
        "sendtoaddress",
        [address, str(config.FAUCET_AMOUNT_BTC)],
        wallet=config.FAUCET_WALLET_NAME,
        timeout=config.RPC_TIMEOUT_WRITE,
    )
    cache.client.lpush(
        "faucet:txs", f"{int(time.time())}|{ip}|{address}|{tx_id}"
    )
    cache.client.ltrim("faucet:txs", 0, 99)
    return {"status": "sent", "amount": str(config.FAUCET_AMOUNT_BTC), "txid": tx_id}


@router.get("/api/history")
def history() -> list[dict[str, Any]]:
    rows = cache.client.lrange("faucet:txs", 0, 20)
    out: list[dict[str, Any]] = []
    for row in rows:
        try:
            ts, ip, address, tx_id = row.split("|", 3)
        except ValueError:
            continue
        out.append({"time": int(ts), "ip": ip, "address": address, "txid": tx_id})
    return out
