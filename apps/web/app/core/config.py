"""Centralised configuration read from environment variables."""

from __future__ import annotations

import os
import re
from decimal import Decimal


def _bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def _decimal(name: str, default: str) -> Decimal:
    try:
        return Decimal(os.getenv(name, default))
    except Exception:
        return Decimal(default)


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


# --- Version ------------------------------------------------------------------
APP_VERSION = os.getenv("APP_VERSION", "0.1.1")

# --- Branding / i18n ----------------------------------------------------------
APP_TITLE = os.getenv("APP_TITLE", "Signet Core Study Platform")
DEFAULT_LANG = os.getenv("DEFAULT_LANG", "pt-BR")

# --- Bitcoin Core RPC ---------------------------------------------------------
RPC_URL = os.getenv("BITCOIN_RPC_URL", "http://bitcoind:38332")
RPC_AUTH_MODE = os.getenv("BITCOIN_RPC_AUTH_MODE", "password").strip().lower()
RPC_USER = os.getenv("BITCOIN_RPC_USER", "")
RPC_PASSWORD = os.getenv("BITCOIN_RPC_PASSWORD", "")
RPC_COOKIE_FILE = os.getenv("BITCOIN_RPC_COOKIE_FILE", "/bitcoind-data/signet/.cookie")
RPC_TIMEOUT_READ = float(os.getenv("BITCOIN_RPC_TIMEOUT_READ", "15"))
RPC_TIMEOUT_WRITE = float(os.getenv("BITCOIN_RPC_TIMEOUT_WRITE", "30"))

# --- Faucet -------------------------------------------------------------------
FAUCET_AMOUNT_BTC = _decimal("FAUCET_AMOUNT_BTC", "0.0001")
FAUCET_COOLDOWN_SECONDS = _int("FAUCET_COOLDOWN_SECONDS", 86400)
FAUCET_MAX_PER_IP_PER_DAY = _int("FAUCET_MAX_PER_IP_PER_DAY", 3)

WALLET_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")
_FAUCET_WALLET_NAME = os.getenv("FAUCET_WALLET_NAME", "faucet")
FAUCET_WALLET_NAME = _FAUCET_WALLET_NAME if WALLET_NAME_RE.fullmatch(_FAUCET_WALLET_NAME) else "faucet"

# --- Wallet lab ---------------------------------------------------------------
MAX_WALLET_SEND_BTC = _decimal("MAX_WALLET_SEND_BTC", "0.01")

# --- Cloudflare Turnstile -----------------------------------------------------
TURNSTILE_ENABLED = _bool("TURNSTILE_ENABLED")
TURNSTILE_SITE_KEY = os.getenv("TURNSTILE_SITE_KEY", "")
TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY", "")

# --- HTTP / proxy -------------------------------------------------------------
TRUST_PROXY_HEADERS = _bool("TRUST_PROXY_HEADERS")

# --- Container stats ----------------------------------------------------------
ENABLE_CONTAINER_STATS = _bool("ENABLE_CONTAINER_STATS")
PROJECT_CONTAINER_NAMES = {
    "signet-bitcoind",
    "signet-redis",
    "signet-web",
    "signet-display",
    "signet-terminal-webui",
    "signet-terminal-proxy",
}

# --- Display & Terminal URLs --------------------------------------------------
DISPLAY_URL = os.getenv("DISPLAY_URL", "http://localhost:8181")
TERMINAL_URL = os.getenv("TERMINAL_URL", "http://localhost:8182")

# --- Auth ---------------------------------------------------------------------
BASIC_AUTH_USERNAME = os.getenv("BASIC_AUTH_USERNAME", "")
BASIC_AUTH_PASSWORD = os.getenv("BASIC_AUTH_PASSWORD", "")

# --- Redis --------------------------------------------------------------------
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = _int("REDIS_PORT", 6379)

# --- Filesystem paths ---------------------------------------------------------
DOCS_DIR = os.getenv("DOCS_DIR", "/app/docs")
DOCS_FILE = os.getenv("DOCS_FILE", "/app/docs/bitcoin-core-study.md")

# --- Auto-refresh intervals (seconds) -----------------------------------------
REFRESH_MEMPOOL = _int("REFRESH_MEMPOOL", 5)
REFRESH_STATS = _int("REFRESH_STATS", 30)

# --- Rate limits (per minute) --------------------------------------------------
SEARCH_RATE_PER_MIN = _int("SEARCH_RATE_PER_MIN", 6)
MEMPOOL_DETAIL_RATE_PER_MIN = _int("MEMPOOL_DETAIL_RATE_PER_MIN", 60)
