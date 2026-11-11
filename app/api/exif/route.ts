import { NextRequest, NextResponse } from 'next/server'
import { withEdgeCache } from '@/lib/cache'
import { parseExifFromJpegBuffer } from '@/lib/exif'
import { isNotionUuid, resolveNotionAssetUrl } from '@/lib/notion'
import type { ExifMetadata } from '@/lib/types'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') || ''
  const index = Number.parseInt(searchParams.get('index') || '0', 10)

  if (!isNotionUuid(id) || Number.isNaN(index) || index < 0 || index > 50) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const exif = await withEdgeCache<ExifMetadata | null>(
    `exif:v1:${id.replace(/-/g, '').toLowerCase()}:${index}`,
    async () => {
      try {
        const assetUrl = await resolveNotionAssetUrl('gallery', id, index)
        if (!assetUrl) return null

        // Skip video extensions
        const lowerPath = assetUrl.split('?')[0].toLowerCase()
        if (['.mp4', '.webm', '.ogg', '.mov', '.png', '.gif', '.svg'].some((ext) => lowerPath.endsWith(ext))) {
          return null
        }

        // Fetch only the first 64KB where JPEG APP1 EXIF segment lives
        const res = await fetch(assetUrl, {
          headers: {
            Range: 'bytes=0-65535',
          },
        })

        if (!res.ok && res.status !== 206) {
          return null
        }

        const buffer = await res.arrayBuffer()
        const slice = buffer.byteLength > 65536 ? buffer.slice(0, 65536) : buffer
        return parseExifFromJpegBuffer(slice)
      } catch {
        return null
      }
    },
    { freshSeconds: 86400, maxStaleSeconds: 604800 }
  )

  return NextResponse.json(
    { exif },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
