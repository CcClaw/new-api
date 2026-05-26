#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${NEW_IMAGE:-}" ]]; then
  cat >&2 <<'EOF'
Set NEW_IMAGE first, for example:
  export NEW_IMAGE='ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64'
EOF
  exit 1
fi

VERSION_TAG="${VERSION_TAG:-v1.0.0-rc.8-patched-8}"
BUILD_GOPROXY="${BUILD_GOPROXY:-https://proxy.golang.org,direct}"

if command -v sudo >/dev/null 2>&1; then
  printf '%s\n' "${VERSION_TAG}" | sudo tee VERSION >/dev/null
elif [[ -w VERSION ]] || [[ ! -e VERSION && -w . ]]; then
  printf '%s\n' "${VERSION_TAG}" > VERSION
else
  printf 'Cannot write VERSION and sudo is unavailable.\n' >&2
  exit 1
fi

docker build --platform linux/amd64 --build-arg "GOPROXY=${BUILD_GOPROXY}" -t "${NEW_IMAGE}" .

cat <<EOF
Built image: ${NEW_IMAGE}

If you want to push it manually:
  docker push ${NEW_IMAGE}
EOF
