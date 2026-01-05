import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Folder, Tag } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { NotionRenderer } from '@/components/notion/NotionRenderer'
import { getBlogPosts, getBlogPostBySlug, getNotionPageContent } from '@/lib/notion'
import { formatDate } from '@/lib/utils'

export const runtime = 'edge'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Peng Zhang`,
    description: post.excerpt || `Read ${post.title} on Peng Zhang's blog.`,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const recordMap = await getNotionPageContent(post.id)

  if (!recordMap) {
    notFound()
  }

  return (
    <div className="py-16">
      <Container>
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono text-sm group"
        >
          <span className="text-green-500 group-hover:underline">$</span>
          <span className="group-hover:underline">cd ..</span>
        </Link>

        {/* Post Header */}
        <header className="mb-12 border-b border-border pb-8">
          {/* Terminal Header */}
          <div className="border border-border bg-card/50 rounded-lg p-6 mb-8 font-mono text-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />

            <div className="flex flex-col gap-4 relative z-10">
              {/* File Info */}
              <div className="flex items-center gap-2 text-muted-foreground border-b border-border/50 pb-4">
                <span className="text-primary">$</span>
                <span>cat</span>
                <span className="text-yellow-400">./posts/{post.slug}.md</span>
              </div>

              {/* Metadata Block */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-blue-400">const</span>
                  <span className="text-yellow-400">metadata</span>
                  <span>=</span>
                  <span className="text-muted-foreground">{`{`}</span>
                </div>

                <div className="pl-4 space-y-1">
                  <div>
                    <span className="text-blue-300">date:</span> <span className="text-green-400">&quot;{formatDate(post.date)}&quot;</span>,
                  </div>
                  {post.category && (
                    <div>
                      <span className="text-blue-300">category:</span> <span className="text-green-400">&quot;{post.category}&quot;</span>,
                    </div>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-300">tags:</span>
                      <span>[</span>
                      {post.tags.map((tag, i) => (
                        <span key={tag}>
                          <span className="text-green-400">&quot;{tag}&quot;</span>
                          {i < post.tags.length - 1 && ','}
                        </span>
                      ))}
                      <span>]</span>
                    </div>
                  )}
                </div>

                <div className="text-muted-foreground">{`}`}</div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 font-mono bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            {post.title}
          </h1>
        </header>

        {/* Post Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <NotionRenderer recordMap={recordMap} rootPageId={post.id} />
        </article>
      </Container>
    </div>
  )
}
