import {
  BITMAP_FONT_FORMAT,
  BITMAP_FONT_VERSION,
  type BitmapFontJSON,
  type BitmapGlyphJSON,
} from 'three-2d'
import { resolveCharacters, type CharsetName } from './charsets'
import { AtlasPacker } from './pack/AtlasPacker'
import { OpenTypeFontParser } from './parser'
import { CpuGlyphRasterizer } from './rasterizer/CpuGlyphRasterizer'
import type { FontParser, GlyphRasterizer, ParsedFont, RasterizedGlyph } from './types'

export interface BakeOptions {
  /** Em size in pixels to bake at. */
  size: number
  /** Preset name (`latin`, `ascii`, `digits`), a literal string of characters, or code points. Default `latin`. */
  characters?: CharsetName | string | Iterable<number>
  /** Supersampling factor for the rasterizer (default 4). */
  supersample?: number
  /** Transparent border around every glyph bitmap (default 2, good for mipmapped minification). */
  padding?: number
  /** Gap between glyphs in the atlas (default 1). */
  spacing?: number
  maxAtlasSize?: number
  family?: string
  style?: string
  weight?: number
  /** File name recorded in the JSON `atlas.image` field. */
  imageName?: string
  parser?: FontParser
  /** Defaults to the portable CPU rasterizer; pass a `ThreeGlyphRasterizer` to bake on the GPU. */
  rasterizer?: GlyphRasterizer
}

export interface BakedBitmapFont {
  json: BitmapFontJSON
  atlas: {
    width: number
    height: number
    /** RGBA8, rgb = white, alpha = glyph coverage. */
    rgba: Uint8Array
  }
}

const round2 = (v: number) => Math.round(v * 100) / 100

/**
 * Font bytes → glyph bitmaps → packed atlas pixels + versioned JSON metrics.
 * Pure: no DOM, no files, no GPU unless a GPU rasterizer is supplied.
 */
export async function bakeBitmapFont(data: ArrayBuffer, options: BakeOptions): Promise<BakedBitmapFont> {
  const parser = options.parser ?? new OpenTypeFontParser()
  const rasterizer = options.rasterizer ?? new CpuGlyphRasterizer()
  const font = parser.parse(data)
  const size = options.size
  const padding = options.padding ?? 2
  const spacing = options.spacing ?? 1

  const codePoints = resolveCharacters(options.characters)
  const chars: Record<string, number> = {}
  const glyphIds = new Set<number>([0])
  for (const cp of codePoints) {
    const id = font.glyphIdForCodePoint(cp)
    if (id > 0 || cp === 0x20) {
      chars[String(cp)] = id
      glyphIds.add(id)
    }
  }
  const ids = [...glyphIds].sort((a, b) => a - b)

  const rasterized = await rasterizer.rasterize(font, ids.map((glyphId) => ({ glyphId })), {
    size,
    supersample: options.supersample ?? 4,
    padding,
    mode: 'bitmap',
  })
  const byId = new Map<number, RasterizedGlyph>(rasterized.map((g) => [g.glyphId, g]))

  const packed = AtlasPacker.pack(
    rasterized.map((g) => ({ id: g.glyphId, width: g.width, height: g.height })),
    { spacing, maxWidth: options.maxAtlasSize ?? 4096, maxHeight: options.maxAtlasSize ?? 4096 },
  )
  const rgba = new Uint8Array(packed.width * packed.height * 4)
  const where = new Map(packed.placements.map((p) => [p.id, p]))

  const scale = size / font.unitsPerEm
  const ascent = Math.round(font.ascender * scale)
  const descent = Math.round(-font.descender * scale)
  const lineHeight = Math.round((font.ascender - font.descender + font.lineGap) * scale)

  const glyphs: BitmapGlyphJSON[] = []
  for (const id of ids) {
    const g = byId.get(id)!
    const p = where.get(id)!
    for (let y = 0; y < g.height; y++) {
      for (let x = 0; x < g.width; x++) {
        const o = ((p.y + y) * packed.width + p.x + x) * 4
        rgba[o] = 255
        rgba[o + 1] = 255
        rgba[o + 2] = 255
        rgba[o + 3] = g.alpha[y * g.width + x]!
      }
    }
    glyphs.push({
      id,
      x: g.width ? p.x : 0,
      y: g.height ? p.y : 0,
      width: g.width,
      height: g.height,
      xOffset: g.bearingX,
      yOffset: ascent - g.bearingY,
      xAdvance: round2(g.advance),
    })
  }

  const kerning = collectKerning(font, ids.filter((id) => id !== 0), scale)

  const json: BitmapFontJSON = {
    format: BITMAP_FONT_FORMAT,
    version: BITMAP_FONT_VERSION,
    family: options.family ?? font.familyName,
    style: options.style ?? font.styleName,
    weight: options.weight ?? font.weight,
    mode: 'bitmap',
    size,
    lineHeight,
    ascent,
    descent,
    atlas: {
      width: packed.width,
      height: packed.height,
      padding,
      ...(options.imageName ? { image: options.imageName } : {}),
    },
    chars,
    glyphs,
    kerning,
  }
  return { json, atlas: { width: packed.width, height: packed.height, rgba } }
}

function collectKerning(font: ParsedFont, ids: number[], scale: number): [number, number, number][] {
  const out: [number, number, number][] = []
  for (const l of ids) {
    for (const r of ids) {
      const k = font.kerning(l, r)
      if (k !== 0) out.push([l, r, round2(k * scale)])
    }
  }
  return out
}
