import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CursorSpotlight } from '@/components/ui/CursorSpotlight'
import { TechGrid } from '@/components/ui/TechGrid'
import { CommandPalette } from '@/components/ui/CommandPalette'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://pzhng.com'),
  title: 'Peng Zhang',
  description: 'A soul yearning to become interesting.',
  keywords: ['Backend Engineer', 'Distributed Systems', 'Software Engineer', 'Peng Zhang'],
  authors: [{ name: 'Peng Zhang', url: 'https://pzhng.com' }],
  icons: {
    icon: '/favicon.png',
  },
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: 'Peng Zhang',
    description: 'A soul yearning to become interesting.',
    url: 'https://pzhng.com',
    siteName: 'Peng Zhang',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peng Zhang',
    description: 'A soul yearning to become interesting.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col relative">
          <TechGrid />
          <CursorSpotlight />
          <Navbar />
          <CommandPalette />
          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
