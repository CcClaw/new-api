#!/usr/bin/env bash

set -euo pipefail

readonly PROD_HOST="${PROD_HOST:-82.157.22.190}"
readonly PROD_USER="${PROD_USER:-ubuntu}"
readonly PROD_CONTAINER_NAME="${PROD_CONTAINER_NAME:-new-api}"
readonly PROD_BIND_PORT="${PROD_BIND_PORT:-127.0.0.1:3000:3000}"
readonly PROD_DATA_BIND="${PROD_DATA_BIND:-/opt/new-api/data:/data}"
readonly ROLLBACK_IMAGE_DEFAULT="ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-7-amd64"

require_ssh_auth() {
  if [[ -n "${SSHPASS:-}" ]]; then
    return 0
  fi
  if [[ -n "${SSHPASS_FILE:-}" ]]; then
    if [[ ! -f "${SSHPASS_FILE}" ]]; then
      printf 'SSHPASS_FILE does not exist: %s\n' "${SSHPASS_FILE}" >&2
      exit 1
    fi
    return 0
  fi

  cat >&2 <<'EOF'
Set SSH auth before running this script:
  export SSHPASS='your-password'
or
  export SSHPASS_FILE='/path/to/password-file'
EOF
  exit 1
}

sshpass_cmd() {
  require_ssh_auth
  if [[ -n "${SSHPASS_FILE:-}" ]]; then
    sshpass -f "${SSHPASS_FILE}" "$@"
  else
    sshpass -p "${SSHPASS}" "$@"
  fi
}

remote_ssh() {
  sshpass_cmd ssh -o StrictHostKeyChecking=no "${PROD_USER}@${PROD_HOST}" "$@"
}

remote_bash() {
  local script="$1"
  remote_ssh "bash -lc $(printf '%q' "${script}")"
}

require_image() {
  if [[ -z "${NEW_IMAGE:-}" ]]; then
    printf 'Set NEW_IMAGE before continuing.\n' >&2
    exit 1
  fi
}
