import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { BlogList } from '@/components/blog/BlogList'
import { getBlogPosts, getCategories, getTags } from '@/lib/notion'

export const metadata: Metadata = {
  title: 'Blog | Peng Zhang',
  description: 'Blog posts, projects, and notes about software engineering and distributed systems.',
}

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function BlogPage() {
  const [posts, categories, tags] = await Promise.all([
    getBlogPosts(),
    getCategories(),
    getTags(),
  ])

  return (
    <div className="py-16">
      <Container>
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Thoughts on software engineering, distributed systems, and projects I&apos;m working on.
          </p>
        </div>

        <BlogList posts={posts} categories={categories} tags={tags} />
      </Container>
    </div>
  )
}
