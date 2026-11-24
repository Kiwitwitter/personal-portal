import { NextResponse } from 'next/server'
import { withEdgeCache } from '@/lib/cache'
import { getBlogPosts, getNotionPageContent, getStreamPosts } from '@/lib/notion'
import { extractArticleDetails } from '@/lib/notion-content'

export const runtime = 'edge'

interface SearchPostEntry {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  bodyText: string
}

interface SearchStreamEntry {
  id: string
  content: string
  createdAt: string
  tags: string[]
}

interface SearchIndexPayload {
  posts: SearchPostEntry[]
  streams: SearchStreamEntry[]
}

export async function GET() {
  const payload = await withEdgeCache<SearchIndexPayload>(
    'search:fulltext-index:v2',
    async () => {
      const [allPosts, allStreams] = await Promise.all([getBlogPosts(), getStreamPosts()])
      const posts = allPosts.filter((post) => Boolean(post.slug))

      // Enrich up to the 25 most recent posts with full-text body content for grep search
      const enrichedPosts = await Promise.all(
        posts.map(async (post, index) => {
          let bodyText = ''
          if (index < 25) {
            try {
              const recordMap = await getNotionPageContent(post.id)
              if (recordMap) {
                const { plainTextParagraphs } = extractArticleDetails(
                  recordMap,
                  post.id,
                  post.title
                )
                bodyText = plainTextParagraphs.join(' ').replace(/\s+/g, ' ').slice(0, 4000)
              }
            } catch {
              bodyText = ''
            }
          }

          return {
            slug: post.slug,
            title: post.title,
            date: post.date,
            category: post.category,
            tags: post.tags,
            excerpt: post.excerpt,
            bodyText,
          }
        })
      )

      const streams: SearchStreamEntry[] = allStreams.slice(0, 40).map((item) => ({
        id: item.id,
        content: item.content,
        createdAt: item.createdAt,
        tags: item.tags,
      }))

      return { posts: enrichedPosts, streams }
    },
    { freshSeconds: 300, maxStaleSeconds: 2400 }
  )

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=1200',
    },
  })
}
