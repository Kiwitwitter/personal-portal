import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextRequest, NextResponse } from 'next/server'
import type { LikeableType } from '@/lib/types'

export const runtime = 'edge'

interface KV {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}

const VALID_TYPES: LikeableType[] = ['blog', 'gallery']

function kvKey(type: string, id: string): string {
  return `${type}:${id}`
}

function getKV(): KV {
  const { env } = getRequestContext()
  return (env as unknown as { LIKES: KV }).LIKES
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (!type || !id || !VALID_TYPES.includes(type as LikeableType)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  try {
    const kv = getKV()
    const value = await kv.get(kvKey(type, id))
    return NextResponse.json({ count: value ? parseInt(value, 10) : 0 })
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
    !id ||
    !action ||
    !VALID_TYPES.includes(type as LikeableType) ||
    !['like', 'unlike'].includes(action)
  ) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  try {
    const kv = getKV()
    const key = kvKey(type, id)
    const current = await kv.get(key)
    let count = current ? parseInt(current, 10) : 0

    if (action === 'like') {
      count++
    } else {
      count = Math.max(0, count - 1)
    }

    await kv.put(key, count.toString())
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
