import type { Texture } from 'three'
import type { SpriteBatch } from '../batch/SpriteBatch'
import { TextureRegion } from './TextureRegion'
import { Color4, parseColor } from '../color'
import type { ColorLike } from '../types'

/**
 * Scalable region: 4 fixed corners, 4 stretching edges and a stretching center.
 * Split sizes are in source pixels of the region.
 */
export class NinePatch {
  readonly region: TextureRegion
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
  /** Tint multiplied with the batch color. */
  readonly color = new Color4(1, 1, 1, 1)

  // 3×3 grid of UV rects, row-major (top row first)
  private readonly patches: TextureRegion[]

  constructor(region: TextureRegion | Texture, left: number, right: number, top: number, bottom: number) {
    this.region = region instanceof TextureRegion ? region : new TextureRegion(region)
    this.left = left
    this.right = right
    this.top = top
    this.bottom = bottom
    const r = this.region
    const cw = r.regionWidth - left - right
    const ch = r.regionHeight - top - bottom
    const xs = [0, left, left + cw]
    const ys = [0, top, top + ch]
    const ws = [left, cw, right]
    const hs = [top, ch, bottom]
    this.patches = []
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        this.patches.push(new TextureRegion(r.texture, r.regionX + xs[col]!, r.regionY + ys[row]!, ws[col]!, hs[row]!))
      }
    }
  }

  get minWidth(): number {
    return this.left + this.right
  }

  get minHeight(): number {
    return this.top + this.bottom
  }

  setColor(color: ColorLike): this {
    parseColor(color, this.color)
    return this
  }

  /** Draw stretched into `(x, y, width, height)`; sizes smaller than the minimum scale the corners down. */
  draw(batch: SpriteBatch, x: number, y: number, width: number, height: number): void {
    const kx = width < this.left + this.right ? width / Math.max(1, this.left + this.right) : 1
    const ky = height < this.top + this.bottom ? height / Math.max(1, this.top + this.bottom) : 1
    const l = this.left * kx
    const rr = this.right * kx
    const t = this.top * ky
    const b = this.bottom * ky
    const xs = [x, x + l, x + width - rr, x + width]
    const ys = [y, y + t, y + height - b, y + height]
    const p = this.patches
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
        const region = p[row * 3 + col]!
        if (region.regionWidth === 0 || region.regionHeight === 0) continue
        batch.drawUV(region.texture, xs[col]!, ys[row]!, w, h, region.u, region.v, region.u2, region.v2)
      }
    }
    batch.setColorRGBA(prevR, prevG, prevB, prevA)
  }
}
