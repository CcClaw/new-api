# NewAPI Stream Diagnostics Rollout

## Scope

This rollout deploys the local stream diagnostics patch only.

Behavior impact:
- No billing changes
- No retry logic changes
- No stream success/error classification changes
- Adds diagnostics fields to `stream_status` logs only

## Local Changes Included

- `relay/common/stream_status.go`
- `relay/common/stream_status_test.go`
- `relay/helper/stream_result.go`
- `relay/helper/stream_scanner.go`
- `relay/helper/stream_scanner_test.go`
- `service/log_info_generate.go`

New diagnostics fields:
- `saw_done`
- `stop_source`
- `scanner_error`
- `last_chunk_kind`

## Current Production Baseline

Server:
- Host: `82.157.22.190`
- User: `ubuntu`

Container:
- Name: `new-api`
- Current image: `ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64`
- Current image id: `ab2de1ecb975`
- Current container id: `e06eca9b21313b7a6c2435d258cb32031d5bd98784308c810d074680ae07478c`

Runtime settings:
- Port: `127.0.0.1:3000 -> 3000/tcp`
- Bind mount: `/opt/new-api/data:/data`
- Network mode: `bridge`
- Restart policy: `no`
- Entrypoint: `/new-api`

Rollback image already present on server:
- `ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-7-amd64` (previous production image, stays on server)

Server capacity checked:
- Disk free: about `33G`
- Memory available: about `6.0Gi`

## Pre-Cutover Checklist

Helper scripts prepared locally:
- `scripts/prod-newapi-common.sh`
- `scripts/prod-newapi-precheck.sh`
- `scripts/prod-newapi-switch.sh`
- `scripts/prod-newapi-rollback.sh`
- `scripts/prod-newapi-build-image.sh`

Recommended auth setup before running scripts:

```bash
export SSHPASS_FILE=/tmp/newapi_pass.txt
```

Run these before stopping the current container.

1. Confirm working tree contains only intended patch files.

```bash
git status --short
```

2. Confirm current production container and image.

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker ps --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}' | grep '^new-api '"
```

3. Save a fresh inspect snapshot before replacement.

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker inspect new-api > /opt/new-api/new-api.inspect.$(date +%Y%m%d%H%M%S).json"
```

4. Save the last 10 minutes of logs for comparison.

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker logs --since 10m new-api > /opt/new-api/new-api.logs.before.$(date +%Y%m%d%H%M%S).log 2>&1"
```

5. Confirm server disk and memory one more time.

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "df -h /opt /var/lib/docker && free -h"
```

## Build And Publish Preparation

Choose one of the following before the cutover window.

### Option A: Build and push a new GHCR image

Recommended tag example:
- `ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64`

Suggested sequence:

1. Commit or keep the patch staged locally as needed.
2. Build and push the amd64 image using the existing pipeline or local Docker build.
3. Pull the new image onto the production server before cutover.

Example remote pre-pull:

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker pull ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64"
```

### Option B: Build locally and transfer later

If you decide not to publish to GHCR first, keep the exact target image name settled before the window.

Local helper:

```bash
export NEW_IMAGE='ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64'
export VERSION_TAG='v1.0.0-rc.8-patched-8'
./scripts/prod-newapi-build-image.sh
```

## Exact Replacement Commands

Replace `NEW_IMAGE` with the image that contains tonight's diagnostics patch.

Scripted form:

```bash
export SSHPASS_FILE=/tmp/newapi_pass.txt
export NEW_IMAGE='ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64'
./scripts/prod-newapi-precheck.sh
./scripts/prod-newapi-switch.sh
```

```bash
NEW_IMAGE="ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64"
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker stop new-api && docker rm new-api && docker run -d --name new-api -p 127.0.0.1:3000:3000 -v /opt/new-api/data:/data ${NEW_IMAGE}"
```

This keeps the runtime parameters identical to the current production container.

## Immediate Post-Cutover Checks

1. Confirm container is running.

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker ps --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}' | grep '^new-api '"
```

2. Confirm startup logs are clean.

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker logs --since 2m new-api 2>&1"
```

3. Confirm local port responds.

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "curl -sS http://127.0.0.1:3000/ >/dev/null"
```

4. After a few live stream requests, check the new diagnostics fields exist.

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker logs --since 10m new-api 2>&1 | grep 'stream ended:'"
```

Expected additions in stream summaries:
- `stop_source=...`
- `saw_done=true`
- `scanner_error="..."`
- `last_chunk=...`

## Rollback Commands

If startup or live verification fails, roll back immediately to the current production image.

Scripted form:

```bash
export SSHPASS_FILE=/tmp/newapi_pass.txt
./scripts/prod-newapi-rollback.sh
```

```bash
ROLLBACK_IMAGE="ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-7-amd64"
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker stop new-api && docker rm new-api && docker run -d --name new-api -p 127.0.0.1:3000:3000 -v /opt/new-api/data:/data ${ROLLBACK_IMAGE}"
```

Then verify:

```bash
sshpass -p 'Fmusic2025.' ssh -o StrictHostKeyChecking=no ubuntu@82.157.22.190 "docker ps --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}' | grep '^new-api '"
```

## Known Validation Notes

Local validation completed:
- `gofmt` run on modified files
- `go test ./relay/common` passed

Local validation blocked by network dependency fetch:
- `go test ./relay/helper` attempted to download `github.com/ncruces/go-strftime@v0.1.9`
- fetch failed with upstream `EOF`
- this was not a code compile error from the patch itself

## What To Look For After Deployment

Use the new fields to classify empty-reason streams:

1. Official did not emit done marker
- `saw_done=false`
- `stop_source=scanner_eof`

2. Upstream or network cut off the stream
- `saw_done=false`
- `scanner_error` populated

3. We stopped locally
- `stop_source=handler_stop`
- `stop_source=handler_done`
- `stop_source=main_timeout`
- `stop_source=client_context_done`
