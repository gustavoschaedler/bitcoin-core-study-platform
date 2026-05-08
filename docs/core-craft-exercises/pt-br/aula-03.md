# Tarefa Prática Mentoria Aula 03

## Evoluindo o sistema para múltiplas wallets e estado interpretado

## Objetivo

Na Aula 3, você construiu um sistema capaz de:

- criar transações
- assinar
- transmitir
- acompanhar transações Bitcoin

Agora a tarefa é evoluir o sistema para operar com múltiplas wallets e interpretar estados.

---

## Contexto

O sistema já consegue:

- criar transações
- assinar com Bitcoin Core
- transmitir via `sendrawtransaction`
- acompanhar status `broadcast → mempool → confirmed`
- exibir transações no frontend

Sistemas reais precisam responder:

- Qual wallet estou usando?
- A transação está demorando?
- Ela já entrou na mempool?
- Posso trocar o contexto sem alterar código?

---

## O que você deve desenvolver

### 1. Suporte a múltiplas wallets

Separar:

#### RPC do node

```text
http://127.0.0.1:58443
```

#### RPC da wallet

```text
http://127.0.0.1:58443/wallet/NOME_DA_WALLET
```

Implementar:

- listagem de wallets
- carregamento automático
- seleção de wallet ativa
- uso da wallet selecionada

---

### Endpoint `GET /wallets`

```json
{
  "available_wallets": ["wallet1","wallet2"],
  "loaded_wallets": ["wallet1"],
  "selected_wallet":"wallet1"
}
```

Usar:

- `listwalletdir`
- `listwallets`

---

### Endpoint `POST /wallet/select`

```json
{
  "wallet":"wallet2"
}
```

Deve:

- verificar existência
- carregar com `loadwallet`
- definir wallet ativa

---

### 2. Seleção de wallet no frontend

Adicionar:

- campo select
- atualização dinâmica
- exibição da wallet usada

---

### 3. Interpretação do estado da transação

Exemplos:

#### Broadcast

```json
{
  "status":"broadcast",
  "message":"Transação enviada ao node."
}
```

#### Mempool

```json
{
  "status":"mempool",
  "message":"Transação aceita na mempool."
}
```

#### Confirmada

```json
{
  "status":"confirmed",
  "message":"Transação confirmada em bloco."
}
```

---

### 4. Endpoint enriquecido `/tx/<txid>`

Retornar:

- txid
- wallet
- status
- confirmed
- confirmations
- block_hash
- age_seconds
- message
- warning

---

### 5. Endpoint `/wallet/status`

Retornar:

```json
{
  "wallet":"wallet1",
  "balance":0.0012,
  "utxos":3
}
```

Usar:

- `getwalletinfo`
- `listunspent`

---

## Execução do sistema

O sistema deve estar acessível externamente via:

- VPS
- ngrok
- Cloudflare Tunnel