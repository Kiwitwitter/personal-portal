'use client'

import { cn } from '@/lib/utils'

interface TagFilterProps {
  tags: string[]
  selected: string[]
  onChange: (tags: string[]) => void
}

export function TagFilter({ tags, selected, onChange }: TagFilterProps) {
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  if (tags.length === 0) return null

  return (
    <div className="flex items-center gap-3 flex-wrap font-mono text-xs">
      <span className="text-muted-foreground/50 hidden sm:inline">filter by tags:</span>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={cn(
            'transition-colors',
            selected.includes(tag)
              ? 'text-green-400 font-bold'
              : 'text-muted-foreground/70 hover:text-green-400/70'
          )}
        >
          #{tag}
        </button>
      ))}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-red-400/70 hover:text-red-400 transition-colors ml-2"
        >
          (clear)
        </button>
      )}
    </div>
  )
}
