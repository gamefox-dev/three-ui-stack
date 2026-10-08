import { Color4, TextureRegion, type Radii4, type Affine2, type BatchSegment, type GlyphLayout, type NinePatch, type PolygonSpriteBatch, type Rect } from '@implicit-invocation/three-2d'
import { warnOnce } from '../dev'
import type { BackdropPaint, BoxPaint, ImagePaint, NinePatchPaint, RectPaint, ShadowPaint, TextPaint, UIDrawContext } from './DrawContext'

export interface PaintCounters {
  paintOps: number
}

const WHITE = new Color4(1, 1, 1, 1)

/**
 * `UIDrawContext` backed by a `@implicit-invocation/three-2d` batch. Every UI primitive becomes quads in the batch's
 * dynamic buffer — nodes never own Three objects.
 */
export class BatchDrawContext implements UIDrawContext {
  private opacity = 1
  private scratchRegion: TextureRegion | null = null
  private readonly opacityStack: number[] = []
  /** Snap text origins to this grid (1 / pixelRatio) for crisp glyphs. */
  snap = 1

  constructor(
    readonly batch: PolygonSpriteBatch,
    readonly counters: PaintCounters,
  ) {}

  /** @internal Parent multiplier before this node's optional opacity push (for retained bitmap fades). */
  inheritedOpacity(pushed: boolean): number {
    return pushed ? this.opacityStack[this.opacityStack.length - 1]! : this.opacity
  }

  /** Reset per-frame state; call after `batch.begin()`. */
  reset(): void {
    this.opacity = 1
    this.opacityStack.length = 0
  }

  rect(rect: Rect, paint: RectPaint): void {
    const c = paint.color
    const bw = paint.borderWidth ?? 0
    const bc = paint.borderColor
    const hasFill = c !== undefined && c.a > 0
    const hasBorder = bw > 0 && bc !== undefined && bc.a > 0
    if (!hasFill && !hasBorder) return
    this.counters.paintOps++
    const radius = paint.radius ?? 0
    const o = this.opacity
    this.batch.fillRect(rect.x, rect.y, rect.width, rect.height, {
      color: hasFill ? { r: c!.r, g: c!.g, b: c!.b, a: c!.a * o } : { r: 0, g: 0, b: 0, a: 0 },
      radius,
      borderWidth: hasBorder ? bw : 0,
      borderColor: hasBorder ? { r: bc!.r, g: bc!.g, b: bc!.b, a: bc!.a * o } : { r: 0, g: 0, b: 0, a: 0 },
    })
  }

  box(rect: Rect, paint: BoxPaint): void {
    this.counters.paintOps++
    this.batch.fillBox({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      radii: paint.radii,
      ...(paint.borderWidths ? { borderWidths: paint.borderWidths } : {}),
      ...(paint.borderColor ? { borderColor: paint.borderColor } : {}),
      ...(paint.background ? { background: paint.background } : {}),
      ...(paint.gradient ? { gradient: paint.gradient } : {}),
      opacity: this.opacity,
    })
  }

  backdrop(rect: Rect, paint: BackdropPaint): void {
    if (this.batch.fillBackdrop({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, radii: paint.radii, blur: paint.blur, brightness: paint.brightness, saturate: paint.saturate, opacity: this.opacity })) {
      this.counters.paintOps++
    }
  }

  shadow(rect: Rect, paint: ShadowPaint): void {
    this.counters.paintOps++
    this.batch.fillShadow({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      radii: paint.radii,
      ...(paint.borderWidths ? { borderWidths: paint.borderWidths } : {}),
      offsetX: paint.offsetX,
      offsetY: paint.offsetY,
      blur: paint.blur,
      spread: paint.spread,
      color: paint.color,
      inset: paint.inset,
      opacity: this.opacity,
    })
  }

  image(region: TextureRegion, rect: Rect, paint: ImagePaint = {}): void {
    this.counters.paintOps++
    const t = paint.tint ?? WHITE
    const batch = this.batch
    const crop = paint.crop
    let u = region.u
    let v = region.v
    let u2 = region.u2
    let v2 = region.v2
    if (crop) {
      const du = region.u2 - region.u
      const dv = region.v2 - region.v
      u = region.u + du * crop.u
      u2 = region.u + du * crop.u2
      v = region.v + dv * crop.v
      v2 = region.v + dv * crop.v2
    }
    if (paint.flipX) [u, u2] = [u2, u]
    if (paint.flipY) [v, v2] = [v2, v]
    const radius = paint.radius ?? 0
    const prev = batch.color
    const pr = prev.r
    const pg = prev.g
    const pb = prev.b
    const pa = prev.a
    batch.setColorRGBA(t.r, t.g, t.b, t.a * this.opacity)
    if (radius > 0 || paint.silhouette) {
      const scratch = (this.scratchRegion ??= new TextureRegion(region.texture))
      scratch.texture = region.texture
      scratch.u = u
      scratch.v = v
      scratch.u2 = u2
      scratch.v2 = v2
      batch.drawEx(scratch, { x: rect.x, y: rect.y, width: rect.width, height: rect.height, radius, ...(paint.silhouette ? { silhouette: true } : {}) })
    } else {
      batch.drawUV(region.texture, rect.x, rect.y, rect.width, rect.height, u, v, u2, v2)
    }
    batch.setColorRGBA(pr, pg, pb, pa)
  }

  ninePatch(patch: NinePatch, rect: Rect, paint: NinePatchPaint = {}): void {
    this.counters.paintOps++
    const batch = this.batch
    const prev = batch.color
    const pr = prev.r
    const pg = prev.g
    const pb = prev.b
    const pa = prev.a
    const t = paint.tint ?? WHITE
    batch.setColorRGBA(t.r, t.g, t.b, t.a * this.opacity)
    patch.draw(batch, rect.x, rect.y, rect.width, rect.height, paint.scale ?? patch.scale)
    batch.setColorRGBA(pr, pg, pb, pa)
  }

  text(layout: GlyphLayout, x: number, y: number, paint: TextPaint): void {
    const n = layout.glyphs.length
    if (n === 0) return
    this.counters.paintOps++
    const batch = this.batch
    const snap = this.snap
    x = Math.round(x / snap) * snap
    y = Math.round(y / snap) * snap
    const prev = batch.color
    const pr = prev.r
    const pg = prev.g
    const pb = prev.b
    const pa = prev.a
    const fx = paint.effects
    const o = this.opacity
    const c = paint.color
    if (!fx) {
      batch.setColorRGBA(c.r, c.g, c.b, c.a * o)
      this.glyphPass(layout, x, y, paint, 0, 0, 0, 0, true)
      batch.setColorRGBA(pr, pg, pb, pa)
      return
    }

    const { drawFont, fontSize } = paint
    const sdf = drawFont.data.strokeMaxWidth > 0
    const R = drawFont.data.strokeMaxWidth / 2 + 1 // distance range in baked texels
    const texPerPx = drawFont.size / fontSize
    const maxRho = drawFont.data.strokeMaxWidth / 2

    let rho = 0
    if (fx.strokeWidth > 0 && fx.strokeColor.a > 0) {
      if (!sdf) {
        warnOnce(`no-stroke-channel-${drawFont.data.family}`, `text stroke requested but font "${drawFont.data.family}" has no stroke channel (bake it with three-2d-font --stroke); stroke ignored`)
      } else {
        rho = (fx.strokeWidth / 2) * texPerPx
        if (rho > maxRho + 0.01) {
          warnOnce(
            `stroke-clamp-${drawFont.data.family}-${drawFont.size}`,
            `text stroke ${fx.strokeWidth}px exceeds what font "${drawFont.data.family}" ${drawFont.size}px was baked for (${((maxRho * 2) / texPerPx).toFixed(1)}px at this size); clamped`,
          )
          rho = maxRho
        }
      }
    }
    const hasStroke = rho > 0

    // shadows first (last listed = lowest), each a copy of the glyphs through the distance channel (blur = threshold softness)
    for (let i = fx.shadows.length - 1; i >= 0; i--) {
      const s = fx.shadows[i]!
      if (s.color.a <= 0) continue
      batch.setColorRGBA(s.color.r, s.color.g, s.color.b, s.color.a * o)
      if (sdf) {
        const blurTexels = Math.min(s.blur * texPerPx, 2 * R)
        const edge = 0.5 - (hasStroke ? rho : 0) / (2 * R)
        this.glyphPass(layout, x + s.offsetX, y + s.offsetY, paint, 1, edge, blurTexels / (2 * R), 9, false)
      } else {
        this.glyphPass(layout, x + s.offsetX, y + s.offsetY, paint, 0, 0, 0, 0, false)
      }
    }

    const sc = fx.strokeColor
    if (hasStroke && fx.strokeUnder) {
      batch.setColorRGBA(sc.r, sc.g, sc.b, sc.a * o)
      this.glyphPass(layout, x, y, paint, 1, 0.5 - rho / (2 * R), 0, 9, false)
    }
    batch.setColorRGBA(c.r, c.g, c.b, c.a * o)
    this.glyphPass(layout, x, y, paint, 0, 0, 0, 0, true)
    if (hasStroke && !fx.strokeUnder) {
      batch.setColorRGBA(sc.r, sc.g, sc.b, sc.a * o)
      this.glyphPass(layout, x, y, paint, 1, 0.5 - rho / (2 * R), 0, 0.5 + rho / (2 * R), false)
    }
    batch.setColorRGBA(pr, pg, pb, pa)
  }

  /**
   * One pass over the glyph quads with the batch tint: `effect` 0 = coverage fill, 1 = distance-channel effect
   * (`threshold` / `softness` / `inner` in channel units). Same-size fonts take the fast path.
   */
  private glyphPass(layout: GlyphLayout, x: number, y: number, paint: TextPaint, effect: 0 | 1, threshold: number, softness: number, inner: number, count: boolean): void {
    const batch = this.batch
    const n = layout.glyphs.length
    const { layoutFont, drawFont, fontSize } = paint
    const tex = drawFont.texture
    if (layoutFont === drawFont) {
      const { glyphs, quads } = layout
      for (let i = 0; i < n; i++) {
        const g = glyphs[i]!
        const w = quads[i * 4 + 2]!
        if (w <= 0 || g.width === 0) continue
        if (effect === 0) batch.drawGlyph(tex, x + quads[i * 4]!, y + quads[i * 4 + 1]!, w, quads[i * 4 + 3]!, g.u, g.v, g.u2, g.v2)
        else batch.drawGlyphEffect(tex, x + quads[i * 4]!, y + quads[i * 4 + 1]!, w, quads[i * 4 + 3]!, g.u, g.v, g.u2, g.v2, threshold, softness, inner)
      }
    } else {
      // Same face baked at another size: keep the canonical layout positions, swap in the draw font's bitmaps.
      const sc = fontSize / layoutFont.size
      const sd = fontSize / drawFont.size
      const lAscent = layoutFont.data.ascent
      const dAscent = drawFont.data.ascent
      const { glyphs, quads } = layout
      for (let i = 0; i < n; i++) {
        const cg = glyphs[i]!
        const dg = drawFont.data.glyphs.get(cg.id) ?? drawFont.data.fallbackGlyph
        if (!dg || dg.width === 0) continue
        const qx = quads[i * 4]!
        const qy = quads[i * 4 + 1]!
        const lineTop = qy - cg.yOffset * sc
        const gx = qx - cg.xOffset * sc + dg.xOffset * sd
        const gy = lineTop + lAscent * sc - (dAscent - dg.yOffset) * sd
        if (effect === 0) batch.drawGlyph(tex, x + gx, y + gy, dg.width * sd, dg.height * sd, dg.u, dg.v, dg.u2, dg.v2)
        else batch.drawGlyphEffect(tex, x + gx, y + gy, dg.width * sd, dg.height * sd, dg.u, dg.v, dg.u2, dg.v2, threshold, softness, inner)
      }
    }
    if (count) batch.stats.glyphs += n
  }

  pushClip(rect: Rect, radii?: Radii4): void {
    this.batch.pushClip(rect.x, rect.y, rect.width, rect.height, radii)
  }

  popClip(): void {
    this.batch.popClip()
  }

  pushTransform(transform: Affine2): void {
    this.batch.pushTransform(transform)
  }

  popTransform(): void {
    this.batch.popTransform()
  }

  pushOpacity(opacity: number): void {
    this.opacityStack.push(this.opacity)
    this.opacity *= opacity
  }

  popOpacity(): void {
    this.opacity = this.opacityStack.pop() ?? 1
  }

  /** Segments of the last frame (for debug overlays). */
  get segments(): readonly BatchSegment[] {
    return this.batch.segments
  }
}
