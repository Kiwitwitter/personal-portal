import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextRequest, NextResponse } from 'next/server'
import type { LikeableType } from '@/lib/types'

export const runtime = 'edge'

interface KV {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

const VALID_TYPES: LikeableType[] = ['blog', 'gallery']
const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/

function isValidId(id: string | null | undefined): id is string {
  return Boolean(id && SAFE_ID_REGEX.test(id))
}

function kvKey(type: string, id: string): string {
  return `${type}:${id}`
}

function getKV(): KV {
  const { env } = getRequestContext()
  return (env as unknown as { LIKES: KV }).LIKES
}

async function getClientFingerprint(request: NextRequest): Promise<string | null> {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  if (!ip) return null

  const encoder = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`pzhng-likes:${ip}`))
  const bytes = Array.from(new Uint8Array(digest).slice(0, 12))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (!type || !isValidId(id) || !VALID_TYPES.includes(type as LikeableType)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  try {
    const kv = getKV()
    const value = await kv.get(kvKey(type, id))
    const parsed = value ? Number.parseInt(value, 10) : 0
    return NextResponse.json({ count: Number.isNaN(parsed) ? 0 : Math.max(0, parsed) })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}

export async function POST(request: NextRequest) {
  let body: { type?: string; id?: string; action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, id, action } = body

  if (
    !type ||
    !isValidId(id) ||
    !action ||
    !VALID_TYPES.includes(type as LikeableType) ||
    !['like', 'unlike'].includes(action)
  ) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  try {
    const kv = getKV()
    const key = kvKey(type, id)
    const fingerprint = await getClientFingerprint(request)

    // Simple burst rate limit per IP (max 30 toggle actions per minute)
    if (fingerprint) {
      const rateKey = `rl:${fingerprint}`
      const recentHits = Number.parseInt((await kv.get(rateKey)) || '0', 10) || 0
      if (recentHits >= 30) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
      await kv.put(rateKey, String(recentHits + 1), { expirationTtl: 60 })
    }

    const currentRaw = await kv.get(key)
    let count = Math.max(0, Number.parseInt(currentRaw || '0', 10) || 0)

    if (fingerprint) {
      const voteKey = `vote:${type}:${id}:${fingerprint}`
      const hasVoted = (await kv.get(voteKey)) === '1'

      if (action === 'like') {
        if (!hasVoted) {
          count += 1
          await Promise.all([kv.put(key, count.toString()), kv.put(voteKey, '1')])
        }
      } else if (hasVoted) {
        count = Math.max(0, count - 1)
        await Promise.all([kv.put(key, count.toString()), kv.delete(voteKey)])
      }

      return NextResponse.json({ count })
    }

    // Fallback when IP headers are absent (e.g. local dev)
    if (action === 'like') {
      count += 1
    } else {
      count = Math.max(0, count - 1)
    }
    await kv.put(key, count.toString())
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
