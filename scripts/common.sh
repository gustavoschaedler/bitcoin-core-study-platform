#!/usr/bin/env bash
# Helper sourced by the other scripts. Loads .env, builds a `bitcoin_cli`
# wrapper that runs against the project's signet-bitcoind container, and a
# `wallet_cli` shortcut for the faucet wallet.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"
cd "$project_root"

if [ ! -f "$project_root/.env" ]; then
    echo "Missing .env. Copy .env.example to .env and configure it first." >&2
    exit 1
fi

# shellcheck source=/dev/null
set -a
source "$project_root/.env"
set +a

wallet_name="${FAUCET_WALLET_NAME:-faucet}"
auth_mode="${BITCOIN_RPC_AUTH_MODE:-password}"

bitcoin_cli() {
    if [ "$auth_mode" = "cookie" ]; then
        # bitcoin-cli inside the container reads the cookie from its own datadir.
        docker exec signet-bitcoind bitcoin-cli -signet "$@"
    else
        docker exec signet-bitcoind bitcoin-cli -signet \
            -rpcuser="${BITCOIN_RPC_USER}" \
            -rpcpassword="${BITCOIN_RPC_PASSWORD}" \
            "$@"
    fi
}

wallet_cli() {
    bitcoin_cli -rpcwallet="$wallet_name" "$@"
}
