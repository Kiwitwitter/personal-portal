import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { StreamFeed } from '@/components/stream/StreamFeed'
import { getStreamPosts } from '@/lib/notion'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Stream | Peng Zhang',
  description:
    'Short-form engineering thoughts, TILs, and quick updates by Peng Zhang.',
  alternates: {
    canonical: '/stream',
  },
}

export default async function StreamPage() {
  const items = await getStreamPosts()

  return (
    <div className="py-16">
      <Container>
        <div className="mb-10 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mb-4">
            <span className="text-green-500">$</span>
            <span>tail -f ./stream.log</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 font-mono">Stream</h1>
          <p className="text-lg text-muted-foreground font-mono">
            <span className="text-blue-400">const</span>{' '}
            <span className="text-yellow-400">stream</span> ={' '}
            <span className="text-green-400">
              &quot;quick thoughts, TILs &amp; snapshots too short for a blog post&quot;
            </span>
            ;
          </p>
        </div>

        <StreamFeed initialItems={items} />
      </Container>
    </div>
  )
}
