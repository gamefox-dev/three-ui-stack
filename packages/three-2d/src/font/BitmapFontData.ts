export const BITMAP_FONT_FORMAT = 'three-2d-bitmap-font'
export const BITMAP_FONT_VERSION = 1

export type BitmapFontMode = 'bitmap' | 'sdf' | 'msdf'

/** Serialized glyph entry. Atlas entries are keyed by font glyph ID (not only Unicode). */
export interface BitmapGlyphJSON {
  /** Font glyph ID. */
  id: number
  /** Atlas rectangle in pixels (origin top-left). */
  x: number
  y: number
  width: number
  height: number
  /** Offset from pen position / line top to the bitmap's top-left (pixels, +y down). */
  xOffset: number
  yOffset: number
  xAdvance: number
}

/** Versioned on-disk / over-the-wire format produced by `@implicit-invocation/three-2d-font` and consumed by `BitmapFont`. */
export interface BitmapFontJSON {
  format: typeof BITMAP_FONT_FORMAT
  version: typeof BITMAP_FONT_VERSION
  family: string
  style: string
  weight: number
  mode: BitmapFontMode
  /** Pixel size (em) the atlas was baked at. */
  size: number
  /** Distance between baselines, pixels. */
  lineHeight: number
  /** Distance from line top to the baseline, pixels. */
  ascent: number
  descent: number
  atlas: { width: number; height: number; image?: string; padding?: number }
  /**
   * Present when the atlas' red channel holds a signed distance field (glyph coverage stays in alpha):
   * `maxWidth` is the widest `text-stroke` (px at `size`) the field can render. Optional, so version-1 files stay valid.
   */
  stroke?: { maxWidth: number }
  /** Unicode code point (as decimal string) → glyph ID. */
  chars: Record<string, number>
  glyphs: BitmapGlyphJSON[]
  /** `[leftGlyphId, rightGlyphId, advanceAdjustmentPx]` */
  kerning: [number, number, number][]
}

export interface Glyph extends BitmapGlyphJSON {
  u: number
  v: number
  u2: number
  v2: number
}

/** Parsed, indexed bitmap font metrics. Round-trips losslessly through `toJSON()`. */
export class BitmapFontData {
  readonly glyphs = new Map<number, Glyph>()
  readonly chars = new Map<number, number>()
  readonly kerning = new Map<number, number>()
  fallbackGlyph: Glyph | undefined

  constructor(public readonly json: BitmapFontJSON) {
    const { atlas } = json
    for (const g of json.glyphs) {
      this.glyphs.set(g.id, {
        ...g,
        u: g.x / atlas.width,
        v: g.y / atlas.height,
        u2: (g.x + g.width) / atlas.width,
        v2: (g.y + g.height) / atlas.height,
      })
    }
    for (const [cp, id] of Object.entries(json.chars)) this.chars.set(Number(cp), id)
    for (const [l, r, amount] of json.kerning) this.kerning.set(kernKey(l, r), amount)
    this.fallbackGlyph = this.glyphForCodePoint(0xfffd) ?? this.glyphForCodePoint(63) ?? this.glyphs.get(0)
  }

  get family(): string {
    return this.json.family
  }
  get style(): string {
    return this.json.style
  }
  get weight(): number {
    return this.json.weight
  }
  get size(): number {
    return this.json.size
  }
  get lineHeight(): number {
    return this.json.lineHeight
  }
  get ascent(): number {
    return this.json.ascent
  }
  get descent(): number {
    return this.json.descent
  }
  /** Widest text stroke (px at the baked size) the distance channel supports, or 0 when the font has no stroke channel. */
  get strokeMaxWidth(): number {
    return this.json.stroke?.maxWidth ?? 0
  }

  glyphForCodePoint(cp: number): Glyph | undefined {
    const id = this.chars.get(cp)
    return id === undefined ? undefined : this.glyphs.get(id)
  }

  kern(leftGlyphId: number, rightGlyphId: number): number {
    return this.kerning.get(kernKey(leftGlyphId, rightGlyphId)) ?? 0
  }

  toJSON(): BitmapFontJSON {
    return this.json
  }

  static parse(input: string | unknown): BitmapFontData {
    const json = (typeof input === 'string' ? JSON.parse(input) : input) as Partial<BitmapFontJSON>
    if (json.format !== BITMAP_FONT_FORMAT) {
      throw new Error(`[three-2d] not a ${BITMAP_FONT_FORMAT} file (format = ${String(json.format)})`)
    }
    if (json.version !== BITMAP_FONT_VERSION) {
      throw new Error(`[three-2d] unsupported ${BITMAP_FONT_FORMAT} version ${String(json.version)}`)
    }
    return new BitmapFontData(json as BitmapFontJSON)
  }
}

function kernKey(l: number, r: number): number {
  return l * 65536 + r
}
