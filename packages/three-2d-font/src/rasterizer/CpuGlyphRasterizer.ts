import { flattenPath, glyphBox } from '../glyphMetrics'
import type { GlyphRasterizer, GlyphRequest, ParsedFont, RasterizeOptions, RasterizedGlyph } from '../types'

/**
 * Pure-JS scanline rasterizer (non-zero winding, supersampled). Needs no GPU, DOM or Canvas2D, so it
 * powers the CLI, tests and any platform without a Three renderer.
 */
export class CpuGlyphRasterizer implements GlyphRasterizer {
  async rasterize(font: ParsedFont, glyphs: readonly GlyphRequest[], options: RasterizeOptions): Promise<readonly RasterizedGlyph[]> {
    return glyphs.map((g) => this.rasterizeOne(font, g.glyphId, options))
  }

  private rasterizeOne(font: ParsedFont, glyphId: number, options: RasterizeOptions): RasterizedGlyph {
    const ss = Math.max(1, Math.round(options.supersample ?? 4))
    const padding = options.padding ?? 1
    const glyph = font.glyph(glyphId)
    const box = glyphBox(font, glyph, options.size, padding)
    const advance = (glyph.advanceWidth * options.size) / font.unitsPerEm
    if (box.empty) {
      return { glyphId, width: 0, height: 0, bearingX: 0, bearingY: 0, advance, alpha: new Uint8Array(0) }
    }
    const { width, height, scale } = box
    const acc = new Float32Array(width * height)

    // Contours into supersampled pixel space (y down, origin at the bitmap's top-left).
    const k = scale * ss
    const contours = flattenPath(glyph.path, 0.25 / Math.max(scale, 1e-6) / ss)
    const edges: number[] = [] // x0,y0,x1,y1,dir
    const topFontY = box.bearingY / scale
    const leftFontX = box.bearingX / scale
    for (const pts of contours) {
      const n = pts.length / 2
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n
        const x0 = (pts[i * 2]! - leftFontX) * k
        const y0 = (topFontY - pts[i * 2 + 1]!) * k
        const x1 = (pts[j * 2]! - leftFontX) * k
        const y1 = (topFontY - pts[j * 2 + 1]!) * k
        if (y0 === y1) continue
        if (y0 < y1) edges.push(x0, y0, x1, y1, 1)
        else edges.push(x1, y1, x0, y0, -1)
      }
    }

    const rows = height * ss
    const sw = width * ss
    const xs: number[] = []
    const dirs: number[] = []
    const order: number[] = []
    for (let row = 0; row < rows; row++) {
      const y = row + 0.5
      xs.length = 0
      dirs.length = 0
      for (let e = 0; e < edges.length; e += 5) {
        const y0 = edges[e + 1]!
        const y1 = edges[e + 3]!
        if (y < y0 || y >= y1) continue
        const t = (y - y0) / (y1 - y0)
        xs.push(edges[e]! + (edges[e + 2]! - edges[e]!) * t)
        dirs.push(edges[e + 4]!)
      }
      if (xs.length < 2) continue
      order.length = xs.length
      for (let i = 0; i < xs.length; i++) order[i] = i
      order.sort((a, b) => xs[a]! - xs[b]!)
      let winding = 0
      const py = Math.floor(row / ss)
      for (let i = 0; i < order.length - 1; i++) {
        winding += dirs[order[i]!]!
        if (winding === 0) continue
        const xa = Math.max(0, xs[order[i]!]!)
        const xb = Math.min(sw, xs[order[i + 1]!]!)
        if (xb <= xa) continue
        const p0 = Math.floor(xa / ss)
        const p1 = Math.min(width - 1, Math.floor((xb - 1e-9) / ss))
        for (let px = p0; px <= p1; px++) {
          const overlap = Math.min(xb, (px + 1) * ss) - Math.max(xa, px * ss)
          if (overlap > 0) acc[py * width + px]! += overlap
        }
      }
    }
    const alpha = new Uint8Array(width * height)
    const norm = 255 / (ss * ss)
    for (let i = 0; i < alpha.length; i++) alpha[i] = Math.min(255, Math.round(acc[i]! * norm))
    return { glyphId, width, height, bearingX: box.bearingX, bearingY: box.bearingY, advance, alpha }
  }
}
