"""Slim RPC client for the HDMI display.

Mirrors the auth model used by ``apps/web``: ``password`` (default) or ``cookie``.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

import requests
from fastapi import HTTPException

log = logging.getLogger(__name__)

RPC_URL = os.getenv("BITCOIN_RPC_URL", "http://bitcoind:38332")
RPC_AUTH_MODE = os.getenv("BITCOIN_RPC_AUTH_MODE", "password").strip().lower()
RPC_USER = os.getenv("BITCOIN_RPC_USER", "")
RPC_PASSWORD = os.getenv("BITCOIN_RPC_PASSWORD", "")
RPC_COOKIE_FILE = os.getenv("BITCOIN_RPC_COOKIE_FILE", "/bitcoind-data/signet/.cookie")
RPC_TIMEOUT = float(os.getenv("BITCOIN_RPC_TIMEOUT_READ", "8"))


def _read_cookie() -> tuple[str, str] | None:
    try:
        raw = Path(RPC_COOKIE_FILE).read_text(encoding="utf-8").strip()
    except OSError:
        return None
    if ":" not in raw:
        return None
    user, _, password = raw.partition(":")
    if not user or not password:
        return None
    return user, password


def _auth() -> tuple[str, str]:
    if RPC_AUTH_MODE == "cookie":
        cookie = _read_cookie()
        if cookie is not None:
            return cookie
    return RPC_USER, RPC_PASSWORD


def call(method: str, params: list[Any] | None = None, *, wallet: str | None = None) -> Any:
    url = RPC_URL if wallet is None else f"{RPC_URL}/wallet/{wallet}"
    try:
        res = requests.post(
            url,
            json={"jsonrpc": "1.0", "id": "display", "method": method, "params": params or []},
            auth=_auth(),
            timeout=RPC_TIMEOUT,
        )
        res.raise_for_status()
        data = res.json()
    except requests.RequestException as exc:
        log.warning("RPC error on %s: %s", method, exc)
        raise HTTPException(status_code=503, detail="Bitcoin RPC unavailable") from exc
    if data.get("error"):
        raise HTTPException(status_code=500, detail=data["error"])
    return data.get("result")
