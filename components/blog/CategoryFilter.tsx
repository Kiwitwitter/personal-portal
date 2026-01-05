'use client'

import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: string[]
  selected: string | null
  onChange: (category: string | null) => void
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap font-mono text-sm">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'transition-colors',
          selected === null
            ? 'text-primary font-bold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {selected === null ? '[ All ]' : 'All'}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            'transition-colors',
            selected === category
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {selected === category ? `[ ${category} ]` : category}
        </button>
      ))}
    </div>
  )
}
