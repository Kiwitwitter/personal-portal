'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { CategoryFilter } from './CategoryFilter'
import { TagFilter } from './TagFilter'
import { TimelineNode } from './TimelineNode'
import { LinkedText } from '@/components/ui/LinkedText'
import { cn, formatTechDate, getDateYear } from '@/lib/utils'
import type { BlogPost } from '@/lib/types'

interface BlogListProps {
  posts: BlogPost[]
  categories: string[]
  tags: string[]
}

// Group posts by UTC-safe calendar year
function groupPostsByYear(posts: BlogPost[]): Record<string, BlogPost[]> {
  const groups: Record<string, BlogPost[]> = {}
  for (const post of posts) {
    const year = getDateYear(post.date)
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(post)
  }
  return groups
}

export function BlogList({ posts, categories, tags }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const slugs = posts.map((p) => p.slug).filter(Boolean)
    if (slugs.length === 0) return

    fetch(`/api/views?slugs=${encodeURIComponent(slugs.join(','))}`)
      .then((res) => res.json())
      .then((data: { counts?: Record<string, number> }) => {
        if (data.counts && typeof data.counts === 'object') {
          setViewCounts(data.counts)
        }
      })
      .catch(() => {})
  }, [posts])

  const filteredPosts = useMemo(() => {
    const base = posts.filter((post) => {
      if (selectedCategory && post.category !== selectedCategory) {
        return false
      }
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((tag) => post.tags.includes(tag))
        if (!hasAllTags) return false
      }
      return true
    })

    if (sortBy === 'popular') {
      return [...base].sort(
        (a, b) => (viewCounts[b.slug] || 0) - (viewCounts[a.slug] || 0)
      )
    }
    return base
  }, [posts, selectedCategory, selectedTags, sortBy, viewCounts])

  const groupedPosts = useMemo(() => groupPostsByYear(filteredPosts), [filteredPosts])
  const sortedYears = Object.keys(groupedPosts).sort((a, b) => Number(b) - Number(a))

  const renderPostEntry = (post: BlogPost, showYearInDate = false) => {
    const views = viewCounts[post.slug]
    return (
      <article key={post.id} className="group relative flex gap-6 sm:gap-10">
        <TimelineNode />

        {/* Date Column */}
        <div className="hidden sm:block w-24 pt-1 text-right font-mono text-sm text-muted-foreground shrink-0 tabular-nums">
          {showYearInDate
            ? `${formatTechDate(post.date)} '${getDateYear(post.date).slice(-2)}`
            : formatTechDate(post.date)}
        </div>

        {/* Content */}
        <Link href={`/blog/${post.slug}`} className="block flex-1 pb-4">
          <div className="flex flex-col gap-2">
            {/* Mobile Date */}
            <div className="sm:hidden font-mono text-xs text-muted-foreground mb-1">
              {formatTechDate(post.date)}, {getDateYear(post.date)}
            </div>

            <h3 className="text-xl font-bold font-mono group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            {post.excerpt && (
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                <LinkedText text={post.excerpt} asSpan />
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 flex-wrap mt-2 text-xs font-mono text-muted-foreground">
              {post.category && (
                <span className="text-blue-400">
                  dir: <span className="text-blue-300">{post.category}</span>
                </span>
              )}
              {post.tags.length > 0 && (
                <span className="flex gap-2">tags: [{post.tags.join(', ')}]</span>
              )}
              {typeof views === 'number' && (
                <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                  <Eye className="w-3.5 h-3.5" />
                  {views.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <div>
      {/* Filters & Sort Controls */}
      <div className="space-y-4 mb-16">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-border pb-6">
          <div className="flex flex-wrap gap-4 flex-1">
            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onChange={setSelectedCategory}
              />
            )}
            {tags.length > 0 && (
              <TagFilter
                tags={tags}
                selected={selectedTags}
                onChange={setSelectedTags}
              />
            )}
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="text-muted-foreground/60">--sort=</span>
            <button
              type="button"
              onClick={() => setSortBy('latest')}
              className={cn(
                'px-2 py-1 rounded border transition-colors',
                sortBy === 'latest'
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              latest
            </button>
            <button
              type="button"
              onClick={() => setSortBy('popular')}
              className={cn(
                'px-2 py-1 rounded border transition-colors',
                sortBy === 'popular'
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              popular
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {filteredPosts.length > 0 ? (
        <div className="relative pl-4 sm:pl-8 space-y-16">
          {/* Vertical Timeline Line */}
          <div className="absolute left-4 sm:left-8 top-2 bottom-0 w-[2px] bg-border transform -translate-x-[1px]" />

          {sortBy === 'popular' ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8 -ml-1">
                <div className="font-mono font-bold text-lg text-primary/80 pl-4">
                  top_by_views
                </div>
              </div>
              {filteredPosts.map((post) => renderPostEntry(post, true))}
            </div>
          ) : (
            sortedYears.map((year) => (
              <div key={year} className="relative">
                {/* Year Marker */}
                <div className="flex items-center gap-4 mb-8 -ml-1">
                  <div className="w-16 sm:w-20 text-right font-mono font-bold text-2xl text-muted-foreground/50">
                    {year}
                  </div>
                </div>

                {/* Posts for this year */}
                <div className="space-y-8">
                  {groupedPosts[year].map((post) => renderPostEntry(post, false))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/50">
          <p className="font-mono text-muted-foreground">
            <span className="text-red-500">Error:</span> No matching posts found in current directory.
          </p>
        </div>
      )}
    </div>
  )
}
