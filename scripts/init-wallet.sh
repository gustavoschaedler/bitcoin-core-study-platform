#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"

if ! bitcoin_cli loadwallet "$wallet_name"; then
  bitcoin_cli createwallet "$wallet_name"
fi

wallet_cli getnewaddress
