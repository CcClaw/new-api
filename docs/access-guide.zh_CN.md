# NewAPI 接入文档

本文档用于说明如何接入当前部署在 `https://sine.fmusic.cc` 的 NewAPI 服务。

## 基本信息

- 服务地址：`https://sine.fmusic.cc`
- 鉴权方式：`Bearer Token`
- OpenAI 兼容前缀：`https://sine.fmusic.cc/v1`
- Claude 兼容前缀：`https://sine.fmusic.cc`

请求时请将你在平台创建的令牌放到 `Authorization` 请求头中：

```text
Authorization: Bearer YOUR_API_KEY
```

## 推荐接入方式

当前环境中，`/v1/chat/completions` 的稳定性明显好于 `/v1/responses`。

推荐优先使用：

- OpenAI 兼容：`/v1/chat/completions`
- Claude 兼容：`/v1/messages`

不推荐默认使用：

- `/v1/responses`

原因：当前部分上游链路在 `responses` 流式场景下仍可能出现流尾兼容问题，表现为内容已经返回，但最终状态被判定为失败。

## OpenAI 兼容接入

### curl 示例

```bash
curl "https://sine.fmusic.cc/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {"role": "user", "content": "你好，简单介绍一下你自己。"}
    ],
    "stream": false
  }'
```

### Node.js 示例

安装依赖：

```bash
npm install openai
```

示例代码：

```js
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://sine.fmusic.cc/v1',
});

const completion = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [
    { role: 'user', content: '你好，简单介绍一下你自己。' },
  ],
});

console.log(completion.choices[0]?.message?.content);
```

环境变量示例：

```bash
export OPENAI_API_KEY="YOUR_API_KEY"
```

### Python 示例

安装依赖：

```bash
pip install openai
```

示例代码：

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://sine.fmusic.cc/v1",
)

resp = client.chat.completions.create(
    model="gpt-5.5",
    messages=[
        {"role": "user", "content": "你好，简单介绍一下你自己。"}
    ],
)

print(resp.choices[0].message.content)
```

## Claude 兼容接入

如果你使用的是 Claude SDK 或 Claude Code 兼容配置，请直接使用平台根地址作为 `baseURL`。

### curl 示例

```bash
curl "https://sine.fmusic.cc/v1/messages" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "你好，简单介绍一下你自己。"}
    ]
  }'
```

### Node.js 示例

安装依赖：

```bash
npm install @anthropic-ai/sdk
```

示例代码：

```js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://sine.fmusic.cc',
});

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: '你好，简单介绍一下你自己。' },
  ],
});

const text = message.content
  .filter((item) => item.type === 'text')
  .map((item) => item.text)
  .join('\n');

console.log(text);
```

环境变量示例：

```bash
export ANTHROPIC_API_KEY="YOUR_API_KEY"
```

## Claude Code 配置示例

如果你使用 Claude Code，可以参考下面的环境变量：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",
    "ANTHROPIC_BASE_URL": "https://sine.fmusic.cc",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "claude-opus-4-7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME": "claude-opus-4-7",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-sonnet-4-6",
    "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME": "claude-sonnet-4-6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "claude-haiku-4-5",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME": "claude-haiku-4-5"
  },
  "model": "opus"
}
```

## 流式输出示例

### OpenAI 兼容流式

```js
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://sine.fmusic.cc/v1',
});

const stream = await client.chat.completions.create({
  model: 'gpt-5.5',
  stream: true,
  messages: [
    { role: 'user', content: '用三句话介绍 Go。' },
  ],
});

for await (const chunk of stream) {
  const text = chunk.choices?.[0]?.delta?.content;
  if (text) process.stdout.write(text);
}
```

### Claude 流式

```js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://sine.fmusic.cc',
});

const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: '用三句话介绍 Go。' },
  ],
});

for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
    process.stdout.write(event.delta.text);
  }
}
```

## 常见问题

### 1. 为什么 `gpt-5.5` 有时能用，有时报错？

通常不是模型权限问题，而是请求路径不同：

- `chat/completions` 更稳定
- `responses` 更容易在当前链路中触发流尾兼容问题

### 2. 为什么建议优先用 `chat/completions`？

因为当前生产环境已经验证：

- `chat/completions` 大量成功
- `responses` 在部分模型和上游链路下存在短流错误

### 3. Claude Code 里应该填哪个地址？

填根地址：

```text
https://sine.fmusic.cc
```

不要额外手动拼接 `/v1/messages`，Claude SDK 或 Claude Code 会自行处理对应路径。

### 4. OpenAI SDK 里应该填哪个地址？

填：

```text
https://sine.fmusic.cc/v1
```

## 调试建议

如果接入失败，优先检查：

1. API Key 是否有效
2. 请求路径是否正确
3. 模型名是否存在
4. 是否误用了 `/v1/responses`
5. 是否使用了与 SDK 不匹配的 `baseURL`

推荐先用最简单的 `curl` 或 `chat/completions` 示例验证连通性，再接入业务代码。
