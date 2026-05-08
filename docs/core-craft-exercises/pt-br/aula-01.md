# Tarefa Prática Mentoria Aula 01
## Snapshot Inteligente: Interpretando o estado do Bitcoin

## Objetivo

Na Aula 1, você construiu um sistema que consulta o estado do Bitcoin Core via RPC e exibe essas informações em um painel web.

Agora, o objetivo é dar o próximo passo:

> parar de apenas mostrar dados e começar a interpretar o estado do node.

Você irá evoluir seu sistema para construir uma primeira camada de inteligência, ainda baseada apenas em RPC (sem ZMQ).

---

## Contexto

Até aqui, você já sabe que:

- RPC fornece uma fotografia do estado
- O Bitcoin Core não entrega produtos prontos
- Sistemas reais precisam interpretar os dados

Esta atividade representa exatamente isso:

> transformar dados brutos em informação útil.

---

## O que você deve desenvolver

### 1. Endpoint `/api/mempool/summary`

Crie um endpoint que analisa a mempool e retorna um resumo interpretado.

#### Deve utilizar:

- `getmempoolinfo`
- `getrawmempool true`

#### O endpoint deve retornar pelo menos:

- quantidade total de transações
- tamanho total (vsize ou bytes)
- taxa média de fee
- taxa mínima e máxima
- distribuição da quantidade de transações por nível de fee

### Exemplo esperado

```json
{
  "tx_count": 12345,
  "total_vsize": 3456789,
  "avg_fee_rate": 42.3,
  "min_fee_rate": 5.1,
  "max_fee_rate": 120.8,
  "fee_distribution": {
    "low": 3200,
    "medium": 7000,
    "high": 2145
  }
}
```

---

### 2. Classificação das transações por fee

Implemente uma lógica simples:

- `low` → fee baixa
- `medium` → fee média
- `high` → fee alta

Exemplo:

- `< 10 sat/vB` → low
- `10–50 sat/vB` → medium
- `> 50 sat/vB` → high

---

### 3. Endpoint `/api/blockchain/lag`

Crie um endpoint que avalia o estado de sincronização do node.

#### Deve utilizar:

- `getblockchaininfo`

#### Deve retornar:

```json
{
  "blocks": 572061,
  "headers": 572120,
  "lag": 59
}
```

---

### 4. Atualização do frontend

Adicionar:

#### Card: Mempool Intelligence

- total de transações
- fee média
- distribuição (low / medium / high)

#### Card: Node Sync Status

- lag entre headers e blocks

---

## Restrições

- Não usar ZMQ
- Não usar banco de dados
- Não usar bibliotecas Bitcoin

Tudo deve continuar baseado em:

- RPC
- processamento no backend