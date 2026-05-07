"""HTML pages: home, faucet, mempool, wallet, stats, study docs."""

from __future__ import annotations

from html import escape
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from ..core import config, node
from ..templates import templates

router = APIRouter()


def _ctx(request: Request, lang: str | None, **extra) -> dict:
    return {"title": config.APP_TITLE, "lang": lang or config.DEFAULT_LANG, **extra}


@router.get("/", response_class=HTMLResponse)
def home(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="home.html",
        context=_ctx(request, lang, summary=node.summary()),
    )


@router.get("/faucet", response_class=HTMLResponse)
def faucet_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="faucet.html",
        context=_ctx(
            request,
            lang,
            amount=str(config.FAUCET_AMOUNT_BTC),
            cooldown=config.FAUCET_COOLDOWN_SECONDS,
            turnstile_enabled=config.TURNSTILE_ENABLED,
            turnstile_site_key=config.TURNSTILE_SITE_KEY,
            summary=node.summary(),
        ),
    )


@router.get("/mempool", response_class=HTMLResponse)
def mempool_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="mempool.html",
        context=_ctx(request, lang, summary=node.summary()),
    )


@router.get("/wallet", response_class=HTMLResponse)
def wallet_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="wallet.html",
        context=_ctx(request, lang, faucet_wallet_name=config.FAUCET_WALLET_NAME),
    )


@router.get("/stats", response_class=HTMLResponse)
def stats_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request, name="stats.html", context=_ctx(request, lang)
    )


@router.get("/study-docs", response_class=HTMLResponse)
def docs_page(request: Request, lang: str | None = None):
    try:
        content = Path(config.DOCS_FILE).read_text(encoding="utf-8")
    except OSError:
        content = "# Documentation\n\nThe local study notes are unavailable in this container."
    return templates.TemplateResponse(
        request=request,
        name="docs.html",
        context=_ctx(request, lang, content=escape(content)),
    )
