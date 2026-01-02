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
    <div className="flex items-center gap-2 flex-wrap">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={cn(
            'px-3 py-1 text-xs rounded-full transition-colors',
            selected.includes(tag)
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-border'
          )}
        >
          {tag}
        </button>
      ))}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
