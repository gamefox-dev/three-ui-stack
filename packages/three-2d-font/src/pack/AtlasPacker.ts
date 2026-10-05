export interface PackRect {
  id: number
  width: number
  height: number
}

export interface PackPlacement {
  id: number
  x: number
  y: number
}

export interface PackResult {
  width: number
  height: number
  placements: PackPlacement[]
}

export interface PackOptions {
  /** Empty pixels kept between rectangles. Default 0. */
  spacing?: number
  maxWidth?: number
  maxHeight?: number
  /** Round the atlas size up to powers of two (default true). */
  powerOfTwo?: boolean
  /** Fixed size instead of auto-growing. */
  width?: number
  height?: number
}

interface Free {
  x: number
  y: number
  w: number
  h: number
}

/** MaxRects (best-short-side-fit) rectangle packer. Pure data → data; used by the font baker and tests. */
export class AtlasPacker {
  static pack(rects: readonly PackRect[], options: PackOptions = {}): PackResult {
    const spacing = options.spacing ?? 0
    const maxW = options.maxWidth ?? 4096
    const maxH = options.maxHeight ?? 4096
    const pot = options.powerOfTwo ?? true
    const sorted = [...rects].sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height) || b.height - a.height)

    if (options.width && options.height) {
      const r = tryPack(sorted, options.width, options.height, spacing)
      if (!r) throw new Error(`[three-2d-font] glyphs do not fit in a ${options.width}×${options.height} atlas`)
      return { width: options.width, height: options.height, placements: r }
    }

    let area = 0
    let widest = 1
    let tallest = 1
    for (const r of sorted) {
      area += (r.width + spacing) * (r.height + spacing)
      widest = Math.max(widest, r.width + spacing)
      tallest = Math.max(tallest, r.height + spacing)
    }
    const round = (v: number) => (pot ? 1 << Math.ceil(Math.log2(Math.max(1, v))) : Math.ceil(v))
    let w = round(Math.max(widest, Math.ceil(Math.sqrt(area * 1.1))))
    let h = round(Math.max(tallest, Math.ceil(area * 1.1 / w)))
    for (let guard = 0; guard < 32; guard++) {
      if (w > maxW || h > maxH) break
      const placed = tryPack(sorted, w, h, spacing)
      if (placed) {
        if (!pot) {
          // shrink to used bounds
          let uw = 1
          let uh = 1
          const byId = new Map(sorted.map((r) => [r.id, r]))
          for (const p of placed) {
            const r = byId.get(p.id)!
            uw = Math.max(uw, p.x + r.width)
            uh = Math.max(uh, p.y + r.height)
          }
          return { width: uw, height: uh, placements: placed }
        }
        return { width: w, height: h, placements: placed }
      }
      if (w <= h) w = pot ? w * 2 : Math.ceil(w * 1.25)
      else h = pot ? h * 2 : Math.ceil(h * 1.25)
    }
    throw new Error(`[three-2d-font] glyphs do not fit within ${maxW}×${maxH}; lower the size or charset`)
  }
}

function tryPack(rects: readonly PackRect[], width: number, height: number, spacing: number): PackPlacement[] | null {
  let free: Free[] = [{ x: 0, y: 0, w: width + spacing, h: height + spacing }]
  const out: PackPlacement[] = []
  for (const r of rects) {
    const w = r.width + spacing
    const h = r.height + spacing
    if (r.width === 0 || r.height === 0) {
      out.push({ id: r.id, x: 0, y: 0 })
      continue
    }
    let best: Free | null = null
    let bestShort = Infinity
    let bestLong = Infinity
    for (const f of free) {
      if (f.w >= w && f.h >= h) {
        const short = Math.min(f.w - w, f.h - h)
        const long = Math.max(f.w - w, f.h - h)
        if (short < bestShort || (short === bestShort && long < bestLong)) {
          best = f
          bestShort = short
          bestLong = long
        }
      }
    }
    if (!best) return null
    const px = best.x
    const py = best.y
    out.push({ id: r.id, x: px, y: py })
    const next: Free[] = []
    for (const f of free) {
      if (px >= f.x + f.w || px + w <= f.x || py >= f.y + f.h || py + h <= f.y) {
        next.push(f)
        continue
      }
      if (px > f.x) next.push({ x: f.x, y: f.y, w: px - f.x, h: f.h })
      if (px + w < f.x + f.w) next.push({ x: px + w, y: f.y, w: f.x + f.w - (px + w), h: f.h })
      if (py > f.y) next.push({ x: f.x, y: f.y, w: f.w, h: py - f.y })
      if (py + h < f.y + f.h) next.push({ x: f.x, y: py + h, w: f.w, h: f.y + f.h - (py + h) })
    }
    // prune contained rects
    free = next.filter((a, i) => !next.some((b, j) => i !== j && a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h && (a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h || i > j)))
  }
  return out
}
