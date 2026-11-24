import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { StreamFeed } from '@/components/stream/StreamFeed'
import { getStreamPostById } from '@/lib/notion'
import { getStreamShortId } from '@/lib/utils'

export const runtime = 'edge'

interface StreamStatusPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: StreamStatusPageProps): Promise<Metadata> {
  const { id } = await params
  const item = await getStreamPostById(id)

  if (!item) {
    return {
      title: 'Not Found | Stream — Peng Zhang',
    }
  }

  const oneLine = item.content.replace(/\s+/g, ' ').trim()
  const snippet = oneLine
    ? `${oneLine.slice(0, 60)}${oneLine.length > 60 ? '...' : ''}`
    : 'Media post'
  const shortId = getStreamShortId(item.id)

  return {
    title: `${snippet} | Stream — Peng Zhang`,
    description: oneLine || 'Short update on pzhng.com/stream',
    alternates: {
      canonical: `/stream/${shortId}`,
    },
    openGraph: {
      title: `@pzhng · Stream`,
      description: oneLine || 'Short update on pzhng.com/stream',
      url: `https://pzhng.com/stream/${shortId}`,
      type: 'article',
      publishedTime: item.createdAt,
    },
    twitter: {
      card: 'summary',
      title: `@pzhng · Stream`,
      description: oneLine || 'Short update on pzhng.com/stream',
    },
  }
}

export default async function StreamStatusPage({ params }: StreamStatusPageProps) {
  const { id } = await params
  const item = await getStreamPostById(id)

  if (!item) {
    notFound()
  }

  return (
    <div className="py-16">
      <Container>
        <div className="mb-8">
          <Link
            href="/stream"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-mono group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>cd /stream</span>
          </Link>
        </div>

        <StreamFeed initialItems={[item]} singleView />
      </Container>
    </div>
  )
}
