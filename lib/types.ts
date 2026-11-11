export type LikeableType = 'blog' | 'gallery'

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
  exif?: string
  published: boolean
}

export interface GeoLocationGroup {
  location: string
  lat: number
  lng: number
  imageIds: string[]
}

export interface ExifMetadata {
  camera?: string
  lens?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: string
  summary?: string
}

export interface TocItem {
  id: string
  text: string
  level: 1 | 2 | 3
}

export interface BlogComment {
  id: string
  author: string
  message: string
  createdAt: string
  colo?: string
}

export interface GuestbookEntry {
  id: string
  name: string
  message: string
  createdAt: string
  colo?: string
}

export interface GitHubContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface GitHubCommitEvent {
  id: string
  repo: string
  message: string
  date: string
  url: string
}

export interface GitHubStatusData {
  totalLastYear: number
  days: GitHubContributionDay[]
  recentEvents: GitHubCommitEvent[]
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
