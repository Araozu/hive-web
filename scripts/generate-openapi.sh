#!/bin/sh
# Generate typed OpenAPI client from the running core daemon.
#
# The daemon must ALREADY be running — this script never builds or starts it.
# Source of truth: `GET /api-docs/openapi.json` on the daemon's HTTP API
# (utoipa, unauthenticated docs endpoint; Swagger UI lives at `/docs`).
# Output: src/lib/api/openapi.json + src/lib/api/openapi.d.ts via openapi-typescript.
#
# Port: defaults to 7331. Override with `--port <N>`, `--port=<N>`,
# or the SLOP_DAEMON_PORT env var. A full base URL (SLOP_DAEMON_URL) wins over
# the port, matching the env used by the web app's daemon proxy.
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

PORT="${SLOP_DAEMON_PORT:-7331}"
while [ $# -gt 0 ]; do
    case $1 in
    --port)
        [ $# -ge 2 ] || {
            echo "error: --port needs a value" >&2
            exit 2
        }
        PORT=$2
        shift 2
        ;;
    --port=*)
        PORT=${1#*=}
        shift
        ;;
    -h | --help)
        echo "usage: $0 [--port <N>]   (or set SLOP_DAEMON_PORT / SLOP_DAEMON_URL)" >&2
        exit 0
        ;;
    *)
        echo "error: unknown argument: $1" >&2
        exit 2
        ;;
    esac
done

if [ -n "${SLOP_DAEMON_URL:-}" ]; then
    BASE=$SLOP_DAEMON_URL
else
    BASE="http://127.0.0.1:$PORT"
fi
URL="$BASE/api-docs/openapi.json"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT INT TERM

echo "Fetching OpenAPI from $URL ..."
if ! curl -fsS --max-time 10 "$URL" >"$TMP"; then
    echo "error: cannot reach the core daemon at $URL" >&2
    echo "       start slopd (e.g. in $ROOT/../core) or point --port / SLOP_DAEMON_URL at it" >&2
    exit 1
fi
# Guard against proxy/hardware pages: must look like an OpenAPI document.
case $(head -c 200 "$TMP") in
*'"openapi"'*) ;;
*)
    printf 'error: %s did not return an OpenAPI document\n' "$URL" >&2
    exit 1
    ;;
esac

echo "Saving raw document ..."
cp "$TMP" src/lib/api/openapi.json

echo "Generating TypeScript ..."
pnpm exec openapi-typescript "$TMP" -o src/lib/api/openapi.d.ts
pnpm exec prettier --write src/lib/api/openapi.d.ts src/lib/api/openapi.json
echo "Wrote src/lib/api/openapi.json + src/lib/api/openapi.d.ts"
