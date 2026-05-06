import base64
import os
import secrets
from typing import Any
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

RPC_USER=os.getenv("BITCOIN_RPC_USER","bitcoin")
RPC_PASSWORD=os.getenv("BITCOIN_RPC_PASSWORD","")
RPC_URL=os.getenv("BITCOIN_RPC_URL","http://bitcoind:38332")
FAUCET_WALLET_NAME=os.getenv("FAUCET_WALLET_NAME","faucet")
APP_TITLE=os.getenv("APP_TITLE","Signet Core Study Platform")
DEFAULT_LANG=os.getenv("DEFAULT_LANG","pt-BR")
BASIC_AUTH_USERNAME=os.getenv("BASIC_AUTH_USERNAME","")
BASIC_AUTH_PASSWORD=os.getenv("BASIC_AUTH_PASSWORD","")

app=FastAPI(title="Signet Display")
app.mount("/static", StaticFiles(directory="/app/app/static"), name="static")
templates=Jinja2Templates(directory="/app/app/templates")

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    if BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD and not basic_auth_is_valid(request):
        response=HTMLResponse("Authentication required",status_code=401,headers={"WWW-Authenticate":'Basic realm="Signet Display"'})
        add_common_security_headers(response)
        return response
    response=await call_next(request)
    add_common_security_headers(response)
    return response

def add_common_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options","nosniff")
    response.headers.setdefault("X-Frame-Options","DENY")
    response.headers.setdefault("Referrer-Policy","same-origin")
    response.headers.setdefault("Permissions-Policy","camera=(), microphone=(), geolocation=()")

def basic_auth_is_valid(request: Request) -> bool:
    auth=request.headers.get("authorization","")
    if not auth.lower().startswith("basic "):
        return False
    try:
        decoded=base64.b64decode(auth.split(" ",1)[1],validate=True).decode("utf-8")
        username,password=decoded.split(":",1)
    except Exception:
        return False
    return secrets.compare_digest(username,BASIC_AUTH_USERNAME) and secrets.compare_digest(password,BASIC_AUTH_PASSWORD)

def rpc(method:str, params:list[Any]|None=None, wallet:str|None=None)->Any:
    url=f"{RPC_URL}/wallet/{wallet}" if wallet else RPC_URL
    try:
        res=requests.post(url,json={"jsonrpc":"1.0","id":"display","method":method,"params":params or []},auth=(RPC_USER,RPC_PASSWORD),timeout=8)
        res.raise_for_status()
        data=res.json()
    except Exception as exc:
        raise HTTPException(503, detail=f"Bitcoin RPC unavailable: {exc}")
    if data.get("error"): raise HTTPException(500, detail=data["error"])
    return data["result"]

def btc_sats(value: Any) -> dict[str, str]:
    if value is None:
        return {"btc": "-", "sats": "-"}
    amount = float(value)
    return {"btc": f"{amount:.8f} sBTC", "sats": f"{round(amount * 100_000_000):,} s-sats"}

def fee_formats(value: Any) -> dict[str, str]:
    if value is None:
        return {"btc": "-", "sats": "-"}
    fee_btc_kvb = float(value)
    sats_vb = fee_btc_kvb * 100_000
    return {"btc": f"{fee_btc_kvb:.8f} sBTC/kvB", "sats": f"{sats_vb:.2f} s-sats/vB"}

def summary():
    try:
        bc=rpc("getblockchaininfo"); net=rpc("getnetworkinfo"); mem=rpc("getmempoolinfo")
        try: balance=rpc("getwalletinfo", wallet=FAUCET_WALLET_NAME).get("balance")
        except Exception: balance=None
        minfee=mem.get("mempoolminfee")
        return {"ok":True,"chain":bc.get("chain"),"blocks":bc.get("blocks"),"headers":bc.get("headers"),"sync":round(float(bc.get("verificationprogress",0))*100,2),"peers":net.get("connections"),"mempool":mem.get("size"),"mempool_bytes":mem.get("bytes"),"minfee":minfee,"minfee_display":fee_formats(minfee),"balance":balance,"balance_display":btc_sats(balance)}
    except Exception as e:
        return {"ok":False,"error":str(e)}

@app.get("/", response_class=HTMLResponse)
def index(request: Request, lang: str | None = None):
    return templates.TemplateResponse(request=request, name="display.html", context={"title":APP_TITLE,"s":summary(),"lang":lang or DEFAULT_LANG})

@app.get("/api/status")
def api_status():
    return summary()
