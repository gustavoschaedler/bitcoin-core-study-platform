"""HTTP middleware: optional Basic auth + sane security headers."""

from __future__ import annotations

import base64
import secrets

from fastapi import Request
from fastapi.responses import HTMLResponse, Response

from . import config


CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self' https://challenges.cloudflare.com; "
    "frame-src https://challenges.cloudflare.com; "
    "img-src 'self' data: https://api.qrserver.com; "
    "style-src 'self' 'unsafe-inline'; "
    "connect-src 'self'; "
    "font-src 'self' data:; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)


def _basic_auth_ok(request: Request) -> bool:
    if not (config.BASIC_AUTH_USERNAME and config.BASIC_AUTH_PASSWORD):
        return True
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("basic "):
        return False
    try:
        decoded = base64.b64decode(header.split(" ", 1)[1], validate=True).decode("utf-8")
        username, _, password = decoded.partition(":")
    except (ValueError, UnicodeDecodeError):
        return False
    return (
        secrets.compare_digest(username, config.BASIC_AUTH_USERNAME)
        and secrets.compare_digest(password, config.BASIC_AUTH_PASSWORD)
    )


def _apply_headers(response: Response) -> None:
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault(
        "Permissions-Policy", "camera=(), microphone=(), geolocation=()"
    )
    response.headers.setdefault("Content-Security-Policy", CSP_POLICY)


async def security_middleware(request: Request, call_next):
    if not _basic_auth_ok(request):
        response = HTMLResponse(
            "Authentication required",
            status_code=401,
            headers={"WWW-Authenticate": f'Basic realm="{config.APP_TITLE}"'},
        )
        _apply_headers(response)
        return response
    response = await call_next(request)
    _apply_headers(response)
    return response


def client_ip(request: Request) -> str:
    if config.TRUST_PROXY_HEADERS:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
