import { BookOpen, Terminal, Globe, MessageSquare, AlertTriangle, Zap } from 'lucide-react'
import { PublicLayout } from '@/components/layout'

function Section({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2.5 mb-4">
        <Icon className="h-5 w-5 text-primary shrink-0" />
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

function CodeBlock({ language, children }: { language?: string, children: string }) {
  return (
    <pre className="bg-muted/60 rounded-lg border p-4 overflow-x-auto text-xs leading-relaxed my-4">
      {language && <div className="text-muted-foreground text-[11px] mb-1.5 font-mono">{language}</div>}
      <code className="font-mono text-[12px]">{children}</code>
    </pre>
  )
}

function InlineCode({ children }: { children: string }) {
  return <code className="bg-muted/60 rounded px-1.5 py-0.5 text-[12px] font-mono">{children}</code>
}

export function Docs() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">接入指南</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            本文档介绍如何接入 <InlineCode>sine.fmusic.cc</InlineCode> 的 NewAPI 服务。支持 OpenAI 和 Claude 兼容 SDK。
          </p>
        </div>

        <Section icon={Globe} title="基本信息">
          <ul className="list-disc pl-5 space-y-1">
            <li>服务地址：<InlineCode>https://sine.fmusic.cc</InlineCode></li>
            <li>鉴权方式：Bearer Token</li>
            <li>OpenAI 前缀：<InlineCode>https://sine.fmusic.cc/v1</InlineCode></li>
            <li>Claude 前缀：<InlineCode>https://sine.fmusic.cc</InlineCode></li>
          </ul>
          <p>请求时在 <InlineCode>Authorization</InlineCode> 头中携带你的 API Key：</p>
          <CodeBlock>{`Authorization: Bearer YOUR_API_KEY`}</CodeBlock>
        </Section>

        <Section icon={AlertTriangle} title="重要提示">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm text-muted-foreground">
              当前环境中，<InlineCode>/v1/chat/completions</InlineCode> 的稳定性明显好于 <InlineCode>/v1/responses</InlineCode>。推荐优先使用 <InlineCode>chat/completions</InlineCode> 和 <InlineCode>/v1/messages</InlineCode>。
            </p>
          </div>
          <ul className="list-disc pl-5 space-y-1 mt-4">
            <li>OpenAI SDK：使用 <InlineCode>/v1/chat/completions</InlineCode></li>
            <li>Claude SDK / Claude Code：使用 <InlineCode>/v1/messages</InlineCode></li>
            <li><strong>暂不推荐：</strong><InlineCode>/v1/responses</InlineCode>（部分上游链路有流尾兼容问题）</li>
          </ul>
        </Section>

        <Section icon={Terminal} title="OpenAI 兼容接入">
          <h3 className="text-base font-medium mt-0 mb-2">cURL 测试</h3>
          <CodeBlock language="bash">{`curl "https://sine.fmusic.cc/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {"role": "user", "content": "你好，请简单介绍一下你自己。"}
    ],
    "stream": false
  }'`}</CodeBlock>

          <h3 className="text-base font-medium mt-6 mb-2">Node.js</h3>
          <CodeBlock language="bash">{`npm install openai`}</CodeBlock>
          <CodeBlock language="js">{`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://sine.fmusic.cc/v1',
});

const completion = await client.chat.completions.create({
  model: 'gpt-5.5',
  messages: [
    { role: 'user', content: '你好，请简单介绍一下你自己。' },
  ],
});

console.log(completion.choices[0]?.message?.content);`}</CodeBlock>

          <h3 className="text-base font-medium mt-6 mb-2">Python</h3>
          <CodeBlock language="bash">{`pip install openai`}</CodeBlock>
          <CodeBlock language="python">{`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://sine.fmusic.cc/v1",
)

resp = client.chat.completions.create(
    model="gpt-5.5",
    messages=[
        {"role": "user", "content": "你好，请简单介绍一下你自己。"}
    ],
)

print(resp.choices[0].message.content)`}</CodeBlock>
        </Section>

        <Section icon={MessageSquare} title="Claude 兼容接入">
          <h3 className="text-base font-medium mt-0 mb-2">cURL 测试</h3>
          <CodeBlock language="bash">{`curl "https://sine.fmusic.cc/v1/messages" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "你好，请简单介绍一下你自己。"}
    ]
  }'`}</CodeBlock>

          <h3 className="text-base font-medium mt-6 mb-2">Node.js</h3>
          <CodeBlock language="bash">{`npm install @anthropic-ai/sdk`}</CodeBlock>
          <CodeBlock language="js">{`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://sine.fmusic.cc',
});

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: '你好，请简单介绍一下你自己。' },
  ],
});

const text = message.content
  .filter((item) => item.type === 'text')
  .map((item) => item.text)
  .join('\\n');

console.log(text);`}</CodeBlock>
        </Section>

        <Section icon={Zap} title="Claude Code 配置">
          <p className="text-sm text-muted-foreground mb-3">
            如果你使用 Claude Code，可以参考以下环境变量配置：
          </p>
          <CodeBlock language="json">{`{
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
}`}</CodeBlock>
        </Section>

        <Section icon={Zap} title="流式输出示例">
          <h3 className="text-base font-medium mt-0 mb-2">OpenAI 流式</h3>
          <CodeBlock language="js">{`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://sine.fmusic.cc/v1',
});

const stream = await client.chat.completions.create({
  model: 'gpt-5.5',
  stream: true,
  messages: [
    { role: 'user', content: '用三句话介绍 Go 语言。' },
  ],
});

for await (const chunk of stream) {
  const text = chunk.choices?.[0]?.delta?.content;
  if (text) process.stdout.write(text);
}`}</CodeBlock>

          <h3 className="text-base font-medium mt-6 mb-2">Claude 流式</h3>
          <CodeBlock language="js">{`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://sine.fmusic.cc',
});

const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: '用三句话介绍 Go 语言。' },
  ],
});

for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
    process.stdout.write(event.delta.text);
  }
}`}</CodeBlock>
        </Section>

        <Section icon={AlertTriangle} title="常见问题">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold mb-1">Q: 为什么 gpt-5.5 有时能用，有时报错？</h3>
              <p className="text-sm text-muted-foreground">
                通常是请求路径不同导致的，不是模型权限问题。<InlineCode>chat/completions</InlineCode> 更稳定，<InlineCode>responses</InlineCode> 容易触发流尾兼容问题。
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Q: 不同 SDK 应该填什么地址？</h3>
              <p className="text-sm text-muted-foreground">
                OpenAI SDK 填 <InlineCode>https://sine.fmusic.cc/v1</InlineCode><br />
                Anthropic SDK / Claude Code 填 <InlineCode>https://sine.fmusic.cc</InlineCode>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Q: 接入失败怎么排查？</h3>
              <p className="text-sm text-muted-foreground">
                1. 确认 API Key 有效 2. 确认请求路径正确（优先用 chat/completions）3. 确认模型名存在 4. 先用 curl 验证连通性
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Q: 如何获取 API Key？</h3>
              <p className="text-sm text-muted-foreground">
                登录平台后在「令牌」页面创建新的 Key，选择对应的模型分组即可使用。
              </p>
            </div>
          </div>
        </Section>
      </div>
    </PublicLayout>
  )
}
