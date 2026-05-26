#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./prod-newapi-common.sh
source "${SCRIPT_DIR}/prod-newapi-common.sh"

require_image

printf 'Switching %s on %s to %s\n' "${PROD_CONTAINER_NAME}" "${PROD_HOST}" "${NEW_IMAGE}"

remote_bash "docker stop ${PROD_CONTAINER_NAME} && \
docker rm ${PROD_CONTAINER_NAME} && \
docker run -d --name ${PROD_CONTAINER_NAME} \
  -p ${PROD_BIND_PORT} \
  -v ${PROD_DATA_BIND} \
  ${NEW_IMAGE}"

printf '\n== Post-switch container status ==\n'
remote_bash "docker ps --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}' | grep '^${PROD_CONTAINER_NAME} '"

printf '\n== Startup logs ==\n'
remote_bash "docker logs --since 2m ${PROD_CONTAINER_NAME} 2>&1"

printf '\n== Local health check ==\n'
remote_bash "curl -sS http://127.0.0.1:3000/ >/dev/null && printf 'healthcheck ok\\n'"
