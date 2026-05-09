# Arquitetura da Plataforma

## Visão Geral

A Signet Core Study Platform funciona como um conjunto de containers Docker orquestrados pelo Docker Compose. Todos os serviços se comunicam por uma rede Docker interna.

## Serviços

### bitcoind

Nó Bitcoin Core rodando na **Signet** (a rede de testes oficial com desafio de assinatura). Expõe JSON-RPC na porta `38332` e ZMQ nas portas `28332`–`28335`.

### web

Aplicação FastAPI que serve a interface web e os endpoints da API. As rotas incluem:

- `/` — Dashboard principal com status do nó
- `/faucet` — Solicitar moedas de teste
- `/mempool` — Explorador de mempool em tempo real
- `/wallet` — Lab de carteira (criar, gerenciar e exportar carteiras)
- `/signing` — Lab de assinatura (criar PSBTs, assinar e transmitir transações)
- `/stats` — Monitoramento de recursos dos containers
- `/study-docs` — Este visualizador de documentação

### redis

Camada de cache para respostas RPC, rate limiting e controle de cooldown do faucet.

### display

Dashboard HDMI otimizado para uma tela conectada, exibindo métricas do nó em tempo real. Os links de navegação na interface web apontam para a URL definida na variável de ambiente `DISPLAY_URL` (padrão `http://localhost:8181`).

### terminal-webui / terminal-proxy

Terminal no navegador com acesso direto ao `bitcoin-cli` e JSON-RPC no nó Signet. Os links de navegação na interface web apontam para a URL definida na variável de ambiente `TERMINAL_URL` (padrão `http://localhost:8182`).

## Modos de Autenticação

A plataforma suporta dois métodos de autenticação RPC configurados via `BITCOIN_RPC_AUTH_MODE`:

- **password** — credenciais tradicionais `rpcuser` / `rpcpassword`
- **cookie** — lê o arquivo `.cookie` gerado pelo Bitcoin Core na inicialização

## Fluxo de Dados

```text
Navegador ──► FastAPI (web) ──► Bitcoin Core RPC (bitcoind)
                            ──► Redis (cache)
                            ──► Docker API (stats)
```

Todas as chamadas RPC passam por `apps/web/app/core/rpc.py`, que gerencia ambos os modos de autenticação e o pool de conexões via `httpx`.
