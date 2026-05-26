# 本地补丁记录

最后更新：`2026-05-27 03:40`

## 当前版本

| 项目 | 内容 |
|------|------|
| 上游基础 | `v1.0.0-rc.10`（QuantumNous） |
| 生产分支 | `v1.0.0-rc.10-patched` |
| 生产镜像 | `ghcr.io/ccclaw/new-api:v1.0.0-rc.10-patched-1-amd64` |
| 旧版回滚 | `ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64` |
| 部署地址 | `https://sine.fmusic.cc` |

## 补丁清单

### 01 EOF 分类

- **文件**：`relay/common/stream_status.go`、`relay/helper/stream_scanner.go`
- **内容**：将流扫描器 EOF 单独分类，不与硬错误混淆

### 02 Claude text_delta 兼容

- **文件**：`relay/channel/claude/relay-claude.go`
- **内容**：Claude text_delta 转 OpenAI 流式输出格式兼容

### 02b Claude Opus 4.7 参数剥离

- **文件**：`relay/channel/claude/relay-claude.go`
- **内容**：拦截 Opus 4.7 请求中的 `temperature`/`top_p`/`top_k`（Anthropic 新版已废弃这些参数，传了会报 400）

### 04 client_gone 跳过（上游已集成）

- 上游 `rc.9` 已包含等价修复，不再单独维护

### 05 output_tokens（上游已集成）

- 上游 `rc.9` 已包含等价修复，不再单独维护

### 07 币种同步

- **内容**：本地货币和计费展示逻辑与当前部署对齐

### 08 流诊断

- **文件**：
  - `relay/common/stream_status.go`
  - `relay/helper/stream_result.go`
  - `relay/helper/stream_scanner.go`
  - `service/log_info_generate.go`
- **新增字段**：
  - `saw_done`：是否检测到流正常结束标记
  - `stop_source`：流停止原因来源（scanner_streaming / handler_done / client_gone 等）
  - `scanner_error`：扫描器级错误信息
  - `last_chunk_kind`：最后一段数据块的类型（done / short / data / non_data_line 等）

### 09 Kiro-Claude message_stop 正常结束

- **文件**：
  - `relay/channel/claude/relay-claude.go`
  - `relay/channel/claude/relay_claude_test.go`
  - `relay/helper/stream_scanner.go`
- **问题**：Kiro-Go 能正常输出 Claude `message_stop` 事件，然后用 EOF 结束流。旧代码在 EOF 结尾时仍然报错，即使上游已正常收尾。
- **修复**：
  - 在 `HandleStreamResponseData` 中增加 `sr.Done()` 调用，当收到 `message_stop` 时标记流已正常结束
  - `StreamScannerHandler` 增加 worker goroutine 等待逻辑，避免 handler 还没处理完就提前输出最终状态
  - 新增测试用例 `TestClaudeStreamHandler_MessageStopMarksDoneWithoutDoneMarker`

## 前端改动

### 10a 导航栏「说明」按钮

- **文件**：`web/default/src/hooks/use-top-nav-links.ts`
- **改动**：顶部导航栏标签从 `Docs`（文档）改为 `说明`
- **行为**：点击后跳转内部的 `/docs` 接入文档页面

### 10b 接入文档页面（`/docs`）

- **文件**：
  - `web/default/src/routes/docs.tsx`（路由）
  - `web/default/src/features/docs/index.tsx`（页面组件）
- **内容**：完整中文接入指南，包含：
  - 服务基本信息
  - 重要提示（优先用 chat/completions，避免 responses）
  - OpenAI 兼容接入（cURL / Node.js / Python）
  - Claude 兼容接入（cURL / Node.js）
  - Claude Code 配置示例
  - 流式输出示例（OpenAI / Claude）
  - 常见问题 FAQ

### 10c 关于页面（`/about`）

- **文件**：`web/default/src/features/about/index.tsx`
- **改动**：去掉默认的 GitHub/QuantumNous/AGPL 占位内容，替换为：
  - 服务简介
  - 四张功能卡片（已接入模型 / 接口兼容 / 权限与用量 / 服务状态）
  - 底部跳转到接入文档链接
- **管理员覆盖**：如果在后台配置了 `关于` 页面内容（/api/about），优先显示后台配置

### 10d 外部文档链接处理

- **问题**：默认 `docs_link` 值为 `https://docs.newapi.pro`，导致导航栏「说明」跳外部链接
- **修复**：生产数据库中清空 `docs_link`（设为空字符串），导航栏自动使用内部 `/docs` 路径
- **注意**：`docs_link` 是代码默认值（`setting/operation_setting/general_setting.go`），替换数据库的 `options` 表不生效，需在生产数据库插入 `INSERT INTO options (key, value) VALUES ('general_setting.docs_link', '')` 并在源码中将默认值改为空字符串

## 其它文件

### Dockerfile

- **文件**：`Dockerfile`
- **改动**：保持原样，同时构建 default 和 classic 两个前端主题

### Dockerfile.minimal

- **文件**：`Dockerfile.minimal`
- **用途**：用于服务器端快速打包镜像（只 COPY 预编译好的 `new-api-linux` 二进制，不重新编译前端和 Go）

### 部署脚本

- `scripts/prod-newapi-build-image.sh`：构建 Docker 镜像
- `scripts/prod-newapi-common.sh`：通用部署函数
- `scripts/prod-newapi-precheck.sh`：部署前检查
- `scripts/prod-newapi-rollback.sh`：回滚脚本
- `scripts/prod-newapi-switch.sh`：切换版本

## 部署注意事项

1. **主题**：目前生产数据库 `theme=default`，不需要额外操作。如果是新部署，需要确保内置了 `default` 和 `classic` 两个前端主题的 dist，或者将 DB 中的 theme 选项改为 `default`
2. **docs_link**：生产环境已在数据库中设为空字符串，导航栏「说明」指向内部 `/docs` 页面
3. **回滚**：如有问题，执行 `docker run -d --name new-api --restart always -p 3000:3000 -v /opt/new-api/data:/data ghcr.io/ccclaw/new-api:v1.0.0-rc.8-patched-8-amd64`

## 升级检查清单

1. 基于最新上游版本创建分支
2. 按数字顺序重新应用补丁 01-09（检查 04/05 是否已被上游集成）
3. 检查前端文件（10a-10d）是否已包含在新版本中
4. 运行针对性测试
5. 更新本文档的时间戳、标签和补丁状态
6. 如果某个补丁已被上游正式集成，标记为"上游已集成"并移除本地重复修改
