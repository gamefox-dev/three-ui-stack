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
  /** Maximum number of lines; extra text is dropped (see `ellipsis`). */
  maxLines?: number
  /** `false` keeps every paragraph on one line (CSS `white-space: nowrap`). Default true. */
  wrap?: boolean
  /**
   * Replace what does not fit (text cut off by `maxLines`, or a nowrap line wider than `width`) with `…`
   * (`...` when the font lacks it). Default false.
   */
  ellipsis?: boolean
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

  /** True when `maxLines` cut off text (even if no ellipsis was requested). */
  truncated = false

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
    const maxLines = options.maxLines && options.maxLines > 0 ? options.maxLines : Infinity
    const wrapWidth = options.wrap === false ? Infinity : maxWidth
    this.truncated = false

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
      lineCount = this.layoutParagraph(font, text, p, q, scale, spacing, wrapWidth, lineY, lineHeight, maxLines, lineCount)
      lineY = lineCount * lineHeight
      p = q + 1
      if (q === n) break
    }
    // text that never got a line (maxLines reached before the end of the string)
    if (p <= n && lineCount >= maxLines && text.slice(p).trim() !== '') this.truncated = true
    if (options.ellipsis && Number.isFinite(maxWidth)) this.applyEllipsis(font, scale, spacing, maxWidth, maxLines)
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
    if (start < count) this.truncated = true
    return lineCount
  }

  /**
   * Ellipsis pass: the last line when `maxLines` cut text off, and any line wider than `maxWidth` (nowrap).
   * Glyphs are removed from the end of the line until `…` fits.
   */
  private applyEllipsis(font: BitmapFont, scale: number, spacing: number, maxWidth: number, maxLines: number): void {
    const data = font.data
    const dot = data.glyphForCodePoint(0x2026)
    const ell = dot ? [dot] : (() => {
      const p = data.glyphForCodePoint(0x2e)
      return p ? [p, p, p] : []
    })()
    if (ell.length === 0) return
    let ellWidth = 0
    for (const g of ell) ellWidth += g.xAdvance * scale + spacing
    ellWidth -= spacing
    for (let li = this.lines.length - 1; li >= 0; li--) {
      const line = this.lines[li]!
      const last = li === this.lines.length - 1
      const cutOff = last && this.truncated && this.lines.length >= maxLines
      const overflow = line.width > maxWidth + 0.01
      if (!cutOff && !overflow) continue
      // pen position at the start of glyph i (before alignment)
      const pen = (i: number): number => this.quads[i * 4]! - this.glyphs[i]!.xOffset * scale
      let k = line.end
      // when text was cut off but the line has room, only the ellipsis is appended
      let penEnd = line.width
      while (k > line.start && (penEnd + ellWidth > maxWidth + 0.01 || (k < line.end && this.glyphs[k - 1]!.id === data.glyphForCodePoint(32)?.id))) {
        k--
        penEnd = pen(k)
      }
      // never leave dangling spaces before the ellipsis
      while (k > line.start && data.glyphForCodePoint(32) && this.glyphs[k - 1]!.id === data.glyphForCodePoint(32)!.id) {
        k--
        penEnd = pen(k)
      }
      const removed = line.end - k
      const addGlyphs: Glyph[] = []
      const addQuads: number[] = []
      let x = penEnd
      for (const g of ell) {
        addGlyphs.push(g)
        addQuads.push(x + g.xOffset * scale, line.y + g.yOffset * scale, g.width * scale, g.height * scale)
        x += g.xAdvance * scale + spacing
      }
      this.glyphs.splice(k, removed, ...addGlyphs)
      this.quads.splice(k * 4, removed * 4, ...addQuads)
      const delta = addGlyphs.length - removed
      line.end = k + addGlyphs.length
      line.width = penEnd + ellWidth
      for (let j = li + 1; j < this.lines.length; j++) {
        this.lines[j]!.start += delta
        this.lines[j]!.end += delta
      }
    }
    let widest = 0
    for (const l of this.lines) if (l.width > widest) widest = l.width
    this.width = widest
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
