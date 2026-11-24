import { NextRequest, NextResponse } from 'next/server'
import { isNotionUuid, resolveNotionAssetUrl } from '@/lib/notion'

export const runtime = 'edge'

const VALID_KINDS = ['blog-cover', 'gallery', 'stream'] as const
type AssetKind = (typeof VALID_KINDS)[number]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const kind = searchParams.get('kind') as AssetKind | null
  const id = searchParams.get('id')
  const indexParam = searchParams.get('index') || '0'
  const index = Number.parseInt(indexParam, 10)

  if (
    !kind ||
    !VALID_KINDS.includes(kind) ||
    !id ||
    !isNotionUuid(id) ||
    Number.isNaN(index) ||
    index < 0 ||
    index > 50
  ) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const freshUrl = await resolveNotionAssetUrl(kind, id, index)
  if (!freshUrl) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  return NextResponse.redirect(freshUrl, {
    status: 302,
    headers: {
      // Cache redirect for 25 minutes (well within Notion's 60-minute S3 signature lifetime)
      'Cache-Control': 'public, max-age=1500, s-maxage=1500, stale-while-revalidate=300',
    },
  })
}
