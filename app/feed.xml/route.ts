import { getBlogPosts, getStreamPosts } from '@/lib/notion'

export const runtime = 'edge'

const SITE_URL = 'https://pzhng.com'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

interface FeedEntry {
  title: string
  link: string
  guid: string
  pubDate: Date
  description: string
  categories: string[]
}

export async function GET() {
  const [posts, streamItems] = await Promise.all([getBlogPosts(), getStreamPosts()])

  const blogEntries: FeedEntry[] = posts
    .filter((p) => Boolean(p.slug))
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`
      const parsed = new Date(post.date)
      return {
        title: post.title,
        link: postUrl,
        guid: postUrl,
        pubDate: Number.isNaN(parsed.getTime()) ? new Date() : parsed,
        description: post.excerpt || post.title,
        categories: [post.category, ...post.tags].filter(Boolean),
      }
    })

  const streamEntries: FeedEntry[] = streamItems.slice(0, 30).map((item) => {
    const anchor = `s-${item.id.replace(/-/g, '').slice(0, 8)}`
    const url = `${SITE_URL}/stream#${anchor}`
    const parsed = new Date(item.createdAt)
    const oneLine = item.content.replace(/\s+/g, ' ').trim()
    return {
      title: `Stream: ${oneLine.slice(0, 72)}${oneLine.length > 72 ? '...' : ''}`,
      link: url,
      guid: url,
      pubDate: Number.isNaN(parsed.getTime()) ? new Date() : parsed,
      description: item.content,
      categories: ['Stream', ...item.tags],
    }
  })

  const merged = [...blogEntries, ...streamEntries].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime()
  )

  const itemsXml = merged
    .map((entry) => {
      const categoriesXml = entry.categories
        .map((c) => `<category>${escapeXml(c)}</category>`)
        .join('')

      return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${entry.link}</link>
      <guid isPermaLink="true">${entry.guid}</guid>
      <pubDate>${entry.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(entry.description)}</description>
      ${categoriesXml}
    </item>`
    })
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Peng Zhang | Blog &amp; Stream</title>
    <link>${SITE_URL}</link>
    <description>Articles, short engineering thoughts, and updates from Peng Zhang.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  })
}
