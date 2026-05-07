"""Redis cache and rate-limit helpers."""

from __future__ import annotations

import time

import redis
from fastapi import HTTPException

from . import config

client = redis.Redis(
    host=config.REDIS_HOST,
    port=config.REDIS_PORT,
    decode_responses=True,
)


def rate_limit(key: str, limit_per_min: int) -> None:
    """Sliding-window-ish counter: increment a per-minute key in Redis.

    Raises 429 once the call exceeds ``limit_per_min`` within the current minute.
    """
    bucket = f"rl:{key}:{int(time.time() // 60)}"
    count = client.incr(bucket)
    if count == 1:
        client.expire(bucket, 70)
    if count > limit_per_min:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
