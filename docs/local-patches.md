# Local Patches

Updated: `2026-05-27 02:40`

## rc.10 Merge Notes

- Merged upstream `v1.0.0-rc.10` from QuantumNous onto `v1.0.0-rc.9-patched`.
- No merge conflicts. rc.10 changes are limited to frontend UI fixes (theme presets, log filters, form NaN handling).
- Stream relay files untouched by rc.10 — all local patches (01-09) remain compatible.

## Patch Baseline

- Upstream base: `v1.0.0-rc.10`
- Current production image: `ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64`
- Local build branch: `v1.0.0-rc.10-patched`
- Recommended next image tag: `ghcr.io/ccclaw/new-api:v1.0.0-rc.10-patched-1-amd64`

## Patch List

### 01 EOF classification

- Purpose: classify stream EOF separately from hard scanner failures.
- Main files:
  - `relay/common/stream_status.go`
  - `relay/helper/stream_scanner.go`

### 02 Claude text_delta

- Purpose: keep Claude text delta conversion compatible with OpenAI-style stream output.
- Main files:
  - `relay/channel/claude/relay-claude.go`

### 02b Claude Opus 4.7 temperature strip

- Purpose: strip `temperature`/`top_p`/`top_k` from upstream Claude Opus 4.7 requests (Anthropic rejects them as deprecated for this model).
- Main files:
  - `relay/channel/claude/relay-claude.go`

### 04 client_gone skip

- Purpose: avoid treating client disconnects as relay failures where upstream already behaved normally.
- Main files:
  - upstream-integrated patch

### 05 output_tokens

- Purpose: preserve Claude/OpenAI output token reporting in stream settlement.
- Main files:
  - upstream-integrated patch

### 07 currency sync

- Purpose: keep local currency and billing display behavior aligned with current deployment.
- Main files:
  - local billing-related changes

### 08 stream diagnostics

- Updated: `2026-05-26 23:00`
- Purpose: add stream-end diagnostics without changing billing or retry behavior.
- Main files:
  - `relay/common/stream_status.go`
  - `relay/helper/stream_result.go`
  - `relay/helper/stream_scanner.go`
  - `service/log_info_generate.go`
  - `docs/stream-diagnostics-rollout.md`
- Added fields:
  - `saw_done`
  - `stop_source`
  - `scanner_error`
  - `last_chunk_kind`

### 09 Kiro-Claude message_stop completion

- Updated: `2026-05-26 23:00`
- Purpose: treat Claude `message_stop` as a normal completed stream even when the transport ends with EOF and never emits scanner-level `[DONE]`, and wait for handler goroutines to finish before final stream classification is logged.
- Why: Kiro-Go can emit a valid Claude `message_stop` and then end the HTTP stream with EOF. Without this patch, `new-api` may still log `reason=` and show a red stream warning even though the Claude stream ended correctly. A second issue was that `StreamScannerHandler` could log final status before the handler goroutine had finished setting `Done`, which produced false empty-reason errors even when the handler had already reached normal completion.
- Main files:
  - `relay/channel/claude/relay-claude.go`
  - `relay/channel/claude/relay_claude_test.go`
  - `relay/helper/stream_scanner.go`
- Roll-forward note: when rebasing to a newer upstream, re-check whether Claude stream handling already marks `message_stop` as completed inside the stream handler. If upstream has equivalent behavior, drop this local patch instead of carrying it forward.

### 10 Frontend: Docs page + About rewrite

- Purpose: provide user-facing integration documentation and replace default GitHub/QuantumNous about placeholder with service-specific content.
- Main files:
  - `web/default/src/routes/docs.tsx`
  - `web/default/src/features/docs/index.tsx`
  - `web/default/src/features/about/index.tsx`
  - `docs/access-guide.zh_CN.md`
- Notes: `docs_link` admin setting should be left empty or set to `/docs` so the top-nav "Docs" link points to the internal documentation page.

## Upgrade Checklist

1. Rebase or merge upstream first.
2. Re-apply local patches in numeric order.
3. Run focused tests for touched areas.
4. Update this file with the new timestamp, image tag, and any patch status changes.
5. If a patch becomes upstreamed, mark it as upstream-integrated and remove the duplicate local diff.
