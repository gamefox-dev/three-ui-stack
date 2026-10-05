import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  RenderTarget,
  Scene,
  ShapeUtils,
  UnsignedByteType,
  Vector2,
  type Camera,
  type Object3D,
} from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { AtlasPacker } from '../pack/AtlasPacker'
import { flattenPath, glyphBox, type GlyphBox } from '../glyphMetrics'
import type { GlyphRasterizer, GlyphRequest, ParsedFont, ParsedGlyph, RasterizeOptions, RasterizedGlyph } from '../types'

/** Structural subset of Three's `WebGPURenderer` used for glyph baking. The caller owns the renderer. */
export interface GlyphRasterizerRenderer {
  autoClear: boolean
  render(scene: Object3D, camera: Camera): void
  setRenderTarget(target: RenderTarget | null): void
  getRenderTarget(): RenderTarget | null
  setClearColor(color: Color, alpha?: number): void
  getClearColor(target: Color): Color
  getClearAlpha(): number
  readRenderTargetPixelsAsync(target: RenderTarget, x: number, y: number, width: number, height: number): Promise<ArrayBufferView>
}

export interface ThreeGlyphRasterizerOptions {
  renderer: GlyphRasterizerRenderer
  /** Largest supersampled sheet edge (default 4096). */
  maxSheetSize?: number
}

const rowOrderCache = new WeakMap<object, boolean>()

/**
 * Portable default rasterizer: glyph outlines → Three `ShapeGeometry` → supersampled render target →
 * box-filtered coverage. No Canvas2D / DOM involved; works anywhere a Three WebGPU renderer runs.
 */
export class ThreeGlyphRasterizer implements GlyphRasterizer {
  private readonly renderer: GlyphRasterizerRenderer
  private readonly maxSheet: number

  constructor(options: ThreeGlyphRasterizerOptions) {
    this.renderer = options.renderer
    this.maxSheet = options.maxSheetSize ?? 4096
  }

  async rasterize(font: ParsedFont, glyphs: readonly GlyphRequest[], options: RasterizeOptions): Promise<readonly RasterizedGlyph[]> {
    const ss = Math.max(1, Math.round(options.supersample ?? 4))
    const padding = options.padding ?? 1
    const results = new Map<number, RasterizedGlyph>()
    const jobs: { id: number; glyph: ParsedGlyph; box: GlyphBox }[] = []

    for (const req of glyphs) {
      const glyph = font.glyph(req.glyphId)
      const box = glyphBox(font, glyph, options.size, padding)
      const advance = (glyph.advanceWidth * options.size) / font.unitsPerEm
      if (box.empty) {
        results.set(req.glyphId, { glyphId: req.glyphId, width: 0, height: 0, bearingX: 0, bearingY: 0, advance, alpha: new Uint8Array(0) })
      } else {
        jobs.push({ id: req.glyphId, glyph, box })
      }
    }

    const topFirst = await this.detectTopFirst()

    // split jobs into sheets
    const queue = [...jobs]
    while (queue.length) {
      const take: typeof jobs = []
      let sheet = null as ReturnType<typeof AtlasPacker.pack> | null
      while (queue.length) {
        const next = queue[0]!
        const trial = [...take, next]
        try {
          sheet = AtlasPacker.pack(
            trial.map((j) => ({ id: j.id, width: j.box.width * ss, height: j.box.height * ss })),
            { spacing: 2, maxWidth: this.maxSheet, maxHeight: this.maxSheet, powerOfTwo: false },
          )
        } catch {
          if (take.length === 0) throw new Error('[three-2d-font] a single glyph exceeds the maximum sheet size')
          break
        }
        take.push(queue.shift()!)
      }
      sheet = AtlasPacker.pack(
        take.map((j) => ({ id: j.id, width: j.box.width * ss, height: j.box.height * ss })),
        { spacing: 2, maxWidth: this.maxSheet, maxHeight: this.maxSheet, powerOfTwo: false },
      )
      const pixels = await this.renderSheet(take, sheet.placements, sheet.width, sheet.height, ss)
      const where = new Map(sheet.placements.map((p) => [p.id, p]))
      for (const job of take) {
        const p = where.get(job.id)!
        results.set(job.id, downsample(job, p.x, p.y, pixels, sheet.width, sheet.height, ss, topFirst, (job.glyph.advanceWidth * options.size) / font.unitsPerEm))
      }
    }
    return glyphs.map((g) => results.get(g.glyphId)!)
  }

  private async renderSheet(
    jobs: { id: number; glyph: ParsedGlyph; box: GlyphBox }[],
    placements: { id: number; x: number; y: number }[],
    width: number,
    height: number,
    ss: number,
  ): Promise<Uint8Array> {
    const scene = new Scene()
    // Non-zero winding via two additive accumulators: contours of one winding add into R, the other into G.
    // A pixel is inside the glyph iff R ≠ G — correct for holes AND for the overlapping contours variable/modern
    // fonts use (which ShapeGeometry's hole detection cannot represent).
    const makeMaterial = (r: number, g: number) => {
      const m = new MeshBasicNodeMaterial({ color: new Color(r, g, 0) })
      m.side = DoubleSide
      m.blending = AdditiveBlending
      m.depthTest = false
      m.depthWrite = false
      m.toneMapped = false
      return m
    }
    const matPositive = makeMaterial(WINDING_STEP, 0)
    const matNegative = makeMaterial(0, WINDING_STEP)
    const where = new Map(placements.map((p) => [p.id, p]))
    const positive = new MeshBuilder()
    const negative = new MeshBuilder()
    for (const job of jobs) {
      const p = where.get(job.id)!
      addGlyphContours(job.glyph, job.box, ss, p.x, p.y, positive, negative)
    }
    const geometries: BufferGeometry[] = []
    for (const [builder, material] of [[positive, matPositive], [negative, matNegative]] as const) {
      const geometry = builder.build()
      if (!geometry) continue
      geometries.push(geometry)
      const mesh = new Mesh(geometry, material)
      mesh.frustumCulled = false
      scene.add(mesh)
    }
    // y-down sheet coordinates: (0,0) top-left
    const camera = new OrthographicCamera(0, width, 0, height, -10, 10)
    camera.position.z = 1
    const rt = new RenderTarget(width, height, { type: UnsignedByteType, format: RGBAFormat, depthBuffer: false, samples: 1 } as never)
    const r = this.renderer
    const prevTarget = r.getRenderTarget()
    const prevColor = r.getClearColor(new Color())
    const prevAlpha = r.getClearAlpha()
    const prevAuto = r.autoClear
    try {
      r.setRenderTarget(rt)
      r.setClearColor(new Color(0, 0, 0), 0)
      r.autoClear = true
      r.render(scene, camera)
      const data = await r.readRenderTargetPixelsAsync(rt, 0, 0, width, height)
      return tightRgba(data, width, height)
    } finally {
      r.setRenderTarget(prevTarget)
      r.setClearColor(prevColor, prevAlpha)
      r.autoClear = prevAuto
      rt.dispose()
      matPositive.dispose()
      matNegative.dispose()
      for (const g of geometries) g.dispose()
    }
  }

  /** Render targets read back top-first on some backends and bottom-first on others; probe once. */
  private async detectTopFirst(): Promise<boolean> {
    const cached = rowOrderCache.get(this.renderer)
    if (cached !== undefined) return cached
    const scene = new Scene()
    const material = new MeshBasicNodeMaterial({ color: 0xffffff })
    material.side = DoubleSide
    material.blending = NoBlending
    const quad = new Mesh(new PlaneGeometry(4, 2), material)
    quad.position.set(2, 1, 0) // top half in y-down camera space
    scene.add(quad)
    const camera = new OrthographicCamera(0, 4, 0, 4, -10, 10)
    camera.position.z = 1
    const rt = new RenderTarget(4, 4, { type: UnsignedByteType, format: RGBAFormat, depthBuffer: false, samples: 1 } as never)
    const r = this.renderer
    const prevTarget = r.getRenderTarget()
    const prevColor = r.getClearColor(new Color())
    const prevAlpha = r.getClearAlpha()
    const prevAuto = r.autoClear
    try {
      r.setRenderTarget(rt)
      r.setClearColor(new Color(0, 0, 0), 0)
      r.autoClear = true
      r.render(scene, camera)
      const data = tightRgba(await r.readRenderTargetPixelsAsync(rt, 0, 0, 4, 4), 4, 4)
      const topFirst = (data[3] ?? 0) > 127 // alpha of first pixel of first row
      rowOrderCache.set(this.renderer, topFirst)
      return topFirst
    } finally {
      r.setRenderTarget(prevTarget)
      r.setClearColor(prevColor, prevAlpha)
      r.autoClear = prevAuto
      rt.dispose()
      material.dispose()
      quad.geometry.dispose()
    }
  }
}

/**
 * Normalize a render-target readback to tightly packed RGBA8. The WebGPU backend returns rows padded to 256-byte
 * `bytesPerRow` (the last row unpadded); the WebGL backend returns tight rows.
 */
function tightRgba(view: ArrayBufferView, width: number, height: number): Uint8Array {
  const src = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
  const tight = width * 4
  if (src.length === tight * height) return src.slice()
  const stride = Math.ceil(tight / 256) * 256
  if (src.length !== stride * (height - 1) + tight && src.length !== stride * height) {
    throw new Error(`[three-2d-font] unexpected render-target readback size ${src.length} for ${width}×${height}`)
  }
  const out = new Uint8Array(tight * height)
  for (let y = 0; y < height; y++) out.set(src.subarray(y * stride, y * stride + tight), y * tight)
  return out
}

/** Step added per covering contour; 3 overlaps still fit in 8 bits (3 × 64 = 192). */
const WINDING_STEP = 64 / 255
/** |R − G| above this (0–255) counts as inside. */
const INSIDE_THRESHOLD = 32

/** Accumulates triangle soup for one winding direction. */
class MeshBuilder {
  private readonly positions: number[] = []
  private readonly indices: number[] = []

  addContour(points: Vector2[]): void {
    const faces = ShapeUtils.triangulateShape(points, [])
    if (faces.length === 0) return
    const base = this.positions.length / 3
    for (const p of points) this.positions.push(p.x, p.y, 0)
    for (const f of faces) this.indices.push(base + f[0]!, base + f[1]!, base + f[2]!)
  }

  build(): BufferGeometry | null {
    if (this.indices.length === 0) return null
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(this.positions), 3))
    g.setIndex(new BufferAttribute(new Uint32Array(this.indices), 1))
    return g
  }
}

/** Flatten a glyph's contours into supersampled sheet space (y-down) and triangulate each one by winding. */
function addGlyphContours(glyph: ParsedGlyph, box: GlyphBox, ss: number, cx: number, cy: number, positive: MeshBuilder, negative: MeshBuilder): void {
  const k = box.scale * ss
  const left = box.bearingX / box.scale
  const top = box.bearingY / box.scale
  for (const contour of flattenPath(glyph.path, 0.2 / Math.max(box.scale, 1e-6) / ss)) {
    const points: Vector2[] = []
    for (let i = 0; i < contour.length; i += 2) points.push(new Vector2(cx + (contour[i]! - left) * k, cy + (top - contour[i + 1]!) * k))
    const area = ShapeUtils.area(points)
    if (area === 0) continue
    ;(area > 0 ? positive : negative).addContour(points)
  }
}

function downsample(
  job: { id: number; box: GlyphBox },
  cellX: number,
  cellY: number,
  rgba: Uint8Array,
  sheetW: number,
  sheetH: number,
  ss: number,
  topFirst: boolean,
  advance: number,
): RasterizedGlyph {
  const { width, height } = job.box
  const alpha = new Uint8Array(width * height)
  const norm = 1 / (ss * ss)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let inside = 0
      for (let sy = 0; sy < ss; sy++) {
        const row = cellY + y * ss + sy
        const srcRow = topFirst ? row : sheetH - 1 - row
        const base = srcRow * sheetW * 4
        for (let sx = 0; sx < ss; sx++) {
          const o = base + (cellX + x * ss + sx) * 4
          if (Math.abs(rgba[o]! - rgba[o + 1]!) > INSIDE_THRESHOLD) inside++
        }
      }
      alpha[y * width + x] = Math.round(inside * norm * 255)
    }
  }
  return {
    glyphId: job.id,
    width,
    height,
    bearingX: job.box.bearingX,
    bearingY: job.box.bearingY,
    advance,
    alpha,
  }
}
