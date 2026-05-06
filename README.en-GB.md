# Signet Core Study Platform

A local Bitcoin Core study platform for Signet. The project includes a Bitcoin Core node, faucet, mempool monitor, wallet/signing lab, optional container stats and an HDMI dashboard.

## Requirements

- Docker and Docker Compose.
- Python `3.14-slim` base image defined in the `Dockerfile`.
- Python dependencies pinned to exact versions in `requirements.txt`.
- 4 GB of free RAM recommended.
- Local ports `8080` and `8181` available.

## Structure

```text
.
├── bitcoin/              # Bitcoin Core Signet configuration
├── faucet/               # Main FastAPI app and APIs
├── mempool-ui/           # HTML/CSS/JS mempool interface
├── wallet-lab/           # Wallet, PSBT and signing lab
├── container-stats/      # Container stats UI
├── display/              # HDMI/kiosk dashboard
├── scripts/              # bitcoin-cli helpers
├── systemd/              # Optional kiosk service
└── docs/                 # Study notes
```

## Installation

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and replace `BITCOIN_RPC_PASSWORD` with a long random password.

```bash
nano .env
```

3. Start the services:

```bash
docker compose up -d --build
```

4. Initialise the faucet wallet:

```bash
chmod +x scripts/*.sh
./scripts/init-wallet.sh
```

5. Check sync status:

```bash
./scripts/status.sh
```

## Usage

```text
http://localhost:8080          # home
http://localhost:8080/mempool  # mempool monitor
http://localhost:8080/faucet   # Signet faucet
http://localhost:8080/wallet   # wallet lab
http://localhost:8080/stats    # container stats
http://localhost:8181          # HDMI display
```

All primary pages can switch between `pt-BR` and `en-GB`.

## Secure Internet Publication

Do not publish this stack directly to the internet without a protection layer. For a public environment, use a reverse proxy with HTTPS, authentication and explicit blocking for administrative areas.

Minimum recommendation:

- bind Docker ports to `127.0.0.1` only and expose the public service only through the reverse proxy;
- enable HTTPS with Caddy, Nginx, Traefik or Cloudflare Tunnel;
- configure `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` to protect the whole app when it is reachable outside the local network;
- enable `TURNSTILE_ENABLED=true` for the faucet and configure the Cloudflare keys;
- keep `ENABLE_CONTAINER_STATS=false` in production and do not use the `docker-compose.stats.yml` override;
- do not expose `/wallet`, `/api/wallet/*`, `/stats`, `/api/container-stats`, RPC, ZMQ, Redis or the Docker socket to the internet;
- keep only a small balance in the faucet wallet and use Signet coins only;
- use a host firewall allowing public access only to `80/tcp` and `443/tcp`;
- use `TRUST_PROXY_HEADERS=true` only when the proxy is under your control.

Safe local bind example for reverse-proxy publication:

```yaml
ports:
  - "127.0.0.1:8080:8080"
  - "127.0.0.1:8181:8181"
```

## Container Stats

The `/stats` page is disabled by default to avoid exposing the Docker socket. For a trusted local lab, set `ENABLE_CONTAINER_STATS=true` in `.env` and start the stack with the override:

```bash
docker compose -f docker-compose.yml -f docker-compose.stats.yml up -d --build
```

That override mounts the Docker socket read-only in the `faucet` container and runs that container as `root`. This is convenient for a local lab, but do not expose it to the internet. Even read-only Docker socket access can reveal sensitive host information.

It shows only this stack's containers (`signet-bitcoind`, `signet-redis`, `signet-faucet`, `signet-display`), including CPU, memory, disk size, network and I/O. The screen refreshes automatically every 30 seconds and has an immediate refresh button.

## Scripts

- `scripts/common.sh`: internal helper used by the other scripts. It loads `.env` and centralises `bitcoin-cli` calls inside the `signet-bitcoind` container.
- `scripts/bitcoin-cli.sh`: runs any Signet `bitcoin-cli` command. Example: `./scripts/bitcoin-cli.sh getblockchaininfo`.
- `scripts/init-wallet.sh`: loads the wallet from `FAUCET_WALLET_NAME`; if it does not exist yet, it creates it and prints a fresh address.
- `scripts/status.sh`: prints blockchain, network, mempool, ZMQ and faucet wallet information.
- `scripts/mempool.sh`: prints `getmempoolinfo` and the raw local mempool transaction list.
- `scripts/new-address.sh`: creates a new receiving address in the faucet wallet.
- `scripts/send-test.sh`: sends Signet coins from the faucet wallet to the provided address. Usage: `./scripts/send-test.sh <signet_address> <amount_btc>`.

## Faucet And Signet Coins

This project does not mine or create Signet coins automatically. The faucet only sends coins that already exist in the wallet configured by `FAUCET_WALLET_NAME`.

Recommended flow:

```bash
./scripts/init-wallet.sh
./scripts/new-address.sh
```

Send sBTC from an external Signet source to the generated address. Once confirmed, the `/faucet` page can distribute `FAUCET_AMOUNT_BTC` per request, respecting cooldown and per-IP limits.

## Mempool

The `/mempool` monitor is inspired by `mempool.space/signet` and uses only HTML, CSS and JavaScript served by FastAPI.

Main features:

- blocks to be mined on the left and mined blocks on the right;
- recent mined blocks in a horizontal row, with mouse drag and scrollbar navigation;
- blocks sorted by height, highest to lowest;
- cube-style blocks with block number, fee range, total sBTC, transaction count and relative time;
- transaction list paginated 10 at a time, sorted by ascending time;
- full TXIDs as links, highlighting the first 7 and last 7 characters;
- top search for TXID, block, hash, node metric and address;
- transaction modal with inputs, outputs, fee, size, weight, dependencies, raw hex and decoded JSON;
- address modal inspired by mempool.space, with balance, received, sent, UTXOs, balance history chart, UTXO bubbles and transaction history.

### Address Search

Plain Bitcoin Core does not provide a full address index like mempool.space typically gets through Esplora/Electrum. To keep this project local and simple:

- if the address belongs to a loaded wallet, the API uses `listreceivedbyaddress` and `listunspent`, which is fast;
- otherwise, it falls back to `scantxoutset`, which can take a few seconds;
- address responses are cached in Redis for 60 seconds.

So local wallet addresses should open quickly; arbitrary addresses can be slower.

## Security Hardening

- The web containers run as a non-root user in the default compose file. The `docker-compose.stats.yml` override switches `faucet` to `root` only when local Docker socket stats are enabled.
- Both Python apps share one root `Dockerfile` and one root `requirements.txt`.
- The Python runtime is fixed to `python:3.14-slim` and every Python library is pinned with `==` for reproducible builds.
- Duplicate subdirectory `Dockerfile` and `requirements.txt` files were removed.
- Bitcoin Core RPC/ZMQ ports are exposed only inside the Docker network by default.
- Basic HTTP security headers were added.
- Optional HTTP Basic authentication was added through `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`.
- `x-forwarded-for` is accepted only when `TRUST_PROXY_HEADERS=true`.
- Wallet endpoints validate wallet names, Signet addresses, amounts and raw transaction hex.
- Dynamic UI rendering escapes content before inserting HTML.
- Docker socket based stats are opt-in.

## Important Variables

```text
BITCOIN_RPC_USER              Bitcoin Core RPC user
BITCOIN_RPC_PASSWORD          strong RPC password
FAUCET_AMOUNT_BTC             amount sent per request
FAUCET_COOLDOWN_SECONDS       cooldown per address
FAUCET_MAX_PER_IP_PER_DAY     daily limit per IP
FAUCET_WALLET_NAME            wallet used by the faucet
MAX_WALLET_SEND_BTC           signing lab amount limit
TURNSTILE_ENABLED             enables Cloudflare Turnstile
TRUST_PROXY_HEADERS           trusts x-forwarded-for from a reverse proxy
ENABLE_CONTAINER_STATS        enables the container stats API
BASIC_AUTH_USERNAME           username for optional HTTP Basic authentication
BASIC_AUTH_PASSWORD           password for optional HTTP Basic authentication
DEFAULT_LANG                  default language: pt-BR or en-GB
```

## ZMQ

Bitcoin Core publishes ZMQ events inside the Docker network:

```ini
zmqpubrawblock=tcp://0.0.0.0:28332
zmqpubrawtx=tcp://0.0.0.0:28333
zmqpubhashblock=tcp://0.0.0.0:28334
zmqpubhashtx=tcp://0.0.0.0:28335
```

Use host `bitcoind` from other containers.

## Maintenance

```bash
docker compose ps
docker compose logs -f faucet
docker compose down
docker compose pull
docker compose up -d --build
```
