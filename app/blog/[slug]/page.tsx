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
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Post Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

          <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.date)}
            </span>
            {post.category && (
              <span className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                {post.category}
              </span>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Post Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <NotionRenderer recordMap={recordMap} rootPageId={post.id} />
        </article>
      </Container>
    </div>
  )
}
