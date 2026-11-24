'use client'

import { useEffect, useState } from 'react'

interface TelemetryState {
  colo: string
  rttMs: number
  status: string
}

export function EdgeTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryState | null>(null)

  useEffect(() => {
    let cancelled = false
    const start = performance.now()

    fetch('/api/telemetry', { cache: 'no-store' })
      .then(async (res) => {
        const rttMs = Math.max(1, Math.round(performance.now() - start))
        const data = (await res.json()) as { colo?: string; status?: string }
        if (!cancelled) {
          setTelemetry({
            colo: data.colo || 'EDGE',
            rttMs,
            status: data.status || `${res.status} OK`,
          })
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  if (!telemetry) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
        <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" />
        <span>probing edge...</span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 text-xs text-muted-foreground"
      title="Served via Cloudflare Edge Network"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
      <span>
        edge: <span className="text-foreground">{telemetry.colo}</span>
      </span>
      <span className="text-muted-foreground/40">·</span>
      <span>
        rtt: <span className="text-primary tabular-nums">{telemetry.rttMs}ms</span>
      </span>
      <span className="hidden md:inline text-muted-foreground/40">·</span>
      <span className="hidden md:inline text-green-400/90">{telemetry.status}</span>
    </div>
  )
}
