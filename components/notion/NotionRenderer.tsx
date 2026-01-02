'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
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
  return (
    <NotionRendererLib
      recordMap={recordMap}
      fullPage={false}
      darkMode={false}
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
