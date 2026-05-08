# Practical Mentoring Task 03

## Evolving the system for multiple wallets and interpreted state

## Objective

In Lesson 3, you built a system capable of:

- creating transactions
- signing
- broadcasting
- tracking Bitcoin transactions

Now the task is to evolve the system to support multiple wallets and interpreted transaction states.

---

## Context

The system already:

- creates transactions
- signs with Bitcoin Core
- broadcasts using `sendrawtransaction`
- tracks status `broadcast → mempool → confirmed`
- displays transactions in the frontend

Real systems need to answer:

- Which wallet am I using?
- Is the transaction taking too long?
- Has it reached the mempool?
- Can I switch execution context without changing code?

---

## What you must develop

### 1. Multiple wallet support

Separate:

#### Node RPC

```text
http://127.0.0.1:58443
```

#### Wallet RPC

```text
http://127.0.0.1:58443/wallet/WALLET_NAME
```

Implement:

- wallet listing
- automatic wallet loading
- active wallet selection
- selected wallet usage

---

### Endpoint `GET /wallets`

```json
{
  "available_wallets": ["wallet1","wallet2"],
  "loaded_wallets": ["wallet1"],
  "selected_wallet":"wallet1"
}
```

Use:

- `listwalletdir`
- `listwallets`

---

### Endpoint `POST /wallet/select`

```json
{
  "wallet":"wallet2"
}
```

Must:

- verify existence
- load with `loadwallet`
- define active wallet

---

### 2. Wallet selection in the frontend

Add:

- select field
- dynamic update
- wallet display

---

### 3. Transaction state interpretation

Examples:

#### Broadcast

```json
{
  "status":"broadcast",
  "message":"Transaction sent to the node."
}
```

#### Mempool

```json
{
  "status":"mempool",
  "message":"Transaction accepted into the mempool."
}
```

#### Confirmed

```json
{
  "status":"confirmed",
  "message":"Transaction confirmed in block."
}
```

---

### 4. Enriched endpoint `/tx/<txid>`

Return:

- txid
- wallet
- status
- confirmed
- confirmations
- block_hash
- age_seconds
- message
- warning

---

### 5. Endpoint `/wallet/status`

Return:

```json
{
  "wallet":"wallet1",
  "balance":0.0012,
  "utxos":3
}
```

Use:

- `getwalletinfo`
- `listunspent`

---

## System deployment

The system must be externally accessible using:

- VPS
- ngrok
- Cloudflare Tunnel