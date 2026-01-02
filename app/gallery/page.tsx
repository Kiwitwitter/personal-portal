import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { getGalleryImages } from '@/lib/notion'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Gallery | Peng Zhang',
  description: 'Photography gallery showcasing moments captured through my lens.',
}

export default async function GalleryPage() {
  const images = await getGalleryImages()

  return (
    <div className="py-16">
      <Container>
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Gallery</h1>
          <p className="text-lg text-muted-foreground">
            A collection of moments captured through my lens.
          </p>
        </div>

        {images.length > 0 ? (
          <GalleryGrid images={images} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No images yet. Check back soon!</p>
          </div>
        )}
      </Container>
    </div>
  )
}
