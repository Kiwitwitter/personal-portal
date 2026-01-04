'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CategoryFilter } from './CategoryFilter'
import { TagFilter } from './TagFilter'
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

// Format date as "DD Mon" (e.g., "02 Jan")
function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  return `${day} ${month}`
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
      <div className="space-y-4 mb-8">
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

      {/* Archives */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year}>
              {/* Year Header */}
              <h2 className="text-2xl font-bold mb-4 text-foreground">{year}</h2>

              {/* Posts for this year */}
              <div className="space-y-2">
                {groupedPosts[year].map((post) => (
                  <div key={post.id} className="flex items-baseline gap-4">
                    <span className="text-sm text-muted-foreground w-16 shrink-0">
                      {formatShortDate(post.date)}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-foreground hover:text-primary transition-colors truncate"
                    >
                      {post.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found.</p>
        </div>
      )}
    </div>
  )
}
