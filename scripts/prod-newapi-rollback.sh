#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./prod-newapi-common.sh
source "${SCRIPT_DIR}/prod-newapi-common.sh"

ROLLBACK_IMAGE="${ROLLBACK_IMAGE:-${ROLLBACK_IMAGE_DEFAULT}}"

printf 'Rolling back %s on %s to %s\n' "${PROD_CONTAINER_NAME}" "${PROD_HOST}" "${ROLLBACK_IMAGE}"

remote_bash "docker stop ${PROD_CONTAINER_NAME} && \
docker rm ${PROD_CONTAINER_NAME} && \
docker run -d --name ${PROD_CONTAINER_NAME} \
  -p ${PROD_BIND_PORT} \
  -v ${PROD_DATA_BIND} \
  ${ROLLBACK_IMAGE}"

printf '\n== Post-rollback container status ==\n'
remote_bash "docker ps --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}' | grep '^${PROD_CONTAINER_NAME} '"
