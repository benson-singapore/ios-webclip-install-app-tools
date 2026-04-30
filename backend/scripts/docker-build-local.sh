#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${IMAGE_NAME:-tuangou-shop-backend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "==> Step 1/2: build linux/amd64 binary"
"$ROOT_DIR/scripts/build-linux-amd64.sh"

echo "==> Step 2/2: docker build ${IMAGE_NAME}:${IMAGE_TAG}"
docker build --platform linux/amd64 -t "${IMAGE_NAME}:${IMAGE_TAG}" "$ROOT_DIR"

echo "==> Docker image built: ${IMAGE_NAME}:${IMAGE_TAG}"
