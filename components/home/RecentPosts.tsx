import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatTechDate, getDateYear } from '@/lib/utils'
import type { BlogPost } from '@/lib/types'

interface RecentPostsProps {
  posts: BlogPost[]
}

export const RecentPosts = ({ posts }: RecentPostsProps) => {
  const recent = posts.filter((p) => Boolean(p.slug)).slice(0, 3)

  if (recent.length === 0) return null

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-lg font-mono text-green-500">
          <span>$</span>
          <span className="text-foreground">head -n 3 ./posts/*.md</span>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <span>cd ./blog</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="divide-y divide-border border border-border rounded-lg bg-card overflow-hidden">
        {recent.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 p-5 hover:bg-muted/40 transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                {post.category && (
                  <span className="font-mono text-xs text-blue-400">[{post.category}]</span>
                )}
                <h3 className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {post.title}
                </h3>
              </div>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
              )}
            </div>

            <div className="font-mono text-xs text-muted-foreground shrink-0 tabular-nums">
              {formatTechDate(post.date)}, {getDateYear(post.date)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
