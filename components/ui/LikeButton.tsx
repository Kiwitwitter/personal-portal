'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LikeableType } from '@/lib/types'

interface LikeButtonProps {
  type: LikeableType
  id: string
  className?: string
}

const STORAGE_KEY = 'likes'

function getLikedItems(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function setLikedItem(key: string, liked: boolean) {
  const items = getLikedItems()
  if (liked) {
    items[key] = true
  } else {
    delete items[key]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function LikeButton({ type, id, className }: LikeButtonProps) {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const storageKey = `${type}:${id}`

  useEffect(() => {
    setLiked(!!getLikedItems()[storageKey])

    fetch(`/api/likes?type=${type}&id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === 'number') setCount(data.count)
      })
      .catch(() => {})
  }, [type, id, storageKey])

  const handleClick = useCallback(async () => {
    if (loading) return

    const newLiked = !liked
    const prevCount = count
    const newCount = newLiked ? count + 1 : Math.max(0, count - 1)

    // Optimistic update
    setLiked(newLiked)
    setCount(newCount)
    setLikedItem(storageKey, newLiked)

    setLoading(true)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action: newLiked ? 'like' : 'unlike' }),
      })
      const data = await res.json()
      if (typeof data.count === 'number') {
        setCount(data.count)
      }
    } catch {
      // Revert on failure
      setLiked(!newLiked)
      setCount(prevCount)
      setLikedItem(storageKey, !newLiked)
    } finally {
      setLoading(false)
    }
  }, [liked, count, loading, type, id, storageKey])

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'group inline-flex items-center gap-1.5 text-muted-foreground transition-colors',
        className
      )}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <Heart
        className={cn(
          'w-5 h-5 transition-all',
          liked
            ? 'fill-red-500 text-red-500 scale-110'
            : 'group-hover:text-red-400'
        )}
      />
      <span className="text-sm font-mono">{count}</span>
    </button>
  )
}
