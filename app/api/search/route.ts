import { NextResponse } from 'next/server'
import { withEdgeCache } from '@/lib/cache'
import { getBlogPosts, getNotionPageContent } from '@/lib/notion'
import { extractArticleDetails } from '@/lib/notion-content'

export const runtime = 'edge'

interface SearchIndexEntry {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  bodyText: string
}

export async function GET() {
  const items = await withEdgeCache<SearchIndexEntry[]>(
    'search:fulltext-index:v1',
    async () => {
      const posts = (await getBlogPosts()).filter((post) => Boolean(post.slug))

      // Enrich up to the 25 most recent posts with full-text body content for grep search
      const enriched = await Promise.all(
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

      return enriched
    },
    { freshSeconds: 600, maxStaleSeconds: 3600 }
  )

  return NextResponse.json(
    { posts: items },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
      },
    }
  )
}
