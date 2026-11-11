import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextRequest, NextResponse } from 'next/server'
import {
  getKV,
  getClientFingerprint,
  checkRateLimit,
  sanitizeMultiLine,
} from '@/lib/kv'
import { createStreamPost, getStreamPosts } from '@/lib/notion'

export const runtime = 'edge'

function getStreamSecret(): string {
  try {
    const { env } = getRequestContext()
    const fromCf = (env as unknown as { STREAM_SECRET?: string })?.STREAM_SECRET
    if (fromCf) return fromCf.trim()
  } catch {
    // Outside Cloudflare request context
  }
  return (process.env.STREAM_SECRET || '').trim()
}

async function timingSafeTokenEqual(provided: string, expected: string): Promise<boolean> {
  if (!provided || !expected) return false
  const encoder = new TextEncoder()
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(provided)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ])
  const viewA = new Uint8Array(hashA)
  const viewB = new Uint8Array(hashB)
  if (viewA.length !== viewB.length) return false
  let diff = 0
  for (let i = 0; i < viewA.length; i++) {
    diff |= viewA[i] ^ viewB[i]
  }
  return diff === 0
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limitParam = Number.parseInt(searchParams.get('limit') || '0', 10)

  const allItems = await getStreamPosts()
  const items =
    !Number.isNaN(limitParam) && limitParam > 0 ? allItems.slice(0, limitParam) : allItems

  return NextResponse.json(
    { items },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
      },
    }
  )
}

export async function POST(request: NextRequest) {
  const expectedSecret = getStreamSecret()
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'STREAM_SECRET is not configured on the server.' },
      { status: 503 }
    )
  }

  const kv = getKV()
  const fingerprint = await getClientFingerprint(request, 'stream-post')

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : ''

  const authorized = await timingSafeTokenEqual(token, expectedSecret)
  if (!authorized) {
    // Throttle repeated failed auth attempts per IP (max 8 attempts / 5 min)
    const allowedAttempt = await checkRateLimit(kv, fingerprint, 'stream-auth-fail', 8, 300)
    return NextResponse.json(
      { error: allowedAttempt ? 'Unauthorized' : 'Too many failed attempts' },
      { status: allowedAttempt ? 401 : 429 }
    )
  }

  let body: { text?: string; content?: string; pinned?: boolean; images?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const rawText = typeof body.text === 'string' ? body.text : body.content || ''
  const text = sanitizeMultiLine(rawText, 2000)
  const imageUrls = Array.isArray(body.images)
    ? body.images.filter((u): u is string => typeof u === 'string' && /^https?:\/\//i.test(u))
    : []

  if (!text && imageUrls.length === 0) {
    return NextResponse.json({ error: 'Stream text cannot be empty' }, { status: 400 })
  }

  try {
    const item = await createStreamPost({
      text,
      pinned: Boolean(body.pinned),
      imageUrls,
    })
    return NextResponse.json({ ok: true, item }, { status: 201 })
  } catch (err) {
    console.error('Error creating stream post:', err)
    return NextResponse.json({ error: 'Failed to create stream post' }, { status: 500 })
  }
}
