import { Color4, TextureRegion, type Affine2, type BatchSegment, type GlyphLayout, type NinePatch, type PolygonSpriteBatch, type Rect } from 'three-2d'
import type { ImagePaint, NinePatchPaint, RectPaint, TextPaint, UIDrawContext } from './DrawContext'

export interface PaintCounters {
  paintOps: number
}

const WHITE = new Color4(1, 1, 1, 1)

/**
 * `UIDrawContext` backed by a `three-2d` batch. Every UI primitive becomes quads in the batch's
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
    if (radius > 0) {
      const scratch = (this.scratchRegion ??= new TextureRegion(region.texture))
      scratch.texture = region.texture
      scratch.u = u
      scratch.v = v
      scratch.u2 = u2
      scratch.v2 = v2
      batch.drawEx(scratch, { x: rect.x, y: rect.y, width: rect.width, height: rect.height, radius })
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
    patch.draw(batch, rect.x, rect.y, rect.width, rect.height)
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
    const c = paint.color
    const prev = batch.color
    const pr = prev.r
    const pg = prev.g
    const pb = prev.b
    const pa = prev.a
    batch.setColorRGBA(c.r, c.g, c.b, c.a * this.opacity)
    const { layoutFont, drawFont, fontSize } = paint
    if (layoutFont === drawFont) {
      drawFont.draw(batch, layout, x, y)
    } else {
      // Same face baked at another size: keep the canonical layout positions, swap in the draw font's bitmaps.
      const sc = fontSize / layoutFont.size
      const sd = fontSize / drawFont.size
      const lAscent = layoutFont.data.ascent
      const dAscent = drawFont.data.ascent
      const tex = drawFont.texture
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
        batch.drawUV(tex, x + gx, y + gy, dg.width * sd, dg.height * sd, dg.u, dg.v, dg.u2, dg.v2)
      }
      batch.stats.glyphs += n
    }
    batch.setColorRGBA(pr, pg, pb, pa)
  }

  pushClip(rect: Rect): void {
    this.batch.pushClip(rect.x, rect.y, rect.width, rect.height)
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
