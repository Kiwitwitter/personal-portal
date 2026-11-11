import type { ExifMetadata } from './types'

// TIFF / EXIF Tag IDs
const TAG_MAKE = 0x010f
const TAG_MODEL = 0x0110
const TAG_EXIF_IFD_POINTER = 0x8769
const TAG_EXPOSURE_TIME = 0x829a
const TAG_FNUMBER = 0x829d
const TAG_ISO = 0x8827
const TAG_FOCAL_LENGTH = 0x920a
const TAG_FOCAL_LENGTH_35MM = 0xa405
const TAG_LENS_MODEL = 0xa434

function readAscii(view: DataView, offset: number, length: number): string {
  const end = Math.min(view.byteLength, offset + length)
  const chars: number[] = []
  for (let i = offset; i < end; i++) {
    const byte = view.getUint8(i)
    if (byte === 0) break
    if (byte >= 32 && byte <= 126) {
      chars.push(byte)
    }
  }
  return String.fromCharCode(...chars).trim()
}

function readRational(view: DataView, offset: number, littleEndian: boolean): number | null {
  if (offset + 8 > view.byteLength) return null
  const numerator = view.getUint32(offset, littleEndian)
  const denominator = view.getUint32(offset + 4, littleEndian)
  if (denominator === 0) return null
  return numerator / denominator
}

function formatShutterSpeed(seconds: number): string {
  if (seconds <= 0) return ''
  if (seconds >= 1) {
    return `${Number(seconds.toFixed(1))}s`
  }
  const reciprocal = Math.round(1 / seconds)
  return `1/${reciprocal}s`
}

function cleanCameraName(make?: string, model?: string): string | undefined {
  const m = (make || '').trim()
  const mod = (model || '').trim()
  if (!m && !mod) return undefined
  if (!m) return mod
  if (!mod) return m
  if (mod.toLowerCase().startsWith(m.toLowerCase())) {
    return mod
  }
  // Shorten common verbose manufacturer strings
  const cleanMake = m
    .replace(/\bCORPORATION\b/i, '')
    .replace(/\bCO\.,?\s*LTD\.?/i, '')
    .replace(/\bINC\.?/i, '')
    .trim()
  if (mod.toLowerCase().includes(cleanMake.toLowerCase())) {
    return mod
  }
  return `${cleanMake} ${mod}`.trim()
}

interface ParsedTags {
  make?: string
  model?: string
  lens?: string
  exposureTime?: number
  fNumber?: number
  iso?: number
  focalLength?: number
  focalLength35mm?: number
  exifIfdOffset?: number
}

function parseIfd(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  littleEndian: boolean,
  out: ParsedTags
) {
  const dirStart = tiffStart + ifdOffset
  if (dirStart + 2 > view.byteLength) return

  const entryCount = view.getUint16(dirStart, littleEndian)
  for (let i = 0; i < entryCount; i++) {
    const entryOffset = dirStart + 2 + i * 12
    if (entryOffset + 12 > view.byteLength) break

    const tag = view.getUint16(entryOffset, littleEndian)
    const type = view.getUint16(entryOffset + 2, littleEndian)
    const count = view.getUint32(entryOffset + 4, littleEndian)
    const valueOffsetField = entryOffset + 8

    // Type sizes: 1=BYTE(1), 2=ASCII(1), 3=SHORT(2), 4=LONG(4), 5=RATIONAL(8)
    const typeSize =
      type === 1 || type === 2
        ? 1
        : type === 3
          ? 2
          : type === 4
            ? 4
            : type === 5
              ? 8
              : 0
    if (typeSize === 0) continue

    const totalBytes = count * typeSize
    const dataOffset =
      totalBytes <= 4
        ? valueOffsetField
        : tiffStart + view.getUint32(valueOffsetField, littleEndian)

    if (dataOffset < 0 || dataOffset > view.byteLength) continue

    if (tag === TAG_MAKE && type === 2) {
      out.make = readAscii(view, dataOffset, count)
    } else if (tag === TAG_MODEL && type === 2) {
      out.model = readAscii(view, dataOffset, count)
    } else if (tag === TAG_LENS_MODEL && type === 2) {
      out.lens = readAscii(view, dataOffset, count)
    } else if (tag === TAG_EXIF_IFD_POINTER && type === 4) {
      out.exifIfdOffset = view.getUint32(valueOffsetField, littleEndian)
    } else if (tag === TAG_EXPOSURE_TIME && type === 5) {
      const val = readRational(view, dataOffset, littleEndian)
      if (val !== null) out.exposureTime = val
    } else if (tag === TAG_FNUMBER && type === 5) {
      const val = readRational(view, dataOffset, littleEndian)
      if (val !== null) out.fNumber = val
    } else if (tag === TAG_FOCAL_LENGTH && type === 5) {
      const val = readRational(view, dataOffset, littleEndian)
      if (val !== null) out.focalLength = val
    } else if (tag === TAG_FOCAL_LENGTH_35MM && type === 3) {
      if (dataOffset + 2 <= view.byteLength) {
        out.focalLength35mm = view.getUint16(dataOffset, littleEndian)
      }
    } else if (tag === TAG_ISO) {
      if (type === 3 && dataOffset + 2 <= view.byteLength) {
        out.iso = view.getUint16(dataOffset, littleEndian)
      } else if (type === 4 && dataOffset + 4 <= view.byteLength) {
        out.iso = view.getUint32(dataOffset, littleEndian)
      }
    }
  }
}

/**
 * Lightweight zero-dependency binary JPEG EXIF parser designed for Edge 64KB Range fetches.
 */
export function parseExifFromJpegBuffer(buffer: ArrayBuffer): ExifMetadata | null {
  const view = new DataView(buffer)
  if (view.byteLength < 12) return null

  // Check JPEG SOI marker 0xFFD8
  if (view.getUint16(0, false) !== 0xffd8) return null

  let offset = 2
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break
    const marker = view.getUint8(offset + 1)

    // SOS (Start of Scan) or EOI: metadata segments are finished
    if (marker === 0xda || marker === 0xd9) break

    const segmentLength = view.getUint16(offset + 2, false)
    if (segmentLength < 2) break

    // APP1 marker (0xFFE1) with "Exif\0\0"
    if (marker === 0xe1 && offset + 10 <= view.byteLength) {
      const header = readAscii(view, offset + 4, 6)
      if (header === 'Exif') {
        const tiffStart = offset + 10
        if (tiffStart + 8 > view.byteLength) return null

        const byteOrder = view.getUint16(tiffStart, false)
        const littleEndian = byteOrder === 0x4949 // "II"
        if (!littleEndian && byteOrder !== 0x4d4d) return null

        const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian)
        const parsed: ParsedTags = {}
        parseIfd(view, tiffStart, firstIfdOffset, littleEndian, parsed)

        if (parsed.exifIfdOffset !== undefined) {
          parseIfd(view, tiffStart, parsed.exifIfdOffset, littleEndian, parsed)
        }

        const camera = cleanCameraName(parsed.make, parsed.model)
        const focal = parsed.focalLength35mm || parsed.focalLength
        const focalLength = focal ? `${Math.round(focal)}mm` : undefined
        const aperture = parsed.fNumber
          ? `f/${Number(parsed.fNumber.toFixed(1))}`
          : undefined
        const shutterSpeed = parsed.exposureTime
          ? formatShutterSpeed(parsed.exposureTime)
          : undefined
        const iso = parsed.iso ? `ISO ${parsed.iso}` : undefined

        const parts = [camera, focalLength, aperture, shutterSpeed, iso].filter(Boolean)
        if (parts.length === 0) return null

        return {
          camera,
          lens: parsed.lens || undefined,
          focalLength,
          aperture,
          shutterSpeed,
          iso,
          summary: parts.join(' · '),
        }
      }
    }

    offset += 2 + segmentLength
  }

  return null
}
