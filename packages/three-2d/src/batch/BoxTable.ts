import { DataTexture, FloatType, NearestFilter, NoColorSpace, RGBAFormat } from 'three'
import type { Disposable } from '../types'

/** Texels per row of the table texture. Entries are addressed by a linear texel index and may straddle rows. */
export const TABLE_WIDTH = 1024
const INITIAL_ROWS = 8

/** Anything that must follow the table texture when it is re-allocated (TSL texture nodes). */
export interface TableSubscriber {
  value: unknown
}

/**
 * Per-frame float table read by the box shader (`texelFetch`, no filtering). Quads carry only an index into
 * it, so a box with a gradient, border, radii and any number of shadows costs a handful of vertices plus
 * a few table texels instead of a wide vertex format. It is the only per-box GPU state.
 *
 * Layout of the entry kinds is documented next to their writers in `SpriteBatch` and read in `BatchMaterial`.
 */
export class BoxTable implements Disposable {
  data: Float32Array
  texture: DataTexture
  /** Next free texel. */
  cursor = 0
  /** Highest cursor reached since the last upload (texels), exposed for stats. */
  peak = 0
  private rows: number
  private readonly subscribers = new Set<TableSubscriber>()
  private disposed = false

  constructor() {
    this.rows = INITIAL_ROWS
    this.data = new Float32Array(TABLE_WIDTH * this.rows * 4)
    this.texture = BoxTable.createTexture(this.data, this.rows)
  }

  private static createTexture(data: Float32Array, rows: number): DataTexture {
    const t = new DataTexture(data, TABLE_WIDTH, rows, RGBAFormat, FloatType)
    t.minFilter = NearestFilter
    t.magFilter = NearestFilter
    t.generateMipmaps = false
    t.flipY = false
    t.colorSpace = NoColorSpace
    t.needsUpdate = true
    return t
  }

  /** Follow the texture across re-allocations. The subscriber's `value` is set to the current texture now. */
  subscribe(node: TableSubscriber): void {
    node.value = this.texture
    this.subscribers.add(node)
  }

  /** Reserve `texels` consecutive texels; returns the index of the first one. Grows the texture when needed. */
  alloc(texels: number): number {
    const start = this.cursor
    const end = start + texels
    if (end > TABLE_WIDTH * this.rows) this.grow(end)
    this.cursor = end
    return start
  }

  private grow(needed: number): void {
    let rows = this.rows
    while (TABLE_WIDTH * rows < needed) rows *= 2
    const data = new Float32Array(TABLE_WIDTH * rows * 4)
    data.set(this.data)
    const old = this.texture
    this.data = data
    this.rows = rows
    this.texture = BoxTable.createTexture(data, rows)
    old.dispose()
    for (const s of this.subscribers) s.value = this.texture
  }

  /** Start a new fill (everything written so far has been submitted). */
  reset(): void {
    if (this.cursor > this.peak) this.peak = this.cursor
    this.cursor = 0
  }

  /** Mark the texture dirty so the entries written since `reset()` reach the GPU. */
  upload(): void {
    if (this.cursor > 0) this.texture.needsUpdate = true
  }

  get rowCount(): number {
    return this.rows
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.texture.dispose()
    this.subscribers.clear()
  }
}
