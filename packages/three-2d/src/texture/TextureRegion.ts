import type { Texture } from 'three'

export interface SizedImage {
  width: number
  height: number
}

/** Pixel size of a Three texture; works for Image/Canvas/ImageBitmap/DataTexture sources. */
export function textureSize(texture: Texture): SizedImage {
  const img = texture.image as { width?: number; height?: number; videoWidth?: number; videoHeight?: number } | null | undefined
  const width = img?.width ?? img?.videoWidth ?? 0
  const height = img?.height ?? img?.videoHeight ?? 0
  return { width, height }
}

/**
 * A rectangular sub-area of a texture.
 *
 * UV convention: `v = 0` is the **top** row of the source image (libGDX style). Textures used with
 * three-2d must therefore have `flipY = false`; `configureTexture()` does that for you.
 */
export class TextureRegion {
  texture: Texture
  u = 0
  v = 0
  u2 = 1
  v2 = 1
  regionX = 0
  regionY = 0
  regionWidth = 0
  regionHeight = 0

  constructor(texture: Texture, x?: number, y?: number, width?: number, height?: number) {
    this.texture = texture
    const size = textureSize(texture)
    if (x === undefined) {
      this.setRegion(0, 0, size.width, size.height)
    } else {
      this.setRegion(x, y ?? 0, width ?? size.width - x, height ?? size.height - (y ?? 0))
    }
  }

  /** Create a region from explicit UVs (pixel size is derived from the texture). */
  static fromUV(texture: Texture, u: number, v: number, u2: number, v2: number): TextureRegion {
    const r = new TextureRegion(texture)
    r.setUV(u, v, u2, v2)
    return r
  }

  /** Set the region in pixels (origin top-left). */
  setRegion(x: number, y: number, width: number, height: number): this {
    const size = textureSize(this.texture)
    const invW = size.width ? 1 / size.width : 0
    const invH = size.height ? 1 / size.height : 0
    this.u = x * invW
    this.v = y * invH
    this.u2 = (x + width) * invW
    this.v2 = (y + height) * invH
    this.regionX = x
    this.regionY = y
    this.regionWidth = width
    this.regionHeight = height
    return this
  }

  setUV(u: number, v: number, u2: number, v2: number): this {
    const size = textureSize(this.texture)
    this.u = u
    this.v = v
    this.u2 = u2
    this.v2 = v2
    this.regionX = Math.round(u * size.width)
    this.regionY = Math.round(v * size.height)
    this.regionWidth = Math.round(Math.abs(u2 - u) * size.width)
    this.regionHeight = Math.round(Math.abs(v2 - v) * size.height)
    return this
  }

  /** Flip the UVs in place. */
  flip(x: boolean, y: boolean): this {
    if (x) {
      const t = this.u
      this.u = this.u2
      this.u2 = t
    }
    if (y) {
      const t = this.v
      this.v = this.v2
      this.v2 = t
    }
    return this
  }

  isFlipX(): boolean {
    return this.u > this.u2
  }

  isFlipY(): boolean {
    return this.v > this.v2
  }

  copy(other: TextureRegion): this {
    this.texture = other.texture
    this.u = other.u
    this.v = other.v
    this.u2 = other.u2
    this.v2 = other.v2
    this.regionX = other.regionX
    this.regionY = other.regionY
    this.regionWidth = other.regionWidth
    this.regionHeight = other.regionHeight
    return this
  }

  clone(): TextureRegion {
    return new TextureRegion(this.texture).copy(this)
  }

  /** Sub-region in pixels relative to this region. */
  sub(x: number, y: number, width: number, height: number): TextureRegion {
    return new TextureRegion(this.texture, this.regionX + x, this.regionY + y, width, height)
  }

  /** Split into a grid of `tileWidth × tileHeight` regions (row-major). */
  split(tileWidth: number, tileHeight: number): TextureRegion[][] {
    const rows = Math.floor(this.regionHeight / tileHeight)
    const cols = Math.floor(this.regionWidth / tileWidth)
    const out: TextureRegion[][] = []
    for (let row = 0; row < rows; row++) {
      const line: TextureRegion[] = []
      for (let col = 0; col < cols; col++) {
        line.push(new TextureRegion(this.texture, this.regionX + col * tileWidth, this.regionY + row * tileHeight, tileWidth, tileHeight))
      }
      out.push(line)
    }
    return out
  }
}

const fullRegions = new WeakMap<Texture, TextureRegion>()

/** Cached full-texture region (avoids per-draw allocation in `batch.draw(texture, …)`). */
export function fullRegion(texture: Texture): TextureRegion {
  let r = fullRegions.get(texture)
  if (r === undefined || r.regionWidth === 0) {
    r = new TextureRegion(texture)
    fullRegions.set(texture, r)
  }
  return r
}
