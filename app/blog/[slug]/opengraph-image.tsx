import { ImageResponse } from 'next/og'
import { getBlogPostByIdOrSlug } from '@/lib/notion'
import { formatDate } from '@/lib/utils'

export const runtime = 'edge'
export const alt = 'Blog Post | Peng Zhang'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { post } = await getBlogPostByIdOrSlug(slug)

  const title = post?.title || 'Peng Zhang — Blog'
  const date = post?.date ? formatDate(post.date) : ''
  const category = post?.category || 'article'
  const tags = post?.tags?.slice(0, 4) || []

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0a0a0a',
          color: '#f0f0f0',
          padding: '56px',
          fontFamily: 'monospace',
          border: '2px solid #27272a',
        }}
      >
        {/* Terminal Window Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #27272a',
            paddingBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '999px',
                backgroundColor: '#ef4444',
              }}
            />
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '999px',
                backgroundColor: '#eab308',
              }}
            />
            <div
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '999px',
                backgroundColor: '#22c55e',
              }}
            />
            <span style={{ marginLeft: '12px', color: '#a0a0a0', fontSize: '22px' }}>
              ~/pzhng/posts/{post?.slug || slug}.md
            </span>
          </div>
          <span style={{ color: '#4ade80', fontSize: '22px' }}>pzhng.com</span>
        </div>

        {/* Main Post Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px' }}>
            <span style={{ color: '#4ade80' }}>$</span>
            <span style={{ color: '#60a5fa' }}>cat</span>
            <span style={{ color: '#facc15' }}>[{category}]</span>
          </div>
          <div
            style={{
              fontSize: title.length > 55 ? '46px' : '58px',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#f8fafc',
              display: 'flex',
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer Metadata */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #27272a',
            paddingTop: '24px',
            fontSize: '22px',
            color: '#a0a0a0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#f0f0f0', fontWeight: 600 }}>Peng Zhang</span>
            {date ? <span>• {date}</span> : null}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  color: '#4ade80',
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '18px',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
