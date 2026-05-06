# Container Stats

Feature directory for CPU, memory, network, disk size and block I/O monitoring.

Served at `/stats`.

The Docker socket is mounted read-only by the main Compose file for local lab use.

Keep this project on a trusted local network. Even read-only Docker socket access can expose host and container metadata.

The page shows only project stack containers:

- `signet-bitcoind`
- `signet-redis`
- `signet-faucet`
- `signet-display`

It refreshes every 30 seconds and has a manual refresh button for immediate updates. Disk size is collected from Docker container metadata.
