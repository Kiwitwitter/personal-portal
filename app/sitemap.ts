import type { MetadataRoute } from 'next'
import { getBlogPosts } from '@/lib/notion'

export const runtime = 'edge'

const BASE_URL = 'https://pzhng.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/apps/sales-tax-assistant`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const blogRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => Boolean(post.slug))
    .map((post) => {
      const parsedDate = new Date(post.date)
      return {
        url: `${BASE_URL}/blog/${encodeURIComponent(post.slug)}`,
        lastModified: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    })

  return [...staticRoutes, ...blogRoutes]
}
