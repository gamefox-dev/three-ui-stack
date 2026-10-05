import type { GlyphLayout } from '@implicit-invocation/three-2d'
import { warnOnce } from '../dev'
import type { UIDrawContext } from '../paint/DrawContext'
import { resolveEm, TEXT_METRIC_KEYS, type ComputedStyle } from '../style/computed'
import { YGEnums as E } from '../yoga/runtime'
import { paintBox } from './paintBox'
import { UINode, type NodeKind, type UINodeOptions } from './UINode'
import type { FontFace } from '../text/FontRegistry'

export interface TextOptions extends UINodeOptions {
  text?: string | undefined
}

interface ResolvedText {
  layout: GlyphLayout
  face: FontFace
}

/**
 * Text leaf. Measurement goes through Yoga's measure callback and the shared, cacheable text layout so
 * identical inputs always produce identical sizes on every platform.
 */
export class Text extends UINode {
  readonly kind: NodeKind = 'Text'
  private _text: string

  constructor(options: TextOptions = {}) {
    super(options)
    this._text = options.text ?? ''
    this._yoga.setMeasureFunc((width, widthMode, height, heightMode) => this.measure(width, widthMode, height, heightMode))
  }

  protected override get canHaveChildren(): boolean {
    return false
  }

  get text(): string {
    return this._text
  }

  setText(text: string): void {
    if (this._text === text) return
    this._text = text
    this.invalidateMeasure()
  }

  protected override onStyleApplied(prev: ComputedStyle | null, next: ComputedStyle): void {
    if (prev === null || TEXT_METRIC_KEYS.some((k) => prev[k] !== next[k])) this.invalidateMeasure()
  }

  /** Inner content width available for wrapping (rect minus padding/border). */
  private contentInsets(): { left: number; top: number; right: number; bottom: number } {
    const y = this._yoga
    return {
      left: y.getComputedPadding(E.Edge.Left) + y.getComputedBorder(E.Edge.Left),
      top: y.getComputedPadding(E.Edge.Top) + y.getComputedBorder(E.Edge.Top),
      right: y.getComputedPadding(E.Edge.Right) + y.getComputedBorder(E.Edge.Right),
      bottom: y.getComputedPadding(E.Edge.Bottom) + y.getComputedBorder(E.Edge.Bottom),
    }
  }

  private resolve(maxWidth: number): ResolvedText | null {
    const ui = this._ui
    if (!ui || !this._text) return null
    const cs = this.computedStyle
    const face = ui.fonts.resolve(cs.fontFamily, cs.fontWeight, cs.fontStyle)
    if (!face || face.sizes.length === 0) {
      warnOnce('no-fonts', 'Text rendered but no bitmap font is registered (ui.fonts.register(font)).')
      return null
    }
    const font = face.canonical
    const lineHeight = resolveEm(cs.lineHeight, cs.fontSize) ?? font.data.lineHeight * (cs.fontSize / font.size)
    const layout = ui.textLayouts.get({
      text: this._text,
      faceKey: face.key,
      font,
      fontSize: cs.fontSize,
      lineHeight,
      letterSpacing: resolveEm(cs.letterSpacing, cs.fontSize) ?? 0,
      align: cs.textAlign === 'auto' ? 'left' : cs.textAlign,
      width: maxWidth,
    })
    return { layout, face }
  }

  private measure(width: number, widthMode: number, _height: number, heightMode: number): { width: number; height: number } {
    const maxW = widthMode === E.MeasureMode.Undefined ? Infinity : width
    const r = this.resolve(maxW)
    if (!r) return { width: widthMode === E.MeasureMode.Exactly ? width : 0, height: 0 }
    let w = Math.ceil(r.layout.width * 100) / 100
    const h = Math.ceil(r.layout.height * 100) / 100
    if (widthMode === E.MeasureMode.Exactly) w = width
    else if (widthMode === E.MeasureMode.AtMost) w = Math.min(w, width)
    void heightMode
    return { width: w, height: h }
  }

  override paintSelf(ctx: UIDrawContext, x: number, y: number, w: number, h: number): void {
    const cs = this.computedStyle
    paintBox(ctx, cs, x, y, w, h)
    const ui = this._ui
    if (!ui || !this._text || cs.color.a <= 0) return
    const inset = this.contentInsets()
    const r = this.resolve(Math.max(0, w - inset.left - inset.right))
    if (!r) return
    const drawFont = r.face.pick(cs.fontSize * ui.environment.viewport.pixelRatio)
    ctx.text(r.layout, x + inset.left, y + inset.top, {
      color: cs.color,
      layoutFont: r.face.canonical,
      drawFont,
      fontSize: cs.fontSize,
    })
  }
}
