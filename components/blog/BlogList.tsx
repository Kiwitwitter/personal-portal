'use client'

import { useState, useMemo } from 'react'
import { BlogCard } from './BlogCard'
import { CategoryFilter } from './CategoryFilter'
import { TagFilter } from './TagFilter'
import type { BlogPost } from '@/lib/types'

interface BlogListProps {
  posts: BlogPost[]
  categories: string[]
  tags: string[]
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

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
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
