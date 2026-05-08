# Wallet and Signing

The platform separates wallet management and transaction signing into two dedicated pages.

## Wallet Lab (`/wallet`)

The wallet lab handles wallet lifecycle: creation, loading, deletion, address derivation, import and export. It uses Bitcoin Core's built-in descriptor wallets.

```bash
./scripts/bitcoin-cli.sh createwallet "study-wallet"
```

### Generating Addresses

New addresses are derived from the wallet's descriptor set. The platform generates `bech32m` (Taproot) addresses by default.

```bash
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet getnewaddress "" "bech32m"
```

### Import and Export

Wallets can be exported (descriptors + keys) and imported as JSON files, enabling backup and migration between nodes.

## Signing Lab (`/signing`)

The signing lab handles transaction creation, signing and broadcasting. The signing flow uses PSBTs (Partially Signed Bitcoin Transactions):

1. **Create** a raw transaction specifying inputs and outputs
2. **Fund** the transaction with `walletcreatefundedpsbt`
3. **Sign** with `walletprocesspsbt`
4. **Finalise** with `finalizepsbt`
5. **Broadcast** with `sendrawtransaction`

The signing lab UI handles steps 2–5 in a single action. Signed transactions are queued for review before broadcasting, and amounts can be entered in either s-sats or sBTC.

## Useful RPC Commands

```bash
# List all wallets
./scripts/bitcoin-cli.sh listwallets

# Wallet info
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet getwalletinfo

# List unspent outputs
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet listunspent

# Get address info
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet getaddressinfo "tb1q..."
```

## Security Note

Wallets created on Signet hold test coins only. Private keys are stored in Bitcoin Core's wallet files and are never exposed through the web UI.
