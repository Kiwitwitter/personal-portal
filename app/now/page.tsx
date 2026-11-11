import { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { NotionRenderer } from '@/components/notion/NotionRenderer'
import {
  getNowPageContent,
  getBlogPosts,
  getGalleryImages,
  getBlogSlugMap,
} from '@/lib/notion'
import { formatDate } from '@/lib/utils'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Now | Peng Zhang',
  description: 'What Peng Zhang is currently focused on, building, and exploring.',
  alternates: {
    canonical: '/now',
  },
}

export default async function NowPage() {
  const [nowDoc, posts, photos, slugMap] = await Promise.all([
    getNowPageContent(),
    getBlogPosts(),
    getGalleryImages(),
    getBlogSlugMap(),
  ])

  const latestPost = posts.find((p) => Boolean(p.slug)) || null
  const latestPhoto = photos[0] || null

  return (
    <div className="py-16">
      <Container>
        <div className="mb-12 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mb-4">
            <span className="text-green-500">$</span>
            <span>systemctl status pzhng.service</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 font-mono">/now</h1>
          <p className="text-lg text-muted-foreground font-mono">
            <span className="text-blue-400">const</span>{' '}
            <span className="text-yellow-400">focus</span> ={' '}
            <span className="text-green-400">
              &quot;what I am working on and thinking about right now&quot;
            </span>
            ;
          </p>
        </div>

        {/* Live Systemd-style Status Card */}
        <div className="mb-12 rounded-lg border border-border bg-card p-6 font-mono text-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            <span className="text-foreground font-semibold">pzhng.service</span>
            <span className="text-primary">— active (running)</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="text-xs text-blue-400 uppercase tracking-wider">
                {'// Day Job'}
              </div>
              <p className="text-foreground font-semibold">
                Backend SDE @ Google
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Building cloud control-plane &amp; API infrastructure on Google Cloud Platform (One
                Platform).
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs text-blue-400 uppercase tracking-wider">
                {'// Side Builds & Exploration'}
              </div>
              <p className="text-foreground font-semibold">
                Edge Systems, AI Agents &amp; iOS Tooling
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Iterating on{' '}
                <Link
                  href="/apps/sales-tax-assistant"
                  className="text-primary hover:underline"
                >
                  Sales Tax Assistant
                </Link>
                , agentic tooling (MCP), and edge-native web experiences.
              </p>
            </div>
          </div>

          {/* Live Signals from Notion */}
          {(latestPost || latestPhoto) && (
            <div className="pt-4 border-t border-border/60 grid gap-4 sm:grid-cols-2 text-xs">
              {latestPost && (
                <div>
                  <span className="text-muted-foreground">latest_post: </span>
                  <Link
                    href={`/blog/${latestPost.slug}`}
                    className="text-primary hover:underline"
                  >
                    {latestPost.title}
                  </Link>{' '}
                  <span className="text-muted-foreground/60">
                    ({formatDate(latestPost.date)})
                  </span>
                </div>
              )}

              {latestPhoto && (
                <div>
                  <span className="text-muted-foreground">latest_capture: </span>
                  <Link href="/gallery" className="text-primary hover:underline">
                    {latestPhoto.caption || latestPhoto.location || 'View Gallery'}
                  </Link>{' '}
                  {latestPhoto.location && (
                    <span className="text-muted-foreground/60">
                      @ {latestPhoto.location}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optional Notion-powered /now body when NOTION_NOW_PAGE_ID is set */}
        {nowDoc?.recordMap && (
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <NotionRenderer
              recordMap={nowDoc.recordMap}
              rootPageId={nowDoc.pageId}
              slugMap={slugMap}
            />
          </article>
        )}

        <p className="mt-10 font-mono text-xs text-muted-foreground/60">
          {'// Inspired by '}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            nownownow.com
          </a>
          . Set <code className="text-foreground/80">NOTION_NOW_PAGE_ID</code> to append live
          Notion notes below the status block.
        </p>
      </Container>
    </div>
  )
}
