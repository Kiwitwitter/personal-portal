import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import type { BlogPost, GalleryImage, NotionPage } from './types'

// Official Notion client for database queries
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

// Unofficial client for rendering full pages with react-notion-x
const notionAPI = new NotionAPI()

// Database IDs from environment
const BLOG_DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID || ''
const GALLERY_DATABASE_ID = process.env.NOTION_GALLERY_DATABASE_ID || ''
const ABOUT_PAGE_ID = process.env.NOTION_ABOUT_PAGE_ID || ''

/**
 * Get all published blog posts from Notion database
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!BLOG_DATABASE_ID) {
    console.warn('NOTION_BLOG_DATABASE_ID is not set')
    return []
  }

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

    return response.results.map((page) => parseNotionPageToBlogPost(page as unknown as NotionPage))
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!BLOG_DATABASE_ID) {
    console.warn('NOTION_BLOG_DATABASE_ID is not set')
    return null
  }

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
}

/**
 * Get the full page content for rendering with react-notion-x
 */
export async function getNotionPageContent(pageId: string) {
  try {
    const recordMap = await notionAPI.getPage(pageId)
    return recordMap
  } catch (error) {
    console.error('Error fetching Notion page content:', error)
    return null
  }
}

/**
 * Get all gallery images from Notion database
 */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!GALLERY_DATABASE_ID) {
    console.warn('NOTION_GALLERY_DATABASE_ID is not set')
    return []
  }

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

    return response.results.map((page) => parseNotionPageToGalleryImage(page as unknown as NotionPage))
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    return []
  }
}

/**
 * Get the About page content
 */
export async function getAboutPageContent() {
  if (!ABOUT_PAGE_ID) {
    console.warn('NOTION_ABOUT_PAGE_ID is not set')
    return null
  }

  return getNotionPageContent(ABOUT_PAGE_ID)
}

/**
 * Get all unique categories from blog posts
 */
export async function getCategories(): Promise<string[]> {
  const posts = await getBlogPosts()
  const categories = new Set(posts.map((post) => post.category).filter(Boolean))
  return Array.from(categories)
}

/**
 * Get all unique tags from blog posts
 */
export async function getTags(): Promise<string[]> {
  const posts = await getBlogPosts()
  const tags = new Set(posts.flatMap((post) => post.tags))
  return Array.from(tags)
}

// Helper functions to parse Notion pages

function parseNotionPageToBlogPost(page: NotionPage): BlogPost {
  const properties = page.properties

  // Support both Chinese "名称" and English "Title" property names
  const titleProperty = properties['名称'] || properties.Title

  return {
    id: page.id,
    slug: getTextProperty(properties.Slug),
    title: getTitleProperty(titleProperty),
    date: getDateProperty(properties.Date),
    category: getSelectProperty(properties.Category),
    tags: getMultiSelectProperty(properties.Tags),
    excerpt: getTextProperty(properties.Excerpt),
    cover: getCoverImage(page),
    published: getCheckboxProperty(properties.Published),
  }
}

function parseNotionPageToGalleryImage(page: NotionPage): GalleryImage {
  const properties = page.properties

  return {
    id: page.id,
    urls: getFilesProperty(properties.Image),
    caption: getTextProperty(properties.Caption),
    date: getDateProperty(properties.Date),
    published: getCheckboxProperty(properties.Published),
  }
}

function getTitleProperty(property: NotionPage['properties'][string]): string {
  if (property?.type === 'title' && property.title) {
    return property.title.map((t) => t.plain_text).join('')
  }
  return ''
}

function getTextProperty(property: NotionPage['properties'][string]): string {
  if (property?.type === 'rich_text' && property.rich_text) {
    return property.rich_text.map((t) => t.plain_text).join('')
  }
  return ''
}

function getDateProperty(property: NotionPage['properties'][string]): string {
  if (property?.type === 'date' && property.date?.start) {
    return property.date.start
  }
  return new Date().toISOString()
}

function getSelectProperty(property: NotionPage['properties'][string]): string {
  if (property?.type === 'select' && property.select?.name) {
    return property.select.name
  }
  return ''
}

function getMultiSelectProperty(property: NotionPage['properties'][string]): string[] {
  if (property?.type === 'multi_select' && property.multi_select) {
    return property.multi_select.map((s) => s.name)
  }
  return []
}

function getCheckboxProperty(property: NotionPage['properties'][string]): boolean {
  if (property?.type === 'checkbox') {
    return property.checkbox ?? false
  }
  return false
}

function getFileProperty(property: NotionPage['properties'][string]): string {
  if (property?.type === 'files' && property.files && property.files.length > 0) {
    const file = property.files[0]
    return file.file?.url || file.external?.url || ''
  }
  return ''
}

function getFilesProperty(property: NotionPage['properties'][string]): string[] {
  if (property?.type === 'files' && property.files) {
    return property.files
      .map((file) => file.file?.url || file.external?.url || '')
      .filter(Boolean)
  }
  return []
}

function getCoverImage(page: NotionPage): string | undefined {
  if (page.cover) {
    return page.cover.file?.url || page.cover.external?.url
  }
  return undefined
}
