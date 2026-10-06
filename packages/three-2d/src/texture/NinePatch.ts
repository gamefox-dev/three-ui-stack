import type { Texture } from 'three'
import type { SpriteBatch } from '../batch/SpriteBatch'
import { TextureRegion, textureSize } from './TextureRegion'
import { Color4, parseColor } from '../color'
import type { Sides4 } from '../batch/boxGeometry'
import type { ColorLike } from '../types'

export interface NinePatchOptions {
  /**
   * Logical units per source pixel (default 1). Art baked at 2–3× for high-DPI screens uses `1 / 2` or `1 / 3`: the borders, `minWidth` /
   * `minHeight` and `padding` are then measured in logical units, not in source pixels.
   */
  scale?: number
  /**
   * Content padding in source pixels (libGDX atlas `pad:`), as `[left, right, top, bottom]`. Scaled like the borders.
   */
  pad?: readonly [number, number, number, number]
  /**
   * Inset of every cell's UV rectangle in source texels, so linear filtering never reads a neighbouring cell (or atlas neighbour).
   * Default `'auto'`: half a texel when `scale` is not 1 (a 1:1 draw samples texel centers exactly and must not be inset), else 0.
   */
  uvInset?: number | 'auto'
}

/**
 * Scalable region: 4 fixed corners, 4 stretching edges and a stretching center.
 * Split sizes (`left`, `right`, `top`, `bottom`) are in source pixels of the region; `scale` converts them to logical units.
 */
export class NinePatch {
  readonly region: TextureRegion
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
  /** Tint multiplied with the batch color. */
  readonly color = new Color4(1, 1, 1, 1)

  private _scale: number
  private readonly uvInsetOption: number | 'auto'
  private readonly _pad: readonly [number, number, number, number] | null

  // 3×3 grid of source rects (x, y, w, h in texels of the texture), row-major (top row first)
  private readonly cells: { x: number; y: number; w: number; h: number }[] = []
  // UVs of the cells for the current inset: u, v, u2, v2 per cell
  private readonly uvs = new Float32Array(36)
  private uvScale = NaN

  /** `scale` may be given directly as the sixth argument (`new NinePatch(region, 8, 8, 8, 8, 0.5)`) or inside `options`. */
  constructor(region: TextureRegion | Texture, left: number, right: number, top: number, bottom: number, options: number | NinePatchOptions = {}) {
    const opts: NinePatchOptions = typeof options === 'number' ? { scale: options } : options
    this.region = region instanceof TextureRegion ? region : new TextureRegion(region)
    this.left = left
    this.right = right
    this.top = top
    this.bottom = bottom
    this._scale = opts.scale ?? 1
    this.uvInsetOption = opts.uvInset ?? 'auto'
    this._pad = opts.pad ?? null
    const r = this.region
    const cw = r.regionWidth - left - right
    const ch = r.regionHeight - top - bottom
    const xs = [0, left, left + cw]
    const ys = [0, top, top + ch]
    const ws = [left, cw, right]
    const hs = [top, ch, bottom]
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        this.cells.push({ x: r.regionX + xs[col]!, y: r.regionY + ys[row]!, w: ws[col]!, h: hs[row]! })
      }
    }
    this.updateUVs()
  }

  /** Logical units per source pixel. */
  get scale(): number {
    return this._scale
  }

  /** Change the logical size of one source pixel (affects every later draw, `minWidth`, `minHeight` and `padding`). */
  setScale(scale: number): this {
    this._scale = scale
    this.updateUVs()
    return this
  }

  /** Smallest drawable width in logical units (the scaled left + right borders). */
  get minWidth(): number {
    return (this.left + this.right) * this._scale
  }

  get minHeight(): number {
    return (this.top + this.bottom) * this._scale
  }

  /** Content padding in logical units as `[top, right, bottom, left]` (CSS order), or null when the patch has none. */
  get padding(): Sides4 | null {
    const p = this._pad
    if (!p) return null
    const s = this._scale
    return [p[2] * s, p[1] * s, p[3] * s, p[0] * s]
  }

  setColor(color: ColorLike): this {
    parseColor(color, this.color)
    return this
  }

  private updateUVs(scale = this._scale): void {
    if (this.uvScale === scale) return
    this.uvScale = scale
    const t = this.region.texture
    const size = textureSize(t)
    const invW = size.width ? 1 / size.width : 0
    const invH = size.height ? 1 / size.height : 0
    const inset = this.uvInsetOption === 'auto' ? (scale === 1 ? 0 : 0.5) : this.uvInsetOption
    for (let i = 0; i < 9; i++) {
      const c = this.cells[i]!
      // never inset past the middle of a thin cell
      const ix = Math.min(inset, c.w / 2)
      const iy = Math.min(inset, c.h / 2)
      const o = i * 4
      this.uvs[o] = (c.x + ix) * invW
      this.uvs[o + 1] = (c.y + iy) * invH
      this.uvs[o + 2] = (c.x + c.w - ix) * invW
      this.uvs[o + 3] = (c.y + c.h - iy) * invH
    }
  }

  /**
   * Draw stretched into `(x, y, width, height)`; sizes smaller than the minimum scale the corners down. `scale` overrides this
   * patch's own scale for this draw only (the same patch can serve views at different scales).
   */
  draw(batch: SpriteBatch, x: number, y: number, width: number, height: number, scale = this._scale): void {
    this.updateUVs(scale)
    const lw = (this.left + this.right) * scale
    const th = (this.top + this.bottom) * scale
    const kx = width < lw ? width / Math.max(1e-6, lw) : 1
    const ky = height < th ? height / Math.max(1e-6, th) : 1
    const l = this.left * scale * kx
    const rr = this.right * scale * kx
    const t = this.top * scale * ky
    const b = this.bottom * scale * ky
    const xs = [x, x + l, x + width - rr, x + width]
    const ys = [y, y + t, y + height - b, y + height]
    const cells = this.cells
    const uvs = this.uvs
    const texture = this.region.texture
    const prevR = batch.color.r
    const prevG = batch.color.g
    const prevB = batch.color.b
    const prevA = batch.color.a
    batch.setColorRGBA(prevR * this.color.r, prevG * this.color.g, prevB * this.color.b, prevA * this.color.a)
    for (let row = 0; row < 3; row++) {
      const h = ys[row + 1]! - ys[row]!
      if (h <= 0) continue
      for (let col = 0; col < 3; col++) {
        const w = xs[col + 1]! - xs[col]!
        if (w <= 0) continue
        const i = row * 3 + col
        const c = cells[i]!
        if (c.w === 0 || c.h === 0) continue
        const o = i * 4
        batch.drawUV(texture, xs[col]!, ys[row]!, w, h, uvs[o]!, uvs[o + 1]!, uvs[o + 2]!, uvs[o + 3]!)
      }
    }
    batch.setColorRGBA(prevR, prevG, prevB, prevA)
    // keep the cached UVs in step with the patch's own scale (a per-draw override above may have changed them)
    if (scale !== this._scale) this.updateUVs()
  }
}
