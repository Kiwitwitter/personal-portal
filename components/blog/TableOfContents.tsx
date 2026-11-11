'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ListTree } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TocItem } from '@/lib/types'

interface TableOfContentsProps {
  items: TocItem[]
  variant?: 'sidebar' | 'inline'
}

export function TableOfContents({ items, variant = 'sidebar' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || '')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (variant !== 'sidebar' || items.length === 0) return

    let observer: IntersectionObserver | null = null

    const attachObserver = () => {
      const elements = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => Boolean(el))

      if (elements.length === 0) return false

      observer?.disconnect()
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          if (visible.length > 0) {
            setActiveId(visible[0].target.id)
          }
        },
        {
          rootMargin: '-88px 0px -70% 0px',
          threshold: 0,
        }
      )

      elements.forEach((el) => observer?.observe(el))
      return true
    }

    // Attach immediately or wait until client-rendered NotionRenderer mounts anchors
    if (!attachObserver()) {
      const mutationObserver = new MutationObserver(() => {
        if (attachObserver()) {
          mutationObserver.disconnect()
        }
      })
      mutationObserver.observe(document.body, { childList: true, subtree: true })
      return () => {
        mutationObserver.disconnect()
        observer?.disconnect()
      }
    }

    return () => observer?.disconnect()
  }, [items, variant])

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id)
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState(null, '', `#${id}`)
      setActiveId(id)
      setExpanded(false)
    }
  }

  if (items.length < 2) return null

  if (variant === 'inline') {
    return (
      <div className="mb-8 border border-border rounded-lg bg-card/50 font-mono text-sm">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <ListTree className="w-4 h-4 text-primary" />
            <span className="text-primary">$</span>
            <span>tree ./headings ({items.length})</span>
          </span>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>

        {expanded && (
          <nav
            aria-label="Table of contents"
            className="px-4 pb-4 pt-2 border-t border-border/60 space-y-1.5"
          >
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToHeading(e, item.id)}
                className={cn(
                  'block text-xs text-muted-foreground hover:text-primary transition-colors truncate py-0.5',
                  item.level === 2 && 'pl-4',
                  item.level === 3 && 'pl-8'
                )}
              >
                <span className="text-muted-foreground/50 mr-1.5">├─</span>
                {item.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    )
  }

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto font-mono text-xs border-l border-border pl-4 py-1"
    >
      <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
        <span className="text-primary">$</span>
        <span>tree ./headings</span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = activeId === item.id
          return (
            <li
              key={item.id}
              className={cn(
                item.level === 2 && 'pl-3',
                item.level === 3 && 'pl-6'
              )}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => scrollToHeading(e, item.id)}
                className={cn(
                  'block leading-snug transition-colors line-clamp-2',
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
