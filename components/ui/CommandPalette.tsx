'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  FileText,
  Home,
  BookOpen,
  Image as ImageIcon,
  Smartphone,
  Activity,
  TerminalSquare,
  Github,
  Linkedin,
  Mail,
  Rss,
  CornerDownLeft,
  X,
} from 'lucide-react'
import { cn, formatTechDate } from '@/lib/utils'

export const OPEN_COMMAND_PALETTE_EVENT = 'open-command-palette'

export function triggerCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT))
  }
}

interface SearchPostItem {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  excerpt: string
  bodyText?: string
}

interface CommandItem {
  id: string
  group: 'Navigation' | 'Blog Posts' | 'Links & Actions'
  title: string
  subtitle?: string
  bodyText?: string
  keywords?: string
  icon: React.ComponentType<{ className?: string }>
  onSelect: () => void
}

function buildBodyMatchSnippet(bodyText: string | undefined, query: string): string | null {
  if (!bodyText || !query.trim()) return null
  const firstTerm = query.trim().toLowerCase().split(/\s+/)[0]
  if (!firstTerm || firstTerm.length < 2) return null

  const idx = bodyText.toLowerCase().indexOf(firstTerm)
  if (idx === -1) return null

  const start = Math.max(0, idx - 36)
  const end = Math.min(bodyText.length, idx + firstTerm.length + 56)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < bodyText.length ? '...' : ''
  return `grep: "${prefix}${bodyText.slice(start, end).trim()}${suffix}"`
}

let cachedPosts: SearchPostItem[] | null = null

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [posts, setPosts] = useState<SearchPostItem[]>(cachedPosts || [])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const openPalette = useCallback(() => {
    setOpen(true)
    setQuery('')
    setActiveIndex(0)
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => {
          if (!prev) {
            setQuery('')
            setActiveIndex(0)
          }
          return !prev
        })
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    const handleCustomOpen = () => openPalette()

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustomOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handleCustomOpen)
    }
  }, [openPalette])

  // Lazy-fetch full-text blog index when first opened
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => inputRef.current?.focus(), 10)

    if (!cachedPosts && !loadingPosts) {
      setLoadingPosts(true)
      fetch('/api/search')
        .then((res) => res.json())
        .then((data: { posts?: SearchPostItem[] }) => {
          if (Array.isArray(data.posts)) {
            cachedPosts = data.posts
            setPosts(data.posts)
          }
        })
        .catch(() => {})
        .finally(() => setLoadingPosts(false))
    }

    return () => clearTimeout(timer)
  }, [open, loadingPosts])

  const allItems: CommandItem[] = useMemo(() => {
    const navItems: CommandItem[] = [
      {
        id: 'nav-home',
        group: 'Navigation',
        title: 'cd ~ (Home)',
        subtitle: 'About, experience, GitHub heatmap & AI terminal',
        keywords: 'home about experience skills education',
        icon: Home,
        onSelect: () => router.push('/'),
      },
      {
        id: 'nav-blog',
        group: 'Navigation',
        title: 'cd ./blog',
        subtitle: 'Articles, projects & engineering notes',
        keywords: 'blog posts articles notes writing',
        icon: BookOpen,
        onSelect: () => router.push('/blog'),
      },
      {
        id: 'nav-gallery',
        group: 'Navigation',
        title: 'cd ./gallery',
        subtitle: 'Photography grid, world footprint map & EXIF',
        keywords: 'gallery photos pictures camera map exif',
        icon: ImageIcon,
        onSelect: () => router.push('/gallery'),
      },
      {
        id: 'nav-now',
        group: 'Navigation',
        title: 'systemctl status (/now)',
        subtitle: 'What I am currently working on & exploring',
        keywords: 'now status current focus',
        icon: Activity,
        onSelect: () => router.push('/now'),
      },
      {
        id: 'nav-guestbook',
        group: 'Navigation',
        title: 'tail -f ./guestbook.log',
        subtitle: 'Read or sign the edge terminal guestbook',
        keywords: 'guestbook log sign message visitors',
        icon: TerminalSquare,
        onSelect: () => router.push('/guestbook'),
      },
      {
        id: 'nav-sales-tax',
        group: 'Navigation',
        title: 'cat ./apps/sales-tax-assistant',
        subtitle: 'iOS home screen widget app for US & Canada sales tax',
        keywords: 'app ios widget sales tax assistant project',
        icon: Smartphone,
        onSelect: () => router.push('/apps/sales-tax-assistant'),
      },
    ]

    const postItems: CommandItem[] = posts.map((post) => ({
      id: `post-${post.slug}`,
      group: 'Blog Posts',
      title: post.title,
      subtitle: [
        formatTechDate(post.date),
        post.category,
        post.tags.length > 0 ? `#${post.tags.join(' #')}` : '',
      ]
        .filter(Boolean)
        .join(' · '),
      bodyText: post.bodyText,
      keywords: `${post.slug} ${post.category} ${post.tags.join(' ')} ${post.excerpt} ${
        post.bodyText || ''
      }`,
      icon: FileText,
      onSelect: () => router.push(`/blog/${post.slug}`),
    }))

    const actionItems: CommandItem[] = [
      {
        id: 'act-cv',
        group: 'Links & Actions',
        title: './cv.pdf (Download Resume)',
        subtitle: 'Open PengZhang_CV_2026.pdf in new tab',
        keywords: 'resume cv pdf download career',
        icon: FileText,
        onSelect: () => window.open('/PengZhang_CV_2026.pdf', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'act-github',
        group: 'Links & Actions',
        title: 'GitHub (@Kiwitwitter)',
        subtitle: 'github.com/Kiwitwitter',
        keywords: 'github code repo open source',
        icon: Github,
        onSelect: () =>
          window.open('https://github.com/Kiwitwitter', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'act-linkedin',
        group: 'Links & Actions',
        title: 'LinkedIn (@pzhng)',
        subtitle: 'linkedin.com/in/pzhng',
        keywords: 'linkedin profile network',
        icon: Linkedin,
        onSelect: () =>
          window.open('https://linkedin.com/in/pzhng', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'act-email',
        group: 'Links & Actions',
        title: 'Email (luka@pzhng.com)',
        subtitle: 'Send an email',
        keywords: 'email contact mail luka',
        icon: Mail,
        onSelect: () => {
          window.location.href = 'mailto:luka@pzhng.com'
        },
      },
      {
        id: 'act-rss',
        group: 'Links & Actions',
        title: 'RSS Feed (/feed.xml)',
        subtitle: 'Subscribe via RSS reader',
        keywords: 'rss atom xml subscribe feed',
        icon: Rss,
        onSelect: () => window.open('/feed.xml', '_blank', 'noopener,noreferrer'),
      },
    ]

    return [...navItems, ...postItems, ...actionItems]
  }, [posts, router])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allItems
    const terms = q.split(/\s+/)
    return allItems.filter((item) => {
      const haystack = `${item.title} ${item.subtitle || ''} ${item.keywords || ''}`.toLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
  }, [allItems, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const runItem = useCallback(
    (item: CommandItem | undefined) => {
      if (!item) return
      closePalette()
      item.onSelect()
    },
    [closePalette]
  )

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) =>
        filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runItem(filteredItems[activeIndex])
    }
  }

  useEffect(() => {
    if (!open || !listRef.current) return
    const activeEl = listRef.current.querySelector(`[data-cmd-index="${activeIndex}"]`)
    if (activeEl instanceof HTMLElement) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, open])

  if (!open) return null

  const groups: Array<CommandItem['group']> = ['Navigation', 'Blog Posts', 'Links & Actions']

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closePalette}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div
        className="w-full max-w-xl rounded-lg border border-primary/30 bg-card shadow-2xl overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/40">
          <Search className="w-4 h-4 text-primary shrink-0" />
          <span className="text-primary text-sm shrink-0">grep -ri</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Full-text grep across posts, pages & commands..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {loadingPosts && (
            <span className="text-xs text-muted-foreground animate-pulse">indexing...</span>
          )}
          <button
            onClick={closePalette}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <span className="text-red-400">0 matches:</span> No command or article text matching
              &quot;{query}&quot;
            </div>
          ) : (
            groups.map((groupName) => {
              const groupItems = filteredItems.filter((i) => i.group === groupName)
              if (groupItems.length === 0) return null

              return (
                <div key={groupName} className="mb-3 last:mb-0">
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground/70">
                    {`// ${groupName}`}
                  </div>
                  <div className="space-y-0.5">
                    {groupItems.map((item) => {
                      const flatIndex = filteredItems.indexOf(item)
                      const isSelected = flatIndex === activeIndex
                      const Icon = item.icon
                      const snippet =
                        query.trim().length >= 2 &&
                        !item.title.toLowerCase().includes(query.trim().toLowerCase())
                          ? buildBodyMatchSnippet(item.bodyText, query)
                          : null

                      return (
                        <button
                          key={item.id}
                          data-cmd-index={flatIndex}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          onClick={() => runItem(item)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors',
                            isSelected
                              ? 'bg-primary/15 text-foreground border border-primary/30'
                              : 'text-muted-foreground hover:bg-muted/60 border border-transparent'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4 shrink-0',
                              isSelected ? 'text-primary' : 'text-muted-foreground'
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                'text-sm truncate',
                                isSelected ? 'text-primary font-medium' : 'text-foreground'
                              )}
                            >
                              {item.title}
                            </div>
                            {(snippet || item.subtitle) && (
                              <div className="text-xs text-muted-foreground truncate mt-0.5">
                                {snippet ? (
                                  <span className="text-green-400/90">{snippet}</span>
                                ) : (
                                  item.subtitle
                                )}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <CornerDownLeft className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">↵</kbd> open
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">esc</kbd> close
            </span>
          </div>
          <span className="hidden sm:inline text-muted-foreground/60">full-text grep</span>
        </div>
      </div>
    </div>
  )
}
