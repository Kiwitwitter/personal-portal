import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { BlogList } from '@/components/blog/BlogList'
import { getBlogPosts, getCategories, getTags } from '@/lib/notion'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Blog | Peng Zhang',
  description: 'Blog posts, projects, and notes about software engineering and distributed systems.',
}

export default async function BlogPage() {
  const [posts, categories, tags] = await Promise.all([
    getBlogPosts(),
    getCategories(),
    getTags(),
  ])

  return (
    <div className="py-16">
      <Container>
        <div className="mb-12 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mb-4">
            <span className="text-green-500">$</span>
            <span>ls -la ./posts/*.md</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 font-mono">Blog</h1>
          <p className="text-lg text-muted-foreground font-mono">
            <span className="text-blue-400">const</span> <span className="text-yellow-400">articles</span> = <span className="text-green-400">&quot;thoughts on software engineering and distributed systems&quot;</span>;
          </p>
        </div>

        <BlogList posts={posts} categories={categories} tags={tags} />
      </Container>
    </div>
  )
}
