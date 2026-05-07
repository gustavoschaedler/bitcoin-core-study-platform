"""FastAPI application factory for the Signet study platform web UI."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .core import config
from .core.security import security_middleware
from .routes import blockchain, faucet, mempool, pages, search, stats, wallet

app = FastAPI(title=config.APP_TITLE)

app.middleware("http")(security_middleware)

app.mount("/static", StaticFiles(directory="/app/app/static"), name="static")

app.include_router(pages.router)
app.include_router(blockchain.router)
app.include_router(mempool.router)
app.include_router(search.router)
app.include_router(faucet.router)
app.include_router(wallet.router)
app.include_router(stats.router)
