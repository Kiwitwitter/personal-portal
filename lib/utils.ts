import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

function toUtcSafeDate(date: string | Date): { dateObj: Date; useUtc: boolean } {
  if (date instanceof Date) {
    return { dateObj: date, useUtc: false }
  }
  const trimmed = date.trim()
  if (DATE_ONLY_REGEX.test(trimmed)) {
    return { dateObj: new Date(`${trimmed}T00:00:00.000Z`), useUtc: true }
  }
  // ISO strings starting with YYYY-MM-DD from Notion date properties
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return { dateObj: new Date(trimmed), useUtc: true }
  }
  return { dateObj: new Date(trimmed), useUtc: false }
}

export function formatDate(date: string | Date): string {
  const { dateObj, useUtc } = toUtcSafeDate(date)
  if (Number.isNaN(dateObj.getTime())) return String(date)
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(useUtc ? { timeZone: 'UTC' } : {}),
  })
}

export function formatShortDate(date: string | Date): string {
  const { dateObj, useUtc } = toUtcSafeDate(date)
  if (Number.isNaN(dateObj.getTime())) return String(date)
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(useUtc ? { timeZone: 'UTC' } : {}),
  })
}

export function formatTechDate(date: string | Date): string {
  const { dateObj, useUtc } = toUtcSafeDate(date)
  if (Number.isNaN(dateObj.getTime())) return String(date)
  const day = (useUtc ? dateObj.getUTCDate() : dateObj.getDate())
    .toString()
    .padStart(2, '0')
  const month = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    ...(useUtc ? { timeZone: 'UTC' } : {}),
  })
  return `${month} ${day}`
}

export function getDateYear(date: string | Date): string {
  if (typeof date === 'string') {
    const match = date.trim().match(/^(\d{4})-/)
    if (match) return match[1]
  }
  const { dateObj, useUtc } = toUtcSafeDate(date)
  if (Number.isNaN(dateObj.getTime())) return new Date().getUTCFullYear().toString()
  return (useUtc ? dateObj.getUTCFullYear() : dateObj.getFullYear()).toString()
}

export function formatRelativeTime(date: string | Date, nowMs = Date.now()): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  const ts = dateObj.getTime()
  if (Number.isNaN(ts)) return String(date)

  const diffSec = Math.max(0, Math.floor((nowMs - ts) / 1000))
  if (diffSec < 45) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 14) return `${diffDay}d ago`

  return formatShortDate(dateObj)
}

export function formatExactTimestamp(date: string | Date): string {
  const dateObj = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(dateObj.getTime())) return String(date)
  return dateObj.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}
