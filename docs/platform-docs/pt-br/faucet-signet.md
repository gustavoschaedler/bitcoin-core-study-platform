# Faucet Signet

## Como Funciona

O faucet distribui pequenas quantidades de moedas Signet (sBTC) de uma carteira dedicada gerenciada pelo nó Bitcoin Core local. Essas moedas não têm valor real e são usadas exclusivamente para testes.

## Configuração

1. Inicialize a carteira do faucet:

```bash
./scripts/init-wallet.sh
```

2. Gere um endereço de recebimento:

```bash
./scripts/new-address.sh
```

3. Financie o endereço a partir de um faucet Signet externo. Após a confirmação da transação, o faucet local estará pronto.

### Faucets Signet Externos

- [signet257.bublina.eu.org](https://signet257.bublina.eu.org/) — Faucet Signet Bublina
- [signetfaucet.com](https://signetfaucet.com) — Signet Faucet
- Faucet da Mutinynet

## Configuração

| Variável | Padrão | Descrição |
|---|---|---|
| `FAUCET_AMOUNT_BTC` | `0.001` | Quantidade enviada por requisição |
| `FAUCET_COOLDOWN_SECONDS` | `86400` | Cooldown entre requisições (por endereço) |
| `FAUCET_MAX_PER_IP_PER_DAY` | `3` | Máximo de requisições por IP por dia |
| `FAUCET_WALLET_NAME` | `faucet` | Nome da carteira Bitcoin Core |

## API

**POST** `/api/faucet/send`

```json
{ "address": "tb1q..." }
```

Retorna o ID da transação em caso de sucesso.

## Rate Limiting

O faucet aplica limites de taxa por endereço e por IP armazenados no Redis. O temporizador de cooldown começa quando um envio bem-sucedido é concluído.
