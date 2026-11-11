import { cache } from 'react'
import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import { withEdgeCache } from './cache'
import type { BlogPost, GalleryImage, NotionPage } from './types'

// Official Notion client for database & page metadata queries
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Unofficial client for rendering full pages with react-notion-x
const notionAPI = new NotionAPI()

// Database IDs from environment
const BLOG_DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID || ''
const GALLERY_DATABASE_ID = process.env.NOTION_GALLERY_DATABASE_ID || ''

const UUID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i

export function normalizePageId(id: string): string {
  return id.replace(/-/g, '').toLowerCase()
}

export function isNotionUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim())
}

function isExpiringNotionAssetUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.hostname.endsWith('amazonaws.com') &&
      (parsed.searchParams.has('X-Amz-Signature') || parsed.searchParams.has('X-Amz-Algorithm'))
    )
  } catch {
    return false
  }
}

function extractUrlExtension(url: string): string {
  const pathname = url.split('?')[0]
  const match = pathname.match(/\.[a-zA-Z0-9]{2,5}$/)
  return match ? match[0].toLowerCase() : ''
}

function toProxiedAssetUrl(
  url: string,
  kind: 'blog-cover' | 'gallery',
  pageId: string,
  index = 0
): string {
  if (!url || !isExpiringNotionAssetUrl(url)) {
    return url
  }
  const ext = extractUrlExtension(url)
  const params = new URLSearchParams({
    kind,
    id: pageId,
    ...(kind === 'gallery' ? { index: String(index) } : {}),
    ...(ext ? { ext } : {}),
  })
  return `/api/image?${params.toString()}`
}

/**
 * Get all published blog posts from Notion database (deduplicated per-request & Edge-cached)
 */
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  if (!BLOG_DATABASE_ID) {
    console.warn('NOTION_BLOG_DATABASE_ID is not set')
    return []
  }

  return withEdgeCache(
    'notion:blog-posts:v2',
    async () => {
      try {
        const response = await notion.databases.query({
          database_id: BLOG_DATABASE_ID,
          filter: {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          sorts: [
            {
              property: 'Date',
              direction: 'descending',
            },
          ],
        })

        return response.results.map((page) =>
          parseNotionPageToBlogPost(page as unknown as NotionPage)
        )
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        return []
      }
    },
    { freshSeconds: 300, maxStaleSeconds: 2400 }
  )
})

/**
 * Get a single blog post by slug
 */
export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!BLOG_DATABASE_ID) {
    console.warn('NOTION_BLOG_DATABASE_ID is not set')
    return null
  }

  // Fast path: resolve from cached post list
  const allPosts = await getBlogPosts()
  const matched = allPosts.find((p) => p.slug === slug)
  if (matched) {
    return matched
  }

  // Fallback direct query in case a brand-new post was just published
  return withEdgeCache(
    `notion:blog-slug:v2:${slug}`,
    async () => {
      try {
        const response = await notion.databases.query({
          database_id: BLOG_DATABASE_ID,
          filter: {
            and: [
              {
                property: 'Slug',
                rich_text: {
                  equals: slug,
                },
              },
              {
                property: 'Published',
                checkbox: {
                  equals: true,
                },
              },
            ],
          },
        })

        if (response.results.length === 0) {
          return null
        }

        return parseNotionPageToBlogPost(response.results[0] as unknown as NotionPage)
      } catch (error) {
        console.error('Error fetching blog post by slug:', error)
        return null
      }
    },
    { freshSeconds: 180, maxStaleSeconds: 1200 }
  )
})

/**
 * Resolve a blog post by either slug or Notion page UUID (supports internal Notion page links)
 */
export const getBlogPostByIdOrSlug = cache(
  async (
    slugOrId: string
  ): Promise<{ post: BlogPost | null; matchedByUuid: boolean }> => {
    const bySlug = await getBlogPostBySlug(slugOrId)
    if (bySlug) {
      return { post: bySlug, matchedByUuid: false }
    }

    if (isNotionUuid(slugOrId)) {
      const targetId = normalizePageId(slugOrId)
      const allPosts = await getBlogPosts()
      const byId = allPosts.find((p) => normalizePageId(p.id) === targetId) || null
      return { post: byId, matchedByUuid: Boolean(byId) }
    }

    return { post: null, matchedByUuid: false }
  }
)

/**
 * Map normalized Notion page IDs to blog slugs for internal link resolution
 */
export const getBlogSlugMap = cache(async (): Promise<Record<string, string>> => {
  const posts = await getBlogPosts()
  const map: Record<string, string> = {}
  for (const post of posts) {
    if (post.slug) {
      map[normalizePageId(post.id)] = post.slug
    }
  }
  return map
})

/**
 * Get previous (older) and next (newer) published blog posts around a slug
 */
export async function getAdjacentBlogPosts(
  slug: string
): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  const posts = await getBlogPosts()
  const idx = posts.findIndex((p) => p.slug === slug)
  if (idx === -1) {
    return { prev: null, next: null }
  }
  return {
    next: idx > 0 ? posts[idx - 1] : null,
    prev: idx < posts.length - 1 ? posts[idx + 1] : null,
  }
}

/**
 * Get the full page content for rendering with react-notion-x
 */
export const getNotionPageContent = cache(async (pageId: string) => {
  return withEdgeCache(
    `notion:page-recordmap:v2:${normalizePageId(pageId)}`,
    async () => {
      try {
        const recordMap = await notionAPI.getPage(pageId)
        return recordMap
      } catch (error) {
        console.error('Error fetching Notion page content:', error)
        return null
      }
    },
    { freshSeconds: 300, maxStaleSeconds: 2400 }
  )
})

/**
 * Get all gallery images from Notion database
 */
export const getGalleryImages = cache(async (): Promise<GalleryImage[]> => {
  if (!GALLERY_DATABASE_ID) {
    console.warn('NOTION_GALLERY_DATABASE_ID is not set')
    return []
  }

  return withEdgeCache(
    'notion:gallery-images:v2',
    async () => {
      try {
        const response = await notion.databases.query({
          database_id: GALLERY_DATABASE_ID,
          filter: {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          sorts: [
            {
              property: 'Date',
              direction: 'descending',
            },
          ],
        })

        return response.results.map((page) =>
          parseNotionPageToGalleryImage(page as unknown as NotionPage)
        )
      } catch (error) {
        console.error('Error fetching gallery images:', error)
        return []
      }
    },
    { freshSeconds: 300, maxStaleSeconds: 2400 }
  )
})

/**
 * Resolve a fresh underlying URL for a Notion-hosted cover or gallery file (used by /api/image)
 */
export async function resolveNotionAssetUrl(
  kind: 'blog-cover' | 'gallery',
  pageId: string,
  index = 0
): Promise<string | null> {
  if (!isNotionUuid(pageId)) return null

  return withEdgeCache(
    `notion:asset:v1:${kind}:${normalizePageId(pageId)}:${index}`,
    async () => {
      try {
        const page = (await notion.pages.retrieve({
          page_id: pageId,
        })) as unknown as NotionPage

        // Only serve assets from published pages
        if (!getCheckboxProperty(page.properties?.Published)) {
          return null
        }

        if (kind === 'blog-cover') {
          return getRawCoverImage(page) || null
        }

        const urls = getRawFilesProperty(page.properties?.Image)
        return urls[index] || null
      } catch (error) {
        console.error('Error resolving Notion asset URL:', error)
        return null
      }
    },
    // Keep strictly below Notion's 3600s S3 signature expiry
    { freshSeconds: 900, maxStaleSeconds: 1800 }
  )
}

/**
 * Extract unique categories synchronously from an already-fetched post array
 */
export function extractCategories(posts: BlogPost[]): string[] {
  return Array.from(new Set(posts.map((post) => post.category).filter(Boolean)))
}

/**
 * Extract unique tags synchronously from an already-fetched post array
 */
export function extractTags(posts: BlogPost[]): string[] {
  return Array.from(new Set(posts.flatMap((post) => post.tags).filter(Boolean)))
}

// Helper functions to parse Notion pages

function parseNotionPageToBlogPost(page: NotionPage): BlogPost {
  const properties = page.properties

  // Support both Chinese "名称" and English "Title" property names
  const titleProperty = properties['名称'] || properties.Title
  const rawCover = getRawCoverImage(page)

  return {
    id: page.id,
    slug: getTextProperty(properties.Slug),
    title: getTitleProperty(titleProperty),
    date: getDateProperty(properties.Date),
    category: getSelectProperty(properties.Category),
    tags: getMultiSelectProperty(properties.Tags),
    excerpt: getTextProperty(properties.Excerpt),
    cover: rawCover ? toProxiedAssetUrl(rawCover, 'blog-cover', page.id) : undefined,
    published: getCheckboxProperty(properties.Published),
  }
}

function parseNotionPageToGalleryImage(page: NotionPage): GalleryImage {
  const properties = page.properties
  const rawUrls = getRawFilesProperty(properties.Image)

  return {
    id: page.id,
    urls: rawUrls.map((url, idx) => toProxiedAssetUrl(url, 'gallery', page.id, idx)),
    caption: getTextProperty(properties.Caption),
    location: getTextProperty(properties.Location),
    date: getDateProperty(properties.Date),
    published: getCheckboxProperty(properties.Published),
  }
}

function getTitleProperty(property?: NotionPage['properties'][string]): string {
  if (property?.type === 'title' && property.title) {
    return property.title.map((t) => t.plain_text).join('')
  }
  return ''
}

function getTextProperty(property?: NotionPage['properties'][string]): string {
  if (property?.type === 'rich_text' && property.rich_text) {
    return property.rich_text.map((t) => t.plain_text).join('')
  }
  return ''
}

function getDateProperty(property?: NotionPage['properties'][string]): string {
  if (property?.type === 'date' && property.date?.start) {
    return property.date.start
  }
  return new Date().toISOString().slice(0, 10)
}

function getSelectProperty(property?: NotionPage['properties'][string]): string {
  if (property?.type === 'select' && property.select?.name) {
    return property.select.name
  }
  return ''
}

function getMultiSelectProperty(property?: NotionPage['properties'][string]): string[] {
  if (property?.type === 'multi_select' && property.multi_select) {
    return property.multi_select.map((s) => s.name)
  }
  return []
}

function getCheckboxProperty(property?: NotionPage['properties'][string]): boolean {
  if (property?.type === 'checkbox') {
    return property.checkbox ?? false
  }
  return false
}

function getRawFilesProperty(property?: NotionPage['properties'][string]): string[] {
  if (property?.type === 'files' && property.files) {
    return property.files
      .map((file) => file.file?.url || file.external?.url || '')
      .filter(Boolean)
  }
  return []
}

function getRawCoverImage(page: NotionPage): string | undefined {
  if (page.cover) {
    return page.cover.file?.url || page.cover.external?.url
  }
  return undefined
}
