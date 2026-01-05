'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/plugins/counter.css'
import type { GalleryImage } from '@/lib/types'

interface GalleryGridProps {
  images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedPost, setSelectedPost] = useState<GalleryImage | null>(null)

  const getSlides = (post: GalleryImage) =>
    post.urls.map((url) => ({
      src: url,
      description: post.caption,
    }))

  return (
    <>
      {/* Instagram-style Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square group cursor-pointer overflow-hidden bg-muted"
            onClick={() => setSelectedPost(image)}
          >
            {image.urls[0] && (
              <Image
                src={image.urls[0]}
                alt={image.caption || 'Gallery image'}
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 300px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            )}
            {/* Multi-image indicator */}
            {image.urls.length > 1 && (
              <div className="absolute top-2 right-2 flex gap-0.5">
                {image.urls.slice(0, 3).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                  />
                ))}
              </div>
            )}
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {image.caption && (
                <p className="text-white text-sm text-center px-2">{image.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox for selected post */}
      <Lightbox
        open={selectedPost !== null}
        close={() => setSelectedPost(null)}
        slides={selectedPost ? getSlides(selectedPost) : []}
        plugins={selectedPost && selectedPost.urls.length > 1 ? [Captions, Counter] : [Captions]}
        captions={{ showToggle: true }}
        counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
        carousel={{ finite: selectedPost?.urls.length === 1 }}
        render={{
          buttonPrev: selectedPost?.urls.length === 1 ? () => null : undefined,
          buttonNext: selectedPost?.urls.length === 1 ? () => null : undefined,
        }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        }}
      />
    </>
  )
}
