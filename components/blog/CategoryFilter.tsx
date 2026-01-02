'use client'

import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: string[]
  selected: string | null
  onChange: (category: string | null) => void
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'px-4 py-2 text-sm rounded-lg transition-colors',
          selected === null
            ? 'bg-primary text-white'
            : 'bg-muted text-muted-foreground hover:bg-border'
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            'px-4 py-2 text-sm rounded-lg transition-colors',
            selected === category
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-border'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
