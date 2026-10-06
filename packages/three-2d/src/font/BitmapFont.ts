import type { Texture } from 'three'
import type { SpriteBatch } from '../batch/SpriteBatch'
import { parseColor, Color4 } from '../color'
import type { ColorLike, Disposable } from '../types'
import { BitmapFontData } from './BitmapFontData'
import { GlyphLayout, type GlyphLayoutOptions } from './GlyphLayout'

export interface FontDrawOptions extends GlyphLayoutOptions {
  color?: ColorLike
}

/** A bitmap font atlas (texture) plus its metrics. Draws through a `SpriteBatch`. */
export class BitmapFont implements Disposable {
  readonly data: BitmapFontData
  readonly texture: Texture
  private readonly scratch = new GlyphLayout()
  private readonly tmp = new Color4()
  private disposed = false

  constructor(data: BitmapFontData | unknown, texture: Texture) {
    this.data = data instanceof BitmapFontData ? data : BitmapFontData.parse(data)
    this.texture = texture
  }

  get size(): number {
    return this.data.size
  }

  get lineHeight(): number {
    return this.data.lineHeight
  }

  hasGlyph(codePoint: number): boolean {
    return this.data.chars.has(codePoint)
  }

  /** Lay out `text` into `target` (or an internal scratch layout) without drawing. */
  layout(text: string, options?: GlyphLayoutOptions, target: GlyphLayout = this.scratch): GlyphLayout {
    return target.setText(this, text, options)
  }

  measure(text: string, options?: GlyphLayoutOptions): { width: number; height: number } {
    const l = this.layout(text, options)
    return { width: l.width, height: l.height }
  }

  /**
   * Draw `text` with its top-left at `(x, y)` (y-down). Pass a prebuilt `GlyphLayout` to avoid
   * re-layout. Uses the batch tint unless `options.color` is set.
   */
  draw(batch: SpriteBatch, text: string | GlyphLayout, x: number, y: number, options?: FontDrawOptions): void {
    const layout = typeof text === 'string' ? this.layout(text, options) : text
    let restore: Color4 | null = null
    if (options?.color !== undefined) {
      restore = this.tmp.copy(batch.color)
      batch.setColor(options.color)
    }
    const { glyphs, quads } = layout
    const tex = this.texture
    for (let i = 0; i < glyphs.length; i++) {
      const g = glyphs[i]!
      const w = quads[i * 4 + 2]!
      if (w <= 0 || g.width === 0) continue
      batch.drawGlyph(tex, x + quads[i * 4]!, y + quads[i * 4 + 1]!, w, quads[i * 4 + 3]!, g.u, g.v, g.u2, g.v2)
    }
    batch.stats.glyphs += glyphs.length
    if (restore) batch.setColorRGBA(restore.r, restore.g, restore.b, restore.a)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.texture.dispose()
  }

  static fromJSON(json: unknown, texture: Texture): BitmapFont {
    return new BitmapFont(BitmapFontData.parse(json), texture)
  }
}

export { parseColor }
