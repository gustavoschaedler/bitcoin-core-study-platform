#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/common.sh"
bitcoin_cli getblockchaininfo
bitcoin_cli getnetworkinfo
bitcoin_cli getmempoolinfo
bitcoin_cli getzmqnotifications
wallet_cli getwalletinfo || true
