'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ExtendedRecordMap } from 'notion-types'

function ArticleSkeleton() {
  return (
    <div className="space-y-6 py-4 font-mono" aria-busy="true" aria-label="Loading article content">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary animate-pulse">▊</span>
        <span>rendering blocks from Notion...</span>
      </div>
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-4/5" />
      </div>
      <div className="h-32 bg-muted/70 border border-border rounded-lg animate-pulse" />
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-muted rounded w-11/12" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    </div>
  )
}

// Dynamically import react-notion-x to keep Edge bundle slim and avoid SSR DOM issues
const NotionRendererLib = dynamic(
  () => import('react-notion-x').then((mod) => mod.NotionRenderer),
  {
    ssr: false,
    loading: () => <ArticleSkeleton />,
  }
)

// Import required styles
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'

// Code block support + common backend/systems Prism language grammars
const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then(async (m) => {
    try {
      await Promise.all([
        import('prismjs/components/prism-markup-templating.js'),
        import('prismjs/components/prism-c.js'),
        import('prismjs/components/prism-bash.js'),
        import('prismjs/components/prism-json.js'),
        import('prismjs/components/prism-yaml.js'),
        import('prismjs/components/prism-sql.js'),
        import('prismjs/components/prism-python.js'),
        import('prismjs/components/prism-java.js'),
        import('prismjs/components/prism-rust.js'),
        import('prismjs/components/prism-go.js'),
        import('prismjs/components/prism-typescript.js'),
      ])
      // prism-cpp depends on prism-c being registered first
      await import('prismjs/components/prism-cpp.js')
    } catch {
      // Ignore optional grammar load failures
    }
    return m.Code
  })
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
  slugMap?: Record<string, string>
}

export function NotionRenderer({ recordMap, rootPageId, slugMap }: NotionRendererProps) {
  return (
    <NotionRendererLib
      recordMap={recordMap}
      fullPage={false}
      darkMode={true}
      rootPageId={rootPageId}
      showTableOfContents={false}
      components={{
        Code,
        Collection,
        Equation,
        nextImage: Image,
        nextLink: Link,
      }}
      mapPageUrl={(pageId) => {
        const clean = pageId.replace(/-/g, '').toLowerCase()
        const mappedSlug = slugMap?.[clean]
        return mappedSlug ? `/blog/${mappedSlug}` : `/blog/${pageId}`
      }}
    />
  )
}
