# Notas de Estudo do Bitcoin Core

## bitcoin-cli

```bash
./scripts/bitcoin-cli.sh getblockchaininfo
./scripts/bitcoin-cli.sh getnetworkinfo
./scripts/bitcoin-cli.sh getmempoolinfo
./scripts/bitcoin-cli.sh help sendrawtransaction
```

## RPC

O serviço FastAPI chama o RPC do Bitcoin Core em:

```text
http://bitcoind:38332
```

Chamadas RPC específicas de carteira usam o endpoint de wallet:

```text
http://bitcoind:38332/wallet/<nome-da-carteira>
```

Exemplos usados pela aplicação:

```bash
./scripts/bitcoin-cli.sh listwallets
./scripts/bitcoin-cli.sh listwalletdir
./scripts/bitcoin-cli.sh -rpcwallet=faucet getwalletinfo
./scripts/bitcoin-cli.sh -rpcwallet=faucet listreceivedbyaddress 0 true true
./scripts/bitcoin-cli.sh -rpcwallet=faucet listunspent 0 9999999
```

## ZMQ

Endpoints configurados:

```text
tcp://bitcoind:28332 rawblock
tcp://bitcoind:28333 rawtx
tcp://bitcoind:28334 hashblock
tcp://bitcoind:28335 hashtx
```

## Assinatura

Use `/wallet` para criar uma carteira e derivar um endereço Signet, depois use `/signing` para criar um PSBT, assinar e transmitir.

## Financiamento do Faucet

A carteira do faucet não cria moedas Signet. Inicialize a carteira e gere um endereço:

```bash
./scripts/init-wallet.sh
./scripts/new-address.sh
```

Financie esse endereço a partir de uma fonte Signet externa. Após a confirmação, o `/faucet` pode distribuir moedas da carteira local.

## Mempool e Consulta de Endereços

A interface `/mempool` chama endpoints locais do FastAPI que encapsulam o RPC do Bitcoin Core. Detalhes de transações estão disponíveis via `getrawtransaction` e `getmempoolentry`.

A consulta de endereços é mais limitada no Bitcoin Core puro do que no mempool.space, pois o Bitcoin Core não mantém um índice completo de endereços por padrão. Este projeto utiliza:

- RPCs de carteira (`listreceivedbyaddress`, `listunspent`) para endereços conhecidos por carteiras carregadas;
- varredura de transações no mempool para saídas não confirmadas;
- `scantxoutset` como fallback para endereços arbitrários.

`scantxoutset` pode ser mais lento pois varre o conjunto UTXO. Os resultados são armazenados brevemente em cache no Redis.
