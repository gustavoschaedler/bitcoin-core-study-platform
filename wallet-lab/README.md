# Wallet Lab

Feature directory for:

- listing existing wallets, addresses and balances
- wallet creation
- address generation
- PSBT creation
- transaction signing
- optional raw transaction broadcast

Served at `/wallet`.

The backend uses Bitcoin Core wallet RPCs. Wallet names, addresses, amounts and raw transaction hex are validated before RPC calls.
