"""Container stats panel (opt-in via ENABLE_CONTAINER_STATS).

The Docker socket must be mounted (read-only) into the web container — this is
done only by the optional ``compose.stats.yml`` override. Outside that override,
the endpoint reports ``enabled=false`` and does not attempt to read the socket.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import docker
from fastapi import APIRouter

from ..core import config

router = APIRouter()


@router.get("/api/container-stats")
def container_stats() -> dict[str, Any]:
    if not config.ENABLE_CONTAINER_STATS:
        return {
            "enabled": False,
            "containers": [],
            "message": (
                "Container stats are disabled. Enable ENABLE_CONTAINER_STATS=true and "
                "use compose.stats.yml only in trusted local environments."
            ),
        }
    if not Path("/var/run/docker.sock").exists():
        return {
            "enabled": False,
            "containers": [],
            "message": (
                "Container stats are disabled in the secure compose profile. "
                "Use compose.stats.yml only in trusted local environments."
            ),
        }
    try:
        client = docker.from_env()
        size_rows = client.api.containers(all=True, size=True)
        size_by_id = {row.get("Id"): row for row in size_rows}
        out = []
        for container in client.containers.list(all=True):
            if container.name not in config.PROJECT_CONTAINER_NAMES:
                continue
            size_info = size_by_id.get(container.id, {})
            item: dict[str, Any] = {
                "name": container.name,
                "image": container.image.tags[0] if container.image.tags else container.image.short_id,
                "status": container.status,
                "id": container.short_id,
                "disk_size": int(size_info.get("SizeRootFs") or 0)
                + int(size_info.get("SizeRw") or 0),
                "disk_rw": int(size_info.get("SizeRw") or 0),
            }
            if container.status == "running":
                stats = container.stats(stream=False)
                cpu_delta = (
                    stats["cpu_stats"]["cpu_usage"]["total_usage"]
                    - stats["precpu_stats"]["cpu_usage"]["total_usage"]
                )
                system_delta = stats["cpu_stats"].get("system_cpu_usage", 0) - stats["precpu_stats"].get(
                    "system_cpu_usage", 0
                )
                cpu_count = len(stats["cpu_stats"]["cpu_usage"].get("percpu_usage", []) or [1])
                cpu_percent = 0.0
                if system_delta > 0 and cpu_delta > 0:
                    cpu_percent = (cpu_delta / system_delta) * cpu_count * 100.0
                mem_usage = stats["memory_stats"].get("usage", 0)
                mem_limit = stats["memory_stats"].get("limit", 0)
                networks = stats.get("networks", {}) or {}
                rx = sum(v.get("rx_bytes", 0) for v in networks.values())
                tx = sum(v.get("tx_bytes", 0) for v in networks.values())
                blk = stats.get("blkio_stats", {}).get("io_service_bytes_recursive", []) or []
                read_bytes = sum(x.get("value", 0) for x in blk if x.get("op") == "Read")
                write_bytes = sum(x.get("value", 0) for x in blk if x.get("op") == "Write")
                item.update(
                    {
                        "cpu_percent": round(cpu_percent, 2),
                        "mem_usage": mem_usage,
                        "mem_limit": mem_limit,
                        "mem_percent": round(
                            (mem_usage / mem_limit * 100) if mem_limit else 0, 2
                        ),
                        "net_rx": rx,
                        "net_tx": tx,
                        "block_read": read_bytes,
                        "block_write": write_bytes,
                    }
                )
            out.append(item)
        return {"containers": out}
    except Exception as exc:  # noqa: BLE001 - the Docker SDK raises a wide tree
        return {
            "enabled": False,
            "containers": [],
            "message": f"Container stats are unavailable: {exc}",
        }
