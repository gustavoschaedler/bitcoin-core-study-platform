#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

cd "$project_root"

if [ ! -f "$project_root/.env" ]; then
  echo "Missing .env. Copy .env.example to .env and configure it first." >&2
  exit 1
fi

source "$project_root/.env"

wallet_name="${FAUCET_WALLET_NAME:-faucet}"

bitcoin_cli() {
  docker exec signet-bitcoind bitcoin-cli -signet \
    -rpcuser="$BITCOIN_RPC_USER" \
    -rpcpassword="$BITCOIN_RPC_PASSWORD" \
    "$@"
}

wallet_cli() {
  bitcoin_cli -rpcwallet="$wallet_name" "$@"
}
