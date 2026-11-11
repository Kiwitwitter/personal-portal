import type { ExtendedRecordMap } from 'notion-types'
import type { TocItem } from './types'

interface RawNotionBlock {
  id?: string
  type?: string
  content?: string[]
  properties?: {
    title?: Array<[string, ...unknown[]]>
  }
}

export interface ExtractedArticleDetails {
  toc: TocItem[]
  readingMinutes: number
  plainTextParagraphs: string[]
}

function unwrapBlock(entry: unknown): RawNotionBlock | null {
  if (!entry || typeof entry !== 'object') return null
  const outer = entry as { value?: unknown }
  if (!outer.value || typeof outer.value !== 'object') return null

  // Notion's API sometimes double-wraps `{ value: { value: Block } }`
  const inner = outer.value as { value?: unknown; id?: string; type?: string }
  if (inner.id && inner.type) {
    return inner as RawNotionBlock
  }
  if (inner.value && typeof inner.value === 'object') {
    const deep = inner.value as RawNotionBlock
    if (deep.id && deep.type) return deep
  }
  return null
}

function getRichTextPlain(titleProp?: Array<[string, ...unknown[]]>): string {
  if (!Array.isArray(titleProp)) return ''
  return titleProp
    .map((segment) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''))
    .join('')
    .trim()
}

function estimateReadingMinutes(text: string): number {
  if (!text.trim()) return 1
  // Count CJK characters (~400 chars/min) + non-CJK words (~220 words/min)
  const cjkMatches = text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g)
  const cjkCount = cjkMatches ? cjkMatches.length : 0
  const nonCjkText = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, ' ')
  const englishWords = nonCjkText.trim().split(/\s+/).filter(Boolean).length

  const minutes = cjkCount / 400 + englishWords / 220
  return Math.max(1, Math.ceil(minutes))
}

/**
 * Safely walk a Notion recordMap to extract a crash-free Table of Contents,
 * reading-time estimate, and plain-text paragraphs for SEO / JSON-LD.
 */
export function extractArticleDetails(
  recordMap: ExtendedRecordMap,
  rootPageId: string,
  postTitle?: string
): ExtractedArticleDetails {
  const blocks = (recordMap?.block || {}) as Record<string, unknown>
  const normalizedRoot = rootPageId.replace(/-/g, '').toLowerCase()

  // Locate root page block
  let rootBlock: RawNotionBlock | null = null
  for (const [key, entry] of Object.entries(blocks)) {
    const unwrapped = unwrapBlock(entry)
    if (!unwrapped?.id) continue
    if (
      key.replace(/-/g, '').toLowerCase() === normalizedRoot ||
      unwrapped.id.replace(/-/g, '').toLowerCase() === normalizedRoot
    ) {
      rootBlock = unwrapped
      break
    }
  }

  // Fallback to first 'page' block if root ID format differs
  if (!rootBlock) {
    for (const entry of Object.values(blocks)) {
      const unwrapped = unwrapBlock(entry)
      if (unwrapped?.type === 'page') {
        rootBlock = unwrapped
        break
      }
    }
  }

  const blockLookup = new Map<string, RawNotionBlock>()
  for (const [key, entry] of Object.entries(blocks)) {
    const unwrapped = unwrapBlock(entry)
    if (unwrapped?.id) {
      blockLookup.set(key, unwrapped)
      blockLookup.set(unwrapped.id, unwrapped)
      blockLookup.set(unwrapped.id.replace(/-/g, ''), unwrapped)
    }
  }

  const toc: TocItem[] = []
  const plainTextParagraphs: string[] = []
  const visited = new Set<string>()
  let isFirstTopLevelBlock = true

  function walk(blockIds: string[] | undefined, isTopLevel: boolean) {
    if (!Array.isArray(blockIds)) return

    for (const id of blockIds) {
      const normalized = id.replace(/-/g, '')
      if (visited.has(normalized)) continue
      visited.add(normalized)

      const block = blockLookup.get(id) || blockLookup.get(normalized)
      if (!block || !block.id || !block.type) continue

      // Never descend into child pages (separate Notion articles)
      if (block.type === 'page' || block.type === 'collection_view_page') {
        isFirstTopLevelBlock = false
        continue
      }

      const text = getRichTextPlain(block.properties?.title)
      const cleanId = block.id.replace(/-/g, '')

      // globals.css hides `.notion-page-content > .notion-h1:first-child` when it duplicates the title
      const isHiddenDuplicateTitle =
        isTopLevel &&
        isFirstTopLevelBlock &&
        block.type === 'header' &&
        (!postTitle || text.toLowerCase() === postTitle.trim().toLowerCase())

      isFirstTopLevelBlock = false

      if (text && !isHiddenDuplicateTitle) {
        if (block.type === 'header') {
          toc.push({ id: cleanId, text, level: 1 })
        } else if (block.type === 'sub_header') {
          toc.push({ id: cleanId, text, level: 2 })
        } else if (block.type === 'sub_sub_header') {
          toc.push({ id: cleanId, text, level: 3 })
        }

        if (
          [
            'text',
            'header',
            'sub_header',
            'sub_sub_header',
            'bulleted_list',
            'numbered_list',
            'quote',
            'callout',
            'code',
            'to_do',
            'toggle',
          ].includes(block.type)
        ) {
          plainTextParagraphs.push(text)
        }
      }

      if (block.content && block.content.length > 0) {
        walk(block.content, false)
      }
    }
  }

  walk(rootBlock?.content, true)

  // Normalize TOC levels so if an article only uses H2 + H3, indentation starts flush left
  if (toc.length > 0) {
    const minLevel = Math.min(...toc.map((item) => item.level))
    if (minLevel > 1) {
      const shift = minLevel - 1
      for (const item of toc) {
        item.level = Math.max(1, item.level - shift) as 1 | 2 | 3
      }
    }
  }

  const fullText = plainTextParagraphs.join('\n')
  return {
    toc,
    readingMinutes: estimateReadingMinutes(fullText),
    plainTextParagraphs,
  }
}
