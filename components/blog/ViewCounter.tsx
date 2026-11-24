'use client'

import { useEffect, useState } from 'react'

interface ViewCounterProps {
  slug: string
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then((res) => res.json())
      .then((data: { count?: number }) => {
        if (!cancelled && typeof data.count === 'number') {
          setViews(data.count)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <div>
      <span className="text-blue-300">views:</span>{' '}
      <span className="text-yellow-400">
        {views === null ? '...' : views.toLocaleString()}
      </span>
      ,
    </div>
  )
}
