import { NextRequest, NextResponse } from 'next/server'
import { getKV, getClientFingerprint, checkRateLimit } from '@/lib/kv'

export const runtime = 'edge'

const SAFE_SLUG_REGEX = /^[a-zA-Z0-9_-]{1,128}$/

function viewKey(slug: string): string {
  return `views:blog:${slug}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const singleSlug = searchParams.get('slug')
  const multiSlugs = searchParams.get('slugs')
  const kv = getKV()

  if (singleSlug) {
    if (!SAFE_SLUG_REGEX.test(singleSlug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }
    const raw = await kv.get(viewKey(singleSlug))
    const count = Math.max(0, Number.parseInt(raw || '0', 10) || 0)
    return NextResponse.json({ count })
  }

  if (multiSlugs !== null) {
    const slugs = multiSlugs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => SAFE_SLUG_REGEX.test(s))
      .slice(0, 100)

    const entries = await Promise.all(
      slugs.map(async (s) => {
        const raw = await kv.get(viewKey(s))
        const count = Math.max(0, Number.parseInt(raw || '0', 10) || 0)
        return [s, count] as const
      })
    )

    return NextResponse.json({ counts: Object.fromEntries(entries) })
  }

  return NextResponse.json({ error: 'Missing slug or slugs' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  let body: { slug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const slug = body.slug?.trim() || ''
  if (!SAFE_SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const kv = getKV()
  const fingerprint = await getClientFingerprint(request, 'views')
  const allowed = await checkRateLimit(kv, fingerprint, 'views', 40, 60)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const key = viewKey(slug)
  const currentRaw = await kv.get(key)
  let count = Math.max(0, Number.parseInt(currentRaw || '0', 10) || 0)

  if (fingerprint) {
    // Deduplicate views from the same IP for 6 hours
    const seenKey = `vseen:${slug}:${fingerprint}`
    const alreadySeen = await kv.get(seenKey)
    if (!alreadySeen) {
      count += 1
      await Promise.all([
        kv.put(key, count.toString()),
        kv.put(seenKey, '1', { expirationTtl: 21600 }),
      ])
    }
    return NextResponse.json({ count })
  }

  count += 1
  await kv.put(key, count.toString())
  return NextResponse.json({ count })
}
