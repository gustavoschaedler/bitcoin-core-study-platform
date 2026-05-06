#!/usr/bin/env bash
set -euo pipefail
if [ $# -ne 2 ]; then echo "Usage: $0 <signet_address> <amount_btc>"; exit 1; fi
source "$(dirname "$0")/common.sh"
wallet_cli sendtoaddress "$1" "$2"
