'use client'

import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import type { GuestbookEntry } from '@/lib/types'

function formatLogTimestamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const min = String(d.getUTCMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min} UTC`
}

export function GuestbookTerminal() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/guestbook')
      .then((res) => res.json())
      .then((data: { entries?: GuestbookEntry[] }) => {
        if (Array.isArray(data.entries)) {
          setEntries(data.entries)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'guest',
          message: trimmed,
        }),
      })
      const data = (await res.json()) as {
        entries?: GuestbookEntry[]
        error?: string
      }
      if (!res.ok) {
        setError(data.error || 'Failed to sign guestbook.')
      } else if (Array.isArray(data.entries)) {
        setEntries(data.entries)
        setMessage('')
      }
    } catch {
      setError('Network error while signing guestbook.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 font-mono">
      {/* Append Command Input Box */}
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-border bg-card p-5 space-y-4"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/60 pb-3">
          <span className="text-primary">$</span>
          <span>echo &quot;$MESSAGE&quot; --from &quot;$USER&quot; &gt;&gt; /var/log/guestbook.log</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 sm:w-52 rounded-md border border-border bg-background px-3 py-2">
            <span className="text-xs text-blue-400 shrink-0">--from</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="guest"
              maxLength={28}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none"
            />
          </div>

          <div className="flex-1 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <span className="text-xs text-green-400 shrink-0">msg:</span>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a one-line note, greeting, or URL..."
              maxLength={240}
              required
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || message.trim().length < 2}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary text-xs hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'writing...' : 'sign'}</span>
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>

      {/* Log Stream Output */}
      <div className="rounded-lg border border-border bg-[#0d100e] overflow-hidden">
        <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2">tail -f /var/log/guestbook.log</span>
          </div>
          <span>{entries.length} lines</span>
        </div>

        <div className="p-5 space-y-2.5 text-xs sm:text-sm max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="text-muted-foreground animate-pulse">
              streaming log entries from Cloudflare KV...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-muted-foreground/70 py-8 text-center">
              [system] /var/log/guestbook.log initialized — waiting for first signature...
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="leading-relaxed break-words">
                <span className="text-muted-foreground/55">
                  [{formatLogTimestamp(entry.createdAt)}]
                </span>{' '}
                {entry.colo && (
                  <span className="text-blue-400/85">[{entry.colo}]</span>
                )}{' '}
                <span className="text-primary font-semibold">{entry.name}:</span>{' '}
                <span className="text-foreground/90 font-sans">{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
