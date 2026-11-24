'use client'

import { useState } from 'react'
import { Sparkles, ChevronUp } from 'lucide-react'

interface PostSummarizerProps {
  slug: string
}

export function PostSummarizer({ slug }: PostSummarizerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async () => {
    if (open) {
      setOpen(false)
      return
    }

    setOpen(true)
    if (summary || loading) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'summarize', slug }),
      })
      const data = (await res.json()) as { answer?: string; error?: string }
      if (!res.ok || !data.answer) {
        setError(data.error || 'Failed to generate summary.')
      } else {
        setSummary(data.answer)
      }
    } catch {
      setError('Network error while generating summary.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8 font-mono text-sm">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card/60 hover:border-primary/50 hover:text-primary transition-colors text-muted-foreground"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-primary">$</span>
        <span>ai --summarize ./posts/{slug}.md</span>
        {open && <ChevronUp className="w-3.5 h-3.5 ml-1" />}
      </button>

      {open && (
        <div className="mt-3 p-5 rounded-lg border border-primary/30 bg-card/80 space-y-2 animate-in fade-in duration-200">
          <div className="text-xs text-primary flex items-center justify-between border-b border-border/60 pb-2 mb-2">
            <span>{'// TL;DR (Workers AI)'}</span>
            {loading && <span className="animate-pulse">generating...</span>}
          </div>

          {loading && (
            <div className="space-y-2 animate-pulse py-1">
              <div className="h-3.5 bg-muted rounded w-11/12" />
              <div className="h-3.5 bg-muted rounded w-4/5" />
              <div className="h-3.5 bg-muted rounded w-5/6" />
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          {summary && (
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-line font-sans">
              {summary}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
