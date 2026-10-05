import type { ParsedFont, ParsedGlyph, PathCommand } from './types'

export interface GlyphBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  empty: boolean
}

/** Control-point bounds of an outline in font units (y-up). Conservative for curves. */
export function pathBounds(path: readonly PathCommand[]): GlyphBounds {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const add = (x: number, y: number) => {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  for (const c of path) {
    if (c.type === 'Z') continue
    add(c.x, c.y)
    if (c.type === 'Q') add(c.x1, c.y1)
    if (c.type === 'C') {
      add(c.x1, c.y1)
      add(c.x2, c.y2)
    }
  }
  return { minX, minY, maxX, maxY, empty: minX === Infinity }
}

export interface GlyphBox {
  /** Bitmap size in pixels including padding. */
  width: number
  height: number
  /** Pen → bitmap left, baseline → bitmap top (+up), in pixels. */
  bearingX: number
  bearingY: number
  /** Scale font units → pixels. */
  scale: number
  /** Font-unit coordinates of the bitmap's bottom-left corner. */
  originX: number
  originY: number
  empty: boolean
}

/** Integer-aligned bitmap box for a glyph at `size` px. */
export function glyphBox(font: ParsedFont, glyph: ParsedGlyph, size: number, padding: number): GlyphBox {
  const scale = size / font.unitsPerEm
  const b = pathBounds(glyph.path)
  if (b.empty) return { width: 0, height: 0, bearingX: 0, bearingY: 0, scale, originX: 0, originY: 0, empty: true }
  const left = Math.floor(b.minX * scale) - padding
  const right = Math.ceil(b.maxX * scale) + padding
  const bottom = Math.floor(b.minY * scale) - padding
  const top = Math.ceil(b.maxY * scale) + padding
  return {
    width: right - left,
    height: top - bottom,
    bearingX: left,
    bearingY: top,
    scale,
    originX: left / scale,
    originY: bottom / scale,
    empty: false,
  }
}

/** Flatten an outline into closed polylines (points in font units, y-up). */
export function flattenPath(path: readonly PathCommand[], tolerance: number): number[][] {
  const contours: number[][] = []
  let cur: number[] | null = null
  let cx = 0
  let cy = 0
  let sx = 0
  let sy = 0
  const finish = () => {
    if (cur && cur.length >= 6) contours.push(cur)
    cur = null
  }
  for (const c of path) {
    switch (c.type) {
      case 'M':
        finish()
        cur = [c.x, c.y]
        cx = sx = c.x
        cy = sy = c.y
        break
      case 'L':
        cur?.push(c.x, c.y)
        cx = c.x
        cy = c.y
        break
      case 'Q': {
        const steps = curveSteps(Math.hypot(c.x1 - cx, c.y1 - cy) + Math.hypot(c.x - c.x1, c.y - c.y1), tolerance)
        for (let i = 1; i <= steps; i++) {
          const t = i / steps
          const mt = 1 - t
          cur?.push(mt * mt * cx + 2 * mt * t * c.x1 + t * t * c.x, mt * mt * cy + 2 * mt * t * c.y1 + t * t * c.y)
        }
        cx = c.x
        cy = c.y
        break
      }
      case 'C': {
        const steps = curveSteps(Math.hypot(c.x1 - cx, c.y1 - cy) + Math.hypot(c.x2 - c.x1, c.y2 - c.y1) + Math.hypot(c.x - c.x2, c.y - c.y2), tolerance)
        for (let i = 1; i <= steps; i++) {
          const t = i / steps
          const mt = 1 - t
          const a = mt * mt * mt
          const b = 3 * mt * mt * t
          const d = 3 * mt * t * t
          const e = t * t * t
          cur?.push(a * cx + b * c.x1 + d * c.x2 + e * c.x, a * cy + b * c.y1 + d * c.y2 + e * c.y)
        }
        cx = c.x
        cy = c.y
        break
      }
      case 'Z':
        if (cur) {
          cx = sx
          cy = sy
        }
        finish()
        break
    }
  }
  finish()
  return contours
}

function curveSteps(controlLength: number, tolerance: number): number {
  return Math.max(2, Math.min(64, Math.ceil(Math.sqrt(controlLength / Math.max(tolerance, 1e-3)) * 1.5)))
}
