<div align="center">

# ⚡ Signet Core Study Platform

### A self-contained Bitcoin Core lab for learners — node, faucet, mempool, wallet management, transaction signing, HDMI dashboard and a browser-based `bitcoin-cli` terminal, all on Signet.

[![Bitcoin Core](https://img.shields.io/badge/Bitcoin%20Core-29-F7931A?logo=bitcoin&logoColor=white)](https://bitcoincore.org/)
[![Docker](https://img.shields.io/badge/Docker%20Compose-ready-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Redis](https://img.shields.io/badge/Redis-8-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![nginx](https://img.shields.io/badge/nginx-1.30--alpine-009639?logo=nginx&logoColor=white)](https://nginx.org/)

**🇬🇧 English** · [🇧🇷 Português](README.pt-BR.md)

</div>

---

## 📸 Screenshots

<details>
<summary>Home — node status and feature cards</summary>

![Home (en)](assets/screenshots/en-gb/home.png)
</details>

<details>
<summary>Faucet — request Signet test coins</summary>

![Faucet (en)](assets/screenshots/en-gb/faucet.png)
</details>

<details>
<summary>Mempool — live mempool explorer</summary>

![Mempool (en)](assets/screenshots/en-gb/mempool.png)
</details>

<details>
<summary>Wallet lab — create and manage wallets</summary>

![Wallet (en)](assets/screenshots/en-gb/wallet.png)
</details>

<details>
<summary>Signing lab — create PSBTs, sign and broadcast</summary>

![Signing (en)](assets/screenshots/en-gb/signing.png)
</details>

<details>
<summary>Container stats — CPU, memory, disk, network</summary>

![Stats (en)](assets/screenshots/en-gb/stats.png)
</details>

<details>
<summary>Study docs — local reference notes</summary>

![Study Docs (en)](assets/screenshots/en-gb/study-docs.png)
</details>

<details>
<summary>HDMI display — kiosk dashboard</summary>

![Display](assets/screenshots/en-gb/display.png)
</details>

<details>
<summary>Bitcoin Core terminal — browser-based bitcoin-cli</summary>

![Terminal](assets/screenshots/en-gb/terminal.png)
</details>

---

## ⚡ TL;DR — Quick start

```bash
git clone <this repo>
cd bitcoin-core-study-platform
cp .env.example .env
# (optional) edit .env — at minimum replace BITCOIN_RPC_PASSWORD
docker compose up -d --build
chmod +x scripts/*.sh
./scripts/init-wallet.sh         # creates the faucet wallet, prints an address
open http://localhost:8080       # hub: faucet, mempool, wallet, signing, stats, docs
```

That's it. You now have a Signet `bitcoind` node and four web surfaces wired to it.

---

## 📖 Table of contents

- [⚡ Signet Core Study Platform](#-signet-core-study-platform)
- [📸 Screenshots](#-screenshots)
- [⚡ TL;DR — Quick start](#-tldr--quick-start)
- [📦 What's in the box](#-whats-in-the-box)
- [✅ Prerequisites](#-prerequisites)
  - [Minimum system requirements](#minimum-system-requirements)
  - [Initial Block Download (IBD) time estimates](#initial-block-download-ibd-time-estimates)
- [⚙️ Configuration (.env)](#️-configuration-env)
- [🔐 RPC authentication: password vs cookie](#-rpc-authentication-password-vs-cookie)
- [🚀 Start the stack](#-start-the-stack)
- [🧪 Smoke test](#-smoke-test)
- [🗂️ Project structure](#️-project-structure)
- [🌐 Web hub (port 8080)](#-web-hub-port-8080)
- [🖥️ HDMI display (port 8181)](#️-hdmi-display-port-8181)
- [⛏️ Bitcoin Core terminal (port 8182)](#️-bitcoin-core-terminal-port-8182)
- [🔌 Ports](#-ports)
- [🛡️ Network architecture](#️-network-architecture)
- [🔒 Security hardening](#-security-hardening)
- [📊 Container stats panel (opt-in)](#-container-stats-panel-opt-in)
- [📝 Study docs — adding documents](#-study-docs--adding-documents)
- [💧 Faucet wallet — funding](#-faucet-wallet--funding)
- [🛠️ CLI scripts](#️-cli-scripts)
- [💾 Persistence and reset](#-persistence-and-reset)
- [🔧 Troubleshooting](#-troubleshooting)
- [📚 References](#-references)

---

## 📦 What's in the box

| Service            | Container               | Image / build                             | What it does                                                   |
| ------------------ | ----------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| **bitcoind**       | `signet-bitcoind`       | `bitcoin/bitcoin:29`                      | Signet full node, JSON-RPC :38332, ZMQ :28332-28335            |
| **redis**          | `signet-redis`          | `redis:8-alpine`                          | Cache + rate limits + faucet history                           |
| **web**            | `signet-web`            | `apps/web` (FastAPI)                      | Home, faucet, mempool, wallet lab, signing lab, container stats, study docs |
| **display**        | `signet-display`        | `apps/display` (FastAPI)                  | HDMI/kiosk dashboard                                           |
| **terminal-webui** | `signet-terminal-webui` | `apps/terminal` (FastAPI + `bitcoin-cli`) | Sandbox running browser-side `bitcoin-cli` / RPC commands      |
| **terminal-proxy** | `signet-terminal-proxy` | `nginx:1.30-alpine`                       | Hardened reverse proxy in front of `terminal-webui`            |

Everything ships as Docker images; no host install needed besides Docker.

---

## ✅ Prerequisites

- Docker Engine and Docker Compose (`docker compose` v2 plugin).
- Free local ports `8080`, `8181`, `8182` (the proxy binds to `127.0.0.1` only).

### Minimum system requirements

| Resource    | Minimum               | Recommended            | Notes                                                                    |
| ----------- | --------------------- | ---------------------- | ------------------------------------------------------------------------ |
| **CPU**     | 2 cores               | 4+ cores               | IBD (initial block download) is CPU-intensive; after sync 1 core is enough. |
| **RAM**     | 4 GB                  | 8 GB                   | `bitcoind` alone uses ~3–4 GB during IBD with `txindex=1`.              |
| **Storage** | 40 GB SSD             | 60 GB+ SSD             | Signet chain is ~30 GB (May 2026) and grows ~5 GB/year. **SSD strongly recommended** — HDD is 5–10× slower during sync. |
| **OS**      | Linux (x86_64/arm64)  | Ubuntu 22.04+ / Debian 12+ | Also runs on macOS and Windows (WSL2) for development.               |
| **Network** | Broadband             | 50+ Mbps               | Downloads ~30 GB of block data during IBD.                              |

> [!TIP]
> **Raspberry Pi 5 (8 GB) + NVMe** is the best single-board option — syncs in under 1 hour.
> **Raspberry Pi 4 (8 GB) + SSD** also works well for a permanent lab (~3 hours).
> The **4 GB models** are tight: Bitcoin Core may OOM during IBD. Use `dbcache=300` in `bitcoin.conf` to reduce memory pressure.

### Initial Block Download (IBD) time estimates

The Signet chain has ~303,000 blocks (May 2026). IBD time varies by hardware:

| Hardware                           | Estimated IBD time | Notes                                     |
| ---------------------------------- | ------------------ | ----------------------------------------- |
| Modern PC (NVMe + 4+ cores)       | ~15–20 min         | Fastest scenario.                         |
| Mid-range PC (SSD + 2 cores)      | ~30–45 min         | Typical laptop.                           |
| Low-end PC / old laptop (SSD)     | ~1–2 hours         | Older hardware, still usable.             |
| Raspberry Pi 5 (NVMe HAT)         | ~40–60 min         | Best single-board option. Cortex-A76 + PCIe. |
| Raspberry Pi 5 (USB SSD)          | ~1–2 hours         | Good option, slightly slower than NVMe.   |
| Raspberry Pi 5 (SD card)          | ~4–6 hours         | Usable but slow — prefer NVMe or SSD.    |
| Raspberry Pi 4 (USB SSD)          | ~2–3 hours         | Solid choice for a dedicated lab.         |
| Raspberry Pi 4 (SD card)          | ~8–12 hours        | **Not recommended** — very slow I/O.     |

After IBD completes, the node stays synced with minimal CPU usage (~1% idle).

```bash
docker --version
docker compose version
```

---

## ⚙️ Configuration (.env)

A single `.env` file at the project root configures **everything**. Copy the
template once:

```bash
cp .env.example .env
```

Key variables (full list in [`.env.example`](.env.example)):

| Variable                                              | Purpose                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `APP_TITLE` · `DEFAULT_LANG`                          | Branding and UI default language (`pt-BR` or `en-GB`).                   |
| `BITCOIN_REPO` · `BITCOIN_VERSION`                    | Bitcoin Core image tag (used by `bitcoind` and the terminal build).      |
| `PYTHON_IMAGE` · `NGINX_IMAGE`                        | Base images for the FastAPI apps and the terminal proxy.                 |
| `BITCOIN_RPC_AUTH_MODE`                               | `password` (default) or `cookie` — see next section.                     |
| `BITCOIN_RPC_USER` · `BITCOIN_RPC_PASSWORD`           | Credentials when in password mode.                                       |
| `BITCOIN_RPC_COOKIE_FILE`                             | Path inside containers to the cookie (default works out-of-the-box).     |
| `BITCOIN_RPC_URL`                                     | Internal RPC base, defaults to `http://bitcoind:38332`.                  |
| `FAUCET_*` · `MAX_WALLET_SEND_BTC`                    | Faucet limits and wallet-lab amount cap.                                 |
| `TURNSTILE_*`                                         | Optional Cloudflare Turnstile CAPTCHA on the faucet.                     |
| `BASIC_AUTH_USERNAME` · `BASIC_AUTH_PASSWORD`         | Optional HTTP Basic auth in front of every web surface.                  |
| `TRUST_PROXY_HEADERS`                                 | Honour `X-Forwarded-For` (only when behind a trusted reverse proxy).     |
| `DISPLAY_URL` · `TERMINAL_URL`                        | Browser URLs for Display and Terminal links (default `http://localhost:8181` / `8182`). |
| `TERMINAL_HOST_PORT`                                  | Host port for the terminal proxy (default `8182`).                       |
| `SEARCH_RATE_PER_MIN` · `MEMPOOL_DETAIL_RATE_PER_MIN` | Per-IP rate limits.                                                      |
| `REFRESH_MEMPOOL` · `REFRESH_STATS`                   | Auto-refresh interval in seconds for mempool (default 5) and stats (default 30). |
| `REFRESH_DISPLAY` · `REFRESH_TERMINAL`                | Auto-refresh interval for HDMI display (default 30) and terminal (default 10).   |
| `APP_VERSION`                                         | Version shown in the header badge (default `0.1.1`).                     |
| `ENABLE_CONTAINER_STATS`                              | Show CPU/memory/disk for the project containers (requires the override). |

> [!IMPORTANT]
> Do not commit `.env`. The `.gitignore` already covers it.

---

## 🔐 RPC authentication: password vs cookie

Two modes, switched with `BITCOIN_RPC_AUTH_MODE` in `.env`.

### `password` (default)

`bitcoind` is launched with `-rpcuser=$BITCOIN_RPC_USER -rpcpassword=$BITCOIN_RPC_PASSWORD`. Every client (web, display, terminal, scripts, in-container `bitcoin-cli`) reads the same pair from `.env`. Simple, but the password sits in env vars on every container.

### `cookie`

`bitcoind` does not receive `-rpcuser` / `-rpcpassword` — it auto-generates `~/.bitcoin/signet/.cookie` containing `__cookie__:<random-hex>`. The `bitcoin-data` Docker volume is mounted **read-only** into every client at `/bitcoind-data`, so:

- `apps/web`, `apps/display` and the `terminal-webui` Python backend read the cookie via `BITCOIN_RPC_COOKIE_FILE=/bitcoind-data/signet/.cookie`.
- `bitcoin-cli` inside the terminal sandbox is rendered with `rpccookiefile=...` instead of `rpcuser=...` (see [`apps/terminal/entrypoint.sh`](apps/terminal/entrypoint.sh)).
- Host scripts in `scripts/` exec `bitcoin-cli` inside the `signet-bitcoind` container, which already has access to its own cookie — they need no env credentials.

Switch is one variable:

```ini
BITCOIN_RPC_AUTH_MODE=cookie
```

then `docker compose up -d --build`. No container rebuilds the cookie file path; bitcoind regenerates it on every start.

---

## 🚀 Start the stack

```bash
docker compose up -d --build
chmod +x scripts/*.sh
./scripts/init-wallet.sh
./scripts/status.sh             # blockchain / network / mempool / ZMQ / faucet wallet
```

Open:

```text
http://localhost:8080            # Web hub (home + faucet + mempool + wallet + signing + stats + docs)
http://localhost:8181            # HDMI display
http://localhost:8182            # Bitcoin Core terminal
```

All UIs switch between `pt-BR` and `en-GB` from the gear menu.

---

## 🧪 Smoke test

```bash
# Full status snapshot (uses .env)
./scripts/status.sh

# Web hub heartbeat
curl http://localhost:8080/api/status | jq .

# Terminal app heartbeat
curl http://localhost:8182/api/health | jq .

# bitcoin-cli inside the bitcoind container
docker exec signet-bitcoind bitcoin-cli -signet \
  -rpcuser="$BITCOIN_RPC_USER" -rpcpassword="$BITCOIN_RPC_PASSWORD" \
  getblockchaininfo
```

---

## 🗂️ Project structure

```text
bitcoin-core-study-platform/
├── apps/
│   ├── web/                       FastAPI hub (port 8080)
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/
│   │       ├── main.py            FastAPI factory + router includes
│   │       ├── templates.py       Jinja2Templates singleton
│   │       ├── core/              env, RPC client, security, cache, validators
│   │       ├── routes/            pages, blockchain, mempool, search, faucet, wallet, stats
│   │       ├── static/            css/, js/, img/
│   │       └── templates/         home, faucet, mempool, wallet, signing, stats, docs
│   │
│   ├── display/                   HDMI kiosk (port 8181)
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/{main.py, rpc.py, static/, templates/}
│   │
│   └── terminal/                  Browser bitcoin-cli (port 8182, behind nginx)
│       ├── Dockerfile             two-stage: pulls bitcoin-cli from bitcoind image
│       ├── entrypoint.sh          renders ~/.bitcoin/bitcoin.conf from env
│       ├── nginx.conf             reverse proxy config
│       ├── requirements.txt
│       ├── version.txt            shown in the UI
│       ├── backend/app.py         RPC + sandbox /api/exec endpoint
│       └── webui/static/          frontend (HTML/CSS/JS + i18n)
│
├── bitcoind/
│   ├── bitcoin.conf               base config (signet=1, ZMQ, txindex)
│   └── entrypoint.sh              switches RPC auth mode based on env
│
├── docs/                          study notes mounted read-only into the web app
├── scripts/                       bash helpers wrapping bitcoin-cli
├── systemd/                       optional kiosk service for Raspberry Pi
├── compose.yml                    main stack
├── compose.stats.yml              opt-in override for the /stats page
├── .env.example                   single source of configuration truth
├── README.md                      this file
└── README.pt-BR.md                Portuguese mirror
```

---

## 🌐 Web hub (port 8080)

Single FastAPI app that serves every page-and-API in the lab.

### Pages

| Path          | What you get                                                            |
| ------------- | ----------------------------------------------------------------------- |
| `/`           | Home — node status + cards linking each surface.                             |
| `/faucet`     | Request faucet sBTC; per-IP and per-address rate limits.                     |
| `/mempool`    | mempool.space-inspired explorer (HTML/CSS/JS only).                          |
| `/wallet`     | Wallet lab: create/load/delete wallets, derive addresses, manage keys.       |
| `/signing`    | Signing lab: create PSBTs, sign and broadcast transactions.                  |
| `/stats`      | Container stats (CPU/mem/disk/net), opt-in.                                  |
| `/study-docs` | Local Bitcoin Core / RPC / ZMQ / wallet notes from `docs/`.                  |

### API surface

Read endpoints (low timeout, rate-limited):

| Method | Path                                        | Purpose                                                 |
| ------ | ------------------------------------------- | ------------------------------------------------------- |
| `GET`  | `/api/status`                               | Snapshot for the home / faucet pages.                   |
| `GET`  | `/api/zmq`                                  | `getzmqnotifications`.                                  |
| `GET`  | `/api/rpc-help?command=...`                 | `help <command>` (command name validated).              |
| `GET`  | `/api/blocks/recent?limit=N`                | Recent mined blocks with fee stats.                     |
| `GET`  | `/api/blocks/{height}/txs`                  | Mined block detail.                                     |
| `GET`  | `/api/mempool` · `/api/mempool/raw`         | `getmempoolinfo`, `getrawmempool`.                      |
| `GET`  | `/api/mempool/txs?limit=N`                  | Mempool TX list with addresses, fees, projected blocks. |
| `GET`  | `/api/mempool/tx/{txid}`                    | Full TX detail (rate-limited).                          |
| `GET`  | `/api/mempool/blocks`                       | Projected blocks summary (fee-rate buckets).            |
| `GET`  | `/api/mempool/projected-block/{n}`          | Per projected block detail (rate-limited).              |
| `GET`  | `/api/search/address/{addr}`                | Address overview, cached 60s; per-IP rate-limited.      |
| `GET`  | `/api/history`                              | Last faucet sends.                                      |
| `GET`  | `/api/wallet/list` · `/api/wallet/overview` | Loaded wallets + balances/addresses.                    |
| `GET`  | `/api/container-stats`                      | Container stats (`ENABLE_CONTAINER_STATS=true` only).   |

Write endpoints (longer timeout):

| Method | Path                        | Purpose                                       |
| ------ | --------------------------- | --------------------------------------------- |
| `POST` | `/api/request`              | Faucet send.                                  |
| `POST` | `/api/wallet/create`        | Create or load a wallet.                      |
| `POST` | `/api/wallet/create-faucet` | Create the faucet wallet + return an address. |
| `POST` | `/api/wallet/load`          | Load an existing wallet.                      |
| `POST` | `/api/wallet/delete`        | Delete (must have zero balance).              |
| `POST` | `/api/wallet/address`       | New receiving address.                        |
| `POST` | `/api/wallet/sign`          | Build + sign a PSBT (does NOT broadcast).     |
| `POST` | `/api/wallet/broadcast`     | `sendrawtransaction` for a signed hex.        |
| `GET`  | `/api/wallet/export?wallet=X` | Export a single wallet (descriptors + keys). |
| `GET`  | `/api/wallet/export-all`    | Export all loaded wallets as a single JSON.   |
| `POST` | `/api/wallet/import`        | Import wallets from an export JSON file.      |
| `POST` | `/api/docs/rebuild-manifest` | Scan `docs/` and regenerate `manifest.json`. |

> [!CAUTION]
> Wallet endpoints are designed for a **lab on `127.0.0.1`**. If you publish the stack, lock the surface with `BASIC_AUTH_USERNAME` / `BASIC_AUTH_PASSWORD` (or a real reverse proxy with auth) — there is no per-endpoint auth.

---

## 🖥️ HDMI display (port 8181)

Tiny FastAPI app rendering a hardware-wallet-style status screen on a kiosk display. The systemd unit at [`systemd/signet-display-kiosk.service`](systemd/signet-display-kiosk.service) launches Chromium in kiosk mode pointed at `http://localhost:8181`.

```bash
sudo cp systemd/signet-display-kiosk.service /etc/systemd/system/
sudo systemctl enable --now signet-display-kiosk.service
```

`GET /api/status` returns the same JSON the screen consumes — fine for any external dashboard.

---

## ⛏️ Bitcoin Core terminal (port 8182)

Adapted from [`gustavoschaedler/bitcoin-core-terminal`](https://github.com/gustavoschaedler/bitcoin-core-terminal), retargeted at this project's Signet node.

### What you get

- **`bitcoin-cli`-style prompt**: type `getblockchaininfo`, `getmempoolinfo`, `listwallets`, etc. JSON params and quoted args are parsed.
- **Shell escape**: prefix a line with `!` to run a shell command in the sandbox (`jq`, `grep`, `sed`, `less`, etc. pre-installed).
- **Snippets sidebar** with search, collapse/expand and `Tab`/`→` autocomplete.
- **Splits and history**: multiple panes; `↑`/`↓` per-pane history; `Ctrl+L` to clear.
- **Languages**: English (UK) and Português (Brasil) toggle.
- **HTTP API**: `/api/health`, `/api/meta`, `/api/wallets`, `/api/rpc`, `/api/exec`, `/api` (Swagger).

### How it talks to the node

```text
Browser
  │  HTTP :8182 (127.0.0.1 only)
  ▼
terminal-proxy (nginx)
  ▼
terminal-webui (FastAPI + bitcoin-cli)
  ▼  JSON-RPC :38332 (password OR cookie)
signet-bitcoind  (shared with web, display, faucet)
```

### Hardening

The `terminal-webui` container runs as `sandbox` (uid 1000), `read_only: true`, with `/tmp` and `~/.bitcoin` as `tmpfs`, all Linux capabilities dropped and `no-new-privileges` set. The `terminal-proxy` keeps only the minimal `cap_add` set nginx needs to bind a port. Both bind only on `127.0.0.1`.

`/api/exec`:

- caps stdout/stderr at ~1 MiB;
- default timeout 30 s, max 120 s;
- runs the process group in a new session and SIGKILLs the whole tree on timeout;
- restricts `cwd` to a small allow-list (`$HOME`, `/tmp`, `/app`) — refuses other paths with `exec_cwd_forbidden`.

> [!WARNING]
> `/api/exec` runs **arbitrary shell** as the `sandbox` user inside the container. Never expose this surface beyond `127.0.0.1` without an authenticating reverse proxy in front.

---

## 🔌 Ports

| Scope                 | Address                             | Note                            |
| --------------------- | ----------------------------------- | ------------------------------- |
| Web hub               | `127.0.0.1:8080` → `web`            | Faucet, mempool, wallet, signing, stats. |
| HDMI display          | `127.0.0.1:8181` → `display`        | Kiosk dashboard.                |
| Bitcoin Core terminal | `127.0.0.1:8182` → nginx → terminal | Browser `bitcoin-cli` sandbox.  |
| RPC (internal)        | `bitcoind:38332`                    | Not published to the host.      |
| P2P (internal)        | `bitcoind:38333`                    | Not published.                  |
| ZMQ (internal)        | `bitcoind:28332..28335`             | Not published.                  |
| Redis (internal)      | `redis:6379`                        | Not published.                  |

---

## 🛡️ Network architecture

```text
Browser
  │
  ├── 8080 ──▶ web (FastAPI)
  ├── 8181 ──▶ display (FastAPI)
  └── 8182 ──▶ terminal-proxy (nginx) ──▶ terminal-webui (FastAPI)
                                              │
                                              ▼
                                          bitcoind (JSON-RPC, ZMQ)
                                              ▲
                                          redis ◀── web (rate limit + cache)
```

All three host bindings default to `127.0.0.1`. RPC, ZMQ, P2P and Redis stay inside the Compose network.

---

## 🔒 Security hardening

This codebase has been audited and tightened. Highlights:

- **Cookie auth supported** alongside user/password — `BITCOIN_RPC_AUTH_MODE=cookie` removes the password from app environments entirely.
- **Address search rate-limited** (`SEARCH_RATE_PER_MIN`, default 6/min/IP). The expensive `?refresh=true` cache-bust path has its own stricter quota.
- **Mempool detail endpoints rate-limited** (`MEMPOOL_DETAIL_RATE_PER_MIN`, default 60/min/IP).
- **Tighter RPC timeouts** — reads default to 15 s; only writes (faucet send, wallet ops) get 30 s.
- **Content-Security-Policy** header added to every response (allows Cloudflare Turnstile).
- **Standard headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- **Optional HTTP Basic auth** (`BASIC_AUTH_*`) covers every web surface.
- **`/api/exec` cwd allow-list** — the terminal sandbox refuses `cwd` outside `$HOME`, `/tmp` or `/app`.
- **Validated input** on every wallet endpoint: wallet name regex, signet/testnet address prefix + `validateaddress`, raw-tx hex regex, decimal amount cap.
- **Read-only containers**: `terminal-webui` runs `read_only: true` with tmpfs scratch dirs; both terminal containers have `cap_drop: [ALL]` and `no-new-privileges`.
- **Trust-proxy headers off by default** — only honour `X-Forwarded-For` when `TRUST_PROXY_HEADERS=true`.
- **No credentials logged** — RPC errors are surfaced to clients without echoing the URL or auth tuple.

For internet exposure, additionally:

- bind only `127.0.0.1` and put a real reverse proxy (Caddy/Nginx/Traefik/Cloudflare Tunnel) in front;
- enforce HTTPS;
- enable `BASIC_AUTH_*`;
- enable `TURNSTILE_ENABLED=true` for the faucet;
- keep `ENABLE_CONTAINER_STATS=false`;
- never expose `/wallet`, `/signing`, `/api/wallet/*`, `/api/exec`, RPC, ZMQ, Redis or the Docker socket;
- keep only a small balance in the faucet wallet;
- use `TRUST_PROXY_HEADERS=true` only when the proxy is yours.

---

## 📊 Container stats panel (opt-in)

The `/stats` page is disabled by default. To enable it on a trusted local lab:

```bash
# .env
ENABLE_CONTAINER_STATS=true
```

```bash
docker compose -f compose.yml -f compose.stats.yml up -d --build
```

The override mounts `/var/run/docker.sock` read-only into the `web` container and runs that container as `root`. Convenient locally; **never expose**.

It only reports project containers: `signet-bitcoind`, `signet-redis`, `signet-web`, `signet-display`, `signet-terminal-webui`, `signet-terminal-proxy`.

---

## 📝 Study docs — adding documents

The `/study-docs` page renders Markdown files from the `docs/` directory. Documents are organised by **section** (a top-level subdirectory) and **locale** (a subdirectory inside each section following the i18n pattern `en-gb`, `pt-br`, etc.).

### Directory layout

```text
docs/
├── manifest.json                  ← sidebar menu definition (auto-generated)
├── platform-docs/                 ← section
│   ├── en-gb/                     ← locale
│   │   ├── architecture.md
│   │   └── wallet-and-signing.md
│   └── pt-br/
│       ├── arquitetura.md
│       └── carteira-e-assinatura.md
└── core-craft-exercises/          ← another section
    ├── en-gb/
    │   ├── lesson-01.md
    │   └── lesson-02.md
    └── pt-br/
        ├── aula-01.md
        └── aula-02.md
```

### Adding new documents

1. **Create a section** (or reuse an existing one): add a directory under `docs/`, e.g. `docs/my-topic/`.
2. **Add locale subdirectories**: create `en-gb/` and/or `pt-br/` inside the section.
3. **Write Markdown files**: place `.md` files in the appropriate locale directory. Files are paired across locales by alphabetical order within each section — keep file counts consistent across locales.
4. **Rebuild the manifest**: click the **rebuild button** (↻) at the top-right of the Study Docs sidebar, or call the API directly:

```bash
curl -X POST http://localhost:8080/api/docs/rebuild-manifest
```

The endpoint scans every section directory, discovers locale folders and `.md` files, pairs them by sorted index, and writes a fresh `docs/manifest.json`. The page reloads automatically with the updated sidebar.

### Language fallback

When a document is not available in the selected language, the viewer falls back to `en-gb`, then to any other available locale. This means you can start with a single locale and add translations later.

### manifest.json format

The rebuild generates this structure (you can also edit it manually for fine-tuning):

```json
[
  {
    "section": "platform-docs",
    "title": { "en-gb": "Platform Docs", "pt-br": "Docs da Plataforma" },
    "docs": [
      { "key": "architecture", "en-gb": "architecture.md", "pt-br": "arquitetura.md" }
    ]
  }
]
```

Section titles default to the directory name in title-case. Edit the `"title"` object manually for proper translations.

---

## 💧 Faucet wallet — funding

This stack does not mine. The faucet only sends what already sits in `FAUCET_WALLET_NAME`.

```bash
./scripts/init-wallet.sh         # creates the wallet, prints an address
./scripts/new-address.sh         # extra addresses
```

Send sBTC from a public Signet faucet to the printed address. After confirmation, `/faucet` distributes `FAUCET_AMOUNT_BTC` per request, gated by `FAUCET_COOLDOWN_SECONDS` per address and `FAUCET_MAX_PER_IP_PER_DAY` per IP.

**External Signet faucets:**
- <https://signet257.bublina.eu.org/>
- <https://signetfaucet.com>
- <https://bitcoinsignetfaucet.com/>

---

## 🛠️ CLI scripts

All wrap `bitcoin-cli` inside `signet-bitcoind`, automatically picking up `BITCOIN_RPC_AUTH_MODE`.

| Script                                             | What it does                                        |
| -------------------------------------------------- | --------------------------------------------------- |
| [`scripts/common.sh`](scripts/common.sh)           | Internal helper sourced by the others.              |
| [`scripts/bitcoin-cli.sh`](scripts/bitcoin-cli.sh) | Run any `bitcoin-cli ...` against the node.         |
| [`scripts/init-wallet.sh`](scripts/init-wallet.sh) | Load or create the faucet wallet.                   |
| [`scripts/status.sh`](scripts/status.sh)           | Blockchain / network / mempool / ZMQ / faucet info. |
| [`scripts/mempool.sh`](scripts/mempool.sh)         | `getmempoolinfo` and the raw mempool list.          |
| [`scripts/new-address.sh`](scripts/new-address.sh) | New receiving address in the faucet wallet.         |
| [`scripts/send-test.sh`](scripts/send-test.sh)     | `./scripts/send-test.sh <address> <amount>`.        |

---

## 💾 Persistence and reset

State lives in two named volumes: `bitcoin-data` (full Signet datadir + cookie) and `redis-data` (faucet history + cache + rate limits).

```bash
# Stop, keep data:
docker compose down

# Full reset (deletes wallets, blocks, faucet history):
docker compose down -v
```

---

## 🔧 Troubleshooting

<details>
<summary><code>Could not locate RPC credentials</code> when running <code>bitcoin-cli</code> on the host</summary>

Use the project script — it knows about both auth modes:

```bash
./scripts/bitcoin-cli.sh getblockchaininfo
```

If you must run `bitcoin-cli` manually, run it inside the container as the `bitcoin` user (it picks up the cookie) or pass `-rpcuser` / `-rpcpassword`.
</details>

<details>
<summary><code>502 Bad Gateway</code> right after starting the terminal</summary>

`terminal-proxy` came up before `terminal-webui` finished. Wait a few seconds and reload.
</details>

<details>
<summary>Port 8080 / 8181 / 8182 already in use</summary>

Change the port in `compose.yml` (or `TERMINAL_HOST_PORT` for the terminal) and recreate.
</details>

<details>
<summary>RPC errors after switching to cookie mode</summary>

Recreate the bitcoind container so it generates a fresh cookie that matches the current run:

```bash
docker compose up -d --force-recreate bitcoind
```
</details>

<details>
<summary>Address search returns 429</summary>

You hit `SEARCH_RATE_PER_MIN`. Wait a minute or raise it in `.env`. The expensive `?refresh=true` path has its own stricter quota.
</details>

---

## 📚 References

- [Bitcoin Core — docs](https://bitcoincore.org/en/doc/)
- [Bitcoin RPC reference](https://developer.bitcoin.org/reference/rpc/)
- [Bitcoin Core Terminal — upstream project](https://github.com/gustavoschaedler/bitcoin-core-terminal)
- [Signet faucet — Bublina](https://signet257.bublina.eu.org/)
- [Signet faucet — signetfaucet.com](https://signetfaucet.com)
- [Signet faucet — bitcoinsignetfaucet.com](https://bitcoinsignetfaucet.com/)

---

## ⚡ Donations

If this project helped you and you'd like to support it, buy me a coffee.

<table>
  <tr>
    <td align="center">
      <strong>⛓️ Bitcoin (on-chain)</strong><br><br>
      <img src="assets/qr_code_onchain.png" alt="Bitcoin on-chain QR" width="180"><br><br>
      <code>bc1q2hmxr026ahlvreftxqrjdwkq8u7ys2g0d0xf40</code>
    </td>
    <td align="center">
      <strong>⚡ Lightning Network</strong><br><br>
      <img src="assets/qr_code_lightning.png" alt="Lightning Network QR" width="180"><br><br>
      <code>btcnow@walletofsatoshi.com</code>
    </td>
  </tr>
</table>

---

<div align="center">
<sub>Built ⛏️ for Bitcoin learners · <a href="README.pt-BR.md">🇧🇷 Versão em Português</a></sub>
</div>
