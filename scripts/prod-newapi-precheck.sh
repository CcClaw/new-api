#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./prod-newapi-common.sh
source "${SCRIPT_DIR}/prod-newapi-common.sh"

printf '== Local git status ==\n'
git status --short

printf '\n== Remote container ==\n'
remote_bash "docker ps --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}' | grep '^${PROD_CONTAINER_NAME} '"

printf '\n== Save inspect snapshot ==\n'
remote_bash "docker inspect ${PROD_CONTAINER_NAME} > /opt/new-api/${PROD_CONTAINER_NAME}.inspect.\$(date +%Y%m%d%H%M%S).json && ls -1t /opt/new-api/${PROD_CONTAINER_NAME}.inspect.*.json | head -n 1"

printf '\n== Save recent logs snapshot ==\n'
remote_bash "docker logs --since 10m ${PROD_CONTAINER_NAME} > /opt/new-api/${PROD_CONTAINER_NAME}.logs.before.\$(date +%Y%m%d%H%M%S).log 2>&1 && ls -1t /opt/new-api/${PROD_CONTAINER_NAME}.logs.before.*.log | head -n 1"

printf '\n== Remote disk and memory ==\n'
remote_bash "df -h /opt /var/lib/docker && free -h"

if [[ -n "${NEW_IMAGE:-}" ]]; then
  printf '\n== Pull target image ==\n'
  remote_bash "docker pull ${NEW_IMAGE}"
fi

printf '\nPrecheck complete.\n'
