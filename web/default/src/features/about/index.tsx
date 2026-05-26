import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { PublicLayout } from '@/components/layout'
import { getAboutContent } from './api'

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isLikelyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function EmptyAboutState() {
  const currentYear = new Date().getFullYear()

  return (
    <div className='flex min-h-[60vh] items-center justify-center p-8'>
      <div className='max-w-2xl w-full space-y-8'>
        <div className='text-center space-y-3'>
          <h2 className='text-2xl font-bold'>关于本服务</h2>
          <p className='text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto'>
            统一的 AI API 网关，支持 GPT、Claude、Gemini 等多种模型，只需一个 API Key 即可接入。
          </p>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='rounded-lg border bg-card p-5 space-y-2'>
            <h3 className='font-semibold text-sm'>已接入模型</h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              GPT-5 系列、Claude Opus & Sonnet、DeepSeek、Gemini、Qwen、GLM、MiniMax、Kimi 等。
            </p>
          </div>
          <div className='rounded-lg border bg-card p-5 space-y-2'>
            <h3 className='font-semibold text-sm'>接口兼容</h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              支持 OpenAI chat/completions、Claude Messages 等接口，兼容主流 SDK 和工具。
            </p>
          </div>
          <div className='rounded-lg border bg-card p-5 space-y-2'>
            <h3 className='font-semibold text-sm'>权限与用量</h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              支持用户令牌、分组权限、用量统计和灵活的计费方式。
            </p>
          </div>
          <div className='rounded-lg border bg-card p-5 space-y-2'>
            <h3 className='font-semibold text-sm'>服务状态</h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {currentYear} 年持续运行和积极维护中。
            </p>
          </div>
        </div>

        <div className='text-center text-xs text-muted-foreground pt-4 border-t'>
          <p>由 NewAPI 驱动。查看 <a href='/docs' className='text-primary hover:underline'>接入文档</a> 了解更多。</p>
        </div>
      </div>
    </div>
  )
}

export function About() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: getAboutContent,
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isValidUrl(rawContent)
  const isHtml = hasContent && !isUrl && isLikelyHtml(rawContent)

  if (isLoading) {
    return (
      <PublicLayout>
        <div className='mx-auto flex max-w-4xl flex-col gap-4 py-12'>
          <Skeleton className='h-8 w-[45%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </PublicLayout>
    )
  }

  if (!hasContent) {
    return (
      <PublicLayout>
        <EmptyAboutState />
      </PublicLayout>
    )
  }

  if (isUrl) {
    return (
      <PublicLayout showMainContainer={false}>
        <iframe
          src={rawContent}
          className='h-[calc(100vh-3.5rem)] w-full border-0'
          title={t('关于')}
        />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        {isHtml ? (
          <div
            className='prose prose-neutral dark:prose-invert max-w-none'
            dangerouslySetInnerHTML={{ __html: rawContent }}
          />
        ) : (
          <Markdown className='prose-neutral dark:prose-invert max-w-none'>
            {rawContent}
          </Markdown>
        )}
      </div>
    </PublicLayout>
  )
}
