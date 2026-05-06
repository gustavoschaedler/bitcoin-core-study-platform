# Bitcoin Core Study Notes

## bitcoin-cli

```bash
./scripts/bitcoin-cli.sh getblockchaininfo
./scripts/bitcoin-cli.sh getnetworkinfo
./scripts/bitcoin-cli.sh getmempoolinfo
./scripts/bitcoin-cli.sh help sendrawtransaction
```

## RPC

The FastAPI service calls Bitcoin Core RPC at:

```text
http://bitcoind:38332
```

Wallet-specific RPC calls use the wallet endpoint:

```text
http://bitcoind:38332/wallet/<wallet-name>
```

Examples used by the app:

```bash
./scripts/bitcoin-cli.sh listwallets
./scripts/bitcoin-cli.sh listwalletdir
./scripts/bitcoin-cli.sh -rpcwallet=faucet getwalletinfo
./scripts/bitcoin-cli.sh -rpcwallet=faucet listreceivedbyaddress 0 true true
./scripts/bitcoin-cli.sh -rpcwallet=faucet listunspent 0 9999999
```

## ZMQ

Configured endpoints:

```text
tcp://bitcoind:28332 rawblock
tcp://bitcoind:28333 rawtx
tcp://bitcoind:28334 hashblock
tcp://bitcoind:28335 hashtx
```

## Signing

Use `/wallet` to create a wallet, derive a Signet address, create a PSBT and sign it.

## Faucet Funding

The faucet wallet does not create Signet coins. Initialise the wallet and generate an address:

```bash
./scripts/init-wallet.sh
./scripts/new-address.sh
```

Fund that address from an external Signet source. Once confirmed, `/faucet` can distribute coins from the local wallet.

## Mempool And Address Lookup

The `/mempool` UI calls local FastAPI endpoints that wrap Bitcoin Core RPC. Transaction details are available through `getrawtransaction` and `getmempoolentry`.

Address lookup is more limited in plain Bitcoin Core than in mempool.space because Bitcoin Core does not keep a full address index by default. This project uses:

- wallet RPCs (`listreceivedbyaddress`, `listunspent`) for addresses known to loaded wallets;
- mempool transaction scans for unconfirmed outputs;
- `scantxoutset` as a fallback for arbitrary addresses.

`scantxoutset` can be slower because it scans the UTXO set. Results are cached briefly in Redis.
