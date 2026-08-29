# Frontend image for Mandate Doctor (TanStack Start / Vite).
#
# The frontend is served with its own development server (`vite dev`),
# matching the existing local workflow, so the browser receives the fully
# SSR-rendered app with zero changes to the frontend source.
#
# Package manager: bun (the project's canonical manager — bun.lock is the
# authoritative lockfile and no package-lock.json is committed, so we use
# `bun install --frozen-lockfile`).
FROM node:24-slim AS base

ENV CI=true \
    NEXT_TELEMETRY_DISABLED=1 \
    BUN_INSTALL=/usr/local

# Install bun, pinned to a known-good version. Floating `latest` (1.4.x)
# intermittently fails mid-install with "Fail extracting tarball" (a bun
# tarball-extraction regression in the 1.3.14/1.4.0 line, see oven-sh/bun
# #34821); 1.3.13 resolves this project's lockfile cleanly.
RUN npm install -g bun@1.3.13

WORKDIR /app

# Install dependencies (layer-cached on lockfile changes).
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# Copy the rest of the application source.
COPY . .

EXPOSE 8080

# Vite dev server bound to all interfaces on 8080 (already the configured
# host/port; flags added for explicitness inside the container).
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]
