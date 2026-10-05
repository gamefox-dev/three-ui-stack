/** One outline command in font units, y-up (as stored in the font). */
export type PathCommand =
  | { type: 'M' | 'L'; x: number; y: number }
  | { type: 'Q'; x1: number; y1: number; x: number; y: number }
  | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { type: 'Z' }

export interface ParsedGlyph {
  /** Font glyph ID (not a Unicode code point). */
  id: number
  advanceWidth: number
  /** Outline in font units, y-up. */
  path: readonly PathCommand[]
}

/** Parser-independent font description. No opentype.js objects leak out of the parser adapter. */
export interface ParsedFont {
  familyName: string
  styleName: string
  weight: number
  unitsPerEm: number
  /** hhea metrics in font units. */
  ascender: number
  descender: number
  lineGap: number
  glyphCount: number
  /** Unicode code point → glyph ID (0 / undefined when not mapped). */
  glyphIdForCodePoint(codePoint: number): number
  glyph(id: number): ParsedGlyph
  /** Pair kerning in font units (0 when unavailable). */
  kerning(leftGlyphId: number, rightGlyphId: number): number
}

export interface FontParser {
  parse(data: ArrayBuffer): ParsedFont
}

export interface GlyphRequest {
  glyphId: number
}

export interface RasterizeOptions {
  /** Em size in pixels the glyph bitmaps are baked at. */
  size: number
  /** Supersampling factor (default 4). */
  supersample?: number
  /** Transparent pixels added around every glyph bitmap (default 1). */
  padding?: number
  mode?: 'bitmap'
}

export interface RasterizedGlyph {
  glyphId: number
  /** Bitmap size in pixels (includes padding). May be 0×0 for blank glyphs such as space. */
  width: number
  height: number
  /** Pen origin → left edge of the bitmap, pixels. */
  bearingX: number
  /** Baseline → top edge of the bitmap, pixels (+up). */
  bearingY: number
  /** Unrounded advance, pixels. */
  advance: number
  /** Coverage 0..255, row-major, top row first. Length `width * height`. */
  alpha: Uint8Array
}

export interface GlyphRasterizer {
  rasterize(font: ParsedFont, glyphs: readonly GlyphRequest[], options: RasterizeOptions): Promise<readonly RasterizedGlyph[]>
}

export type BitmapFontMode = 'bitmap' | 'sdf' | 'msdf'
