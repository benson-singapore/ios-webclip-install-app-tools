#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR="$ROOT_DIR/bin"
OUT_FILE="$BIN_DIR/api-linux-amd64"

mkdir -p "$BIN_DIR"

if ! command -v zig >/dev/null 2>&1; then
  echo "error: zig is required for CGO cross build (install zig first)." >&2
  exit 1
fi

echo "==> Building linux/amd64 binary: $OUT_FILE"
env CGO_ENABLED=1 GOOS=linux GOARCH=amd64 \
  CC="zig cc -target x86_64-linux-gnu" \
  CXX="zig c++ -target x86_64-linux-gnu" \
  go build -o "$OUT_FILE" "$ROOT_DIR/main.go"

echo "==> Build completed: $OUT_FILE"
