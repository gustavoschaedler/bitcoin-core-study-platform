# Tarefa Prática Mentoria Aula 02

## Objetivo

Na Aula 2, o sistema evoluiu de:

- um painel baseado em RPC (estado)
- para um sistema que observa eventos em tempo real (ZMQ)

Agora o objetivo é:

> estruturar o fluxo do sistema e executar a aplicação em um ambiente acessível externamente.

---

## Contexto

Você já sabe que:

- RPC fornece uma fotografia do estado atual
- ZMQ fornece um fluxo de acontecimentos

Eventos:

- não são garantias
- não são ordenados
- não representam confirmação

Além disso:

- sistemas reais não rodam localmente
- são acessados via rede

---

## O que você deve desenvolver

### 1. Estrutura de eventos no backend

Manter em memória:

- últimos blocos observados
- últimas transações observadas
- timestamp de cada evento

Pode utilizar:

- listas
- deque
- buffers limitados

---

### 2. Endpoint `/api/events/summary`

Retornar:

- número de eventos de bloco
- número de eventos de transação
- timestamp do último evento
- taxa de eventos

### Exemplo

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

Retornar:

- últimos blocos
- últimas transações

### Exemplo

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

Comparar:

- último bloco via ZMQ
- `getbestblockhash` via RPC

Retornar divergência.

---

### 5. Atualização do frontend

Adicionar:

- Card Event Activity
- Card Últimos Eventos
- Indicador de divergência

---

### 6. Execução externa

Disponibilizar aplicação externamente via:

- VPS
- Cloudflare Tunnel

Resultado esperado:

- aplicação acessível via internet
- endpoints funcionando
- frontend consumindo API externa