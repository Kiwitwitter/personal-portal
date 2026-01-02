import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Folder, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/lib/types'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
      {post.cover && (
        <Link href={`/blog/${post.slug}`} className="block aspect-video relative overflow-hidden">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}
      <div className="p-5">
        {/* Category & Date */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {post.category && (
            <span className="flex items-center gap-1">
              <Folder className="w-4 h-4" />
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.date)}
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
