import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CursorSpotlight } from '@/components/ui/CursorSpotlight'
import { TechGrid } from '@/components/ui/TechGrid'
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
  title: 'Peng Zhang | Backend Engineer',
  description: 'Backend engineer with 6 years of experience building low-latency, high-throughput distributed systems at scale. Specialized in real-time data pipelines, API platform architecture, and performance optimization.',
  keywords: ['Backend Engineer', 'Distributed Systems', 'Software Engineer', 'Peng Zhang'],
  authors: [{ name: 'Peng Zhang' }],
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'Peng Zhang | Backend Engineer',
    description: 'Backend engineer building distributed systems at scale.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col relative">
            <TechGrid />
            <CursorSpotlight />
            <Navbar />
            <main className="flex-1 relative z-10">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
