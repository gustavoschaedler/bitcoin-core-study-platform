# Carteira e Assinatura

A plataforma separa o gerenciamento de carteiras e a assinatura de transações em duas páginas dedicadas.

## Lab de Carteira (`/wallet`)

O lab de carteiras cuida do ciclo de vida: criação, carregamento, exclusão, derivação de endereços, importação e exportação. Usa as descriptor wallets integradas do Bitcoin Core.

```bash
./scripts/bitcoin-cli.sh createwallet "study-wallet"
```

### Gerando Endereços

Novos endereços são derivados do conjunto de descritores da carteira. A plataforma gera endereços `bech32m` (Taproot) por padrão.

```bash
./scripts/bitcoin-cli.sh -rpcwallet=study-wallet getnewaddress "" "bech32m"
```

### Importação e Exportação

Carteiras podem ser exportadas (descritores + chaves) e importadas como arquivos JSON, permitindo backup e migração entre nós.

## Lab de Assinatura (`/signing`)

O lab de assinatura cuida da criação, assinatura e transmissão de transações. O fluxo usa PSBTs (Partially Signed Bitcoin Transactions):

1. **Criar** uma transação raw especificando entradas e saídas
2. **Financiar** a transação com `walletcreatefundedpsbt`
3. **Assinar** com `walletprocesspsbt`
4. **Finalizar** com `finalizepsbt`
5. **Transmitir** com `sendrawtransaction`

A interface do lab de assinatura executa os passos 2–5 em uma única ação. Transações assinadas ficam em fila para revisão antes da transmissão, e os valores podem ser inseridos em s-sats ou sBTC.

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
