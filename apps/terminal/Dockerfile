# =============================================================================
# Stage 1: copy bitcoin-cli from the official Bitcoin Core image
# =============================================================================
ARG PYTHON_IMAGE=python:3.14-slim
ARG BITCOIN_REPO=bitcoin/bitcoin
ARG BITCOIN_VERSION=29

FROM ${BITCOIN_REPO}:${BITCOIN_VERSION} AS bitcoin

# =============================================================================
# Stage 2: final WebUI image — Python + sandbox shell
# =============================================================================
FROM ${PYTHON_IMAGE}

ARG BITCOIN_VERSION=29

# UTF-8 everywhere so jq/grep/sed handle non-ASCII correctly.
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        jq \
        grep \
        sed \
        gawk \
        findutils \
        less \
        procps \
        coreutils \
    && rm -rf /var/lib/apt/lists/*

# --- bitcoin-cli from stage 1 -----------------------------------------------
# The official Bitcoin Core image lays binaries out as /opt/bitcoin-<full>/bin/.
# A glob-copy keeps this working when only the major version is pinned (e.g. `29`).
COPY --from=bitcoin /opt /tmp/bcopt
RUN cp /tmp/bcopt/bitcoin-*/bin/bitcoin-cli /usr/local/bin/bitcoin-cli \
    && chmod +x /usr/local/bin/bitcoin-cli \
    && rm -rf /tmp/bcopt

# --- unprivileged user for the sandbox --------------------------------------
RUN useradd -m -s /bin/bash -u 1000 sandbox

# --- Python app -------------------------------------------------------------
WORKDIR /app
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/app.py ./app.py
COPY webui/static ./static
RUN chmod -R a+rX /app && chown -R sandbox:sandbox /app

# --- entrypoint: renders bitcoin-cli.conf from env, then execs uvicorn ------
COPY --chmod=0755 entrypoint.sh /usr/local/bin/entrypoint.sh

# --- runtime as sandbox user (non-root) -------------------------------------
USER sandbox
ENV HOME=/home/sandbox
WORKDIR /home/sandbox

EXPOSE 8181
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
