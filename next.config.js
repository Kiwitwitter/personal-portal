import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

// Only run in development
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.notion.so',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 's3.us-west-2.amazonaws.com',
      },
    ],
    unoptimized: true, // Required for Cloudflare Pages
  },
}

export default nextConfig
