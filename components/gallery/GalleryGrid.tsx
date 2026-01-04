'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import type { GalleryImage } from '@/lib/types'

interface GalleryGridProps {
  images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const slides = images.map((image) => ({
    src: image.url,
    description: image.caption,
  }))

  return (
    <>
      {/* Instagram-style Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative aspect-square group cursor-pointer overflow-hidden bg-muted"
            onClick={() => setLightboxIndex(index)}
          >
            <Image
              src={image.url}
              alt={image.caption || 'Gallery image'}
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 300px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {image.caption && (
                <p className="text-white text-sm text-center px-2">{image.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Captions]}
        captions={{ showToggle: true }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        }}
      />
    </>
  )
}
