# Mempool UI

Standalone HTML/CSS/JS mempool interface inspired by mempool.space/signet.

No Node, no React, no build step.

Served by FastAPI at:

```text
/mempool
```

Assets:

```text
/mempool-assets/css/mempool.css
/mempool-assets/js/mempool.js
```

Features:

- projected blocks from the local Signet mempool, shown as cube-style blocks
- recent mined blocks beside projected blocks, shown in a horizontal draggable row
- mined blocks fetched from the local Bitcoin Core node, up to the latest 50
- fee priority cards
- transaction list paginated 10 at a time and sorted by ascending time
- full TXID links with highlighted first and last 7 characters
- top search for TXID, block height, block hash, node metrics and addresses
- transaction detail panel with full TXIDs, full addresses, inputs, outputs, fees, dependencies, raw hex and decoded JSON
- address detail panel inspired by mempool.space, with balance, received/sent totals, balance history, UTXO bubbles and transaction history

Address search is local-node best effort. Loaded wallet addresses are fast because the backend uses wallet RPCs. Arbitrary addresses may use `scantxoutset`, which can take a few seconds on Bitcoin Core because there is no full address index by default.
