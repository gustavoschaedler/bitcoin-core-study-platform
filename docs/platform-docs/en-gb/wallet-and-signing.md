# Wallet and Signing

## Creating a Wallet

The wallet lab uses Bitcoin Core's built-in descriptor wallets. Each wallet is created via `createwallet` and stored in the node's wallet directory.

```bash
./scripts/bitcoin-cli.sh createwallet "study-wallet"
```

## Generating Addresses

New addresses are derived from the wallet's descriptor set. The platform generates `bech32m` (Taproot) addresses by default.

```bash
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet getnewaddress "" "bech32m"
```

## Transaction Signing

The signing flow uses PSBTs (Partially Signed Bitcoin Transactions):

1. **Create** a raw transaction specifying inputs and outputs
2. **Fund** the transaction with `walletcreatefundedpsbt`
3. **Sign** with `walletprocesspsbt`
4. **Finalise** with `finalizepsbt`
5. **Broadcast** with `sendrawtransaction`

The wallet lab UI handles steps 2–5 in a single action.

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
