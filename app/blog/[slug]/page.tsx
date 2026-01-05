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
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mb-6">
            <span className="text-blue-400">~/blog/posts/</span>
            <span className="text-yellow-400">{slug}.md</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 font-mono bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            {post.title}
          </h1>

          <div className="flex flex-col gap-3 font-mono text-sm border-l-2 border-border pl-4">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 w-20">date:</span>
              <span className="text-muted-foreground">"{formatDate(post.date)}"</span>
            </div>

            {post.category && (
              <div className="flex items-center gap-3">
                <span className="text-blue-400 w-20">category:</span>
                <span className="text-green-400">"{post.category}"</span>
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-blue-400 w-20">tags:</span>
                <div className="flex flex-wrap gap-2">
                  <span className="text-yellow-400">[</span>
                  {post.tags.map((tag, index) => (
                    <span key={tag} className="text-muted-foreground">
                      "{tag}"{index < post.tags.length - 1 && ","}
                    </span>
                  ))}
                  <span className="text-yellow-400">]</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Post Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <NotionRenderer recordMap={recordMap} rootPageId={post.id} />
        </article>
      </Container>
    </div>
  )
}
