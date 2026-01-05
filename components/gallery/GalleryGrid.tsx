'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/plugins/counter.css'
import Video from 'yet-another-react-lightbox/plugins/video'
import { Play, MapPin } from 'lucide-react'
import type { GalleryImage } from '@/lib/types'

interface GalleryGridProps {
  images: GalleryImage[]
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov']
const PRIORITY_COUNT = 12

function isVideo(url: string): boolean {
  const urlWithoutQuery = url.split('?')[0].toLowerCase()
  return VIDEO_EXTENSIONS.some((ext) => urlWithoutQuery.endsWith(ext))
}

function getVideoType(url: string): string {
  const urlWithoutQuery = url.split('?')[0].toLowerCase()
  if (urlWithoutQuery.endsWith('.webm')) return 'video/webm'
  if (urlWithoutQuery.endsWith('.ogg')) return 'video/ogg'
  if (urlWithoutQuery.endsWith('.mov')) return 'video/mp4'
  return 'video/mp4'
}

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.disconnect()
      }
    }, { rootMargin: '200px', ...options })

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return { ref, isInView }
}

interface GalleryItemProps {
  image: GalleryImage
  index: number
  onClick: () => void
}

function GalleryItem({ image, index, onClick }: GalleryItemProps) {
  const isPriority = index < PRIORITY_COUNT
  const { ref, isInView } = useInView()
  const shouldRender = isPriority || isInView

  return (
    <div
      ref={ref}
      className="relative aspect-square group cursor-pointer overflow-hidden bg-muted"
      onClick={onClick}
    >
      {shouldRender && image.urls[0] && (
        isVideo(image.urls[0]) ? (
          <video
            src={image.urls[0]}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <Image
            src={image.urls[0]}
            alt={image.caption || 'Gallery image'}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 300px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
            priority={isPriority}
          />
        )
      )}
      {/* Video play indicator */}
      {shouldRender && image.urls[0] && isVideo(image.urls[0]) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
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
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
        {image.caption && (
          <p className="text-white text-sm text-center px-2">{image.caption}</p>
        )}
        {image.date && (
          <p className="text-white/70 text-xs text-center px-2 mt-1">
            {new Date(image.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
        {image.location && (
          <p className="text-white/70 text-xs text-center px-2 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{image.location}</span>
          </p>
        )}
      </div>
    </div>
  )
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedPost, setSelectedPost] = useState<GalleryImage | null>(null)

  const getSlides = (post: GalleryImage) =>
    post.urls.map((url) => {
      if (isVideo(url)) {
        return {
          type: 'video' as const,
          sources: [{ src: url, type: getVideoType(url) }],
          description: post.caption,
        }
      }
      return {
        src: url,
        description: post.caption,
      }
    })

  const hasVideo = (post: GalleryImage) => post.urls.some(isVideo)

  return (
    <>
      {/* Instagram-style Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {images.map((image, index) => (
          <GalleryItem
            key={image.id}
            image={image}
            index={index}
            onClick={() => setSelectedPost(image)}
          />
        ))}
      </div>

      {/* Lightbox for selected post */}
      <Lightbox
        open={selectedPost !== null}
        close={() => setSelectedPost(null)}
        slides={selectedPost ? getSlides(selectedPost) : []}
        plugins={[
          Video,
          Captions,
          ...(selectedPost && selectedPost.urls.length > 1 ? [Counter] : []),
        ]}
        video={{ autoPlay: true }}
        captions={{ showToggle: true }}
        counter={{ container: { style: { top: 0, bottom: 'unset' } } }}
        carousel={{ finite: true }}
        render={{
          buttonPrev: selectedPost?.urls.length === 1 ? () => null : undefined,
          buttonNext: selectedPost?.urls.length === 1 ? () => null : undefined,
          slideFooter: () =>
            selectedPost?.location ? (
              <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/80 text-sm">
                <MapPin className="w-3 h-3" />
                <span>{selectedPost.location}</span>
              </div>
            ) : null,
        }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)', padding: '40px' },
          slide: { padding: '20px' },
        }}
      />
    </>
  )
}
