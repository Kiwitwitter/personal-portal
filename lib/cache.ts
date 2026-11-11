import { getRequestContext } from '@cloudflare/next-on-pages'

interface EdgeCacheOptions {
  /** Fresh TTL in seconds before background revalidation kicks in */
  freshSeconds?: number
  /** Maximum total age in seconds before forcing a synchronous refresh */
  maxStaleSeconds?: number
}

interface CloudflareCacheStorage {
  default?: Cache
}

function getDefaultEdgeCache(): Cache | null {
  if (typeof caches === 'undefined') return null
  return (caches as unknown as CloudflareCacheStorage).default ?? null
}

function scheduleBackgroundWork(promise: Promise<unknown>) {
  try {
    const { ctx } = getRequestContext()
    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(promise)
      return
    }
  } catch {
    // Not inside a Cloudflare request context (e.g. build time or local node)
  }
  promise.catch(() => {})
}

/**
 * Edge-compatible stale-while-revalidate JSON cache backed by Cloudflare Cache API.
 * Keeps cached Notion responses well within S3 presigned URL expiry windows while
 * eliminating Notion API latency on repeat visits.
 */
export async function withEdgeCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: EdgeCacheOptions = {}
): Promise<T> {
  const { freshSeconds = 300, maxStaleSeconds = 2400 } = options
  const edgeCache = getDefaultEdgeCache()

  if (!edgeCache) {
    return fetcher()
  }

  const cacheRequest = new Request(`https://edge-cache.pzhng.internal/${encodeURIComponent(key)}`)

  try {
    const cached = await edgeCache.match(cacheRequest)
    if (cached) {
      const cachedAt = Number(cached.headers.get('x-cached-at') || '0')
      const ageSeconds = (Date.now() - cachedAt) / 1000
      const payload = (await cached.json()) as T

      if (ageSeconds > freshSeconds) {
        // Revalidate asynchronously in the background
        scheduleBackgroundWork(
          fetcher().then(async (fresh) => {
            if (fresh === null || fresh === undefined) return
            await storeInEdgeCache(edgeCache, cacheRequest, fresh, maxStaleSeconds)
          })
        )
      }

      return payload
    }
  } catch {
    // Fall through to live fetcher on cache read errors
  }

  const fresh = await fetcher()
  if (fresh !== null && fresh !== undefined) {
    scheduleBackgroundWork(storeInEdgeCache(edgeCache, cacheRequest, fresh, maxStaleSeconds))
  }
  return fresh
}

async function storeInEdgeCache<T>(
  edgeCache: Cache,
  cacheRequest: Request,
  value: T,
  maxStaleSeconds: number
): Promise<void> {
  try {
    const response = new Response(JSON.stringify(value), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${maxStaleSeconds}`,
        'x-cached-at': Date.now().toString(),
      },
    })
    await edgeCache.put(cacheRequest, response)
  } catch {
    // Ignore cache write errors
  }
}
