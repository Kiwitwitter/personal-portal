'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GeoLocationGroup } from '@/lib/types'

interface FootprintMapProps {
  locations: GeoLocationGroup[]
  selectedLocation: string | null
  onSelectLocation: (location: string | null) => void
}

type RegionKey = 'world' | 'na' | 'asia' | 'eu'

const REGION_VIEWBOX: Record<RegionKey, { label: string; viewBox: string }> = {
  world: { label: 'world', viewBox: '0 0 1000 500' },
  na: { label: 'n_america', viewBox: '80 65 340 190' },
  asia: { label: 'asia_pac', viewBox: '680 95 270 190' },
  eu: { label: 'europe', viewBox: '440 60 190 135' },
}

// Simplified stylized continent polygons in 1000x500 equirectangular coordinates
const CONTINENT_PATHS = [
  // North America
  'M 75,70 L 165,58 L 265,62 L 338,85 L 320,128 L 285,155 L 258,195 L 238,220 L 210,205 L 185,172 L 152,145 L 132,115 L 85,105 Z',
  // Greenland
  'M 342,40 L 415,35 L 428,68 L 378,86 L 345,68 Z',
  // South America
  'M 255,228 L 315,236 L 358,278 L 345,345 L 308,415 L 285,432 L 272,365 L 252,295 Z',
  // Europe
  'M 458,76 L 535,62 L 605,68 L 615,118 L 568,142 L 525,148 L 478,145 L 455,118 Z',
  // Africa
  'M 455,162 L 542,158 L 605,192 L 615,252 L 578,342 L 535,365 L 502,310 L 485,248 L 450,210 Z',
  // Asia
  'M 608,68 L 745,58 L 895,72 L 935,108 L 880,152 L 845,198 L 795,232 L 735,235 L 688,205 L 635,185 L 610,132 Z',
  // Japan & Islands
  'M 875,138 L 892,146 L 885,168 L 870,162 Z',
  // Southeast Asia / Indonesia
  'M 778,242 L 855,250 L 882,272 L 805,274 Z',
  // Australia & NZ
  'M 795,305 L 882,302 L 905,348 L 868,385 L 802,372 Z',
  'M 928,382 L 948,395 L 936,412 L 920,400 Z',
]

function projectToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 1000
  const y = ((90 - lat) / 180) * 500
  return {
    x: Math.max(10, Math.min(990, x)),
    y: Math.max(10, Math.min(490, y)),
  }
}

export function FootprintMap({
  locations,
  selectedLocation,
  onSelectLocation,
}: FootprintMapProps) {
  const [region, setRegion] = useState<RegionKey>('world')
  const [hoveredLoc, setHoveredLoc] = useState<GeoLocationGroup | null>(null)

  const totalPhotosWithGeo = locations.reduce((acc, l) => acc + l.imageIds.length, 0)

  return (
    <div className="mb-10 rounded-lg border border-border bg-card overflow-hidden font-mono">
      {/* Terminal Radar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/40 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary">$</span>
          <span>plot --projection=equirectangular</span>
          <span className="text-muted-foreground/60">
            ({locations.length} {locations.length === 1 ? 'node' : 'nodes'} · {totalPhotosWithGeo}{' '}
            captures)
          </span>
        </div>

        {/* Region Zoom Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.keys(REGION_VIEWBOX) as RegionKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRegion(key)}
              className={cn(
                'px-2 py-0.5 rounded border transition-colors',
                region === key
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {REGION_VIEWBOX[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative bg-[#080b09] aspect-[2/1] w-full overflow-hidden">
        <svg
          viewBox={REGION_VIEWBOX[region].viewBox}
          className="w-full h-full select-none"
          role="img"
          aria-label="Photography world footprint map"
        >
          {/* Graticule Grid Lines */}
          {[1, 2, 3, 4, 5].map((i) => (
            <line
              key={`lat-${i}`}
              x1={0}
              y1={(500 / 6) * i}
              x2={1000}
              y2={(500 / 6) * i}
              stroke={i === 3 ? '#22c55e28' : '#ffffff0a'}
              strokeWidth={region === 'world' ? 1 : 0.45}
              strokeDasharray={i === 3 ? '4 4' : undefined}
            />
          ))}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <line
              key={`lng-${i}`}
              x1={(1000 / 12) * i}
              y1={0}
              x2={(1000 / 12) * i}
              y2={500}
              stroke={i === 6 ? '#22c55e20' : '#ffffff08'}
              strokeWidth={region === 'world' ? 1 : 0.45}
              strokeDasharray={i === 6 ? '4 4' : undefined}
            />
          ))}

          {/* Continents */}
          {CONTINENT_PATHS.map((d, idx) => (
            <path
              key={idx}
              d={d}
              fill="#161b18"
              stroke="#2a362e"
              strokeWidth={region === 'world' ? 1.2 : 0.55}
              strokeLinejoin="round"
            />
          ))}

          {/* Glowing Location Pins */}
          {locations.map((loc) => {
            const { x, y } = projectToSvg(loc.lat, loc.lng)
            const isSelected =
              selectedLocation?.toLowerCase() === loc.location.toLowerCase()
            const scale = region === 'world' ? 1 : 0.45
            const baseRadius = Math.min(8, 3.8 + Math.log2(loc.imageIds.length + 1) * 1.4) * scale

            return (
              <g
                key={loc.location}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredLoc(loc)}
                onMouseLeave={() => setHoveredLoc(null)}
                onClick={() =>
                  onSelectLocation(isSelected ? null : loc.location)
                }
              >
                {/* Outer Pulse Ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={baseRadius * 2.3}
                  fill={isSelected ? 'rgba(74, 222, 128, 0.28)' : 'rgba(74, 222, 128, 0.14)'}
                  className="animate-ping"
                  style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '2.8s' }}
                />
                {/* Halo */}
                <circle
                  cx={x}
                  cy={y}
                  r={baseRadius * 1.6}
                  fill={isSelected ? 'rgba(250, 204, 21, 0.25)' : 'rgba(74, 222, 128, 0.2)'}
                />
                {/* Core Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={baseRadius}
                  fill={isSelected ? '#facc15' : '#4ade80'}
                  stroke="#080b09"
                  strokeWidth={1 * scale}
                />
              </g>
            )
          })}
        </svg>

        {/* Bottom HUD Status Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs">
          <div className="px-2.5 py-1 rounded bg-black/75 border border-border text-muted-foreground">
            {hoveredLoc ? (
              <span>
                <span className="text-primary font-semibold">{hoveredLoc.location}</span> ·{' '}
                {hoveredLoc.lat.toFixed(2)}°, {hoveredLoc.lng.toFixed(2)}° ·{' '}
                <span className="text-yellow-400">
                  {hoveredLoc.imageIds.length}{' '}
                  {hoveredLoc.imageIds.length === 1 ? 'photo' : 'photos'}
                </span>
              </span>
            ) : selectedLocation ? (
              <span>
                filtered: <span className="text-yellow-400">{selectedLocation}</span> (click pin to
                reset)
              </span>
            ) : (
              <span>hover or click any radar node to filter photos by location</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
