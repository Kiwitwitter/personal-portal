'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CategoryFilter } from './CategoryFilter'
import { TagFilter } from './TagFilter'
import { TimelineNode } from './TimelineNode'
import type { BlogPost } from '@/lib/types'

interface BlogListProps {
  posts: BlogPost[]
  categories: string[]
  tags: string[]
}

// Group posts by year
function groupPostsByYear(posts: BlogPost[]): Record<string, BlogPost[]> {
  const groups: Record<string, BlogPost[]> = {}
  for (const post of posts) {
    const year = new Date(post.date).getFullYear().toString()
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(post)
  }
  return groups
}

// Format date as "Mon DD" (e.g., "Jan 02")
function formatTechDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  return `${month} ${day}`
}

export function BlogList({ posts, categories, tags }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Filter by category
      if (selectedCategory && post.category !== selectedCategory) {
        return false
      }
      // Filter by tags (must have ALL selected tags)
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((tag) => post.tags.includes(tag))
        if (!hasAllTags) return false
      }
      return true
    })
  }, [posts, selectedCategory, selectedTags])

  const groupedPosts = useMemo(() => groupPostsByYear(filteredPosts), [filteredPosts])
  const sortedYears = Object.keys(groupedPosts).sort((a, b) => Number(b) - Number(a))

  return (
    <div>
      {/* Filters */}
      <div className="space-y-4 mb-16">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-border pb-6">
          <div className="flex flex-wrap gap-4 w-full">
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
        </div>
      </div>

      {/* Timeline */}
      {filteredPosts.length > 0 ? (
        <div className="relative pl-4 sm:pl-8 space-y-16">
          {/* Vertical Timeline Line */}
          <div className="absolute left-4 sm:left-8 top-2 bottom-0 w-[2px] bg-border transform -translate-x-[1px]" />

          {sortedYears.map((year) => (
            <div key={year} className="relative">
              {/* Year Marker */}
              <div className="flex items-center gap-4 mb-8 -ml-1">
                <div className="w-16 sm:w-20 text-right font-mono font-bold text-2xl text-muted-foreground/50">{year}</div>
              </div>

              {/* Posts for this year */}
              <div className="space-y-8">
                {groupedPosts[year].map((post) => (
                  <article key={post.id} className="group relative flex gap-6 sm:gap-10">
                    <TimelineNode />

                    {/* Date Column */}
                    <div className="hidden sm:block w-20 pt-1 text-right font-mono text-sm text-muted-foreground shrink-0 tabular-nums">
                      {formatTechDate(post.date)}
                    </div>

                    {/* Content */}
                    <Link href={`/blog/${post.slug}`} className="block flex-1 pb-4">
                      <div className="flex flex-col gap-2">
                        {/* Mobile Date */}
                        <div className="sm:hidden font-mono text-xs text-muted-foreground mb-1">
                          {formatTechDate(post.date)}
                        </div>

                        <h3 className="text-xl font-bold font-mono group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-4 mt-2 text-xs font-mono text-muted-foreground">
                          {post.category && (
                            <span className="text-blue-400">
                              dir: <span className="text-blue-300">{post.category}</span>
                            </span>
                          )}
                          {post.tags.length > 0 && (
                            <span className="flex gap-2">
                              tags: [{post.tags.join(', ')}]
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          ))}
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
