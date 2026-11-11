'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, Map as MapIcon, MapPin } from 'lucide-react'
import { GalleryGrid } from './GalleryGrid'
import { FootprintMap } from './FootprintMap'
import { cn } from '@/lib/utils'
import type { GalleryImage, GeoLocationGroup } from '@/lib/types'

interface GalleryViewProps {
  images: GalleryImage[]
  locations: GeoLocationGroup[]
}

export function GalleryView({ images, locations }: GalleryViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const uniqueLocations = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()
    for (const img of images) {
      const loc = img.location?.trim()
      if (!loc) continue
      const key = loc.toLowerCase()
      const prev = counts.get(key)
      if (prev) {
        prev.count += 1
      } else {
        counts.set(key, { label: loc, count: 1 })
      }
    }
    return Array.from(counts.values()).sort((a, b) => b.count - a.count)
  }, [images])

  const filteredImages = useMemo(() => {
    if (!selectedLocation) return images
    const target = selectedLocation.toLowerCase()
    return images.filter((img) => img.location?.trim().toLowerCase() === target)
  }, [images, selectedLocation])

  return (
    <div>
      {/* Toolbar: View Switcher + Location Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-border font-mono text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedLocation(null)}
            className={cn(
              'px-2.5 py-1 rounded border transition-colors',
              selectedLocation === null
                ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            all ({images.length})
          </button>

          {uniqueLocations.map((loc) => {
            const active = selectedLocation?.toLowerCase() === loc.label.toLowerCase()
            return (
              <button
                key={loc.label}
                type="button"
                onClick={() => setSelectedLocation(active ? null : loc.label)}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded border transition-colors',
                  active
                    ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                <MapPin className="w-3 h-3" />
                <span>{loc.label}</span>
                <span className="text-muted-foreground/60">({loc.count})</span>
              </button>
            )
          })}
        </div>

        {/* Grid / Map Switcher */}
        {locations.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors',
                viewMode === 'grid'
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors',
                viewMode === 'map'
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>map</span>
            </button>
          </div>
        )}
      </div>

      {/* Footprint Radar Map */}
      {viewMode === 'map' && locations.length > 0 && (
        <FootprintMap
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
        />
      )}

      {/* Photo Grid */}
      <GalleryGrid images={filteredImages} />
    </div>
  )
}
