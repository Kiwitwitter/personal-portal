import { NextRequest, NextResponse } from 'next/server'
import { extractEdgeColo } from '@/lib/kv'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { colo, country } = extractEdgeColo(request)

  return NextResponse.json(
    {
      colo,
      country: country || null,
      status: '200 OK',
      ts: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}
