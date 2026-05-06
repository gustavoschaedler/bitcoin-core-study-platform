# Signet Core Study Platform

Plataforma local de estudos do Bitcoin Core em Signet. O projeto reúne nó Bitcoin Core, faucet, explorador de mempool, laboratório de carteira/assinatura, estatísticas opcionais de containers e dashboard HDMI.

## Requisitos

- Docker e Docker Compose.
- Imagem base Python `3.14-slim` definida no `Dockerfile`.
- Dependências Python com versões fixas no `requirements.txt`.
- 4 GB de RAM livres recomendados.
- Portas locais `8080` e `8181` disponíveis.

## Estrutura

```text
.
├── bitcoin/              # Configuração do Bitcoin Core Signet
├── faucet/               # App FastAPI principal e APIs
├── mempool-ui/           # Interface de mempool em HTML/CSS/JS
├── wallet-lab/           # Laboratório de carteira, PSBT e assinatura
├── container-stats/      # UI de estatísticas de containers
├── display/              # Dashboard HDMI/kiosk
├── scripts/              # Helpers para bitcoin-cli
├── systemd/              # Serviço opcional de kiosk
└── docs/                 # Notas de estudo
```

## Instalação

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Edite `.env` e troque `BITCOIN_RPC_PASSWORD` por uma senha longa e aleatória.

```bash
nano .env
```

3. Suba os serviços:

```bash
docker compose up -d --build
```

4. Inicialize a carteira do faucet:

```bash
chmod +x scripts/*.sh
./scripts/init-wallet.sh
```

5. Acompanhe a sincronização:

```bash
./scripts/status.sh
```

## Uso

```text
http://localhost:8080          # página inicial
http://localhost:8080/mempool  # monitor de mempool
http://localhost:8080/faucet   # faucet Signet
http://localhost:8080/wallet   # laboratório de carteira
http://localhost:8080/stats    # estatísticas de containers
http://localhost:8181          # display HDMI
```

Todas as páginas principais alternam entre `pt-BR` e `en-GB`.

## Publicação segura na internet

Não publique esta stack diretamente na internet sem uma camada de proteção. Para um ambiente público, use um reverse proxy com HTTPS, autenticação e bloqueio explícito das áreas administrativas.

Recomendação mínima:

- faça bind das portas Docker somente em `127.0.0.1` e exponha o serviço público apenas pelo reverse proxy;
- habilite HTTPS com Caddy, Nginx, Traefik ou Cloudflare Tunnel;
- configure `BASIC_AUTH_USERNAME` e `BASIC_AUTH_PASSWORD` para proteger o app inteiro quando ele ficar acessível fora da rede local;
- habilite `TURNSTILE_ENABLED=true` no faucet e configure as chaves da Cloudflare;
- mantenha `ENABLE_CONTAINER_STATS=false` em produção e não use o override `docker-compose.stats.yml`;
- não exponha `/wallet`, `/api/wallet/*`, `/stats`, `/api/container-stats`, RPC, ZMQ, Redis ou Docker socket para a internet;
- mantenha pouco saldo na carteira do faucet e use somente moedas Signet;
- use firewall no host permitindo publicamente apenas `80/tcp` e `443/tcp`;
- use `TRUST_PROXY_HEADERS=true` apenas quando o proxy estiver sob seu controle.

Exemplo seguro para publicação via proxy local:

```yaml
ports:
  - "127.0.0.1:8080:8080"
  - "127.0.0.1:8181:8181"
```

## Estatísticas de containers

A página `/stats` fica desativada por padrão para evitar exposição do Docker socket. Para laboratório local confiável, habilite `ENABLE_CONTAINER_STATS=true` no `.env` e suba a stack com o override:

```bash
docker compose -f docker-compose.yml -f docker-compose.stats.yml up -d --build
```

Esse override monta o Docker socket em modo somente leitura no container `faucet` e executa esse container como `root`. Essa configuração é prática para laboratório local, mas não deve ser exposta na internet. Mesmo em modo read-only, o Docker socket revela informações sensíveis do host.

Ela mostra somente os containers da stack (`signet-bitcoind`, `signet-redis`, `signet-faucet`, `signet-display`), incluindo CPU, memória, tamanho em disco, rede e I/O. A tela atualiza automaticamente a cada 30 segundos e possui botão de atualização imediata.

## Scripts

- `scripts/common.sh`: helper interno usado pelos demais scripts. Carrega `.env` e centraliza as chamadas ao `bitcoin-cli` dentro do container `signet-bitcoind`.
- `scripts/bitcoin-cli.sh`: executa qualquer comando `bitcoin-cli` em Signet. Exemplo: `./scripts/bitcoin-cli.sh getblockchaininfo`.
- `scripts/init-wallet.sh`: carrega a carteira definida em `FAUCET_WALLET_NAME`; se ela ainda não existir, cria a carteira e gera um endereço novo.
- `scripts/status.sh`: mostra informações de blockchain, rede, mempool, ZMQ e carteira do faucet.
- `scripts/mempool.sh`: mostra `getmempoolinfo` e a lista bruta de transações na mempool local.
- `scripts/new-address.sh`: gera um novo endereço na carteira do faucet.
- `scripts/send-test.sh`: envia moedas Signet da carteira do faucet para um endereço informado. Uso: `./scripts/send-test.sh <endereco_signet> <valor_btc>`.

## Faucet e moedas Signet

Este projeto não minera nem cria moedas Signet automaticamente. O faucet apenas envia moedas que já existem na carteira definida por `FAUCET_WALLET_NAME`.

Fluxo recomendado:

```bash
./scripts/init-wallet.sh
./scripts/new-address.sh
```

Envie sBTC de uma fonte Signet externa para o endereço gerado. Depois de confirmado, a página `/faucet` passa a distribuir `FAUCET_AMOUNT_BTC` por solicitação, respeitando cooldown e limites por IP.

## Mempool

O monitor em `/mempool` é inspirado no `mempool.space/signet` e usa somente HTML, CSS e JavaScript servidos pelo FastAPI.

Principais recursos:

- blocos a serem minerados à esquerda e blocos minerados à direita;
- blocos minerados recentes listados em fila horizontal, com drag pelo mouse e barra de rolagem;
- blocos ordenados por altura, do maior para o menor;
- cubos com número do bloco, faixa de taxa, total em sBTC, transações e tempo relativo;
- lista de transações paginada de 10 em 10, ordenada por tempo crescente;
- TXIDs completos como links, com destaque nos 7 primeiros e 7 últimos caracteres;
- busca no topo por TXID, bloco, hash, métrica do node e endereço;
- modal de transação com inputs, outputs, taxa, tamanho, peso, dependências, raw hex e JSON decodificado;
- modal de endereço inspirado no mempool.space, com saldo, recebidos, enviados, UTXOs, gráfico de histórico, bolhas de UTXO e histórico de transações.

### Busca por endereço

O Bitcoin Core puro não possui índice completo por endereço como o mempool.space usa por trás via Esplora/Electrum. Para manter o projeto local e simples:

- se o endereço pertence a uma wallet carregada, a API usa `listreceivedbyaddress` e `listunspent`, que é rápido;
- caso contrário, usa `scantxoutset` como fallback, que pode demorar alguns segundos;
- respostas de endereço ficam em cache por 60 segundos no Redis.

Por isso, detalhes de endereços de wallets locais tendem a abrir rapidamente; endereços arbitrários podem ser mais lentos.

## Segurança aplicada

- Os containers web rodam como usuário não-root no compose padrão. O override `docker-compose.stats.yml` muda o `faucet` para `root` apenas quando as estatísticas locais via Docker socket são habilitadas.
- As duas aplicações Python usam um único `Dockerfile` e um único `requirements.txt` na raiz do projeto.
- O runtime Python está fixado em `python:3.14-slim` e todas as bibliotecas Python estão pinadas com `==` para builds reproduzíveis.
- `Dockerfile` e `requirements.txt` duplicados em subpastas foram removidos.
- Portas RPC/ZMQ do Bitcoin Core ficam expostas apenas dentro da rede Docker por padrão.
- Headers HTTP básicos de segurança foram adicionados.
- Autenticação HTTP Basic opcional foi adicionada via `BASIC_AUTH_USERNAME` e `BASIC_AUTH_PASSWORD`.
- `x-forwarded-for` só é aceito quando `TRUST_PROXY_HEADERS=true`.
- Endpoints de carteira validam nomes, endereços Signet, valores e hex de transação.
- Renderização dinâmica das UIs escapa conteúdo antes de inserir HTML.
- Estatísticas via Docker socket são opt-in.

## Variáveis importantes

```text
BITCOIN_RPC_USER              usuário RPC do Bitcoin Core
BITCOIN_RPC_PASSWORD          senha RPC forte
FAUCET_AMOUNT_BTC             valor enviado por solicitação
FAUCET_COOLDOWN_SECONDS       espera por endereço
FAUCET_MAX_PER_IP_PER_DAY     limite diário por IP
FAUCET_WALLET_NAME            carteira usada pelo faucet
MAX_WALLET_SEND_BTC           limite para o laboratório de assinatura
TURNSTILE_ENABLED             habilita Cloudflare Turnstile
TRUST_PROXY_HEADERS           aceita x-forwarded-for de proxy confiável
ENABLE_CONTAINER_STATS        habilita a API de estatísticas de containers
BASIC_AUTH_USERNAME           usuário para autenticação HTTP Basic opcional
BASIC_AUTH_PASSWORD           senha para autenticação HTTP Basic opcional
DEFAULT_LANG                  idioma padrão: pt-BR ou en-GB
```

## ZMQ

O Bitcoin Core publica eventos ZMQ dentro da rede Docker:

```ini
zmqpubrawblock=tcp://0.0.0.0:28332
zmqpubrawtx=tcp://0.0.0.0:28333
zmqpubhashblock=tcp://0.0.0.0:28334
zmqpubhashtx=tcp://0.0.0.0:28335
```

Use o host `bitcoind` a partir de outros containers.

## Manutenção

```bash
docker compose ps
docker compose logs -f faucet
docker compose down
docker compose pull
docker compose up -d --build
```
