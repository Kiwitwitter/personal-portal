'use client'

import React from 'react'

interface LinkedTextProps {
  text: string
  className?: string
  linkClassName?: string
  asSpan?: boolean // Use span instead of anchor (for nested link contexts)
}

export function LinkedText({ text, className, linkClassName, asSpan = false }: LinkedTextProps) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  const defaultLinkClass = 'text-primary hover:underline break-all'

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          if (asSpan) {
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(part, '_blank', 'noopener,noreferrer')
                }}
                className={`${linkClassName || defaultLinkClass} cursor-pointer`}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(part, '_blank', 'noopener,noreferrer')
                  }
                }}
              >
                {part}
              </span>
            )
          }
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName || defaultLinkClass}
            >
              {part}
            </a>
          )
        }
        return <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </span>
  )
}
