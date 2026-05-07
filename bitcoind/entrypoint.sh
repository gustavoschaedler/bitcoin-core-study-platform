#!/bin/sh
# -----------------------------------------------------------------------------
# Bitcoind launcher with two RPC auth modes.
#
#   BITCOIN_RPC_AUTH_MODE=password (default)
#       Pass -rpcuser / -rpcpassword on the command line. The cookie file is
#       still generated but ignored by clients.
#
#   BITCOIN_RPC_AUTH_MODE=cookie
#       Do not pass -rpcuser / -rpcpassword; clients read the auto-generated
#       cookie file from the shared bitcoin-data volume.
# -----------------------------------------------------------------------------

set -eu

MODE="${BITCOIN_RPC_AUTH_MODE:-password}"
CONF="${BITCOIN_CONF:-/bitcoin/bitcoin.conf}"

set -- bitcoind -printtoconsole "-conf=${CONF}"

if [ "$MODE" = "password" ]; then
    if [ -z "${BITCOIN_RPC_USER:-}" ] || [ -z "${BITCOIN_RPC_PASSWORD:-}" ]; then
        echo "BITCOIN_RPC_USER / BITCOIN_RPC_PASSWORD must be set in password mode" >&2
        exit 1
    fi
    set -- "$@" "-rpcuser=${BITCOIN_RPC_USER}" "-rpcpassword=${BITCOIN_RPC_PASSWORD}"
fi

exec "$@"
