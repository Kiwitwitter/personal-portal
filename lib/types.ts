export interface BlogPost {
  id: string
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  cover?: string
  published: boolean
}

export interface GalleryImage {
  id: string
  urls: string[]
  caption: string
  location: string
  date: string
  published: boolean
}

export interface NotionPageProperty {
  type: string
  title?: Array<{ plain_text: string }>
  rich_text?: Array<{ plain_text: string }>
  date?: { start: string }
  select?: { name: string }
  multi_select?: Array<{ name: string }>
  checkbox?: boolean
  files?: Array<{
    file?: { url: string }
    external?: { url: string }
  }>
}

export interface NotionPage {
  id: string
  properties: Record<string, NotionPageProperty>
  cover?: {
    file?: { url: string }
    external?: { url: string }
  }
}
