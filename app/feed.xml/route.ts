import { getBlogPosts } from '@/lib/notion'

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

export async function GET() {
  const posts = await getBlogPosts()
  const validPosts = posts.filter((p) => Boolean(p.slug))

  const itemsXml = validPosts
    .map((post) => {
      const postUrl = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`
      const pubDate = new Date(post.date)
      const pubDateStr = Number.isNaN(pubDate.getTime())
        ? new Date().toUTCString()
        : pubDate.toUTCString()
      const categoriesXml = [post.category, ...post.tags]
        .filter(Boolean)
        .map((c) => `<category>${escapeXml(c)}</category>`)
        .join('')

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDateStr}</pubDate>
      <description>${escapeXml(post.excerpt || post.title)}</description>
      ${categoriesXml}
    </item>`
    })
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Peng Zhang | Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Thoughts on software engineering, distributed systems, and life.</description>
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
