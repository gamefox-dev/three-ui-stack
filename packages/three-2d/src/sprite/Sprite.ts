import type { SpriteBatch } from '../batch/SpriteBatch'
import { Color4, parseColor } from '../color'
import type { TextureRegion } from '../texture/TextureRegion'
import type { ColorLike } from '../types'

/** Lightweight (non-Object3D) transformable region, libGDX-style. Drawn through a `SpriteBatch`. */
export class Sprite {
  region: TextureRegion
  x = 0
  y = 0
  width: number
  height: number
  originX: number
  originY: number
  rotation = 0
  scaleX = 1
  scaleY = 1
  flipX = false
  flipY = false
  readonly color = new Color4(1, 1, 1, 1)

  constructor(region: TextureRegion) {
    this.region = region
    this.width = region.regionWidth
    this.height = region.regionHeight
    this.originX = this.width / 2
    this.originY = this.height / 2
  }

  setPosition(x: number, y: number): this {
    this.x = x
    this.y = y
    return this
  }

  setCenter(cx: number, cy: number): this {
    this.x = cx - this.width / 2
    this.y = cy - this.height / 2
    return this
  }

  setSize(width: number, height: number): this {
    this.width = width
    this.height = height
    this.originX = width / 2
    this.originY = height / 2
    return this
  }

  setOriginCenter(): this {
    this.originX = this.width / 2
    this.originY = this.height / 2
    return this
  }

  setColor(color: ColorLike): this {
    parseColor(color, this.color)
    return this
  }

  setAlpha(a: number): this {
    this.color.a = a
    return this
  }

  draw(batch: SpriteBatch): void {
    batch.drawEx(this.region, {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      originX: this.originX,
      originY: this.originY,
      rotation: this.rotation,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      flipX: this.flipX,
      flipY: this.flipY,
      color: this.color,
    })
  }
}
