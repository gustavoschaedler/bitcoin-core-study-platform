"""Bitcoin Core JSON-RPC client.

Supports two authentication modes:
  - ``password`` (default): static rpcuser / rpcpassword from env.
  - ``cookie``: read ``__cookie__:<hex>`` from a cookie file written by bitcoind.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import requests
from fastapi import HTTPException

from . import config

log = logging.getLogger(__name__)


def _read_cookie() -> tuple[str, str] | None:
    path = Path(config.RPC_COOKIE_FILE)
    try:
        raw = path.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        log.warning("RPC cookie file %s not found", path)
        return None
    except OSError as exc:
        log.warning("Failed to read RPC cookie %s: %s", path, exc)
        return None
    if ":" not in raw:
        log.warning("RPC cookie at %s is malformed", path)
        return None
    user, _, password = raw.partition(":")
    if not user or not password:
        return None
    return user, password


def _auth() -> tuple[str, str]:
    if config.RPC_AUTH_MODE == "cookie":
        cookie = _read_cookie()
        if cookie is not None:
            return cookie
        # Fall through to password if env vars are populated, else bail loudly.
        if not (config.RPC_USER and config.RPC_PASSWORD):
            raise HTTPException(
                status_code=503,
                detail="RPC cookie unavailable and no fallback credentials configured",
            )
    return config.RPC_USER, config.RPC_PASSWORD


def call(
    method: str,
    params: list[Any] | None = None,
    *,
    wallet: str | None = None,
    timeout: float | None = None,
) -> Any:
    payload = {
        "jsonrpc": "1.0",
        "id": "signet-core-study",
        "method": method,
        "params": params or [],
    }
    url = config.RPC_URL if wallet is None else f"{config.RPC_URL}/wallet/{wallet}"
    request_timeout = timeout if timeout is not None else config.RPC_TIMEOUT_READ
    try:
        res = requests.post(url, json=payload, auth=_auth(), timeout=request_timeout)
        res.raise_for_status()
        data = res.json()
    except HTTPException:
        raise
    except requests.exceptions.RequestException as exc:
        # Avoid leaking the URL with credentials; log on the server only.
        log.warning("Bitcoin RPC error on %s: %s", method, exc)
        raise HTTPException(status_code=503, detail="Bitcoin RPC unavailable") from exc
    except ValueError as exc:
        log.warning("Bitcoin RPC returned non-JSON for %s: %s", method, exc)
        raise HTTPException(status_code=502, detail="Bitcoin RPC returned non-JSON") from exc

    if data.get("error"):
        raise HTTPException(status_code=500, detail=data["error"])
    return data.get("result")
