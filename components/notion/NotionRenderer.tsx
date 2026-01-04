'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ExtendedRecordMap } from 'notion-types'

// Dynamically import react-notion-x to avoid SSR issues
const NotionRendererLib = dynamic(
  () => import('react-notion-x').then((mod) => mod.NotionRenderer),
  { ssr: false }
)

// Import required styles
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'

// Code block support
const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then((m) => m.Code)
)

// Collection (database) support
const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then((m) => m.Collection)
)

// Equation support
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
)

interface NotionRendererProps {
  recordMap: ExtendedRecordMap
  rootPageId?: string
}

export function NotionRenderer({ recordMap, rootPageId }: NotionRendererProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <NotionRendererLib
      recordMap={recordMap}
      fullPage={false}
      darkMode={isDark}
      rootPageId={rootPageId}
      components={{
        Code,
        Collection,
        Equation,
        nextImage: Image,
        nextLink: Link,
      }}
      mapPageUrl={(pageId) => `/blog/${pageId}`}
    />
  )
}
