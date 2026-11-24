import { getRequestContext } from '@cloudflare/next-on-pages'
import type { NextRequest } from 'next/server'

export interface CloudflareKV {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

export interface WorkersAI {
  run(
    model: string,
    inputs: {
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
      max_tokens?: number
      temperature?: number
    }
  ): Promise<{ response?: string }>
}

// In-memory fallback store so features also work smoothly in local `next dev` without KV
const memoryStore = new Map<string, string>()

const memoryKV: CloudflareKV = {
  async get(key: string) {
    return memoryStore.get(key) ?? null
  },
  async put(key: string, value: string) {
    memoryStore.set(key, value)
  },
  async delete(key: string) {
    memoryStore.delete(key)
  },
}

export function getKV(): CloudflareKV {
  try {
    const { env } = getRequestContext()
    const kv = (env as unknown as { LIKES?: CloudflareKV })?.LIKES
    if (kv && typeof kv.get === 'function') {
      return kv
    }
  } catch {
    // Fallback to in-memory KV outside Cloudflare context
  }
  return memoryKV
}

export function getWorkersAI(): WorkersAI | null {
  try {
    const { env } = getRequestContext()
    const ai = (env as unknown as { AI?: WorkersAI })?.AI
    if (ai && typeof ai.run === 'function') {
      return ai
    }
  } catch {
    // AI binding unavailable in plain Node dev
  }
  return null
}

export async function getClientFingerprint(
  request: NextRequest,
  namespace = 'pzhng'
): Promise<string | null> {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

  if (!ip) return null

  const encoder = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${namespace}:${ip}`))
  const bytes = Array.from(new Uint8Array(digest).slice(0, 12))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function checkRateLimit(
  kv: CloudflareKV,
  fingerprint: string | null,
  bucket: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  if (!fingerprint) return true
  const rateKey = `rl:${bucket}:${fingerprint}`
  const current = Number.parseInt((await kv.get(rateKey)) || '0', 10) || 0
  if (current >= maxRequests) {
    return false
  }
  await kv.put(rateKey, String(current + 1), { expirationTtl: windowSeconds })
  return true
}

export function extractEdgeColo(request: NextRequest): { colo: string; country?: string } {
  const cfRay = request.headers.get('cf-ray') || ''
  const rayParts = cfRay.split('-')
  const coloFromRay = rayParts.length > 1 ? rayParts[rayParts.length - 1].toUpperCase() : ''

  // Also check Cloudflare request.cf object if available
  const reqWithCf = request as NextRequest & { cf?: { colo?: string; country?: string } }
  const colo = (reqWithCf.cf?.colo || coloFromRay || 'LOCAL').slice(0, 6)
  const country =
    reqWithCf.cf?.country || request.headers.get('cf-ipcountry') || undefined

  return { colo, country }
}

export function sanitizeSingleLine(input: string, maxLen: number): string {
  return input
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

export function sanitizeMultiLine(input: string, maxLen: number): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen)
}
