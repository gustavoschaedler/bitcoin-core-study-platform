# Practical Mentoring Task 01
## Intelligent Snapshot: Interpreting Bitcoin Node State

## Objective

In Lesson 1, you built a system that queries the Bitcoin Core state through RPC and displays the information in a web dashboard.

Now the goal is to take the next step:

> stop merely displaying data and start interpreting the node state.

You will evolve your system to build a first layer of intelligence, still based only on RPC (without ZMQ).

---

## Context

So far, you already know that:

- RPC provides a snapshot of the state
- Bitcoin Core does not deliver finished products
- Real systems need to interpret data

This activity represents exactly that:

> transforming raw data into useful information.

---

## What you must develop

### 1. Endpoint `/api/mempool/summary`

Create an endpoint that analyzes the mempool and returns an interpreted summary.

#### Must use:

- `getmempoolinfo`
- `getrawmempool true`

#### The endpoint must return at least:

- total number of transactions
- total size (vsize or bytes)
- average fee rate
- minimum and maximum fee rate
- transaction distribution by fee level

### Expected example

```json
{
  "tx_count": 12345,
  "total_vsize": 3456789,
  "avg_fee_rate": 42.3,
  "min_fee_rate": 5.1,
  "max_fee_rate": 120.8,
  "fee_distribution": {
    "low": 3200,
    "medium": 7000,
    "high": 2145
  }
}
```

---

### 2. Fee classification

Implement a simple classification logic:

- `low` → low fee
- `medium` → medium fee
- `high` → high fee

Example:

- `< 10 sat/vB` → low
- `10–50 sat/vB` → medium
- `> 50 sat/vB` → high

---

### 3. Endpoint `/api/blockchain/lag`

Create an endpoint that evaluates the node synchronization state.

#### Must use:

- `getblockchaininfo`

#### Must return:

```json
{
  "blocks": 572061,
  "headers": 572120,
  "lag": 59
}
```

---

### 4. Frontend update

Add:

#### Card: Mempool Intelligence

- total transactions
- average fee
- distribution (low / medium / high)

#### Card: Node Sync Status

- lag between headers and blocks

---

## Restrictions

- Do not use ZMQ
- Do not use databases
- Do not use Bitcoin libraries

Everything must remain based on:

- RPC
- backend processing