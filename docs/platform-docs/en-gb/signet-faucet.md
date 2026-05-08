# Signet Faucet

## How It Works

The faucet distributes small amounts of Signet coins (sBTC) from a dedicated wallet managed by the local Bitcoin Core node. These coins have no real-world value and are used exclusively for testing.

## Setup

1. Initialise the faucet wallet:

```bash
./scripts/init-wallet.sh
```

2. Generate a receiving address:

```bash
./scripts/new-address.sh
```

3. Fund the address from an external Signet faucet. Once the transaction confirms, the local faucet is ready.

### External Signet Faucets

- [signet257.bublina.eu.org](https://signet257.bublina.eu.org/) — Bublina Signet faucet
- [signetfaucet.com](https://signetfaucet.com) — Signet Faucet
- Mutinynet faucet

## Configuration

| Variable | Default | Description |
|---|---|---|
| `FAUCET_AMOUNT_BTC` | `0.001` | Amount sent per request |
| `FAUCET_COOLDOWN_SECONDS` | `86400` | Cooldown between requests (per address) |
| `FAUCET_MAX_PER_IP_PER_DAY` | `3` | Maximum requests per IP per day |
| `FAUCET_WALLET_NAME` | `faucet` | Name of the Bitcoin Core wallet |

## API

**POST** `/api/faucet/send`

```json
{ "address": "tb1q..." }
```

Returns the transaction ID on success.

## Rate Limiting

The faucet enforces per-address and per-IP rate limits stored in Redis. The cooldown timer starts when a successful send completes.
