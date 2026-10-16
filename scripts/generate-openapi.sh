#!/bin/sh
# Generate typed OpenAPI client from the core daemon.
# Source of truth: ~/projects/hive/core `slop-daemon -- --dump-openapi` (utoipa).
# Output: src/lib/api/openapi.json + src/lib/api/openapi.d.ts via openapi-typescript.
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
CORE_DIR="${SLOP_CORE_DIR:-$ROOT/../core}"
cd "$ROOT"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT INT TERM

echo "Dumping OpenAPI from $CORE_DIR ..."
cargo run -q -p slop-daemon --manifest-path "$CORE_DIR/Cargo.toml" -- --dump-openapi > "$TMP"

echo "Saving raw document ..."
cp "$TMP" src/lib/api/openapi.json

echo "Generating TypeScript ..."
pnpm exec openapi-typescript "$TMP" -o src/lib/api/openapi.d.ts
pnpm exec prettier --write src/lib/api/openapi.d.ts src/lib/api/openapi.json
echo "Wrote src/lib/api/openapi.json + src/lib/api/openapi.d.ts"
