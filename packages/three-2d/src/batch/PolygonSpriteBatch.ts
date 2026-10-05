import type { Texture } from 'three'
import { TextureRegion, fullRegion } from '../texture/TextureRegion'
import { parseColor } from '../color'
import type { ColorLike } from '../types'
import { SpriteBatch } from './SpriteBatch'

export interface PolygonOptions {
  /** Triangle indices into `positions` (x,y pairs). Defaults to a triangle fan (convex polygons). */
  triangles?: ArrayLike<number>
  /** Per-vertex UVs (u,v pairs, 0..1 within the region). Defaults to the polygon's bounding box. */
  uvs?: ArrayLike<number>
  color?: ColorLike
}

function fan(vertexCount: number): number[] {
  const out: number[] = []
  for (let i = 1; i < vertexCount - 1; i++) out.push(0, i, i + 1)
  return out
}

/**
 * SpriteBatch that additionally accepts arbitrary triangle meshes (polygon sprites, convex fills, strips),
 * sharing the same buffers, materials and flush rules.
 */
export class PolygonSpriteBatch extends SpriteBatch {
  /** Draw a textured polygon. `positions` are x,y pairs in batch units. */
  drawPolygon(source: Texture | TextureRegion, positions: ArrayLike<number>, options: PolygonOptions = {}): void {
    const region = source instanceof TextureRegion ? source : fullRegion(source)
    const vn = positions.length >> 1
    const triangles = options.triangles ?? fan(vn)
    let uvs = options.uvs
    const mapped = new Float32Array(vn * 2)
    if (!uvs) {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (let i = 0; i < vn; i++) {
        const x = positions[i * 2]!
        const y = positions[i * 2 + 1]!
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
      const w = maxX - minX || 1
      const h = maxY - minY || 1
      for (let i = 0; i < vn; i++) {
        mapped[i * 2] = (positions[i * 2]! - minX) / w
        mapped[i * 2 + 1] = (positions[i * 2 + 1]! - minY) / h
      }
      uvs = mapped
    } else {
      for (let i = 0; i < vn * 2; i++) mapped[i] = uvs[i]!
    }
    for (let i = 0; i < vn; i++) {
      mapped[i * 2] = region.u + (region.u2 - region.u) * mapped[i * 2]!
      mapped[i * 2 + 1] = region.v + (region.v2 - region.v) * mapped[i * 2 + 1]!
    }
    const c = options.color !== undefined ? parseColor(options.color, this.polyColor) : this.colorState()
    this.writeTriangles(region.texture, positions, mapped, triangles, c.r, c.g, c.b, c.a)
  }

  /** Fill a polygon with a solid color (uses the batch white pixel). */
  fillPolygon(positions: ArrayLike<number>, options: Omit<PolygonOptions, 'uvs'> = {}): void {
    this.drawPolygon(this.whiteRegion, positions, { ...options, uvs: new Float32Array((positions.length >> 1) * 2) })
  }

  private readonly polyColor = this.colorState().clone()
}
