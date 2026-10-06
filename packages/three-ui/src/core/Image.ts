import type { Texture } from 'three'
import { TextureRegion, fullRegion } from '@implicit-invocation/three-2d'
import type { UIDrawContext } from '../paint/DrawContext'
import { YGEnums as E } from '../yoga/runtime'
import { cornerRadii, paintBox } from './paintBox'
import { UINode, type NodeKind, type UINodeOptions } from './UINode'

export type ImageSource = TextureRegion | Texture
export type ResizeMode = 'stretch' | 'contain' | 'cover' | 'center'

export interface ImageOptions extends UINodeOptions {
  source?: ImageSource | null | undefined
  resizeMode?: ResizeMode | undefined
  /** Source pixels per logical pixel (2 for @2x assets). */
  scale?: number | undefined
}

/** Bitmap leaf. Uses the source's intrinsic size/aspect ratio whenever width/height aren't fully constrained. */
export class Image extends UINode {
  readonly kind: NodeKind = 'Image'
  protected _source: TextureRegion | null = null
  private _resizeMode: ResizeMode
  private _scale: number

  constructor(options: ImageOptions = {}) {
    super(options)
    this._resizeMode = options.resizeMode ?? 'stretch'
    this._scale = options.scale ?? 1
    this._source = Image.toRegion(options.source)
    this._yoga.setMeasureFunc((w, wm, h, hm) => this.measureImage(w, wm, h, hm))
  }

  protected static toRegion(source: ImageSource | null | undefined): TextureRegion | null {
    if (!source) return null
    return source instanceof TextureRegion ? source : fullRegion(source)
  }

  protected override get canHaveChildren(): boolean {
    return false
  }

  get source(): TextureRegion | null {
    return this._source
  }

  setSource(source: ImageSource | null): void {
    const next = Image.toRegion(source)
    if (next === this._source) return
    const sizeChanged = !this._source || !next || this._source.regionWidth !== next.regionWidth || this._source.regionHeight !== next.regionHeight
    this._source = next
    if (sizeChanged) this.invalidateMeasure()
    else this.invalidatePaint()
  }

  get resizeMode(): ResizeMode {
    return this._resizeMode
  }

  setResizeMode(mode: ResizeMode): void {
    if (mode === this._resizeMode) return
    this._resizeMode = mode
    this.invalidatePaint()
  }

  setScale(scale: number): void {
    if (scale === this._scale) return
    this._scale = scale
    this.invalidateMeasure()
  }

  /** Intrinsic size in logical pixels (0×0 without a source). */
  protected get intrinsicWidth(): number {
    return this._source ? this._source.regionWidth / this._scale : 0
  }

  protected get intrinsicHeight(): number {
    return this._source ? this._source.regionHeight / this._scale : 0
  }

  private measureImage(width: number, widthMode: number, height: number, heightMode: number): { width: number; height: number } {
    const iw = this.intrinsicWidth
    const ih = this.intrinsicHeight
    if (iw === 0 || ih === 0) return { width: widthMode === E.MeasureMode.Exactly ? width : 0, height: heightMode === E.MeasureMode.Exactly ? height : 0 }
    const ratio = iw / ih
    const wExact = widthMode === E.MeasureMode.Exactly
    const hExact = heightMode === E.MeasureMode.Exactly
    if (wExact && hExact) return { width, height }
    if (wExact) return { width, height: width / ratio }
    if (hExact) return { width: height * ratio, height }
    let w = iw
    let h = ih
    if (widthMode === E.MeasureMode.AtMost && w > width) {
      w = width
      h = w / ratio
    }
    if (heightMode === E.MeasureMode.AtMost && h > height) {
      h = height
      w = h * ratio
    }
    return { width: w, height: h }
  }

  override paintSelf(ctx: UIDrawContext, x: number, y: number, w: number, h: number): void {
    const cs = this.computedStyle
    paintBox(ctx, cs, x, y, w, h)
    const src = this._source
    if (!src || w <= 0 || h <= 0) return
    const y_ = this._yoga
    const bl = y_.getComputedBorder(E.Edge.Left) + y_.getComputedPadding(E.Edge.Left)
    const bt = y_.getComputedBorder(E.Edge.Top) + y_.getComputedPadding(E.Edge.Top)
    const br = y_.getComputedBorder(E.Edge.Right) + y_.getComputedPadding(E.Edge.Right)
    const bb = y_.getComputedBorder(E.Edge.Bottom) + y_.getComputedPadding(E.Edge.Bottom)
    const cx = x + bl
    const cy = y + bt
    const cw = w - bl - br
    const ch = h - bt - bb
    if (cw <= 0 || ch <= 0) return
    const iw = this.intrinsicWidth
    const ih = this.intrinsicHeight
    const tint = cs.tintColor
    // images use one radius (the largest corner) — per-corner image radii would need a textured box shader
    const r = cornerRadii(cs)
    const radius = Math.max(0, Math.max(r[0], r[1], r[2], r[3]) - Math.max(bl, bt))

    // `object-fit` wins over the `resizeMode` prop
    const fit = cs.objectFit
    const mode: ResizeMode | 'scale-down' = fit === undefined ? this._resizeMode : fit === 'fill' ? 'stretch' : fit === 'none' ? 'center' : fit
    // destination rect + source crop (UV fractions) for the chosen fit
    let dx = cx
    let dy = cy
    let dw = cw
    let dh = ch
    let crop: { u: number; v: number; u2: number; v2: number } | undefined
    switch (mode) {
      case 'contain':
      case 'scale-down': {
        const s = mode === 'scale-down' ? Math.min(1, cw / iw, ch / ih) : Math.min(cw / iw, ch / ih)
        dw = iw * s
        dh = ih * s
        dx = cx + (cw - dw) / 2
        dy = cy + (ch - dh) / 2
        break
      }
      case 'cover': {
        const s = Math.max(cw / iw, ch / ih)
        const vw = cw / s / iw // visible fraction of the source
        const vh = ch / s / ih
        const u = (1 - vw) / 2
        const v = (1 - vh) / 2
        crop = { u, v, u2: u + vw, v2: v + vh }
        break
      }
      case 'center': {
        const vw = Math.min(1, cw / iw)
        const vh = Math.min(1, ch / ih)
        dw = iw * vw
        dh = ih * vh
        dx = cx + (cw - dw) / 2
        dy = cy + (ch - dh) / 2
        const u = (1 - vw) / 2
        const v = (1 - vh) / 2
        crop = { u, v, u2: u + vw, v2: v + vh }
        break
      }
      default:
    }
    const imageRadius = radius

    // `drop-shadow()`: a tinted, offset copy of the alpha silhouette underneath (blur is not applied — see the README)
    const shadows = cs.dropShadow
    for (let i = shadows.length - 1; i >= 0; i--) {
      const s = shadows[i]!
      if (s.color.a <= 0) continue
      ctx.image(src, { x: dx + s.offsetX, y: dy + s.offsetY, width: dw, height: dh }, { tint: s.color, radius: imageRadius, silhouette: true, ...(crop ? { crop } : {}) })
    }
    ctx.image(src, { x: dx, y: dy, width: dw, height: dh }, { tint, radius: imageRadius, ...(crop ? { crop } : {}) })
  }
}
