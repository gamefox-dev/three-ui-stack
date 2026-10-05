import { GlyphLayout, type BitmapFont, type TextAlign } from '@implicit-invocation/three-2d'

export interface TextLayoutParams {
  text: string
  faceKey: string
  font: BitmapFont
  fontSize: number
  lineHeight: number
  letterSpacing: number
  align: TextAlign
  /** Wrap width; `Infinity` for no wrapping. */
  width: number
}

/**
 * Deterministic, cacheable text layout keyed by text, font identity, size/style, width constraint and
 * wrapping/alignment options (spec §10.6).
 */
export class TextLayoutCache {
  private readonly map = new Map<string, GlyphLayout>()
  hits = 0
  misses = 0

  constructor(private readonly capacity = 2048) {}

  get(p: TextLayoutParams): GlyphLayout {
    const w = Number.isFinite(p.width) ? Math.round(p.width * 100) / 100 : 'inf'
    const key = `${p.faceKey}|${p.fontSize}|${p.lineHeight}|${p.letterSpacing}|${p.align}|${w}|${p.text}`
    let layout = this.map.get(key)
    if (layout) {
      this.hits++
      return layout
    }
    this.misses++
    if (this.map.size >= this.capacity) {
      // drop the oldest half (Map preserves insertion order)
      let n = this.capacity >> 1
      for (const k of this.map.keys()) {
        if (n-- <= 0) break
        this.map.delete(k)
      }
    }
    layout = new GlyphLayout().setText(p.font, p.text, {
      scale: p.fontSize / p.font.size,
      width: p.width,
      align: p.align,
      lineHeight: p.lineHeight,
      letterSpacing: p.letterSpacing,
    })
    this.map.set(key, layout)
    return layout
  }

  get size(): number {
    return this.map.size
  }

  clear(): void {
    this.map.clear()
  }
}
