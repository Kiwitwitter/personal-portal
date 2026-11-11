import { NextRequest, NextResponse } from 'next/server'
import {
  getKV,
  getClientFingerprint,
  checkRateLimit,
  extractEdgeColo,
  sanitizeSingleLine,
} from '@/lib/kv'
import type { GuestbookEntry } from '@/lib/types'

export const runtime = 'edge'

const GUESTBOOK_KEY = 'guestbook:entries:v1'
const MAX_ENTRIES = 150

export async function GET() {
  const kv = getKV()
  try {
    const raw = await kv.get(GUESTBOOK_KEY)
    const entries = raw ? (JSON.parse(raw) as GuestbookEntry[]) : []
    return NextResponse.json({ entries: Array.isArray(entries) ? entries : [] })
  } catch {
    return NextResponse.json({ entries: [] })
  }
}

export async function POST(request: NextRequest) {
  let body: { name?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = sanitizeSingleLine(body.name || 'guest', 28) || 'guest'
  const message = sanitizeSingleLine(body.message || '', 240)

  if (message.length < 2) {
    return NextResponse.json(
      { error: 'Message must be at least 2 characters.' },
      { status: 400 }
    )
  }

  const kv = getKV()
  const fingerprint = await getClientFingerprint(request, 'guestbook')
  const allowed = await checkRateLimit(kv, fingerprint, 'guestbook', 4, 300)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit reached — please wait a few minutes.' },
      { status: 429 }
    )
  }

  const { colo } = extractEdgeColo(request)
  const entry: GuestbookEntry = {
    id: crypto.randomUUID(),
    name,
    message,
    createdAt: new Date().toISOString(),
    colo,
  }

  const raw = await kv.get(GUESTBOOK_KEY)
  let existing: GuestbookEntry[] = []
  try {
    const parsed = raw ? JSON.parse(raw) : []
    if (Array.isArray(parsed)) existing = parsed
  } catch {
    existing = []
  }

  const updated = [entry, ...existing].slice(0, MAX_ENTRIES)
  await kv.put(GUESTBOOK_KEY, JSON.stringify(updated))

  return NextResponse.json({ entry, entries: updated })
}
