import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { NotionRenderer } from '@/components/notion/NotionRenderer'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { ViewCounter } from '@/components/blog/ViewCounter'
import { PostSummarizer } from '@/components/blog/PostSummarizer'
import { TerminalComments } from '@/components/blog/TerminalComments'
import { LinkedText } from '@/components/ui/LinkedText'
import { LikeButton } from '@/components/ui/LikeButton'
import {
  getBlogPostByIdOrSlug,
  getNotionPageContent,
  getBlogSlugMap,
  getAdjacentBlogPosts,
} from '@/lib/notion'
import { extractArticleDetails } from '@/lib/notion-content'
import { formatDate } from '@/lib/utils'

export const runtime = 'edge'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const { post } = await getBlogPostByIdOrSlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const canonicalSlug = post.slug || slug
  const description = post.excerpt || `Read ${post.title} on Peng Zhang's blog.`

  return {
    title: `${post.title} | Peng Zhang`,
    description,
    alternates: {
      canonical: `/blog/${canonicalSlug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: ['Peng Zhang'],
      tags: post.tags,
      url: `https://pzhng.com/blog/${canonicalSlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const { post, matchedByUuid } = await getBlogPostByIdOrSlug(slug)

  if (!post) {
    notFound()
  }

  // Canonicalize internal Notion UUID links to clean slug URLs
  if (matchedByUuid && post.slug && post.slug !== slug) {
    redirect(`/blog/${post.slug}`)
  }

  const [recordMap, slugMap, adjacent] = await Promise.all([
    getNotionPageContent(post.id),
    getBlogSlugMap(),
    getAdjacentBlogPosts(post.slug),
  ])

  if (!recordMap) {
    notFound()
  }

  const { toc, readingMinutes, plainTextParagraphs } = extractArticleDetails(
    recordMap,
    post.id,
    post.title
  )
  const hasToc = toc.length >= 2

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || plainTextParagraphs.slice(0, 2).join(' '),
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Peng Zhang',
      url: 'https://pzhng.com',
    },
    keywords: post.tags.join(', '),
    url: `https://pzhng.com/blog/${post.slug}`,
  }

  return (
    <div className="py-16">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className={hasToc ? 'xl:max-w-6xl' : undefined}>
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono text-sm group"
        >
          <span className="text-green-500 group-hover:underline">$</span>
          <span className="group-hover:underline">cd ..</span>
        </Link>

        <div
          className={
            hasToc ? 'xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-12 items-start' : undefined
          }
        >
          <div className="min-w-0">
            {/* Post Header */}
            <header className="mb-8 border-b border-border pb-8">
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
                        <span className="text-blue-300">date:</span>{' '}
                        <span className="text-green-400">&quot;{formatDate(post.date)}&quot;</span>,
                      </div>
                      <div>
                        <span className="text-blue-300">readTime:</span>{' '}
                        <span className="text-green-400">&quot;{readingMinutes} min read&quot;</span>,
                      </div>
                      <ViewCounter slug={post.slug} />
                      {post.category && (
                        <div>
                          <span className="text-blue-300">category:</span>{' '}
                          <span className="text-green-400">&quot;{post.category}&quot;</span>,
                        </div>
                      )}
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
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
              {post.excerpt && (
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  <LinkedText text={post.excerpt} />
                </p>
              )}
            </header>

            {/* AI Article Summarizer */}
            <PostSummarizer slug={post.slug} />

            {/* Collapsible inline TOC for mobile / tablet */}
            {hasToc && (
              <div className="xl:hidden">
                <TableOfContents items={toc} variant="inline" />
              </div>
            )}

            {/* Post Content */}
            <article className="prose prose-neutral dark:prose-invert max-w-none">
              <NotionRenderer
                recordMap={recordMap}
                rootPageId={post.id}
                slugMap={slugMap}
              />

              {/* Crawlable semantic fallback when JS is disabled */}
              {plainTextParagraphs.length > 0 && (
                <noscript>
                  <div className="space-y-4 text-foreground">
                    {plainTextParagraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </noscript>
              )}
            </article>

            {/* Like Button & Prev/Next Navigation */}
            <div className="mt-12 pt-8 border-t border-border space-y-8">
              <div className="flex items-center justify-between">
                <LikeButton type="blog" id={post.slug} />
                <Link
                  href="/blog"
                  className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  $ ls ./posts
                </Link>
              </div>

              {(adjacent.prev || adjacent.next) && (
                <nav
                  aria-label="Adjacent posts"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono"
                >
                  {adjacent.prev ? (
                    <Link
                      href={`/blog/${adjacent.prev.slug}`}
                      className="group p-4 rounded-lg border border-border bg-card/40 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                        <ArrowLeft className="w-3.5 h-3.5 text-primary group-hover:-translate-x-0.5 transition-transform" />
                        <span>prev_post</span>
                      </div>
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {adjacent.prev.title}
                      </div>
                    </Link>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {adjacent.next ? (
                    <Link
                      href={`/blog/${adjacent.next.slug}`}
                      className="group p-4 rounded-lg border border-border bg-card/40 hover:border-primary/40 transition-colors sm:text-right"
                    >
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted-foreground mb-1.5">
                        <span>next_post</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {adjacent.next.title}
                      </div>
                    </Link>
                  ) : null}
                </nav>
              )}
            </div>

            {/* Native Terminal Comments */}
            <TerminalComments slug={post.slug} />
          </div>

          {/* Sticky Sidebar TOC for wide desktop viewports */}
          {hasToc && (
            <aside className="hidden xl:block">
              <TableOfContents items={toc} variant="sidebar" />
            </aside>
          )}
        </div>
      </Container>
    </div>
  )
}
