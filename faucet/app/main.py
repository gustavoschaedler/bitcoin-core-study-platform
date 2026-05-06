import base64
from html import escape
import os
import json
import re
import secrets
import time
from pathlib import Path
from decimal import Decimal
from typing import Any

import docker
import redis
import requests
from fastapi import FastAPI, Form, Request, HTTPException, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

APP_TITLE = os.getenv("APP_TITLE", "Signet Core Study Platform")
DEFAULT_LANG = os.getenv("DEFAULT_LANG", "pt-BR")
WALLET_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")

RPC_USER = os.getenv("BITCOIN_RPC_USER", "bitcoin")
RPC_PASSWORD = os.getenv("BITCOIN_RPC_PASSWORD", "")
RPC_URL = os.getenv("BITCOIN_RPC_URL", "http://bitcoind:38332")

FAUCET_AMOUNT_BTC = Decimal(os.getenv("FAUCET_AMOUNT_BTC", "0.001"))
FAUCET_COOLDOWN_SECONDS = int(os.getenv("FAUCET_COOLDOWN_SECONDS", "86400"))
FAUCET_MAX_PER_IP_PER_DAY = int(os.getenv("FAUCET_MAX_PER_IP_PER_DAY", "3"))
FAUCET_WALLET_NAME = os.getenv("FAUCET_WALLET_NAME", "faucet")
if not WALLET_NAME_RE.fullmatch(FAUCET_WALLET_NAME):
    FAUCET_WALLET_NAME = "faucet"
MAX_WALLET_SEND_BTC = Decimal(os.getenv("MAX_WALLET_SEND_BTC", "0.01"))

TURNSTILE_ENABLED = os.getenv("TURNSTILE_ENABLED", "false").lower() == "true"
TURNSTILE_SITE_KEY = os.getenv("TURNSTILE_SITE_KEY", "")
TURNSTILE_SECRET_KEY = os.getenv("TURNSTILE_SECRET_KEY", "")
TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "false").lower() == "true"
ENABLE_CONTAINER_STATS = os.getenv("ENABLE_CONTAINER_STATS", "false").lower() == "true"
PROJECT_CONTAINER_NAMES = {"signet-bitcoind", "signet-redis", "signet-faucet", "signet-display"}
BASIC_AUTH_USERNAME = os.getenv("BASIC_AUTH_USERNAME", "")
BASIC_AUTH_PASSWORD = os.getenv("BASIC_AUTH_PASSWORD", "")

redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "redis"), port=6379, decode_responses=True)

app = FastAPI(title=APP_TITLE)

app.mount("/static", StaticFiles(directory="/app/app/static"), name="static")
app.mount("/mempool-assets", StaticFiles(directory="/app/mempool-ui/static"), name="mempool_assets")
app.mount("/wallet-assets", StaticFiles(directory="/app/wallet-lab/static"), name="wallet_assets")
app.mount("/stats-assets", StaticFiles(directory="/app/container-stats/static"), name="stats_assets")

templates = Jinja2Templates(directory="/app/app/templates")
mempool_templates = Jinja2Templates(directory="/app/mempool-ui/templates")
wallet_templates = Jinja2Templates(directory="/app/wallet-lab/templates")
stats_templates = Jinja2Templates(directory="/app/container-stats/templates")


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    if BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD and not basic_auth_is_valid(request):
        response = HTMLResponse(
            "Authentication required",
            status_code=401,
            headers={"WWW-Authenticate": 'Basic realm="Signet Core Study Platform"'},
        )
        add_common_security_headers(response)
        return response
    response = await call_next(request)
    add_common_security_headers(response)
    return response


def add_common_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "same-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")


def basic_auth_is_valid(request: Request) -> bool:
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("basic "):
        return False
    try:
        decoded = base64.b64decode(auth.split(" ", 1)[1], validate=True).decode("utf-8")
        username, password = decoded.split(":", 1)
    except Exception:
        return False
    return secrets.compare_digest(username, BASIC_AUTH_USERNAME) and secrets.compare_digest(password, BASIC_AUTH_PASSWORD)


def rpc(method: str, params: list[Any] | None = None, wallet: str | None = None) -> Any:
    payload = {
        "jsonrpc": "1.0",
        "id": "signet-core-study",
        "method": method,
        "params": params or [],
    }
    url = RPC_URL if wallet is None else f"{RPC_URL}/wallet/{wallet}"
    try:
        res = requests.post(url, json=payload, auth=(RPC_USER, RPC_PASSWORD), timeout=30)
        res.raise_for_status()
        data = res.json()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Bitcoin RPC unavailable: {exc}")

    if data.get("error"):
        raise HTTPException(status_code=500, detail=data["error"])
    return data.get("result")


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for") if TRUST_PROXY_HEADERS else None
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def validate_signet_address(address: str) -> bool:
    address = address.strip()
    if not address:
        return False
    if not (address.startswith("tb1") or address[0] in ("m", "n", "2")):
        return False
    try:
        return bool(rpc("validateaddress", [address]).get("isvalid"))
    except Exception:
        return False


def validate_wallet_name(name: str) -> str:
    name = name.strip()
    if not WALLET_NAME_RE.fullmatch(name):
        raise HTTPException(
            status_code=400,
            detail="Wallet name must be 1-64 characters and use only letters, numbers, dots, hyphens or underscores.",
        )
    return name


def validate_amount(amount: str | float | Decimal) -> Decimal:
    try:
        value = Decimal(str(amount))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid amount")
    if value <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")
    if value > MAX_WALLET_SEND_BTC:
        raise HTTPException(status_code=400, detail=f"Amount exceeds lab limit of {MAX_WALLET_SEND_BTC} sBTC")
    return value


def verify_turnstile(token: str | None, ip: str) -> bool:
    if not TURNSTILE_ENABLED:
        return True
    if not TURNSTILE_SECRET_KEY or not token:
        return False
    try:
        res = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": TURNSTILE_SECRET_KEY, "response": token, "remoteip": ip},
            timeout=10,
        )
        return bool(res.json().get("success"))
    except Exception:
        return False


def signet_amount_label(value: Any) -> str:
    if value is None:
        return "-"
    amount = Decimal(str(value))
    return f"{amount:.8f} sBTC / {int(amount * Decimal(100_000_000)):,} s-sats"


def enforce_rate_limit(ip: str, address: str):
    day_key = f"faucet:ip:{ip}:{time.strftime('%Y%m%d')}"
    count = redis_client.incr(day_key)
    if count == 1:
        redis_client.expire(day_key, 86400)
    if count > FAUCET_MAX_PER_IP_PER_DAY:
        raise HTTPException(status_code=429, detail="IP daily limit reached")

    address_key = f"faucet:addr:{address}"
    ttl = redis_client.ttl(address_key)
    if ttl > 0:
        raise HTTPException(status_code=429, detail=f"Address cooldown active. Try again in {ttl} seconds.")
    redis_client.setex(address_key, FAUCET_COOLDOWN_SECONDS, "1")


def node_summary() -> dict[str, Any]:
    try:
        blockchain = rpc("getblockchaininfo")
        network = rpc("getnetworkinfo")
        mempool = rpc("getmempoolinfo")
        zmq = rpc("getzmqnotifications")
        try:
            wallet = rpc("getwalletinfo", wallet=FAUCET_WALLET_NAME)
            wallet_balance = wallet.get("balance")
        except Exception:
            wallet_balance = None

        return {
            "ok": True,
            "chain": blockchain.get("chain"),
            "blocks": blockchain.get("blocks"),
            "headers": blockchain.get("headers"),
            "verificationprogress": round(float(blockchain.get("verificationprogress", 0)) * 100, 2),
            "initialblockdownload": blockchain.get("initialblockdownload"),
            "peers": network.get("connections"),
            "mempool": mempool.get("size"),
            "mempool_bytes": mempool.get("bytes"),
            "mempool_usage": mempool.get("usage"),
            "mempool_min_fee": mempool.get("mempoolminfee"),
            "wallet_balance": wallet_balance,
            "wallet_balance_display": signet_amount_label(wallet_balance),
            "zmq": zmq,
        }
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


@app.get("/", response_class=HTMLResponse)
def home(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="home.html",
        context={"title": APP_TITLE, "summary": node_summary(), "lang": lang or DEFAULT_LANG},
    )


@app.get("/study-docs", response_class=HTMLResponse)
def docs_page(request: Request, lang: str | None = None):
    docs_file = Path("/app/docs/bitcoin-core-study.md")
    try:
        content = docs_file.read_text(encoding="utf-8")
    except Exception:
        content = "# Documentation\n\nThe local study notes are unavailable in this container."
    return templates.TemplateResponse(
        request=request,
        name="docs.html",
        context={"title": "Study Docs", "content": escape(content), "lang": lang or DEFAULT_LANG},
    )


@app.get("/faucet", response_class=HTMLResponse)
def faucet_page(request: Request, lang: str | None = None):
    return templates.TemplateResponse(
        request=request,
        name="faucet.html",
        context={
            "title": APP_TITLE,
            "amount": str(FAUCET_AMOUNT_BTC),
            "cooldown": FAUCET_COOLDOWN_SECONDS,
            "turnstile_enabled": TURNSTILE_ENABLED,
            "turnstile_site_key": TURNSTILE_SITE_KEY,
            "summary": node_summary(),
            "lang": lang or DEFAULT_LANG,
        },
    )


@app.get("/mempool", response_class=HTMLResponse)
def mempool_page(request: Request, lang: str | None = None):
    return mempool_templates.TemplateResponse(
        request=request,
        name="mempool.html",
        context={"title": "Signet Mempool", "summary": node_summary(), "lang": lang or DEFAULT_LANG},
    )


@app.get("/wallet", response_class=HTMLResponse)
def wallet_page(request: Request, lang: str | None = None):
    return wallet_templates.TemplateResponse(
        request=request,
        name="wallet.html",
        context={"title": "Wallet Lab", "lang": lang or DEFAULT_LANG},
    )


@app.get("/stats", response_class=HTMLResponse)
def stats_page(request: Request, lang: str | None = None):
    return stats_templates.TemplateResponse(
        request=request,
        name="stats.html",
        context={"title": "Container Stats", "lang": lang or DEFAULT_LANG},
    )


@app.get("/api/status")
def status():
    return node_summary()


@app.get("/api/rpc-help")
def rpc_help(command: str = "getblockchaininfo"):
    return rpc("help", [command])


@app.get("/api/zmq")
def zmq():
    return rpc("getzmqnotifications")


@app.get("/api/mempool")
def mempool_info():
    return rpc("getmempoolinfo")


@app.get("/api/mempool/raw")
def mempool_raw(verbose: bool = False):
    return rpc("getrawmempool", [verbose])


@app.get("/api/mempool/txs")
def mempool_txs(limit: int = Query(80, ge=1, le=300)):
    verbose_mempool = rpc("getrawmempool", [True])
    current_tip = int(rpc("getblockchaininfo").get("blocks") or 0)

    def entry_fee_rate(item: tuple[str, dict[str, Any]]) -> float:
        entry = item[1]
        fee_btc = (entry.get("fees") or {}).get("base")
        vsize = entry.get("vsize") or 0
        if fee_btc is None or not vsize:
            return 0
        return (float(fee_btc) * 100_000_000) / float(vsize)

    projected_heights = {}
    projected_vbytes = 0
    for txid, entry in sorted(verbose_mempool.items(), key=entry_fee_rate, reverse=True):
        block_index = int(projected_vbytes // 1_000_000) + 1
        projected_heights[txid] = current_tip + block_index
        projected_vbytes += int(entry.get("vsize") or 0)

    txids = [
        txid for txid, _entry in sorted(
            verbose_mempool.items(),
            key=lambda item: (int(item[1].get("time") or 0), item[0]),
            reverse=True,
        )
    ][:limit]
    txs = []
    for txid in txids:
        try:
            entry = verbose_mempool[txid]
            raw = rpc("getrawtransaction", [txid, True])
            if raw.get("blockhash") or raw.get("confirmations") or raw.get("in_active_chain"):
                continue
            vin_count = len(raw.get("vin", []))
            outputs = raw.get("vout", [])
            vout_count = len(outputs)
            value_out = sum(float(v.get("value", 0)) for v in outputs)
            addresses = sorted({
                address
                for output in outputs
                for address in ([output.get("scriptPubKey", {}).get("address")] if output.get("scriptPubKey", {}).get("address") else [])
            })
            fee_btc = entry.get("fees", {}).get("base")
            vsize = entry.get("vsize") or 0
            fee_rate = None
            if fee_btc is not None and vsize:
                fee_rate = round((float(fee_btc) * 100_000_000) / vsize, 2)
            txs.append({
                "txid": txid,
                "vsize": vsize,
                "weight": entry.get("weight"),
                "fee": fee_btc,
                "fee_rate": fee_rate,
                "modified_fee": entry.get("fees", {}).get("modified"),
                "time": entry.get("time"),
                "height": entry.get("height"),
                "projected_block_height": projected_heights.get(txid),
                "depends": entry.get("depends", []),
                "spentby": entry.get("spentby", []),
                "vin": vin_count,
                "vout": vout_count,
                "value_out": round(value_out, 8),
                "addresses": addresses[:20],
            })
        except Exception as exc:
            txs.append({"txid": txid, "error": str(exc)})
    return {"count": len(txs), "txs": txs}


@app.get("/api/mempool/tx/{txid}")
def mempool_tx_detail(txid: str):
    txid = txid.strip()
    if not re.fullmatch(r"[0-9a-fA-F]{64}", txid):
        raise HTTPException(status_code=400, detail="Invalid transaction id")

    try:
        raw = rpc("getrawtransaction", [txid, True])
    except HTTPException as exc:
        raise HTTPException(status_code=404, detail=f"Transaction not found: {exc.detail}")

    entry = None
    try:
        entry = rpc("getmempoolentry", [txid])
    except Exception:
        entry = None

    outputs = []
    total_out = Decimal("0")
    for output in raw.get("vout", []):
        value = Decimal(str(output.get("value", 0)))
        total_out += value
        script = output.get("scriptPubKey", {}) or {}
        outputs.append({
            "n": output.get("n"),
            "value": str(value),
            "address": script.get("address"),
            "type": script.get("type"),
            "script": script.get("hex"),
        })

    inputs = []
    total_in: Decimal | None = Decimal("0")
    for vin in raw.get("vin", []):
        item = {
            "txid": vin.get("txid"),
            "vout": vin.get("vout"),
            "sequence": vin.get("sequence"),
            "coinbase": vin.get("coinbase"),
            "witness_items": len(vin.get("txinwitness", []) or []),
            "prevout": None,
        }
        if vin.get("txid") is not None and vin.get("vout") is not None:
            try:
                prev = rpc("getrawtransaction", [vin["txid"], True])
                prevout = prev.get("vout", [])[int(vin["vout"])]
                prev_value = Decimal(str(prevout.get("value", 0)))
                prev_script = prevout.get("scriptPubKey", {}) or {}
                item["prevout"] = {
                    "value": str(prev_value),
                    "address": prev_script.get("address"),
                    "type": prev_script.get("type"),
                }
                if total_in is not None:
                    total_in += prev_value
            except Exception:
                total_in = None
        inputs.append(item)

    fee = None
    fee_rate = None
    if entry:
        fee = Decimal(str((entry.get("fees") or {}).get("base", 0)))
    elif total_in is not None:
        fee = total_in - total_out

    vsize = raw.get("vsize") or 0
    if fee is not None and vsize:
        fee_rate = round((float(fee) * 100_000_000) / int(vsize), 2)

    return {
        "txid": txid,
        "hash": raw.get("hash"),
        "status": "mempool" if entry else "confirmed_or_unknown",
        "version": raw.get("version"),
        "locktime": raw.get("locktime"),
        "size": raw.get("size"),
        "vsize": raw.get("vsize"),
        "weight": raw.get("weight"),
        "fee": str(fee) if fee is not None else None,
        "fee_rate": fee_rate,
        "total_in": str(total_in) if total_in is not None else None,
        "total_out": str(total_out),
        "time": entry.get("time") if entry else raw.get("time"),
        "height": entry.get("height") if entry else raw.get("height"),
        "depends": entry.get("depends", []) if entry else [],
        "spentby": entry.get("spentby", []) if entry else [],
        "inputs": inputs,
        "outputs": outputs,
        "hex": raw.get("hex"),
    }


@app.get("/api/search/address/{address}")
def search_address(address: str, refresh: bool = Query(False)):
    address = address.strip()
    if not re.fullmatch(r"[A-Za-z0-9]{14,90}", address):
        raise HTTPException(status_code=400, detail="Invalid address")

    validation = rpc("validateaddress", [address])
    if validation.get("isvalid") is False:
        raise HTTPException(status_code=400, detail="Invalid address")

    witness_program = validation.get("witness_program") or ""
    if validation.get("iswitness") and validation.get("witness_version") == 0 and len(witness_program) == 40:
        address_type = "P2WPKH"
    elif validation.get("iswitness") and validation.get("witness_version") == 0 and len(witness_program) == 64:
        address_type = "P2WSH"
    elif validation.get("iswitness") and validation.get("witness_version") == 1:
        address_type = "P2TR"
    elif validation.get("isscript"):
        address_type = "P2SH"
    else:
        address_type = "P2PKH"

    cache_key = f"address-search:{address}"
    cached = redis_client.get(cache_key)
    if cached and not refresh:
        return json.loads(cached)

    def empty_stats() -> dict[str, Any]:
        return {
            "funded_txo_count": 0,
            "funded_txo_sum": 0.0,
            "spent_txo_count": 0,
            "spent_txo_sum": 0.0,
            "tx_count": 0,
        }

    def raw_tx_summary(txid: str, source: str, amount: Any = None, height: Any = None) -> dict[str, Any] | None:
        try:
            raw = rpc("getrawtransaction", [txid, True])
        except Exception:
            return None

        funded_outputs = []
        funded_sum = Decimal("0")
        for output in raw.get("vout", []):
            script = output.get("scriptPubKey", {}) or {}
            if script.get("address") != address:
                continue
            value = Decimal(str(output.get("value", 0)))
            funded_sum += value
            funded_outputs.append({
                "n": output.get("n"),
                "value": float(value),
                "type": script.get("type"),
            })

        spent_inputs = []
        spent_sum = Decimal("0")
        for vin in raw.get("vin", []):
            if vin.get("txid") is None or vin.get("vout") is None:
                continue
            try:
                prev = rpc("getrawtransaction", [vin["txid"], True])
                prevout = prev.get("vout", [])[int(vin["vout"])]
                script = prevout.get("scriptPubKey", {}) or {}
                if script.get("address") != address:
                    continue
                value = Decimal(str(prevout.get("value", 0)))
                spent_sum += value
                spent_inputs.append({
                    "txid": vin.get("txid"),
                    "vout": vin.get("vout"),
                    "value": float(value),
                })
            except Exception:
                continue

        block_height = height
        block_time = raw.get("time")
        block_hash = raw.get("blockhash")
        if block_hash:
            try:
                header = rpc("getblockheader", [block_hash, True])
                block_height = header.get("height", block_height)
                block_time = header.get("time", block_time)
            except Exception:
                pass

        return {
            "txid": txid,
            "source": source,
            "status": "confirmed" if block_hash or height else "mempool",
            "block_height": block_height,
            "block_time": block_time,
            "vin": len(raw.get("vin", [])),
            "vout": len(raw.get("vout", [])),
            "vsize": raw.get("vsize"),
            "funded_outputs": funded_outputs,
            "spent_inputs": spent_inputs,
            "value_to_address": float(funded_sum),
            "value_from_address": float(spent_sum),
            "amount": amount,
        }

    matches: list[dict[str, Any]] = []
    verbose_mempool = rpc("getrawmempool", [True])
    for txid in verbose_mempool.keys():
        if len(matches) >= 25:
            break
        try:
            raw = rpc("getrawtransaction", [txid, True])
            outputs = raw.get("vout", [])
            output_matches = [
                {
                    "n": output.get("n"),
                    "value": output.get("value"),
                    "type": output.get("scriptPubKey", {}).get("type"),
                }
                for output in outputs
                if output.get("scriptPubKey", {}).get("address") == address
            ]
            if output_matches:
                matches.append({"source": "mempool", "txid": txid, "outputs": output_matches})
        except Exception:
            continue

    wallet_matches: list[dict[str, Any]] = []
    wallet_utxos: list[dict[str, Any]] = []
    try:
        loaded = set(rpc("listwallets"))
        for wallet in loaded:
            if not WALLET_NAME_RE.fullmatch(wallet):
                continue
            try:
                received = rpc("listreceivedbyaddress", [0, True, True], wallet=wallet)
                for row in received:
                    if row.get("address") == address:
                        wallet_matches.append({
                            "source": "wallet",
                            "wallet": wallet,
                            "amount": row.get("amount"),
                            "confirmations": row.get("confirmations"),
                            "label": row.get("label", ""),
                            "txids": row.get("txids", []),
                        })
                for item in rpc("listunspent", [0, 9999999, [address]], wallet=wallet):
                    wallet_utxos.append({
                        "txid": item.get("txid"),
                        "vout": item.get("vout"),
                        "amount": item.get("amount"),
                        "height": item.get("height"),
                        "confirmations": item.get("confirmations"),
                        "wallet": wallet,
                    })
            except Exception:
                continue
    except Exception:
        pass

    utxos: list[dict[str, Any]] = []
    if wallet_utxos:
        utxos = wallet_utxos[:25]
    else:
        try:
            scan = rpc("scantxoutset", ["start", [{"desc": f"addr({address})"}]])
            utxos = [
                {
                    "txid": item.get("txid"),
                    "vout": item.get("vout"),
                    "amount": item.get("amount"),
                    "height": item.get("height"),
                }
                for item in scan.get("unspents", [])
            ][:25]
        except Exception:
            utxos = []

    summaries: dict[str, dict[str, Any]] = {}
    for match in matches:
        summary = raw_tx_summary(match["txid"], "mempool")
        if summary:
            summaries[match["txid"]] = summary
    for match in wallet_matches:
        for txid in match.get("txids", []):
            summary = raw_tx_summary(txid, f"wallet {match.get('wallet')}", match.get("amount"))
            if summary:
                summaries[txid] = summary
    for utxo in utxos:
        txid = utxo.get("txid")
        if not txid:
            continue
        summary = summaries.get(txid) or raw_tx_summary(txid, "utxo", utxo.get("amount"), utxo.get("height"))
        if summary:
            summary["source"] = "utxo"
            summary["amount"] = utxo.get("amount")
            summary["block_height"] = summary.get("block_height") or utxo.get("height")
            summaries[txid] = summary

    transactions = sorted(
        summaries.values(),
        key=lambda item: (item.get("block_height") or 10**12, item.get("block_time") or 10**12, item.get("txid") or ""),
        reverse=True,
    )

    chain_stats = empty_stats()
    mempool_stats = empty_stats()
    for tx in transactions:
        stats = mempool_stats if tx.get("status") == "mempool" else chain_stats
        stats["tx_count"] += 1
        stats["funded_txo_count"] += len(tx.get("funded_outputs", []))
        stats["funded_txo_sum"] += float(tx.get("value_to_address") or 0)
        stats["spent_txo_count"] += len(tx.get("spent_inputs", []))
        stats["spent_txo_sum"] += float(tx.get("value_from_address") or 0)

    result = {
        "address": address,
        "address_type": address_type,
        "script_pubkey": validation.get("scriptPubKey"),
        "mempool": matches,
        "wallets": wallet_matches,
        "utxos": utxos,
        "lookup_method": "wallet" if wallet_utxos else "utxo_scan",
        "transactions": transactions,
        "chain_stats": chain_stats,
        "mempool_stats": mempool_stats,
        "balance": round(chain_stats["funded_txo_sum"] - chain_stats["spent_txo_sum"] + mempool_stats["funded_txo_sum"] - mempool_stats["spent_txo_sum"], 8),
    }
    redis_client.setex(cache_key, 60, json.dumps(result))
    return result


@app.get("/api/mempool/blocks")
def mempool_blocks():
    verbose_mempool = rpc("getrawmempool", [True])
    clean = []
    for txid, entry in verbose_mempool.items():
        fee_btc = entry.get("fees", {}).get("base")
        vsize = entry.get("vsize") or 0
        fee_rate = 0
        if fee_btc is not None and vsize:
            fee_rate = round((float(fee_btc) * 100_000_000) / vsize, 2)
        clean.append({"txid": txid, "vsize": vsize, "fee": fee_btc, "fee_rate": fee_rate})
    clean.sort(key=lambda x: x.get("fee_rate") or 0, reverse=True)
    blocks = []
    chunk = 40
    for i in range(0, min(len(clean), 240), chunk):
        part = clean[i:i + chunk]
        blocks.append({
            "index": len(blocks) + 1,
            "tx_count": len(part),
            "vbytes": sum(int(t.get("vsize") or 0) for t in part),
            "fees": round(sum(float(t.get("fee") or 0) for t in part), 8),
            "min_fee_rate": min([t.get("fee_rate") or 0 for t in part], default=0),
            "max_fee_rate": max([t.get("fee_rate") or 0 for t in part], default=0),
        })
    return {"blocks": blocks}


def tx_list_item(txid: str, raw: dict[str, Any], fee_btc: Any = None, fee_rate: Any = None) -> dict[str, Any]:
    outputs = raw.get("vout", [])
    value_out = sum(float(v.get("value", 0)) for v in outputs)
    vsize = raw.get("vsize") or raw.get("size") or 0
    computed_fee_rate = fee_rate
    if computed_fee_rate is None and fee_btc is not None and vsize:
        computed_fee_rate = round((float(fee_btc) * 100_000_000) / float(vsize), 2)
    return {
        "txid": txid,
        "vin": len(raw.get("vin", [])),
        "vout": len(outputs),
        "vsize": vsize,
        "weight": raw.get("weight"),
        "fee": fee_btc,
        "fee_rate": computed_fee_rate,
        "value_out": round(value_out, 8),
        "time": raw.get("time"),
    }


@app.get("/api/mempool/projected-block/{index}")
def projected_block_transactions(index: int):
    if index < 1:
        raise HTTPException(status_code=400, detail="Invalid projected block index")
    verbose_mempool = rpc("getrawmempool", [True])
    clean = []
    for txid, entry in verbose_mempool.items():
        fee_btc = entry.get("fees", {}).get("base")
        vsize = entry.get("vsize") or 0
        fee_rate = 0
        if fee_btc is not None and vsize:
            fee_rate = round((float(fee_btc) * 100_000_000) / vsize, 2)
        clean.append({"txid": txid, "vsize": vsize, "fee": fee_btc, "fee_rate": fee_rate, "time": entry.get("time")})
    clean.sort(key=lambda x: x.get("fee_rate") or 0, reverse=True)
    chunk = 40
    start = (index - 1) * chunk
    part = clean[start:start + chunk]
    if not part:
        raise HTTPException(status_code=404, detail="Projected block not found")
    txs = []
    for item in part:
        try:
            raw = rpc("getrawtransaction", [item["txid"], True])
            txs.append(tx_list_item(item["txid"], raw, item.get("fee"), item.get("fee_rate")))
        except Exception as exc:
            txs.append({"txid": item["txid"], "error": str(exc)})
    return {
        "kind": "projected",
        "index": index,
        "tx_count": len(txs),
        "vbytes": sum(int(t.get("vsize") or 0) for t in txs),
        "fees": round(sum(float(t.get("fee") or 0) for t in txs), 8),
        "transactions": txs,
    }


@app.get("/api/blocks/recent")
def recent_blocks(limit: int = Query(6, ge=1, le=50)):
    info = rpc("getblockchaininfo")
    height = int(info.get("blocks", 0))
    blocks = []
    for block_height in range(height, max(-1, height - limit), -1):
        try:
            block_hash = rpc("getblockhash", [block_height])
            block = rpc("getblock", [block_hash, 2])
            fee_rates = []
            total_fees = Decimal("0")
            for tx in block.get("tx", []):
                if "fee" not in tx:
                    continue
                fee = Decimal(str(tx.get("fee") or "0"))
                vsize = Decimal(str(tx.get("vsize") or "0"))
                total_fees += fee
                if vsize:
                    fee_rates.append(round(float((fee * Decimal(100_000_000)) / vsize), 2))
            blocks.append({
                "height": block.get("height", block_height),
                "hash": block_hash,
                "time": block.get("time"),
                "tx_count": block.get("nTx"),
                "size": block.get("size"),
                "weight": block.get("weight"),
                "fees": float(total_fees),
                "min_fee_rate": min(fee_rates, default=0),
                "max_fee_rate": max(fee_rates, default=0),
                "avg_fee_rate": round(sum(fee_rates) / len(fee_rates), 2) if fee_rates else 0,
            })
        except Exception:
            continue
    return {"tip": height, "blocks": blocks}


@app.get("/api/blocks/{height}/txs")
def mined_block_transactions(height: int):
    if height < 0:
        raise HTTPException(status_code=400, detail="Invalid block height")
    block_hash = rpc("getblockhash", [height])
    block = rpc("getblock", [block_hash, 2])
    txs = []
    for tx in block.get("tx", []):
        fee = tx.get("fee")
        txs.append(tx_list_item(tx.get("txid"), tx, fee))
    return {
        "kind": "mined",
        "height": block.get("height", height),
        "hash": block_hash,
        "time": block.get("time"),
        "tx_count": block.get("nTx"),
        "size": block.get("size"),
        "weight": block.get("weight"),
        "transactions": txs,
    }


@app.post("/api/request")
def request_coins(
    request: Request,
    address: str = Form(...),
    cf_turnstile_response: str | None = Form(None, alias="cf-turnstile-response"),
):
    ip = client_ip(request)
    address = address.strip()

    if not verify_turnstile(cf_turnstile_response, ip):
        raise HTTPException(status_code=400, detail="CAPTCHA failed")

    if not validate_signet_address(address):
        raise HTTPException(status_code=400, detail="Invalid Signet/testnet address")

    enforce_rate_limit(ip, address)
    txid = rpc("sendtoaddress", [address, str(FAUCET_AMOUNT_BTC)], wallet=FAUCET_WALLET_NAME)
    redis_client.lpush("faucet:txs", f"{int(time.time())}|{ip}|{address}|{txid}")
    redis_client.ltrim("faucet:txs", 0, 99)
    return {"status": "sent", "amount": str(FAUCET_AMOUNT_BTC), "txid": txid}


@app.get("/api/history")
def history():
    rows = redis_client.lrange("faucet:txs", 0, 20)
    out = []
    for row in rows:
        ts, ip, address, txid = row.split("|", 3)
        out.append({"time": int(ts), "ip": ip, "address": address, "txid": txid})
    return out


@app.get("/api/wallet/list")
def wallet_list():
    return rpc("listwallets")


@app.get("/api/wallet/overview")
def wallet_overview():
    loaded = set(rpc("listwallets"))
    directory = rpc("listwalletdir").get("wallets", [])
    names = [item.get("name") for item in directory if item.get("name")]
    for name in loaded:
        if name not in names:
            names.append(name)

    wallets = []
    for name in names:
        if not WALLET_NAME_RE.fullmatch(name):
            continue
        load_error = None
        if name not in loaded:
            try:
                rpc("loadwallet", [name])
                loaded.add(name)
            except Exception as exc:
                load_error = str(exc)

        balance = None
        addresses = []
        if load_error is None:
            try:
                info = rpc("getwalletinfo", wallet=name)
                balance = info.get("balance")
                received = rpc("listreceivedbyaddress", [0, True, True], wallet=name)
                addresses = [
                    {
                        "address": row.get("address"),
                        "label": row.get("label", ""),
                        "amount": row.get("amount", 0),
                        "confirmations": row.get("confirmations", 0),
                    }
                    for row in received
                ]
            except Exception as exc:
                load_error = str(exc)

        wallets.append({
            "name": name,
            "loaded": name in loaded,
            "balance": balance,
            "addresses": addresses,
            "error": load_error,
        })
    return {"wallets": wallets}


@app.post("/api/wallet/create")
def wallet_create(name: str = Form(...)):
    name = validate_wallet_name(name)
    try:
        result = rpc("createwallet", [name])
    except HTTPException as exc:
        # If already exists, try loading it.
        if "Database already exists" in str(exc.detail):
            result = rpc("loadwallet", [name])
        else:
            raise
    return result


@app.post("/api/wallet/create-faucet")
def wallet_create_faucet():
    name = validate_wallet_name(FAUCET_WALLET_NAME)
    try:
        result = rpc("createwallet", [name])
    except HTTPException as exc:
        # If already exists, try loading it.
        if "Database already exists" in str(exc.detail):
            result = rpc("loadwallet", [name])
        else:
            raise
    address = rpc("getnewaddress", ["faucet"], wallet=name)
    return {"wallet": name, "result": result, "address": address}


@app.post("/api/wallet/load")
def wallet_load(name: str = Form(...)):
    name = validate_wallet_name(name)
    return rpc("loadwallet", [name])


@app.post("/api/wallet/delete")
def wallet_delete(name: str = Form(...)):
    name = validate_wallet_name(name)
    try:
        if name not in set(rpc("listwallets")):
            rpc("loadwallet", [name])
        info = rpc("getwalletinfo", wallet=name)
        balance = Decimal(str(info.get("balance", 0)))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to inspect wallet before deletion: {exc}") from exc

    if balance > 0:
        raise HTTPException(status_code=400, detail="Wallet has balance. Move funds before deleting it.")

    try:
        return {"wallet": name, "deleted": True, "result": rpc("deletewallet", [name])}
    except HTTPException as exc:
        if "Method not found" not in str(exc.detail):
            raise
        result = rpc("unloadwallet", [name])
        return {
            "wallet": name,
            "deleted": False,
            "unloaded": True,
            "result": result,
            "warning": "This Bitcoin Core RPC set does not expose deletewallet; wallet was unloaded but files were not removed.",
        }


@app.post("/api/wallet/address")
def wallet_address(wallet: str = Form(...), label: str = Form("")):
    wallet = validate_wallet_name(wallet)
    label = label.strip()[:80]
    return {"wallet": wallet, "address": rpc("getnewaddress", [label], wallet=wallet)}


@app.post("/api/wallet/sign")
def wallet_sign(wallet: str = Form(...), to_address: str = Form(...), amount: str = Form(...)):
    wallet = validate_wallet_name(wallet)
    to_address = to_address.strip()
    if not validate_signet_address(to_address):
        raise HTTPException(status_code=400, detail="Invalid Signet/testnet address")
    amount_btc = validate_amount(amount)
    psbt = rpc("walletcreatefundedpsbt", [[], [{to_address: str(amount_btc)}], 0, {"subtractFeeFromOutputs": [0]}, True], wallet=wallet)
    processed = rpc("walletprocesspsbt", [psbt["psbt"]], wallet=wallet)
    finalized = rpc("finalizepsbt", [processed["psbt"]])
    return {
        "wallet": wallet,
        "to_address": to_address,
        "amount": str(amount_btc),
        "psbt": psbt,
        "processed": processed,
        "finalized": finalized,
        "note": "Raw transaction is signed but not broadcast by this endpoint.",
    }


@app.post("/api/wallet/broadcast")
def wallet_broadcast(hex_tx: str = Form(...)):
    hex_tx = hex_tx.strip()
    if not re.fullmatch(r"[0-9a-fA-F]{20,400000}", hex_tx):
        raise HTTPException(status_code=400, detail="Invalid raw transaction hex")
    return {"txid": rpc("sendrawtransaction", [hex_tx])}


@app.get("/api/container-stats")
def container_stats():
    if not ENABLE_CONTAINER_STATS:
        return {
            "enabled": False,
            "containers": [],
            "message": "Container stats are disabled. Enable ENABLE_CONTAINER_STATS=true and mount the Docker socket only in trusted local environments.",
        }
    if not Path("/var/run/docker.sock").exists():
        return {
            "enabled": False,
            "containers": [],
            "message": "Container stats are disabled in the secure compose profile. Use docker-compose.stats.yml only in trusted local environments.",
        }
    try:
        client = docker.from_env()
        size_rows = client.api.containers(all=True, size=True)
        size_by_id = {row.get("Id"): row for row in size_rows}
        out = []
        for container in client.containers.list(all=True):
            if container.name not in PROJECT_CONTAINER_NAMES:
                continue
            size_info = size_by_id.get(container.id, {})
            item = {
                "name": container.name,
                "image": container.image.tags[0] if container.image.tags else container.image.short_id,
                "status": container.status,
                "id": container.short_id,
                "disk_size": int(size_info.get("SizeRootFs") or 0) + int(size_info.get("SizeRw") or 0),
                "disk_rw": int(size_info.get("SizeRw") or 0),
            }
            if container.status == "running":
                stats = container.stats(stream=False)
                cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - stats["precpu_stats"]["cpu_usage"]["total_usage"]
                system_delta = stats["cpu_stats"].get("system_cpu_usage", 0) - stats["precpu_stats"].get("system_cpu_usage", 0)
                cpu_count = len(stats["cpu_stats"]["cpu_usage"].get("percpu_usage", []) or [1])
                cpu_percent = 0.0
                if system_delta > 0 and cpu_delta > 0:
                    cpu_percent = (cpu_delta / system_delta) * cpu_count * 100.0
                mem_usage = stats["memory_stats"].get("usage", 0)
                mem_limit = stats["memory_stats"].get("limit", 0)
                networks = stats.get("networks", {}) or {}
                rx = sum(v.get("rx_bytes", 0) for v in networks.values())
                tx = sum(v.get("tx_bytes", 0) for v in networks.values())
                blk = stats.get("blkio_stats", {}).get("io_service_bytes_recursive", []) or []
                read_bytes = sum(x.get("value", 0) for x in blk if x.get("op") == "Read")
                write_bytes = sum(x.get("value", 0) for x in blk if x.get("op") == "Write")
                item.update({
                    "cpu_percent": round(cpu_percent, 2),
                    "mem_usage": mem_usage,
                    "mem_limit": mem_limit,
                    "mem_percent": round((mem_usage / mem_limit * 100) if mem_limit else 0, 2),
                    "net_rx": rx,
                    "net_tx": tx,
                    "block_read": read_bytes,
                    "block_write": write_bytes,
                })
            out.append(item)
        return {"containers": out}
    except Exception as exc:
        return {
            "enabled": False,
            "containers": [],
            "message": f"Container stats are unavailable: {exc}",
        }
