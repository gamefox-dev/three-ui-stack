import type { BitmapFont } from './BitmapFont'
import type { Glyph } from './BitmapFontData'

export type TextAlign = 'left' | 'center' | 'right'

export interface GlyphLayoutOptions {
  /** Scale applied to font metrics (`fontSize / font.data.size`). Default 1. */
  scale?: number
  /** Wrap width in layout units; omitted/Infinity disables wrapping. */
  width?: number
  align?: TextAlign
  /** Absolute line height in layout units (default: font line height × scale). */
  lineHeight?: number
  /** Extra advance after every glyph. */
  letterSpacing?: number
  /** Maximum number of lines; extra text is dropped (no ellipsis yet). */
  maxLines?: number
}

export interface LayoutLine {
  /** Glyph index range in `GlyphLayout.glyphs` */
  start: number
  end: number
  x: number
  y: number
  width: number
}

/**
 * Positioned glyph run. Reusable: `setText()` clears and refills internal arrays so a layout can be
 * re-laid-out every frame without allocating.
 */
export class GlyphLayout {
  /** Glyph refs, parallel to `quads` (x, y, w, h per glyph, relative to the layout origin, +y down). */
  glyphs: Glyph[] = []
  quads: number[] = []
  lines: LayoutLine[] = []
  width = 0
  height = 0
  lineHeight = 0
  /** Distance from the first line top to its baseline. */
  baseline = 0

  private adv: number[] = []
  private kernAdj: number[] = []
  private gl: Glyph[] = []
  private isSpace: boolean[] = []

  get glyphCount(): number {
    return this.glyphs.length
  }

  setText(font: BitmapFont, text: string, options: GlyphLayoutOptions = {}): this {
    const data = font.data
    const scale = options.scale ?? 1
    const maxWidth = options.width ?? Infinity
    const spacing = options.letterSpacing ?? 0
    const lineHeight = options.lineHeight ?? data.lineHeight * scale
    const align = options.align ?? 'left'
    const maxLines = options.maxLines ?? Infinity

    this.glyphs.length = 0
    this.quads.length = 0
    this.lines.length = 0
    this.lineHeight = lineHeight
    // center the baseline in the line box when the caller overrides the line height
    this.baseline = data.ascent * scale + (lineHeight - data.lineHeight * scale) / 2

    let lineY = 0
    let maxLineWidth = 0
    let lineCount = 0

    let p = 0
    const n = text.length
    while (p <= n && lineCount < maxLines) {
      let q = text.indexOf('\n', p)
      if (q < 0) q = n
      lineCount = this.layoutParagraph(font, text, p, q, scale, spacing, maxWidth, lineY, lineHeight, maxLines, lineCount)
      lineY = lineCount * lineHeight
      p = q + 1
      if (q === n) break
    }
    for (const l of this.lines) if (l.width > maxLineWidth) maxLineWidth = l.width
    this.width = maxLineWidth
    this.height = this.lines.length * lineHeight

    // alignment + final quad positions
    const container = Number.isFinite(maxWidth) ? Math.max(maxWidth, maxLineWidth) : maxLineWidth
    for (const line of this.lines) {
      const offset = align === 'center' ? (container - line.width) / 2 : align === 'right' ? container - line.width : 0
      line.x = offset
      for (let i = line.start; i < line.end; i++) this.quads[i * 4]! += offset
    }
    return this
  }

  private layoutParagraph(
    font: BitmapFont,
    text: string,
    from: number,
    to: number,
    scale: number,
    spacing: number,
    maxWidth: number,
    lineY0: number,
    lineHeight: number,
    maxLines: number,
    lineCountIn: number,
  ): number {
    const data = font.data
    const gl = this.gl
    const adv = this.adv
    const kernAdj = this.kernAdj
    const isSpace = this.isSpace
    let count = 0
    let prevId = -1
    for (let i = from; i < to; ) {
      const cp = text.codePointAt(i)!
      i += cp > 0xffff ? 2 : 1
      if (cp === 13) continue
      let g = data.glyphForCodePoint(cp)
      if (!g) g = data.fallbackGlyph
      if (!g) continue
      const kern = prevId >= 0 ? data.kern(prevId, g.id) * scale : 0
      gl[count] = g
      kernAdj[count] = kern
      adv[count] = g.xAdvance * scale + spacing + kern
      isSpace[count] = cp === 32 || cp === 9 || cp === 0xa0
      prevId = g.id
      count++
    }

    let lineCount = lineCountIn
    if (count === 0) {
      this.pushLine(0, lineY0)
      return lineCount + 1
    }

    let start = 0
    while (start < count && lineCount < maxLines) {
      // greedy fit
      let width = 0
      let end = start
      let lastBreak = -1
      let widthAtBreak = 0
      let i = start
      for (; i < count; i++) {
        const a = adv[i]! - (i === start ? kernAdj[i]! : 0)
        if (!isSpace[i] && width + a > maxWidth + 0.001 && i > start) break
        width += a
        if (isSpace[i]) {
          lastBreak = i + 1
          widthAtBreak = width
        }
      }
      let lineEnd: number
      let lineWidth: number
      let next: number
      if (i >= count) {
        lineEnd = count
        lineWidth = width
        next = count
      } else if (lastBreak > start) {
        lineEnd = lastBreak
        lineWidth = widthAtBreak
        next = lastBreak
      } else {
        lineEnd = i
        lineWidth = width
        next = i
      }
      // trim trailing spaces from the visible width
      let trimmedEnd = lineEnd
      while (trimmedEnd > start && isSpace[trimmedEnd - 1]) {
        lineWidth -= adv[trimmedEnd - 1]! - (trimmedEnd - 1 === start ? kernAdj[start]! : 0)
        trimmedEnd--
      }
      this.emitLine(scale, spacing, start, trimmedEnd, lineWidth, lineY0 + (lineCount - lineCountIn) * lineHeight)
      lineCount++
      // skip spaces at the start of the next line
      start = next
      while (start < count && isSpace[start]! && next !== lineEnd) start++
    }
    return lineCount
  }

  private pushLine(width: number, y: number): void {
    const at = this.glyphs.length
    this.lines.push({ start: at, end: at, x: 0, y, width })
  }

  private emitLine(scale: number, spacing: number, from: number, to: number, width: number, y: number): void {
    const base = this.glyphs.length
    let pen = 0
    for (let i = from; i < to; i++) {
      const g = this.gl[i]!
      if (i > from) pen += this.kernAdj[i]!
      this.glyphs.push(g)
      this.quads.push(pen + g.xOffset * scale, y + g.yOffset * scale, g.width * scale, g.height * scale)
      pen += g.xAdvance * scale + spacing
    }
    this.lines.push({ start: base, end: this.glyphs.length, x: 0, y, width })
  }
}
