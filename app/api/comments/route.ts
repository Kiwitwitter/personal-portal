import { NextRequest, NextResponse } from 'next/server'
import {
  getKV,
  getClientFingerprint,
  checkRateLimit,
  extractEdgeColo,
  sanitizeSingleLine,
  sanitizeMultiLine,
} from '@/lib/kv'
import type { BlogComment } from '@/lib/types'

export const runtime = 'edge'

const SAFE_SLUG_REGEX = /^[a-zA-Z0-9_-]{1,128}$/
const MAX_COMMENTS_PER_POST = 100

function commentsKey(slug: string): string {
  return `comments:blog:v1:${slug}`
}

export async function GET(request: NextRequest) {
  const slug = new URL(request.url).searchParams.get('slug') || ''
  if (!SAFE_SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const kv = getKV()
  try {
    const raw = await kv.get(commentsKey(slug))
    const comments = raw ? (JSON.parse(raw) as BlogComment[]) : []
    return NextResponse.json({ comments: Array.isArray(comments) ? comments : [] })
  } catch {
    return NextResponse.json({ comments: [] })
  }
}

export async function POST(request: NextRequest) {
  let body: { slug?: string; author?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const slug = (body.slug || '').trim()
  if (!SAFE_SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const author = sanitizeSingleLine(body.author || 'guest', 32) || 'guest'
  const message = sanitizeMultiLine(body.message || '', 500)

  if (message.length < 2) {
    return NextResponse.json(
      { error: 'Comment must be at least 2 characters.' },
      { status: 400 }
    )
  }

  const kv = getKV()
  const fingerprint = await getClientFingerprint(request, 'comments')
  const allowed = await checkRateLimit(kv, fingerprint, 'comments', 5, 300)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Slow down — max 5 comments every 5 minutes.' },
      { status: 429 }
    )
  }

  const { colo } = extractEdgeColo(request)
  const newComment: BlogComment = {
    id: crypto.randomUUID(),
    author,
    message,
    createdAt: new Date().toISOString(),
    colo,
  }

  const key = commentsKey(slug)
  const raw = await kv.get(key)
  let existing: BlogComment[] = []
  try {
    const parsed = raw ? JSON.parse(raw) : []
    if (Array.isArray(parsed)) existing = parsed
  } catch {
    existing = []
  }

  const updated = [newComment, ...existing].slice(0, MAX_COMMENTS_PER_POST)
  await kv.put(key, JSON.stringify(updated))

  return NextResponse.json({ comment: newComment, comments: updated })
}
