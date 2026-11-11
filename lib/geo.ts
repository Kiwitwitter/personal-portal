import { withEdgeCache } from './cache'
import type { GalleryImage, GeoLocationGroup } from './types'

interface Coordinates {
  lat: number
  lng: number
}

// Fast built-in lookup dictionary for common global cities, parks, and regions
const KNOWN_COORDINATES: Record<string, Coordinates> = {
  // US West
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'santa monica': { lat: 34.0195, lng: -118.4912 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'bay area': { lat: 37.4419, lng: -122.143 },
  'san jose': { lat: 37.3382, lng: -121.8863 },
  'mountain view': { lat: 37.3861, lng: -122.0839 },
  sunnyvale: { lat: 37.3688, lng: -122.0363 },
  'palo alto': { lat: 37.4419, lng: -122.143 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  bellevue: { lat: 47.6101, lng: -122.2015 },
  portland: { lat: 45.5152, lng: -122.6784 },
  'las vegas': { lat: 36.1699, lng: -115.1398 },
  yosemite: { lat: 37.8651, lng: -119.5383 },
  'lake tahoe': { lat: 39.0968, lng: -120.0324 },
  tahoe: { lat: 39.0968, lng: -120.0324 },
  'joshua tree': { lat: 33.8734, lng: -115.901 },
  'big sur': { lat: 36.2704, lng: -121.8081 },
  carmel: { lat: 36.5552, lng: -121.9233 },
  monterey: { lat: 36.6002, lng: -121.8947 },
  'santa barbara': { lat: 34.4208, lng: -119.6982 },
  yellowstone: { lat: 44.428, lng: -110.5885 },
  'grand canyon': { lat: 36.1069, lng: -112.1129 },
  zion: { lat: 37.2982, lng: -113.0263 },
  page: { lat: 36.9147, lng: -111.4558 },
  sedona: { lat: 34.8697, lng: -111.761 },
  denver: { lat: 39.7392, lng: -104.9903 },
  hawaii: { lat: 21.3069, lng: -157.8583 },
  honolulu: { lat: 21.3069, lng: -157.8583 },
  maui: { lat: 20.7984, lng: -156.3319 },
  alaska: { lat: 61.2181, lng: -149.9003 },
  fairbanks: { lat: 64.8378, lng: -147.7164 },
  // US Central & East
  'new york': { lat: 40.7128, lng: -74.006 },
  nyc: { lat: 40.7128, lng: -74.006 },
  manhattan: { lat: 40.7831, lng: -73.9712 },
  boston: { lat: 42.3601, lng: -71.0589 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  miami: { lat: 25.7617, lng: -80.1918 },
  orlando: { lat: 28.5383, lng: -81.3792 },
  austin: { lat: 30.2672, lng: -97.7431 },
  washington: { lat: 38.9072, lng: -77.0369 },
  // Canada & LatAm
  vancouver: { lat: 49.2827, lng: -123.1207 },
  banff: { lat: 51.1784, lng: -115.5708 },
  calgary: { lat: 51.0447, lng: -114.0719 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  montreal: { lat: 45.5017, lng: -73.5673 },
  cancun: { lat: 21.1619, lng: -86.8515 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  // Asia
  beijing: { lat: 39.9042, lng: 116.4074 },
  '北京': { lat: 39.9042, lng: 116.4074 },
  shanghai: { lat: 31.2304, lng: 121.4737 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  shenzhen: { lat: 22.5431, lng: 114.0579 },
  '深圳': { lat: 22.5431, lng: 114.0579 },
  guangzhou: { lat: 23.1291, lng: 113.2644 },
  hangzhou: { lat: 30.2741, lng: 120.1551 },
  chengdu: { lat: 30.5728, lng: 104.0668 },
  chongqing: { lat: 29.563, lng: 106.5516 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  '香港': { lat: 22.3193, lng: 114.1694 },
  taipei: { lat: 25.033, lng: 121.5654 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  '东京': { lat: 35.6762, lng: 139.6503 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  '京都': { lat: 35.0116, lng: 135.7681 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  '大阪': { lat: 34.6937, lng: 135.5023 },
  hokkaido: { lat: 43.0642, lng: 141.3469 },
  sapporo: { lat: 43.0618, lng: 141.3545 },
  fuji: { lat: 35.3606, lng: 138.7274 },
  seoul: { lat: 37.5665, lng: 126.978 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  bali: { lat: -8.4095, lng: 115.1889 },
  // Europe & Oceania
  london: { lat: 51.5072, lng: -0.1276 },
  paris: { lat: 48.8566, lng: 2.3522 },
  rome: { lat: 41.9028, lng: 12.4964 },
  zurich: { lat: 47.3769, lng: 8.5417 },
  iceland: { lat: 64.1466, lng: -21.9426 },
  reykjavik: { lat: 64.1466, lng: -21.9426 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  melbourne: { lat: -37.8136, lng: 144.9631 },
}

function lookupLocalCoordinates(rawLocation: string): Coordinates | null {
  const normalized = rawLocation.trim().toLowerCase()
  if (!normalized) return null

  if (KNOWN_COORDINATES[normalized]) {
    return KNOWN_COORDINATES[normalized]
  }

  // Try matching city prefix before comma (e.g. "Los Angeles, CA" -> "los angeles")
  const primaryPart = normalized.split(',')[0]?.trim()
  if (primaryPart && KNOWN_COORDINATES[primaryPart]) {
    return KNOWN_COORDINATES[primaryPart]
  }

  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords
    }
  }

  return null
}

async function geocodeLocation(location: string): Promise<Coordinates | null> {
  const local = lookupLocalCoordinates(location)
  if (local) return local

  return withEdgeCache<Coordinates | null>(
    `geo:v1:${location.trim().toLowerCase()}`,
    async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          location
        )}`
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'pzhng-personal-portal/1.0 (https://pzhng.com)',
            Accept: 'application/json',
          },
        })
        if (!res.ok) return null
        const results = (await res.json()) as Array<{ lat?: string; lon?: string }>
        if (!Array.isArray(results) || results.length === 0) return null
        const lat = Number.parseFloat(results[0].lat || '')
        const lng = Number.parseFloat(results[0].lon || '')
        if (Number.isNaN(lat) || Number.isNaN(lng)) return null
        return { lat, lng }
      } catch {
        return null
      }
    },
    { freshSeconds: 86400, maxStaleSeconds: 604800 }
  )
}

/**
 * Group gallery images by location and resolve coordinates for the Footprint Map.
 */
export async function resolveGalleryLocations(
  images: GalleryImage[]
): Promise<GeoLocationGroup[]> {
  const grouped = new Map<string, { display: string; imageIds: string[] }>()

  for (const img of images) {
    const loc = img.location?.trim()
    if (!loc) continue
    const key = loc.toLowerCase()
    const existing = grouped.get(key)
    if (existing) {
      existing.imageIds.push(img.id)
    } else {
      grouped.set(key, { display: loc, imageIds: [img.id] })
    }
  }

  const entries = Array.from(grouped.values())
  const resolved = await Promise.all(
    entries.slice(0, 30).map(async (entry) => {
      const coords = await geocodeLocation(entry.display)
      if (!coords) return null
      return {
        location: entry.display,
        lat: coords.lat,
        lng: coords.lng,
        imageIds: entry.imageIds,
      } satisfies GeoLocationGroup
    })
  )

  return resolved.filter((item): item is GeoLocationGroup => Boolean(item))
}
