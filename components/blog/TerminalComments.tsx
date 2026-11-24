'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { formatShortDate } from '@/lib/utils'
import type { BlogComment } from '@/lib/types'

interface TerminalCommentsProps {
  slug: string
}

export function TerminalComments({ slug }: TerminalCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data: { comments?: BlogComment[] }) => {
        if (!cancelled && Array.isArray(data.comments)) {
          setComments(data.comments)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedMsg = message.trim()
    if (!trimmedMsg || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          author: author.trim() || 'guest',
          message: trimmedMsg,
        }),
      })
      const data = (await res.json()) as {
        comments?: BlogComment[]
        error?: string
      }

      if (!res.ok) {
        setError(data.error || 'Failed to post comment.')
      } else if (Array.isArray(data.comments)) {
        setComments(data.comments)
        setMessage('')
      }
    } catch {
      setError('Network error while posting comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-12 pt-8 border-t border-border font-mono">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="text-primary">$</span>
        <span>cat ./comments/{slug}.log</span>
        <span className="text-muted-foreground/60">({comments.length})</span>
      </div>

      {/* New Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-lg border border-border bg-card/50 p-4 space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 sm:w-56 border border-border rounded-md px-3 py-1.5 bg-background">
            <span className="text-xs text-blue-400 shrink-0">--author</span>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="guest"
              maxLength={32}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>
          <div className="flex-1 text-xs text-muted-foreground/60 flex items-center">
            no login required · stored on Cloudflare KV
          </div>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a comment or technical note..."
          rows={3}
          maxLength={500}
          required
          className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 font-sans resize-y"
        />

        <div className="flex items-center justify-between gap-4">
          {error ? (
            <span className="text-xs text-red-400">{error}</span>
          ) : (
            <span className="text-xs text-muted-foreground/60">
              {message.length}/500 chars
            </span>
          )}
          <button
            type="submit"
            disabled={submitting || message.trim().length < 2}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-primary text-xs hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'appending...' : 'echo >> log'}</span>
          </button>
        </div>
      </form>

      {/* Comment Entries */}
      {loading ? (
        <div className="text-xs text-muted-foreground animate-pulse py-4">
          reading comment stream...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-xs text-muted-foreground/70 py-6 text-center border border-dashed border-border rounded-lg">
          {'// EOF — No comments yet. Be the first to append a note.'}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-border/80 bg-card/40 p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-semibold">{c.author}</span>
                  {c.colo && (
                    <span className="text-muted-foreground/60">@{c.colo}</span>
                  )}
                </div>
                <span className="text-muted-foreground/60">
                  {formatShortDate(c.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-line font-sans leading-relaxed">
                {c.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
