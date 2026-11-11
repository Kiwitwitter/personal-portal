import { cache } from 'react'
import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import { invalidateEdgeCache, withEdgeCache } from './cache'
import { getStreamShortId } from './utils'
import type { BlogPost, GalleryImage, NotionPage, StreamItem } from './types'

// Official Notion client for database & page metadata queries
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Unofficial client for rendering full pages with react-notion-x
const notionAPI = new NotionAPI()

// Database IDs from environment
const BLOG_DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID || ''
const GALLERY_DATABASE_ID = process.env.NOTION_GALLERY_DATABASE_ID || ''
const STREAM_DATABASE_ID =
  process.env.NOTION_STREAM_DATABASE_ID || '415460b6-4206-8104-a240-f43102d153b7'

export const STREAM_CACHE_KEY = 'notion:stream:v1'

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
  kind: 'blog-cover' | 'gallery' | 'stream',
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
    ...(kind === 'gallery' || kind === 'stream' ? { index: String(index) } : {}),
    ...(ext ? { ext } : {}),
  })
  return `/api/image?${params.toString()}`
}

/**
 * Extract inline #hashtags while ignoring URLs and code spans/blocks
 */
export function extractHashtags(text: string): string[] {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')

  const tags = new Set<string>()
  const regex = /(?:^|\s)#([a-zA-Z0-9_\u4e00-\u9fff-]{1,32})/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(cleaned)) !== null) {
    const tag = match[1].trim().toLowerCase()
    if (tag) tags.add(tag)
  }
  return Array.from(tags)
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
    'notion:gallery-images:v3',
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
 * Get all published short stream posts from Notion Stream database
 */
export const getStreamPosts = cache(async (): Promise<StreamItem[]> => {
  if (!STREAM_DATABASE_ID) {
    console.warn('NOTION_STREAM_DATABASE_ID is not set')
    return []
  }

  return withEdgeCache(
    STREAM_CACHE_KEY,
    async () => {
      try {
        const response = await notion.databases.query({
          database_id: STREAM_DATABASE_ID,
          filter: {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          sorts: [
            {
              timestamp: 'created_time',
              direction: 'descending',
            },
          ],
        })

        const items = response.results
          .map((page) => parseNotionPageToStreamItem(page as unknown as NotionPage))
          .filter((item) => Boolean(item.content.trim()) || item.images.length > 0)

        // Pin flagged items to the top while preserving created_time desc order
        return items.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      } catch (error) {
        console.error('Error fetching stream posts:', error)
        return []
      }
    },
    { freshSeconds: 120, maxStaleSeconds: 1200 }
  )
})

/**
 * Resolve a single Stream item by its 8-char tail short ID or full Notion UUID
 */
export const getStreamPostById = cache(async (idOrShort: string): Promise<StreamItem | null> => {
  const cleaned = idOrShort.replace(/^s-/, '').replace(/-/g, '').trim().toLowerCase()
  if (!cleaned) return null

  const all = await getStreamPosts()
  const matched = all.find(
    (item) =>
      normalizePageId(item.id) === cleaned || getStreamShortId(item.id) === cleaned
  )
  if (matched) return matched

  if (isNotionUuid(idOrShort)) {
    try {
      const page = (await notion.pages.retrieve({
        page_id: idOrShort,
      })) as unknown as NotionPage
      if (!getCheckboxProperty(page.properties?.Published)) return null
      return parseNotionPageToStreamItem(page)
    } catch {
      return null
    }
  }

  return null
})

/**
 * Create a new Stream post in Notion and immediately invalidate Edge caches
 */
export async function createStreamPost(input: {
  text: string
  pinned?: boolean
  imageUrls?: string[]
}): Promise<StreamItem> {
  if (!STREAM_DATABASE_ID) {
    throw new Error('NOTION_STREAM_DATABASE_ID is not configured')
  }

  const chunks: Array<{ type: 'text'; text: { content: string } }> = []
  for (let i = 0; i < input.text.length; i += 1800) {
    chunks.push({
      type: 'text',
      text: { content: input.text.slice(i, i + 1800) },
    })
  }

  const externalFiles = (input.imageUrls || [])
    .filter((url) => /^https?:\/\//i.test(url))
    .slice(0, 4)
    .map((url, idx) => ({
      name: `media-${idx + 1}`,
      type: 'external' as const,
      external: { url },
    }))

  const created = await notion.pages.create({
    parent: { database_id: STREAM_DATABASE_ID },
    properties: {
      Content: {
        title: chunks,
      },
      Pinned: {
        checkbox: Boolean(input.pinned),
      },
      Published: {
        checkbox: true,
      },
      ...(externalFiles.length > 0
        ? {
            Images: {
              files: externalFiles,
            },
          }
        : {}),
    },
  })

  await Promise.all([
    invalidateEdgeCache(STREAM_CACHE_KEY),
    invalidateEdgeCache('search:fulltext-index:v2'),
  ])

  return parseNotionPageToStreamItem(created as unknown as NotionPage)
}

/**
 * Resolve a fresh underlying URL for a Notion-hosted cover, gallery, or stream file (used by /api/image & /api/exif)
 */
export async function resolveNotionAssetUrl(
  kind: 'blog-cover' | 'gallery' | 'stream',
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

        if (kind === 'stream') {
          const urls = getRawFilesProperty(
            page.properties?.Images || page.properties?.Image
          )
          if (urls[index]) return urls[index]
          if (index === 0) return getRawCoverImage(page) || null
          return null
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
  const manualExif =
    getTextProperty(properties.EXIF) ||
    getTextProperty(properties.Camera) ||
    getTextProperty(properties.Specs)

  return {
    id: page.id,
    urls: rawUrls.map((url, idx) => toProxiedAssetUrl(url, 'gallery', page.id, idx)),
    caption: getTextProperty(properties.Caption),
    location: getTextProperty(properties.Location),
    date: getDateProperty(properties.Date),
    exif: manualExif || undefined,
    published: getCheckboxProperty(properties.Published),
  }
}

function parseNotionPageToStreamItem(page: NotionPage): StreamItem {
  const properties = page.properties
  const titleProperty = properties.Content || properties.Title || properties['名称']
  const mainContent = getTitleProperty(titleProperty)
  const extraBody = getTextProperty(properties.Body) || getTextProperty(properties.Text)
  const content = [mainContent, extraBody].filter(Boolean).join('\n').trim()

  const rawFiles = getRawFilesProperty(properties.Images || properties.Image)
  const rawCover = getRawCoverImage(page)
  const allRawMedia = rawFiles.length > 0 ? rawFiles : rawCover ? [rawCover] : []

  const explicitTags = getMultiSelectProperty(properties.Tags).map((t) => t.toLowerCase())
  const inlineTags = extractHashtags(content)
  const tags = Array.from(new Set([...explicitTags, ...inlineTags]))

  const createdAt =
    (properties.Date?.type === 'date' && properties.Date.date?.start) ||
    page.created_time ||
    new Date().toISOString()

  return {
    id: page.id,
    content,
    createdAt,
    tags,
    images: allRawMedia.map((url, idx) => toProxiedAssetUrl(url, 'stream', page.id, idx)),
    pinned: getCheckboxProperty(properties.Pinned),
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
