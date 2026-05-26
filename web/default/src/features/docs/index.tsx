import { BookOpen, Terminal, Globe, MessageSquare, AlertTriangle, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from '@/components/layout'
import { cn } from '@/lib/utils'

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
  const { t } = useTranslation()

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t('Integration Guide')}</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {t('How to integrate with sine.fmusic.cc NewAPI service using OpenAI or Claude compatible SDKs.')}
          </p>
        </div>

        <Section icon={Globe} title={t('Base Information')}>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t('Service URL:')} <InlineCode>https://sine.fmusic.cc</InlineCode></li>
            <li>{t('Auth: Bearer Token')}</li>
            <li>{t('OpenAI prefix:')} <InlineCode>https://sine.fmusic.cc/v1</InlineCode></li>
            <li>{t('Claude prefix:')} <InlineCode>https://sine.fmusic.cc</InlineCode></li>
          </ul>
          <p>{t('Add your API key to requests:')}</p>
          <CodeBlock>{`Authorization: Bearer YOUR_API_KEY`}</CodeBlock>
        </Section>

        <Section icon={Zap} title={t('Recommended Approach')}>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-sm">{t('Important')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('Currently, /v1/chat/completions is significantly more stable than /v1/responses. We recommend using chat/completions and /v1/messages as the primary integration paths.')}
            </p>
          </div>
          <ul className="list-disc pl-5 space-y-1 mt-4">
            <li>{t('OpenAI: Use')} <InlineCode>/v1/chat/completions</InlineCode></li>
            <li>{t('Claude: Use')} <InlineCode>/v1/messages</InlineCode></li>
            <li><strong>{t('Not recommended:')}</strong> <InlineCode>/v1/responses</InlineCode></li>
          </ul>
        </Section>

        <Section icon={Terminal} title={t('OpenAI Compatible')}>
          <h3 className="text-base font-medium mt-0 mb-2">cURL</h3>
          <CodeBlock language="bash">{`curl "https://sine.fmusic.cc/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {"role": "user", "content": "Hello, introduce yourself."}
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
    { role: 'user', content: 'Hello, introduce yourself.' },
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
        {"role": "user", "content": "Hello, introduce yourself."}
    ],
)

print(resp.choices[0].message.content)`}</CodeBlock>
        </Section>

        <Section icon={MessageSquare} title={t('Claude Compatible')}>
          <h3 className="text-base font-medium mt-0 mb-2">cURL</h3>
          <CodeBlock language="bash">{`curl "https://sine.fmusic.cc/v1/messages" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, introduce yourself."}
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
    { role: 'user', content: 'Hello, introduce yourself.' },
  ],
});

const text = message.content
  .filter((item) => item.type === 'text')
  .map((item) => item.text)
  .join('\\n');

console.log(text);`}</CodeBlock>
        </Section>

        <Section icon={Zap} title={t('Claude Code Configuration')}>
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

        <Section icon={Zap} title={t('Streaming Examples')}>
          <h3 className="text-base font-medium mt-0 mb-2">{t('OpenAI Streaming')}</h3>
          <CodeBlock language="js">{`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://sine.fmusic.cc/v1',
});

const stream = await client.chat.completions.create({
  model: 'gpt-5.5',
  stream: true,
  messages: [
    { role: 'user', content: 'Describe Go in three sentences.' },
  ],
});

for await (const chunk of stream) {
  const text = chunk.choices?.[0]?.delta?.content;
  if (text) process.stdout.write(text);
}`}</CodeBlock>

          <h3 className="text-base font-medium mt-6 mb-2">{t('Claude Streaming')}</h3>
          <CodeBlock language="js">{`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://sine.fmusic.cc',
});

const stream = await client.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Describe Go in three sentences.' },
  ],
});

for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
    process.stdout.write(event.delta.text);
  }
}`}</CodeBlock>
        </Section>

        <Section icon={AlertTriangle} title={t('FAQ')}>
          <div className={cn('space-y-5')}>
            <div>
              <h3 className="text-sm font-semibold mb-1">{t('Q: Why does gpt-5.5 work sometimes but fail other times?')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('This is usually not a model permission issue, but depends on the request path. chat/completions is more stable, while responses may trigger stream compatibility issues.')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">{t('Q: What baseURL should I use?')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('For OpenAI SDK:')} <InlineCode>https://sine.fmusic.cc/v1</InlineCode><br />
                {t('For Anthropic SDK / Claude Code:')} <InlineCode>https://sine.fmusic.cc</InlineCode>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">{t('Q: How to debug connection issues?')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('Test with a simple cURL request first. Verify your API key, model name, and request path. Avoid /v1/responses for now.')}
              </p>
            </div>
          </div>
        </Section>
      </div>
    </PublicLayout>
  )
}
