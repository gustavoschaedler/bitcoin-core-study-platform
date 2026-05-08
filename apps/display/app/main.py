"""HDMI/kiosk dashboard."""

from __future__ import annotations

import base64
import os
import secrets
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from . import rpc

APP_TITLE = os.getenv("APP_TITLE", "Signet Core Study Platform")
DEFAULT_LANG = os.getenv("DEFAULT_LANG", "pt-BR")
FAUCET_WALLET_NAME = os.getenv("FAUCET_WALLET_NAME", "faucet")
BASIC_AUTH_USERNAME = os.getenv("BASIC_AUTH_USERNAME", "")
BASIC_AUTH_PASSWORD = os.getenv("BASIC_AUTH_PASSWORD", "")
REFRESH_DISPLAY = int(os.getenv("REFRESH_DISPLAY", "30"))

app = FastAPI(title="Signet Display")
app.mount("/static", StaticFiles(directory="/app/app/static"), name="static")
templates = Jinja2Templates(directory="/app/app/templates")


def _basic_auth_ok(request: Request) -> bool:
    if not (BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD):
        return True
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("basic "):
        return False
    try:
        decoded = base64.b64decode(header.split(" ", 1)[1], validate=True).decode("utf-8")
        username, _, password = decoded.partition(":")
    except (ValueError, UnicodeDecodeError):
        return False
    return secrets.compare_digest(username, BASIC_AUTH_USERNAME) and secrets.compare_digest(
        password, BASIC_AUTH_PASSWORD
    )


def _set_headers(response: Response) -> None:
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault(
        "Permissions-Policy", "camera=(), microphone=(), geolocation=()"
    )


@app.middleware("http")
async def security(request: Request, call_next):
    if not _basic_auth_ok(request):
        response = HTMLResponse(
            "Authentication required",
            status_code=401,
            headers={"WWW-Authenticate": 'Basic realm="Signet Display"'},
        )
        _set_headers(response)
        return response
    response = await call_next(request)
    _set_headers(response)
    return response


def _btc_sats(value: Any) -> dict[str, str]:
    if value is None:
        return {"btc": "-", "sats": "-"}
    amount = float(value)
    return {"btc": f"{amount:.8f} sBTC", "sats": f"{round(amount * 100_000_000):,} s-sats"}


def _fee_formats(value: Any) -> dict[str, str]:
    if value is None:
        return {"btc": "-", "sats": "-"}
    fee_btc_kvb = float(value)
    return {
        "btc": f"{fee_btc_kvb:.8f} sBTC/kvB",
        "sats": f"{fee_btc_kvb * 100_000:.2f} s-sats/vB",
    }


def _summary() -> dict[str, Any]:
    try:
        bc = rpc.call("getblockchaininfo")
        net = rpc.call("getnetworkinfo")
        mem = rpc.call("getmempoolinfo")
        try:
            balance = rpc.call("getwalletinfo", wallet=FAUCET_WALLET_NAME).get("balance")
        except Exception:
            balance = None
        minfee = mem.get("mempoolminfee")
        return {
            "ok": True,
            "chain": bc.get("chain"),
            "blocks": bc.get("blocks"),
            "headers": bc.get("headers"),
            "sync": round(float(bc.get("verificationprogress", 0)) * 100, 2),
            "peers": net.get("connections"),
            "mempool": mem.get("size"),
            "mempool_bytes": mem.get("bytes"),
            "minfee": minfee,
            "minfee_display": _fee_formats(minfee),
            "balance": balance,
            "balance_display": _btc_sats(balance),
        }
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": str(exc)}


@app.get("/", response_class=HTMLResponse)
def index(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="display.html",
        context={"title": APP_TITLE, "s": _summary(), "lang": lang or DEFAULT_LANG, "refresh_interval": REFRESH_DISPLAY},
    )


@app.get("/api/status")
def api_status():
    return _summary()
