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
        <div className="mb-12 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mb-4">
            <span className="text-green-500">$</span>
            <span>ls ./gallery/*.jpg</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 font-mono">Gallery</h1>
          <p className="text-lg text-muted-foreground font-mono">
            <span className="text-blue-400">const</span> <span className="text-yellow-400">collection</span> = <span className="text-green-400">&quot;moments captured through my lens&quot;</span>;
          </p>
        </div>

        {images.length > 0 ? (
          <GalleryGrid images={images} />
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/50">
            <p className="font-mono text-muted-foreground">
              <span className="text-yellow-500">Warning:</span> No images found in directory.
            </p>
          </div>
        )}
      </Container>
    </div>
  )
}
