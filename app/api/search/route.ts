import { NextResponse } from 'next/server'
import { getBlogPosts } from '@/lib/notion'

export const runtime = 'edge'

export async function GET() {
  const posts = await getBlogPosts()
  const items = posts
    .filter((post) => Boolean(post.slug))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      category: post.category,
      tags: post.tags,
      excerpt: post.excerpt,
    }))

  return NextResponse.json(
    { posts: items },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
      },
    }
  )
}
