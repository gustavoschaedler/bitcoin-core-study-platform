# Practical Mentoring Task 02

## Objective

In Lesson 2, the system evolved from:

- an RPC-based dashboard (state)
- into a system that also observes real-time events (ZMQ)

Now the goal is:

> structure the system flow and run the application in an externally accessible environment.

---

## Context

You already know that:

- RPC provides a snapshot of the current state
- ZMQ provides a stream of events

Events:

- are not guarantees
- are not ordered
- are not confirmations

In addition:

- real systems do not run only locally
- they are accessed over the network

---

## What you must develop

### 1. Backend event structure

Keep in memory:

- latest observed blocks
- latest observed transactions
- timestamp of each event

You may use:

- lists
- deque
- limited buffers

---

### 2. Endpoint `/api/events/summary`

Return:

- number of block events
- number of transaction events
- timestamp of the last event
- event rate

### Example

```json
{
  "blocks_observed": 3,
  "tx_observed": 120,
  "last_event_time": 1712345678,
  "tx_per_second": 4.2
}
```

---

### 3. Endpoint `/api/events/latest`

Return:

- latest blocks
- latest transactions

### Example

```json
{
  "blocks": [
    {"hash":"abc...", "ts":1712345600}
  ],
  "txs": [
    {"txid":"tx1...", "ts":1712345670}
  ]
}
```

---

### 4. Endpoint `/api/events/state-comparison`

Compare:

- last block seen through ZMQ
- `getbestblockhash` through RPC

Return divergence information.

---

### 5. Frontend update

Add:

- Event Activity card
- Latest Events card
- divergence indicator

---

### 6. External deployment

Expose the application externally using:

- VPS
- Cloudflare Tunnel

Expected result:

- application accessible through the internet
- working endpoints
- frontend consuming external API