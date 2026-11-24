'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatRelativeTime, formatShortDate } from '@/lib/utils'
import type { StreamItem } from '@/lib/types'

interface LatestThoughtBarProps {
  item?: StreamItem
}

export function LatestThoughtBar({ item }: LatestThoughtBarProps) {
  const [nowMs, setNowMs] = useState<number | null>(null)

  useEffect(() => {
    setNowMs(Date.now())
  }, [])

  if (!item) return null

  const singleLine = item.content.replace(/\s+/g, ' ').trim()
  const timeText = nowMs
    ? formatRelativeTime(item.createdAt, nowMs)
    : formatShortDate(item.createdAt)

  return (
    <div className="w-full max-w-4xl mx-auto -mt-14 mb-20">
      <Link
        href="/stream"
        className="group flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-border bg-card/70 hover:border-primary/40 hover:bg-card transition-all font-mono text-xs sm:text-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-primary shrink-0">stream</span>
          <span className="text-muted-foreground/60 shrink-0">· {timeText}:</span>
          <span className="text-foreground/90 truncate font-sans">
            {singleLine || '[media attachment]'}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary shrink-0 transition-colors">
          <span className="hidden sm:inline">/stream</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    </div>
  )
}
