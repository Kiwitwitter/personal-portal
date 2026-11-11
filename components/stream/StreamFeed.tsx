'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/plugins/counter.css'
import Video from 'yet-another-react-lightbox/plugins/video'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import {
  Pin,
  Link2,
  Check,
  Play,
  Aperture,
  Send,
  KeyRound,
  Plus,
  X,
} from 'lucide-react'
import { LikeButton } from '@/components/ui/LikeButton'
import {
  cn,
  formatExactTimestamp,
  formatRelativeTime,
  formatShortDate,
  getStreamAnchorId,
  getStreamShortId,
} from '@/lib/utils'
import type { ExifMetadata, StreamItem } from '@/lib/types'

interface StreamFeedProps {
  initialItems: StreamItem[]
  singleView?: boolean
}

const STREAM_SECRET_STORAGE_KEY = 'pzhng_stream_secret'
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov']
const streamExifCache = new Map<string, string | null>()

function extractMediaExt(url: string): string {
  const [pathname, query = ''] = url.split('?')
  const params = new URLSearchParams(query)
  const extParam = params.get('ext')?.toLowerCase()
  if (extParam) return extParam
  const lowerPath = pathname.toLowerCase()
  return VIDEO_EXTENSIONS.find((ext) => lowerPath.endsWith(ext)) || ''
}

function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSIONS.includes(extractMediaExt(url))
}

function getVideoMime(url: string): string {
  const ext = extractMediaExt(url)
  if (ext === '.webm') return 'video/webm'
  if (ext === '.ogg') return 'video/ogg'
  return 'video/mp4'
}

function renderInlineTokens(
  text: string,
  onSelectTag: (tag: string) => void,
  keyPrefix: string
): React.ReactNode[] {
  // Split inline `code`, markdown [label](url), raw https:// URLs, and #hashtags
  const tokenRegex =
    /(`[^`\n]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<>()]+|(?<=^|\s)#[a-zA-Z0-9_\u4e00-\u9fff-]{1,32})/g
  const nodes: React.ReactNode[] = []
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(text.slice(lastIdx, match.index))
    }

    const token = match[0]
    const key = `${keyPrefix}-${match.index}`

    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[0.86em] text-primary"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('[')) {
      const mdMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/)
      if (mdMatch) {
        nodes.push(
          <a
            key={key}
            href={mdMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:opacity-80 break-all"
          >
            {mdMatch[1]}
          </a>
        )
      } else {
        nodes.push(token)
      }
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      const cleanedUrl = token.replace(/[.,;:!?]+$/, '')
      const trailing = token.slice(cleanedUrl.length)
      nodes.push(
        <a
          key={key}
          href={cleanedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:opacity-80 break-all font-mono text-[0.9em]"
        >
          {cleanedUrl.replace(/^https?:\/\//, '')}
        </a>
      )
      if (trailing) nodes.push(trailing)
    } else if (token.startsWith('#')) {
      const tagName = token.slice(1).toLowerCase()
      nodes.push(
        <button
          key={key}
          type="button"
          onClick={() => onSelectTag(tagName)}
          className="font-mono text-[0.9em] text-primary/90 hover:text-primary hover:underline transition-colors"
        >
          {token}
        </button>
      )
    } else {
      nodes.push(token)
    }

    lastIdx = match.index + token.length
  }

  if (lastIdx < text.length) {
    nodes.push(text.slice(lastIdx))
  }

  return nodes
}

function StreamContent({
  content,
  onSelectTag,
}: {
  content: string
  onSelectTag: (tag: string) => void
}) {
  // Split fenced code blocks ```lang\n...\n``` from normal prose
  const blocks = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-3 text-[15px] sm:text-base leading-relaxed text-foreground/95">
      {blocks.map((part, idx) => {
        if (!part) return null
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3)
          const firstNewline = inner.indexOf('\n')
          const lang =
            firstNewline !== -1 ? inner.slice(0, firstNewline).trim() : ''
          const codeBody =
            firstNewline !== -1 ? inner.slice(firstNewline + 1) : inner

          return (
            <div
              key={idx}
              className="rounded-lg border border-border bg-muted/60 overflow-hidden font-mono text-xs sm:text-sm"
            >
              {lang && (
                <div className="px-3 py-1 border-b border-border/70 bg-muted text-[11px] text-muted-foreground">
                  {lang}
                </div>
              )}
              <pre className="p-3 overflow-x-auto text-foreground/90">
                <code>{codeBody.replace(/\n$/, '')}</code>
              </pre>
            </div>
          )
        }

        const trimmed = part.replace(/^\n+|\n+$/g, '')
        if (!trimmed) return null

        return (
          <p key={idx} className="whitespace-pre-wrap break-words">
            {renderInlineTokens(trimmed, onSelectTag, `b${idx}`)}
          </p>
        )
      })}
    </div>
  )
}

export function StreamFeed({ initialItems, singleView = false }: StreamFeedProps) {
  const [items, setItems] = useState<StreamItem[]>(initialItems)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState<number | null>(null)

  // Lightbox state
  const [lightboxItem, setLightboxItem] = useState<StreamItem | null>(null)
  const [slideIndex, setSlideIndex] = useState(0)
  const [exifSummary, setExifSummary] = useState<string | null>(null)

  // Quick owner composer state
  const [composerOpen, setComposerOpen] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [secretToken, setSecretToken] = useState('')
  const [showSecretInput, setShowSecretInput] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  // Client-only relative clock to avoid SSR hydration mismatch
  useEffect(() => {
    setNowMs(Date.now())
    const interval = setInterval(() => setNowMs(Date.now()), 60_000)

    try {
      const savedSecret = localStorage.getItem(STREAM_SECRET_STORAGE_KEY) || ''
      if (savedSecret) {
        setSecretToken(savedSecret)
      } else {
        setShowSecretInput(true)
      }
    } catch {
      setShowSecretInput(true)
    }

    // Smooth scroll if hash anchor is present
    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1))
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return () => clearInterval(interval)
  }, [])

  // Fetch EXIF when Lightbox opens on a Stream image
  useEffect(() => {
    if (!lightboxItem) {
      setExifSummary(null)
      return
    }
    const activeUrl = lightboxItem.images[slideIndex] || ''
    if (!activeUrl || isVideoUrl(activeUrl)) {
      setExifSummary(null)
      return
    }

    const cacheKey = `${lightboxItem.id}:${slideIndex}`
    if (streamExifCache.has(cacheKey)) {
      setExifSummary(streamExifCache.get(cacheKey) || null)
      return
    }

    let cancelled = false
    setExifSummary(null)

    fetch(
      `/api/exif?kind=stream&id=${encodeURIComponent(lightboxItem.id)}&index=${slideIndex}`
    )
      .then((res) => res.json())
      .then((data: { exif?: ExifMetadata | null }) => {
        const summary = data.exif?.summary || null
        streamExifCache.set(cacheKey, summary)
        if (!cancelled) setExifSummary(summary)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [lightboxItem, slideIndex])

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) {
      for (const tag of item.tags) {
        map.set(tag, (map.get(tag) || 0) + 1)
      }
    }
    return Array.from(map.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  }, [items])

  const filteredItems = useMemo(() => {
    if (!selectedTag) return items
    return items.filter((item) => item.tags.includes(selectedTag))
  }, [items, selectedTag])

  const handleToggleTag = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag))
  }

  const handleCopyAnchor = async (item: StreamItem) => {
    const shortId = getStreamShortId(item.id)
    const url = `${window.location.origin}/stream/${shortId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId((cur) => (cur === item.id ? null : cur)), 1800)
    } catch {
      // Ignore clipboard failures
    }
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (publishing) return

    const trimmedText = draftText.trim()
    const trimmedSecret = secretToken.trim()

    if (!trimmedSecret) {
      setShowSecretInput(true)
      setPublishError('Enter STREAM_SECRET first.')
      return
    }
    if (!trimmedText) {
      setPublishError('Write something first.')
      return
    }

    setPublishing(true)
    setPublishError(null)

    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${trimmedSecret}`,
        },
        body: JSON.stringify({ text: trimmedText }),
      })
      const data = (await res.json()) as { item?: StreamItem; error?: string }

      if (!res.ok || !data.item) {
        if (res.status === 401) {
          setShowSecretInput(true)
        }
        setPublishError(data.error || 'Failed to publish.')
        return
      }

      try {
        localStorage.setItem(STREAM_SECRET_STORAGE_KEY, trimmedSecret)
      } catch {
        // Ignore storage errors
      }

      setItems((prev) => {
        const next = [data.item!, ...prev]
        return next.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      })
      setDraftText('')
      setShowSecretInput(false)
      setComposerOpen(false)
    } catch {
      setPublishError('Network error while publishing.')
    } finally {
      setPublishing(false)
    }
  }

  const getSlides = (post: StreamItem) =>
    post.images.map((url) =>
      isVideoUrl(url)
        ? {
            type: 'video' as const,
            sources: [{ src: url, type: getVideoMime(url) }],
          }
        : { src: url }
    )

  return (
    <div className="max-w-3xl">
      {/* Toolbar: Tag Filter + Quick Post Trigger */}
      {!singleView && (
        <div className="flex items-center justify-between gap-3 flex-wrap mb-8">
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            {tagCounts.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    'px-2.5 py-1 rounded border transition-colors',
                    selectedTag === null
                      ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  all ({items.length})
                </button>
                {tagCounts.map(({ tag, count }) => {
                  const active = selectedTag === tag
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={cn(
                        'px-2.5 py-1 rounded border transition-colors',
                        active
                          ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      #{tag}{' '}
                      <span className="text-muted-foreground/60">({count})</span>
                    </button>
                  )
                })}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setComposerOpen((prev) => !prev)
              setPublishError(null)
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-card hover:border-primary/40 hover:text-primary text-xs font-mono text-muted-foreground transition-colors"
          >
            {composerOpen ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>close</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>post</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Collapsible Quick Composer (Owner Mode) */}
      {composerOpen && (
        <form
          onSubmit={handlePublish}
          className="mb-10 rounded-lg border border-primary/30 bg-card p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between mb-3 font-mono text-xs text-muted-foreground">
            <span>
              <span className="text-green-500">$</span> echo &quot;...&quot; &gt;&gt;
              ./stream.log
            </span>
            <button
              type="button"
              onClick={() => setShowSecretInput((prev) => !prev)}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <KeyRound className="w-3 h-3" />
              <span>{secretToken ? 'token saved' : 'set token'}</span>
            </button>
          </div>

          {showSecretInput && (
            <div className="mb-3">
              <input
                type="password"
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
                placeholder="STREAM_SECRET (saved locally in this browser)"
                className="w-full px-3 py-1.5 rounded border border-border bg-background font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              />
            </div>
          )}

          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What's on your mind? Supports `code`, ```blocks```, links, and #hashtags..."
            className="w-full px-3 py-2 rounded border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-y"
          />

          <div className="flex items-center justify-between gap-3 mt-3 font-mono text-xs">
            <div className="text-muted-foreground">
              {publishError ? (
                <span className="text-red-400">{publishError}</span>
              ) : (
                <span>{draftText.length}/2000</span>
              )}
            </div>
            <button
              type="submit"
              disabled={publishing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishing ? 'posting...' : 'publish'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Timeline Feed */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg bg-card/40 font-mono text-sm text-muted-foreground">
          No stream entries found{selectedTag ? ` for #${selectedTag}` : ''}.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l border-border space-y-6">
          {filteredItems.map((item) => {
            const shortId = getStreamShortId(item.id)
            const anchorId = getStreamAnchorId(item.id)
            const timeLabel = nowMs
              ? formatRelativeTime(item.createdAt, nowMs)
              : formatShortDate(item.createdAt)
            const exactTitle = formatExactTimestamp(item.createdAt)
            const isCopied = copiedId === item.id

            return (
              <article
                key={item.id}
                id={anchorId}
                className="relative group rounded-lg border border-border bg-card/70 hover:border-primary/35 transition-colors p-5 scroll-mt-24"
              >
                {/* Timeline Node Dot */}
                <span
                  className={cn(
                    'absolute -left-[29px] sm:-left-[37px] top-6 w-2.5 h-2.5 rounded-full ring-4 ring-background transition-colors',
                    item.pinned
                      ? 'bg-amber-400'
                      : 'bg-muted-foreground/50 group-hover:bg-primary'
                  )}
                />

                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 mb-3 font-mono text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">@pzhng</span>
                    <span className="text-muted-foreground/50">·</span>
                    <Link
                      href={`/stream/${shortId}`}
                      title={exactTitle}
                      className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                    >
                      <time dateTime={item.createdAt}>{timeLabel}</time>
                    </Link>
                  </div>

                  {item.pinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px]">
                      <Pin className="w-3 h-3" />
                      <span>PINNED</span>
                    </span>
                  )}
                </div>

                {/* Body */}
                {item.content && (
                  <StreamContent
                    content={item.content}
                    onSelectTag={handleToggleTag}
                  />
                )}

                {/* Media Attachments (1-4 Grid) */}
                {item.images.length > 0 && (
                  <div
                    className={cn(
                      'mt-4 grid gap-2 overflow-hidden rounded-lg',
                      item.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    )}
                  >
                    {item.images.slice(0, 4).map((mediaUrl, mediaIdx) => {
                      const video = isVideoUrl(mediaUrl)
                      return (
                        <div
                          key={`${item.id}-${mediaIdx}`}
                          onClick={() => {
                            setSlideIndex(mediaIdx)
                            setLightboxItem(item)
                          }}
                          className={cn(
                            'relative cursor-pointer overflow-hidden rounded-md border border-border bg-muted group/media',
                            item.images.length === 1
                              ? 'aspect-[16/10] max-h-[380px]'
                              : 'aspect-[4/3]'
                          )}
                        >
                          {video ? (
                            <>
                              <video
                                src={mediaUrl}
                                className="w-full h-full object-cover group-hover/media:scale-[1.02] transition-transform duration-300"
                                muted
                                playsInline
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <Image
                              src={mediaUrl}
                              alt="Stream attachment"
                              fill
                              sizes="(max-width: 768px) 100vw, 680px"
                              className="object-cover group-hover/media:scale-[1.02] transition-transform duration-300"
                              unoptimized
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <LikeButton
                    type="stream"
                    id={item.id}
                    className="text-xs"
                  />

                  <button
                    type="button"
                    onClick={() => handleCopyAnchor(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Copy link to this stream post"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400">copied</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>/{shortId}</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Lightbox for attached photos/videos */}
      <Lightbox
        open={lightboxItem !== null}
        close={() => setLightboxItem(null)}
        index={slideIndex}
        slides={lightboxItem ? getSlides(lightboxItem) : []}
        on={{
          view: ({ index }) => setSlideIndex(index),
        }}
        plugins={[
          Video,
          Zoom,
          ...(lightboxItem && lightboxItem.images.length > 1 ? [Counter] : []),
        ]}
        video={{ autoPlay: true }}
        carousel={{ finite: true }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        render={{
          buttonPrev: lightboxItem?.images.length === 1 ? () => null : undefined,
          buttonNext: lightboxItem?.images.length === 1 ? () => null : undefined,
          slideFooter: () =>
            lightboxItem && exifSummary ? (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-start pointer-events-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/75 border border-white/15 font-mono text-xs text-green-400">
                  <Aperture className="w-3.5 h-3.5 shrink-0" />
                  <span>{exifSummary}</span>
                </div>
              </div>
            ) : null,
        }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)', padding: '40px' },
          slide: { padding: '20px' },
        }}
      />
    </div>
  )
}
