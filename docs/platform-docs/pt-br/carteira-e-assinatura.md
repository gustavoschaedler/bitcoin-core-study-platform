# Carteira e Assinatura

## Criando uma Carteira

O lab de carteiras usa as descriptor wallets integradas do Bitcoin Core. Cada carteira é criada via `createwallet` e armazenada no diretório de carteiras do nó.

```bash
./scripts/bitcoin-cli.sh createwallet "study-wallet"
```

## Gerando Endereços

Novos endereços são derivados do conjunto de descritores da carteira. A plataforma gera endereços `bech32m` (Taproot) por padrão.

```bash
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet getnewaddress "" "bech32m"
```

## Assinatura de Transações

O fluxo de assinatura usa PSBTs (Partially Signed Bitcoin Transactions):

1. **Criar** uma transação raw especificando entradas e saídas
2. **Financiar** a transação com `walletcreatefundedpsbt`
3. **Assinar** com `walletprocesspsbt`
4. **Finalizar** com `finalizepsbt`
5. **Transmitir** com `sendrawtransaction`

A interface do lab de carteiras executa os passos 2–5 em uma única ação.

## Comandos RPC Úteis

```bash
# Listar todas as carteiras
./scripts/bitcoin-cli.sh listwallets

# Informações da carteira
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet getwalletinfo

# Listar saídas não gastas
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet listunspent

# Obter informações do endereço
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet getaddressinfo "tb1q..."
```

## Nota de Segurança

Carteiras criadas na Signet contêm apenas moedas de teste. As chaves privadas são armazenadas nos arquivos de carteira do Bitcoin Core e nunca são expostas pela interface web.
