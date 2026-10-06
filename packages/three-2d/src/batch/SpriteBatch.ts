import {
  BufferGeometry,
  DataTexture,
  DynamicDrawUsage,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  BufferAttribute,
  Mesh,
  RGBAFormat,
  Scene,
  UnsignedByteType,
  Vector3,
  Vector4,
  type Camera,
  type Object3D,
  type Texture,
} from 'three'
import { Affine2 } from '../math'
import { Color4, parseColor } from '../color'
import { isDev, warnOnce } from '../dev'
import { configureTexture } from '../texture/configureTexture'
import { TextureRegion, fullRegion } from '../texture/TextureRegion'
import type { BlendMode, ColorLike, Disposable, FlushReason, Rect } from '../types'
import { RenderStats } from '../types'
import type { MeshBasicNodeMaterial } from 'three/webgpu'
import {
  BACKDROP_ENTRY,
  BOX_ENTRY_BASE,
  BatchMaterialCache,
  MAX_GRADIENT_STOPS,
  MODE_BACKDROP,
  MODE_BOX,
  MODE_GLYPH,
  MODE_GLYPH_EFFECT,
  MODE_SHADOW_INSET,
  MODE_SHADOW_OUTER,
  MODE_SOLID,
  MODE_SPRITE,
  OFFSET_BORDER,
  OFFSET_COLOR,
  OFFSET_DATA,
  OFFSET_LOCAL,
  OFFSET_MODE,
  OFFSET_SHAPE,
  OFFSET_UV,
  SHADOW_ENTRY,
  VERTEX_STRIDE,
} from './BatchMaterial'
import { BackdropBlur, type BackdropQuality, type BackdropRenderer } from './BackdropBlur'
import { BoxTable } from './BoxTable'
import { normalizeRadii, srgbToOklab, type BoxGradient, type Radii4, type Sides4 } from './boxGeometry'

/** Structural subset of a Three `WebGPURenderer` the batch needs. The batch never creates or owns a renderer. */
export interface BatchRenderer {
  autoClear: boolean
  render(scene: Object3D, camera: Camera): void
  getViewport(target: Vector4): Vector4
  getScissor(target: Vector4): Vector4
  setScissor(x: number, y: number, width: number, height: number): void
  getScissorTest(): boolean
  setScissorTest(enable: boolean): void
}

export interface BatchOptions {
  /** Caller-owned renderer. Without one the batch only builds geometry (see `SpriteBatch.group`). */
  renderer?: BatchRenderer
  /** Quad capacity per buffer (up to 262143, indices are 32-bit). Default 4096. */
  maxSprites?: number
  /** Convert sRGB vertex colors to linear in the shader (default true). */
  srgbVertexColors?: boolean
  /**
   * `backdrop-filter: blur()` support: `'off'` (default for a bare batch), `'low'` (one small blur) or `'full'` (small +
   * large blur). Needs `renderer` to expose `copyFramebufferToTexture` (a Three `WebGPURenderer` does). Decided at
   * construction: it adds three texture bindings to the batch material.
   */
  backdrop?: BackdropQuality
}

export interface BatchDrawOptions {
  x: number
  y: number
  width: number
  height: number
  originX?: number
  originY?: number
  /** Radians, positive = clockwise on a y-down camera. */
  rotation?: number
  scaleX?: number
  scaleY?: number
  color?: ColorLike
  flipX?: boolean
  flipY?: boolean
  /** Corner radius for the rounded-rect SDF path, in batch units. */
  radius?: number
  borderWidth?: number
  borderColor?: ColorLike
  /** Paint the region's alpha silhouette in `color` (RGB of the texture ignored): drop shadows, glows. */
  silhouette?: boolean
}

export interface ShapeOptions {
  color?: ColorLike
  radius?: number
  borderWidth?: number
  borderColor?: ColorLike
}

/** One draw call: a contiguous index range with a single texture / blend / clip state. */
export interface BatchSegment {
  texture: Texture | null
  blend: BlendMode
  clip: ClipRect | null
  indexStart: number
  indexCount: number
  /** Bit mask (`1 << level`) of the backdrop sources quads in this segment sample; they are prepared before it renders. */
  backdrop: number
  /** Capture generation those backdrop quads belong to. */
  backdropEpoch: number
  /** Only texture-free quads (boxes, shadows, solids) so far: the first textured quad may adopt the segment instead of splitting it. */
  loose: boolean
  /** Bounds of everything painted into the segment (world space, no anti-aliasing margin). A clip that contains them clips nothing. */
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** World-space axis-aligned clip rectangle (after the transform stack at push time). */
export interface ClipRect extends Rect {}

export interface BoxOptions {
  /** Border box in batch units. */
  x: number
  y: number
  width: number
  height: number
  /** Corner radii (TL, TR, BR, BL). Scaled down together when adjacent corners overlap, like CSS. */
  radii?: Radii4
  /** Border widths (top, right, bottom, left). The border is painted over the background. */
  borderWidths?: Sides4
  borderColor?: ColorLike
  /** Background color, painted under the gradient. */
  background?: ColorLike
  /** Up to {@link MAX_GRADIENT_STOPS} stops; interpolated premultiplied in sRGB space like CSS. */
  gradient?: BoxGradient
  /** Multiplies the alpha of everything the box paints (default 1). */
  opacity?: number
}

export interface BackdropOptions {
  /** Border box of the blurred region (batch units). */
  x: number
  y: number
  width: number
  height: number
  radii?: Radii4
  /** Blur radius in px (0 = no blur; the region is still brightness / saturation adjusted). */
  blur: number
  /** 1 = unchanged. */
  brightness?: number
  saturate?: number
  opacity?: number
}

export interface BoxShadowOptions {
  /** Border box of the element that casts the shadow. */
  x: number
  y: number
  width: number
  height: number
  radii?: Radii4
  /** Needed for inset shadows: the shadow is clipped to the padding box. */
  borderWidths?: Sides4
  offsetX?: number
  offsetY?: number
  /** CSS blur radius (the Gaussian's standard deviation is half of it). */
  blur?: number
  spread?: number
  color: ColorLike
  inset?: boolean
  opacity?: number
}

/** Extra pixels around a box quad so edge anti-aliasing extends symmetrically outside the border box. */
const QUAD_MARGIN = 1

/** Value equality of two clip rectangles (identity is not enough: every `pushClip` allocates a new one). */
function sameClip(a: ClipRect | null, b: ClipRect | null): boolean {
  return a === b || (a !== null && b !== null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height)
}

const DEFAULT_MAX_SPRITES = 4096
/** Resolution of the "painted since the last backdrop capture" bitmap. */
const DIRTY_COLS = 24
const DIRTY_ROWS = 16

export class SpriteBatch implements Disposable {
  readonly stats = new RenderStats()
  /** Internal scene holding one mesh per live segment. Attach to your own scene if you don't pass a renderer. */
  readonly scene = new Scene()
  /** Segments of the frame being built / last submitted (valid until the next `begin()`). */
  readonly segments: BatchSegment[] = []
  /** Optional hook for tests/tools: called for every segment boundary. */
  onFlush: ((reason: FlushReason, segment: Readonly<BatchSegment>) => void) | null = null

  readonly maxSprites: number
  protected renderer: BatchRenderer | null

  protected readonly vertices: Float32Array
  protected readonly indices: Uint32Array
  protected vertexCount = 0
  protected indexCount = 0

  private readonly interleaved: InterleavedBuffer
  private readonly indexAttribute: BufferAttribute
  private readonly materials: BatchMaterialCache
  /** Every mesh ever created (hidden between frames). */
  private readonly meshes: Mesh[] = []
  /** Meshes keyed by material: a mesh keeps its material for life (swapping materials on a mesh breaks Three's render-object cache). */
  private readonly meshPools = new Map<MeshBasicNodeMaterial, Mesh[]>()
  private readonly meshCursor = new Map<MeshBasicNodeMaterial, number>()
  private readonly segMeshes: Mesh[] = []
  private segmentCount = 0
  private segmentPool: BatchSegment[] = []

  private _begun = false
  private camera: Camera | null = null
  private disposed = false

  // current state
  private readonly _color = new Color4(1, 1, 1, 1)
  private _blend: BlendMode = 'normal'
  private readonly transform = new Affine2()
  private readonly transformStack: Affine2[] = []
  private transformDepth = 0

  private readonly clipStack: (ClipRect | null)[] = []
  private clipPool: ClipRect[] = []
  private clipPoolIndex = 0
  private currentClip: ClipRect | null = null

  private whiteTexture: DataTexture | null = null
  private whiteRegionCache: TextureRegion | null = null

  /** Shader mode written into every vertex (see the `MODE_*` constants) and whether the quad ignores its texture. */
  private mode = MODE_SPRITE
  private texFree = false
  /** Box-table entry index written into every vertex while drawing table-driven quads. */
  private dataIndex = 0
  /** Per-frame float table read by box / shadow / backdrop quads. */
  readonly table = new BoxTable()
  /** Backdrop blur pipeline (null when disabled / unsupported). */
  readonly backdrop: BackdropBlur | null
  private backdropRequested = 0
  /** Capture generation counter for this frame (0 = nothing captured yet). */
  private backdropEpoch = 0
  /** Coarse bitmap of screen cells painted since the last capture (see `fillBackdrop`). */
  private readonly dirtyCells = new Uint8Array(DIRTY_COLS * DIRTY_ROWS)
  private dirtyX0 = 0
  private dirtyY0 = 0
  private dirtyCellW = 1
  private dirtyCellH = 1
  private dirtyTracking = false
  private pendingBackdropBits = 0
  private readonly tmpColor = new Color4()
  private readonly tmpBorder = new Color4()
  private readonly tmpVec4 = new Vector4()
  private readonly tmpScissor = new Vector4()
  private readonly tmpV3 = new Vector3()

  constructor(options: BatchOptions = {}) {
    const maxSprites = Math.min(options.maxSprites ?? DEFAULT_MAX_SPRITES, 262143)
    this.maxSprites = maxSprites
    this.renderer = options.renderer ?? null
    this.vertices = new Float32Array(maxSprites * 4 * VERTEX_STRIDE)
    // 32-bit indices: Three's WebGPU backend silently replaces a Uint16 attribute array with a converted copy on first
    // upload, after which edits to our array would never reach the GPU. A Uint32Array is used as-is.
    this.indices = new Uint32Array(maxSprites * 6)
    this.interleaved = new InterleavedBuffer(this.vertices, VERTEX_STRIDE).setUsage(DynamicDrawUsage)
    this.indexAttribute = new BufferAttribute(this.indices, 1).setUsage(DynamicDrawUsage)
    const wantsBackdrop = options.backdrop !== undefined && options.backdrop !== 'off' && options.renderer !== undefined
    const rendererWithCopy = options.renderer as unknown as Partial<BackdropRenderer> | undefined
    this.backdrop = wantsBackdrop && typeof rendererWithCopy?.copyFramebufferToTexture === 'function' ? new BackdropBlur(options.renderer as unknown as BackdropRenderer, options.backdrop as 'low' | 'full') : null
    this.materials = new BatchMaterialCache({ srgbVertexColors: options.srgbVertexColors ?? true, table: this.table, backdrop: this.backdrop ?? undefined })
    this.scene.matrixAutoUpdate = false
  }

  get begun(): boolean {
    return this._begun
  }

  /** Number of quads/triangles currently buffered is `vertexCount / 4` for quad draws. */
  get bufferedVertices(): number {
    return this.vertexCount
  }

  /** Attach / replace the caller-owned renderer. */
  setRenderer(renderer: BatchRenderer | null): void {
    this.renderer = renderer
  }

  // ───────────────────────────── state ─────────────────────────────

  /** Current tint multiplied into every draw without explicit color. */
  get color(): Color4 {
    return this._color
  }

  setColor(color: ColorLike): void {
    parseColor(color, this._color)
  }

  setColorRGBA(r: number, g: number, b: number, a = 1): void {
    this._color.set(r, g, b, a)
  }

  get blendMode(): BlendMode {
    return this._blend
  }

  setBlendMode(mode: BlendMode): void {
    this._blend = mode
  }

  /** Copy of the current transform (read-only view). */
  get currentTransform(): Readonly<Affine2> {
    return this.transform
  }

  /** Push a copy of the current transform, then apply `m` on top of it (m is applied first to geometry). */
  pushTransform(m?: Affine2): void {
    let saved = this.transformStack[this.transformDepth]
    if (!saved) this.transformStack[this.transformDepth] = saved = new Affine2()
    saved.copy(this.transform)
    this.transformDepth++
    if (m) this.transform.multiply(m)
  }

  popTransform(): void {
    if (this.transformDepth === 0) throw new Error('[three-2d] popTransform() without matching pushTransform()')
    this.transformDepth--
    this.transform.copy(this.transformStack[this.transformDepth]!)
  }

  /** Active clip rect in world space, or `null`. */
  get clip(): Readonly<ClipRect> | null {
    return this.currentClip
  }

  get clipDepth(): number {
    return this.clipStack.length
  }

  /**
   * Intersect the active clip with a rectangle (transformed by the current transform; rotation is
   * approximated by its axis-aligned bounds). Nested clips intersect. Always pair with `popClip()`.
   */
  pushClip(x: number, y: number, width: number, height: number): void {
    const t = this.transform
    let x0 = x
    let y0 = y
    let x1 = x + width
    let y1 = y + height
    if (!t.isIdentity()) {
      const ax = t.applyX(x, y)
      const ay = t.applyY(x, y)
      const bx = t.applyX(x + width, y)
      const by = t.applyY(x + width, y)
      const cx = t.applyX(x + width, y + height)
      const cy = t.applyY(x + width, y + height)
      const dx = t.applyX(x, y + height)
      const dy = t.applyY(x, y + height)
      x0 = Math.min(ax, bx, cx, dx)
      y0 = Math.min(ay, by, cy, dy)
      x1 = Math.max(ax, bx, cx, dx)
      y1 = Math.max(ay, by, cy, dy)
    }
    const cur = this.currentClip
    if (cur) {
      x0 = Math.max(x0, cur.x)
      y0 = Math.max(y0, cur.y)
      x1 = Math.min(x1, cur.x + cur.width)
      y1 = Math.min(y1, cur.y + cur.height)
    }
    let rect = this.clipPool[this.clipPoolIndex]
    if (!rect) this.clipPool[this.clipPoolIndex] = rect = { x: 0, y: 0, width: 0, height: 0 }
    this.clipPoolIndex++
    rect.x = x0
    rect.y = y0
    rect.width = Math.max(0, x1 - x0)
    rect.height = Math.max(0, y1 - y0)
    this.clipStack.push(cur)
    this.currentClip = rect
    this.stats.clipChanges++
  }

  popClip(): void {
    if (this.clipStack.length === 0) throw new Error('[three-2d] popClip() without matching pushClip()')
    this.currentClip = this.clipStack.pop() ?? null
    this.stats.clipChanges++
  }

  /** A shared 1×1 white region for solid fills (owned by the batch). */
  get whiteRegion(): TextureRegion {
    if (!this.whiteRegionCache) {
      const tex = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, RGBAFormat, UnsignedByteType)
      configureTexture(tex)
      this.whiteTexture = tex
      this.whiteRegionCache = new TextureRegion(tex, 0, 0, 1, 1)
    }
    return this.whiteRegionCache
  }

  // ───────────────────────────── lifecycle ─────────────────────────────

  /** Start a frame/pass. `camera` defines the world → screen mapping used when rendering. */
  begin(camera?: Camera): void {
    if (this._begun) throw new Error('[three-2d] SpriteBatch.begin() called twice without end()')
    this._begun = true
    if (camera) this.camera = camera
    this.vertexCount = 0
    this.indexCount = 0
    this.segmentCount = 0
    this.segments.length = 0
    this.table.reset()
    this.backdrop?.beginFrame()
    this.backdropRequested = 0
    this.backdropEpoch = 0
    this.pendingBackdropBits = 0
    this.setupDirtyGrid(this.camera)
    this.clipPoolIndex = 0
    this.clipStack.length = 0
    this.currentClip = null
    this.transformDepth = 0
    this.transform.identity()
    this._blend = 'normal'
    this._color.set(1, 1, 1, 1)
  }

  /** Flush everything and render (when a renderer was supplied). */
  end(): void {
    if (!this._begun) throw new Error('[three-2d] SpriteBatch.end() called without begin()')
    if (this.clipStack.length !== 0 && isDev()) {
      warnOnce('unbalanced-clip', 'end() called with unbalanced pushClip()/popClip()')
    }
    this.submit('end')
    if (this.backdrop) {
      this.stats.backdropPasses = this.backdrop.passCount
      this.stats.backdropCopies = this.backdrop.copyCount
    }
    this._begun = false
  }

  /** Close the current segment and render everything buffered so far (explicit flush). */
  flush(): void {
    this.assertBegun('flush')
    this.submit('explicit')
  }

  // ───────────────────────────── drawing ─────────────────────────────

  /** Draw a texture or region stretched to `width × height` at `(x, y)` (top-left on y-down cameras). */
  draw(source: Texture | TextureRegion, x: number, y: number, width: number, height: number): void {
    const region = source instanceof TextureRegion ? source : fullRegion(source)
    this.drawUV(region.texture, x, y, width, height, region.u, region.v, region.u2, region.v2)
  }

  /** Draw an explicit UV rectangle of `texture` (used by fonts and nine-patches). */
  drawUV(texture: Texture, x: number, y: number, width: number, height: number, u: number, v: number, u2: number, v2: number): void {
    const c = this._color
    this.writeRect(texture, x, y, width, height, u, v, u2, v2, c.r, c.g, c.b, c.a, 0, 0, 0, 0, 0, 0, 0, 0)
  }

  /** Full-featured draw: origin/rotation/scale/flip/tint and optional rounded-rect shape. */
  drawEx(source: Texture | TextureRegion, o: BatchDrawOptions): void {
    const region = source instanceof TextureRegion ? source : fullRegion(source)
    let { u, v, u2, v2 } = region
    if (o.flipX) [u, u2] = [u2, u]
    if (o.flipY) [v, v2] = [v2, v]
    const c = o.color !== undefined ? parseColor(o.color, this.tmpColor) : this._color
    const bw = o.borderWidth ?? 0
    const bc = bw > 0 && o.borderColor !== undefined ? parseColor(o.borderColor, this.tmpBorder) : this.tmpBorder.set(0, 0, 0, 0)
    const w = o.width
    const h = o.height
    // a radius larger than half the shorter side (e.g. Tailwind's rounded-full = 9999) is clamped to a pill/circle
    const radius = Math.min(o.radius ?? 0, Math.abs(w * (o.scaleX ?? 1)) / 2, Math.abs(h * (o.scaleY ?? 1)) / 2)
    const shaped = radius > 0 || bw > 0
    if (o.silhouette) this.mode = MODE_GLYPH
    try {
      this.drawExShape(region, o, u, v, u2, v2, c, bc, radius, bw, shaped)
    } finally {
      if (o.silhouette) this.mode = MODE_SPRITE
    }
  }

  private drawExShape(region: TextureRegion, o: BatchDrawOptions, u: number, v: number, u2: number, v2: number, c: Color4, bc: Color4, radius: number, bw: number, shaped: boolean): void {
    const w = o.width
    const h = o.height
    const sx = o.scaleX ?? 1
    const sy = o.scaleY ?? 1
    const rot = o.rotation ?? 0
    if (rot === 0 && sx === 1 && sy === 1) {
      this.writeRect(region.texture, o.x, o.y, w, h, u, v, u2, v2, c.r, c.g, c.b, c.a, shaped ? w / 2 : 0, shaped ? h / 2 : 0, radius, bw, bc.r, bc.g, bc.b, bc.a)
      return
    }
    const ox = o.x + (o.originX ?? 0)
    const oy = o.y + (o.originY ?? 0)
    const cos = Math.cos(rot)
    const sin = Math.sin(rot)
    const x0 = (o.x - ox) * sx
    const y0 = (o.y - oy) * sy
    const x1 = (o.x + w - ox) * sx
    const y1 = (o.y + h - oy) * sy
    // corners: TL TR BR BL
    const ax = ox + x0 * cos - y0 * sin
    const ay = oy + x0 * sin + y0 * cos
    const bx = ox + x1 * cos - y0 * sin
    const by = oy + x1 * sin + y0 * cos
    const cx = ox + x1 * cos - y1 * sin
    const cy = oy + x1 * sin + y1 * cos
    const dx = ox + x0 * cos - y1 * sin
    const dy = oy + x0 * sin + y1 * cos
    this.writeQuad(region.texture, ax, ay, bx, by, cx, cy, dx, dy, u, v, u2, v2, c.r, c.g, c.b, c.a, shaped ? (w * Math.abs(sx)) / 2 : 0, shaped ? (h * Math.abs(sy)) / 2 : 0, radius, bw, bc.r, bc.g, bc.b, bc.a)
  }

  /** Draw an arbitrary quad (corners in TL, TR, BR, BL order). */
  drawQuad(source: Texture | TextureRegion, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    const region = source instanceof TextureRegion ? source : fullRegion(source)
    const c = this._color
    this.writeQuad(region.texture, x0, y0, x1, y1, x2, y2, x3, y3, region.u, region.v, region.u2, region.v2, c.r, c.g, c.b, c.a, 0, 0, 0, 0, 0, 0, 0, 0)
  }

  /** Solid (optionally rounded / bordered) rectangle using the batch's white pixel. */
  fillRect(x: number, y: number, width: number, height: number, options?: ShapeOptions): void {
    const white = this.whiteRegion
    this.mode = MODE_SOLID
    this.texFree = true
    try {
      this.fillRectSolid(white, x, y, width, height, options)
    } finally {
      this.mode = MODE_SPRITE
      this.texFree = false
    }
  }

  private fillRectSolid(white: TextureRegion, x: number, y: number, width: number, height: number, options?: ShapeOptions): void {
    if (!options) {
      const c = this._color
      this.writeRect(white.texture, x, y, width, height, 0, 0, 1, 1, c.r, c.g, c.b, c.a, 0, 0, 0, 0, 0, 0, 0, 0)
      return
    }
    const c = options.color !== undefined ? parseColor(options.color, this.tmpColor) : this._color
    const bw = options.borderWidth ?? 0
    const bc = bw > 0 && options.borderColor !== undefined ? parseColor(options.borderColor, this.tmpBorder) : this.tmpBorder.set(0, 0, 0, 0)
    const radius = Math.min(options.radius ?? 0, Math.abs(width) / 2, Math.abs(height) / 2)
    const shaped = radius > 0 || bw > 0
    this.writeRect(white.texture, x, y, width, height, 0, 0, 1, 1, c.r, c.g, c.b, c.a, shaped ? width / 2 : 0, shaped ? height / 2 : 0, radius, bw, bc.r, bc.g, bc.b, bc.a)
  }

  // ───────────────────────────── boxes, shadows, glyph effects ─────────────────────────────

  /**
   * Paint a box with the SDF box shader: per-corner radii, per-side border, background color and an optional
   * linear / radial gradient. One quad; boxes join any texture segment, so they never break batching.
   */
  fillBox(o: BoxOptions): void {
    const w = o.width
    const h = o.height
    if (!(w > 0) || !(h > 0)) return
    const bg = o.background !== undefined ? parseColor(o.background, this.tmpColor) : this.tmpColor.set(0, 0, 0, 0)
    const bgR = bg.r
    const bgG = bg.g
    const bgB = bg.b
    const bgA = bg.a
    const bws = o.borderWidths
    const hasBorder = bws !== undefined && (bws[0] > 0 || bws[1] > 0 || bws[2] > 0 || bws[3] > 0) && o.borderColor !== undefined
    const bc = hasBorder ? parseColor(o.borderColor!, this.tmpBorder) : this.tmpBorder.set(0, 0, 0, 0)
    if (hasBorder && bc.a <= 0) {
      // an invisible border still takes its space, but paints nothing
    }
    const grad = o.gradient
    let n = grad ? Math.min(grad.stops.length, MAX_GRADIENT_STOPS) : 0
    if (grad && grad.stops.length > MAX_GRADIENT_STOPS) warnOnce('gradient-stops', `gradients support at most ${MAX_GRADIENT_STOPS} color stops; extra stops are dropped`)
    if (n < 2) n = 0
    if (bgA <= 0 && !hasBorder && n === 0) return
    const rad = normalizeRadii(o.radii, w, h, this.tmpRadii)
    const table = this.table
    const base = table.alloc(BOX_ENTRY_BASE + (n > 0 ? n + Math.ceil(n / 4) : 0))
    const d = table.data
    let i = base * 4
    d[i++] = w / 2
    d[i++] = h / 2
    const oklab = n > 0 && grad!.colorSpace === 'oklab'
    // kind: 0 none, 1 linear, 2 radial; +2 = interpolate in OKLab
    d[i++] = n === 0 ? 0 : (grad!.type === 'linear' ? 1 : 2) + (oklab ? 2 : 0)
    d[i++] = n
    d[i++] = rad[0]
    d[i++] = rad[1]
    d[i++] = rad[2]
    d[i++] = rad[3]
    d[i++] = hasBorder ? bws![0] : 0
    d[i++] = hasBorder ? bws![1] : 0
    d[i++] = hasBorder ? bws![2] : 0
    d[i++] = hasBorder ? bws![3] : 0
    d[i++] = bc.r
    d[i++] = bc.g
    d[i++] = bc.b
    d[i++] = bc.a
    d[i++] = bgR
    d[i++] = bgG
    d[i++] = bgB
    d[i++] = bgA
    if (n > 0 && grad) {
      if (grad.type === 'linear') {
        const len = Math.max(grad.length, 1e-3)
        d[i++] = grad.dx / len
        d[i++] = grad.dy / len
        d[i++] = 0
        d[i++] = 0
      } else {
        d[i++] = grad.cx
        d[i++] = grad.cy
        d[i++] = 1 / Math.max(grad.rx, 1e-3)
        d[i++] = 1 / Math.max(grad.ry, 1e-3)
      }
      // premultiplied stop colors, then the positions packed four per texel
      let last = 0
      for (let k = 0; k < n; k++) {
        const c = parseColor(grad.stops[k]!.color, this.tmpColor)
        if (oklab) {
          const lab = srgbToOklab(c.r, c.g, c.b, this.tmpLab)
          d[i++] = lab[0] * c.a
          d[i++] = lab[1] * c.a
          d[i++] = lab[2] * c.a
        } else {
          d[i++] = c.r * c.a
          d[i++] = c.g * c.a
          d[i++] = c.b * c.a
        }
        d[i++] = c.a
      }
      for (let k = 0; k < Math.ceil(n / 4) * 4; k++) {
        if (k < n) last = Math.max(last, grad.stops[k]!.position)
        d[i++] = last
      }
    } else {
      d[i++] = 0
      d[i++] = 0
      d[i++] = 0
      d[i++] = 0
    }
    this.writeShapeQuad(MODE_BOX, o.x + w / 2, o.y + h / 2, w / 2 + QUAD_MARGIN, h / 2 + QUAD_MARGIN, base, o.opacity ?? 1)
    this.stats.boxes++
  }

  /**
   * Analytic blurred box-shadow of a rounded rectangle (outer or inset). One quad and six table texels per layer —
   * no offscreen pass, no blur kernel taps beyond four Gaussian-weighted rows.
   */
  fillShadow(o: BoxShadowOptions): void {
    const w = o.width
    const h = o.height
    if (!(w > 0) || !(h > 0)) return
    const col = parseColor(o.color, this.tmpColor)
    if (col.a <= 0) return
    const hw = w / 2
    const hh = h / 2
    const rad = normalizeRadii(o.radii, w, h, this.tmpRadii)
    const sigma = Math.max(0, o.blur ?? 0) / 2
    const spread = o.spread ?? 0
    const ox = o.offsetX ?? 0
    const oy = o.offsetY ?? 0
    const table = this.table
    const base = table.alloc(SHADOW_ENTRY)
    const d = table.data
    let i = base * 4
    let qx: number
    let qy: number
    if (!o.inset) {
      const shw = Math.max(0, hw + spread)
      const shh = Math.max(0, hh + spread)
      d[i++] = hw
      d[i++] = hh
      d[i++] = 0
      d[i++] = 0
      d[i++] = rad[0]
      d[i++] = rad[1]
      d[i++] = rad[2]
      d[i++] = rad[3]
      d[i++] = shw
      d[i++] = shh
      d[i++] = sigma
      d[i++] = 0
      for (let k = 0; k < 4; k++) d[i++] = rad[k]! > 0 ? Math.max(0, rad[k]! + spread) : 0
      d[i++] = col.r
      d[i++] = col.g
      d[i++] = col.b
      d[i++] = col.a
      d[i++] = ox
      d[i++] = oy
      d[i++] = 0
      d[i++] = 0
      qx = Math.max(hw, Math.abs(ox) + shw + 3 * sigma) + QUAD_MARGIN
      qy = Math.max(hh, Math.abs(oy) + shh + 3 * sigma) + QUAD_MARGIN
    } else {
      const b = o.borderWidths
      const bT = b ? b[0] : 0
      const bR = b ? b[1] : 0
      const bB = b ? b[2] : 0
      const bL = b ? b[3] : 0
      const ihw = Math.max(0, hw - (bL + bR) / 2)
      const ihh = Math.max(0, hh - (bT + bB) / 2)
      const icx = (bL - bR) / 2
      const icy = (bT - bB) / 2
      const ir0 = Math.max(0, rad[0] - Math.max(bL, bT))
      const ir1 = Math.max(0, rad[1] - Math.max(bR, bT))
      const ir2 = Math.max(0, rad[2] - Math.max(bR, bB))
      const ir3 = Math.max(0, rad[3] - Math.max(bL, bB))
      d[i++] = ihw
      d[i++] = ihh
      d[i++] = icx
      d[i++] = icy
      d[i++] = ir0
      d[i++] = ir1
      d[i++] = ir2
      d[i++] = ir3
      d[i++] = Math.max(0, ihw - spread)
      d[i++] = Math.max(0, ihh - spread)
      d[i++] = sigma
      d[i++] = 0
      d[i++] = Math.max(0, ir0 - spread)
      d[i++] = Math.max(0, ir1 - spread)
      d[i++] = Math.max(0, ir2 - spread)
      d[i++] = Math.max(0, ir3 - spread)
      d[i++] = col.r
      d[i++] = col.g
      d[i++] = col.b
      d[i++] = col.a
      d[i++] = icx + ox
      d[i++] = icy + oy
      d[i++] = 0
      d[i++] = 0
      qx = hw + QUAD_MARGIN
      qy = hh + QUAD_MARGIN
    }
    this.writeShapeQuad(o.inset ? MODE_SHADOW_INSET : MODE_SHADOW_OUTER, o.x + hw, o.y + hh, qx, qy, base, o.opacity ?? 1)
    this.stats.shadows++
  }

  /**
   * Blurred backdrop of the pixels behind a rounded rect (`backdrop-filter`). One quad + two table texels; the blur itself is
   * shared (see {@link BackdropBlur}). Returns false when backdrop blur is off — the caller then just paints its own (translucent)
   * background. The first backdrop quad of a frame starts a new draw call so the framebuffer copy sees everything drawn before it.
   */
  fillBackdrop(o: BackdropOptions): boolean {
    const blur = this.backdrop
    const camera = this.camera
    if (!blur || !camera) return false
    const w = o.width
    const h = o.height
    if (!(w > 0) || !(h > 0)) return false
    const level = blur.levelFor(o.blur)
    const bit = 1 << level
    // One copy serves every blurred element — until one overlaps UI painted after that copy: it would blur (and cover) a stale
    // picture, so a new capture generation starts. Blurred panels over the game scene always share generation 1.
    if (this.backdropEpoch === 0 || this.isDirty(o.x - QUAD_MARGIN, o.y - QUAD_MARGIN, o.x + w + QUAD_MARGIN, o.y + h + QUAD_MARGIN)) {
      this.backdropEpoch++
      this.backdropRequested = 0
      this.dirtyCells.fill(0)
    }
    if (!(this.backdropRequested & bit)) {
      this.backdropRequested |= bit
      this.pendingBackdropBits |= bit
    }
    const rad = normalizeRadii(o.radii, w, h, this.tmpRadii)
    const base = this.table.alloc(BACKDROP_ENTRY)
    const d = this.table.data
    let i = base * 4
    d[i++] = w / 2
    d[i++] = h / 2
    d[i++] = o.brightness ?? 1
    d[i++] = o.saturate ?? 1
    d[i++] = rad[0]
    d[i++] = rad[1]
    d[i++] = rad[2]
    d[i++] = rad[3]

    this.assertBegun('fillBackdrop')
    this.reserve(4, 6)
    this.mode = MODE_BACKDROP
    this.texFree = true
    const seg = this.useState(this.whiteRegion.texture)
    seg.backdrop |= bit
    const m = QUAD_MARGIN
    const cx = o.x + w / 2
    const cy = o.y + h / 2
    const hw = w / 2 + m
    const hh = h / 2 + m
    const t = this.transform
    const f = this.vertices
    const alpha = o.opacity ?? 1
    const v = this.tmpV3
    let vi = this.vertexCount * VERTEX_STRIDE
    const baseIndex = this.vertexCount
    // corners TL TR BR BL; the uv attribute carries the *screen* position of each (transformed) corner
    for (let k = 0; k < 4; k++) {
      const sx = k === 1 || k === 2 ? 1 : -1
      const sy = k >= 2 ? 1 : -1
      let x = cx + sx * hw
      let y = cy + sy * hh
      if (!t.isIdentity()) {
        const tx = t.applyX(x, y)
        y = t.applyY(x, y)
        x = tx
      }
      this.bdX[k] = x
      this.bdY[k] = y
      v.set(x, y, 0).project(camera)
      this.dataIndex = base
      vi = this.vertex(f, vi, x, y, (v.x + 1) / 2, (v.y + 1) / 2, 1, 1, 1, alpha, sx * hw, sy * hh, level, 0, 0, 0, 0, 0, 0, 0)
    }
    const idx = this.indices
    let kk = this.indexCount
    idx[kk++] = baseIndex
    idx[kk++] = baseIndex + 1
    idx[kk++] = baseIndex + 2
    idx[kk++] = baseIndex + 2
    idx[kk++] = baseIndex + 3
    idx[kk++] = baseIndex
    this.vertexCount += 4
    this.indexCount = kk
    seg.indexCount += 6
    this.stats.sprites++
    this.mode = MODE_SPRITE
    this.texFree = false
    this.dataIndex = 0
    const bx0 = Math.min(this.bdX[0]!, this.bdX[1]!, this.bdX[2]!, this.bdX[3]!)
    const by0 = Math.min(this.bdY[0]!, this.bdY[1]!, this.bdY[2]!, this.bdY[3]!)
    const bx1 = Math.max(this.bdX[0]!, this.bdX[1]!, this.bdX[2]!, this.bdX[3]!)
    const by1 = Math.max(this.bdY[0]!, this.bdY[1]!, this.bdY[2]!, this.bdY[3]!)
    if (this.dirtyTracking) this.markDirty(bx0, by0, bx1, by1)
    seg.minX = Math.min(seg.minX, bx0 + QUAD_MARGIN)
    seg.minY = Math.min(seg.minY, by0 + QUAD_MARGIN)
    seg.maxX = Math.max(seg.maxX, bx1 - QUAD_MARGIN)
    seg.maxY = Math.max(seg.maxY, by1 - QUAD_MARGIN)
    return true
  }

  /**
   * Draw a glyph quad from the atlas' coverage channel (the atlas RGB is ignored, so fonts may carry
   * extra channels). Uses the batch tint.
   */
  drawGlyph(texture: Texture, x: number, y: number, width: number, height: number, u: number, v: number, u2: number, v2: number): void {
    const c = this._color
    this.mode = MODE_GLYPH
    this.writeRect(texture, x, y, width, height, u, v, u2, v2, c.r, c.g, c.b, c.a, 0, 0, 0, 0, 0, 0, 0, 0)
    this.mode = MODE_SPRITE
  }

  /**
   * Draw a glyph quad from the atlas' distance channel (R): coverage is where `distance >= threshold`, softened
   * over `softness` (both in channel units, 0..1; `softness` 0 = one screen pixel). With `innerThreshold` ≤ 1 the
   * result is the ring between the two thresholds (a centered stroke); pass 9 to disable it.
   * Used for text outlines and text shadows; the batch tint is the effect color.
   */
  drawGlyphEffect(texture: Texture, x: number, y: number, width: number, height: number, u: number, v: number, u2: number, v2: number, threshold: number, softness: number, innerThreshold = 9): void {
    const c = this._color
    this.mode = MODE_GLYPH_EFFECT
    this.writeRect(texture, x, y, width, height, u, v, u2, v2, c.r, c.g, c.b, c.a, threshold, softness, innerThreshold, 0, 0, 0, 0, 0)
    this.mode = MODE_SPRITE
  }

  private readonly tmpRadii: [number, number, number, number] = [0, 0, 0, 0]
  private readonly bdX = [0, 0, 0, 0]
  private readonly effectiveClips: (ClipRect | null)[] = []
  /** Anti-aliasing margin of the quad being written (excluded from segment bounds). */
  private boundsInset = 0
  private readonly bdY = [0, 0, 0, 0]
  private readonly tmpLab: [number, number, number] = [0, 0, 0]

  /** A quad centered on a box whose SDF origin is the quad center; its vertices carry a table-entry index. */
  private writeShapeQuad(mode: number, cx: number, cy: number, hw: number, hh: number, data: number, alpha: number): void {
    this.mode = mode
    this.texFree = true
    this.dataIndex = data
    this.boundsInset = mode === MODE_SHADOW_OUTER ? 0 : QUAD_MARGIN
    this.writeQuad(this.whiteRegion.texture, cx - hw, cy - hh, cx + hw, cy - hh, cx + hw, cy + hh, cx - hw, cy + hh, 0, 0, 1, 1, 1, 1, 1, alpha, hw, hh, 0, 0, 0, 0, 0, 0)
    this.mode = MODE_SPRITE
    this.texFree = false
    this.dataIndex = 0
    this.boundsInset = 0
  }

  // ───────────────────────────── backdrop dirty tracking ─────────────────────────────

  /** Size the "painted since the last capture" grid to the camera's frustum (orthographic cameras only). */
  private setupDirtyGrid(camera: Camera | null): void {
    const c = camera as (Camera & { isOrthographicCamera?: boolean; left: number; right: number; top: number; bottom: number }) | null
    this.dirtyTracking = this.backdrop !== null && c !== null && c.isOrthographicCamera === true
    if (!this.dirtyTracking || !c) return
    const x0 = Math.min(c.left, c.right)
    const y0 = Math.min(c.top, c.bottom)
    this.dirtyX0 = x0
    this.dirtyY0 = y0
    this.dirtyCellW = Math.max(1e-6, Math.abs(c.right - c.left) / DIRTY_COLS)
    this.dirtyCellH = Math.max(1e-6, Math.abs(c.top - c.bottom) / DIRTY_ROWS)
    this.dirtyCells.fill(0)
  }

  private markDirty(minX: number, minY: number, maxX: number, maxY: number): void {
    const c0 = Math.max(0, Math.floor((minX - this.dirtyX0) / this.dirtyCellW))
    const c1 = Math.min(DIRTY_COLS - 1, Math.floor((maxX - this.dirtyX0) / this.dirtyCellW))
    const r0 = Math.max(0, Math.floor((minY - this.dirtyY0) / this.dirtyCellH))
    const r1 = Math.min(DIRTY_ROWS - 1, Math.floor((maxY - this.dirtyY0) / this.dirtyCellH))
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) this.dirtyCells[r * DIRTY_COLS + c] = 1
  }

  /** Was anything painted into this rect since the last backdrop capture? (Conservative: cell granularity.) */
  private isDirty(minX: number, minY: number, maxX: number, maxY: number): boolean {
    if (!this.dirtyTracking) return true
    const c0 = Math.max(0, Math.floor((minX - this.dirtyX0) / this.dirtyCellW))
    const c1 = Math.min(DIRTY_COLS - 1, Math.floor((maxX - this.dirtyX0) / this.dirtyCellW))
    const r0 = Math.max(0, Math.floor((minY - this.dirtyY0) / this.dirtyCellH))
    const r1 = Math.min(DIRTY_ROWS - 1, Math.floor((maxY - this.dirtyY0) / this.dirtyCellH))
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (this.dirtyCells[r * DIRTY_COLS + c]) return true
    return false
  }

  // ───────────────────────────── internals ─────────────────────────────

  protected assertBegun(what: string): void {
    if (!this._begun) {
      throw new Error(`[three-2d] SpriteBatch.${what}() called outside begin()/end()`)
    }
  }

  private writeRect(
    tex: Texture,
    x: number,
    y: number,
    w: number,
    h: number,
    u: number,
    v: number,
    u2: number,
    v2: number,
    r: number,
    g: number,
    b: number,
    a: number,
    hw: number,
    hh: number,
    radius: number,
    bw: number,
    br: number,
    bg: number,
    bb: number,
    ba: number,
  ): void {
    this.writeQuad(tex, x, y, x + w, y, x + w, y + h, x, y + h, u, v, u2, v2, r, g, b, a, hw, hh, radius, bw, br, bg, bb, ba)
  }

  /** Reserve room for `vertexN` vertices / `indexN` indices, flushing for capacity if needed. */
  protected reserve(vertexN: number, indexN: number): void {
    if (this.vertexCount + vertexN > this.maxSprites * 4 || this.indexCount + indexN > this.indices.length) {
      if (vertexN > this.maxSprites * 4 || indexN > this.indices.length) {
        throw new Error('[three-2d] a single draw exceeds the batch capacity; raise maxSprites')
      }
      if (!this.renderer) {
        throw new Error(`[three-2d] batch capacity (${this.maxSprites} sprites) exceeded and no renderer was supplied to flush into`)
      }
      this.submit('capacity')
    }
  }

  /** Switch segment state if needed; returns after `this.segments` tail matches (texture, blend, clip). */
  protected useState(tex: Texture): BatchSegment {
    const n = this.segmentCount
    let seg = n > 0 ? this.segments[n - 1]! : undefined
    const blend = this._blend
    const clip = this.currentClip
    const forceBreak = this.pendingBackdropBits !== 0
    // Solid fills, boxes and shadows ignore their texture, so they extend the current segment instead of forcing a texture switch.
    if (!forceBreak && seg && (seg.texture === tex || (this.texFree && seg.indexCount > 0)) && seg.blend === blend && seg.clip === clip) {
      if (seg.loose && !this.texFree) {
        seg.texture = tex
        seg.loose = false
      }
      return seg
    }
    // a segment that so far holds only boxes / shadows can take the first real texture instead of forcing a draw-call split
    if (!forceBreak && seg && seg.loose && !this.texFree && seg.indexCount > 0 && seg.blend === blend && seg.clip === clip) {
      seg.texture = tex
      seg.loose = false
      return seg
    }
    if (seg && seg.indexCount > 0) {
      const reason: FlushReason = forceBreak ? 'backdrop' : seg.texture !== tex ? 'texture' : seg.blend !== blend ? 'blend' : 'clip'
      this.closeSegment(seg, reason)
      if (reason === 'texture') this.stats.textureSwitches++
      seg = undefined
    } else if (seg) {
      // empty tail segment: just retarget it
      seg.texture = tex
      seg.blend = blend
      seg.clip = clip
      seg.loose = this.texFree
      seg.minX = seg.minY = Infinity
      seg.maxX = seg.maxY = -Infinity
      seg.backdrop |= this.takeBackdropBits()
      seg.backdropEpoch = this.backdropEpoch
      return seg
    }
    seg = this.segmentPool[this.segmentCount]
    if (!seg) this.segmentPool[this.segmentCount] = seg = { texture: null, blend: 'normal', clip: null, indexStart: 0, indexCount: 0, backdrop: 0, backdropEpoch: 0, loose: false, minX: 0, minY: 0, maxX: 0, maxY: 0 }
    this.segments[this.segmentCount] = seg
    this.segmentCount++
    seg.texture = tex
    seg.blend = blend
    seg.clip = clip
    seg.indexStart = this.indexCount
    seg.indexCount = 0
    seg.loose = this.texFree
    seg.minX = seg.minY = Infinity
    seg.maxX = seg.maxY = -Infinity
    seg.backdrop = this.takeBackdropBits()
    seg.backdropEpoch = this.backdropEpoch
    return seg
  }

  private takeBackdropBits(): number {
    const bits = this.pendingBackdropBits
    this.pendingBackdropBits = 0
    return bits
  }

  private closeSegment(seg: BatchSegment, reason: FlushReason): void {
    this.stats.flushes++
    this.stats.flushReasons[reason]++
    this.onFlush?.(reason, seg)
  }

  protected writeQuad(
    tex: Texture,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    u: number,
    v: number,
    u2: number,
    v2: number,
    r: number,
    g: number,
    b: number,
    a: number,
    hw: number,
    hh: number,
    radius: number,
    bw: number,
    br: number,
    bg: number,
    bb: number,
    ba: number,
  ): void {
    this.assertBegun('draw')
    if (isDev() && (tex as { image?: unknown }).image == null && !(tex as { isRenderTargetTexture?: boolean }).isRenderTargetTexture) {
      warnOnce(`missing-texture-${tex.uuid}`, 'drawing a texture with no image data (missing or disposed texture?)')
    }
    this.reserve(4, 6)
    const seg = this.useState(tex)
    const t = this.transform
    if (!t.isIdentity()) {
      const tx0 = t.applyX(x0, y0)
      const ty0 = t.applyY(x0, y0)
      const tx1 = t.applyX(x1, y1)
      const ty1 = t.applyY(x1, y1)
      const tx2 = t.applyX(x2, y2)
      const ty2 = t.applyY(x2, y2)
      const tx3 = t.applyX(x3, y3)
      const ty3 = t.applyY(x3, y3)
      x0 = tx0
      y0 = ty0
      x1 = tx1
      y1 = ty1
      x2 = tx2
      y2 = ty2
      x3 = tx3
      y3 = ty3
    }
    const bx0 = Math.min(x0, x1, x2, x3)
    const by0 = Math.min(y0, y1, y2, y3)
    const bx1 = Math.max(x0, x1, x2, x3)
    const by1 = Math.max(y0, y1, y2, y3)
    if (this.dirtyTracking) this.markDirty(bx0, by0, bx1, by1)
    // true bounds exclude the 1px anti-aliasing margin of box quads (`boundsInset`)
    const inset = this.boundsInset
    if (bx0 + inset < seg.minX) seg.minX = bx0 + inset
    if (by0 + inset < seg.minY) seg.minY = by0 + inset
    if (bx1 - inset > seg.maxX) seg.maxX = bx1 - inset
    if (by1 - inset > seg.maxY) seg.maxY = by1 - inset
    const f = this.vertices
    let i = this.vertexCount * VERTEX_STRIDE
    const base = this.vertexCount
    // TL
    i = this.vertex(f, i, x0, y0, u, v, r, g, b, a, -hw, -hh, hw, hh, radius, bw, br, bg, bb, ba)
    // TR
    i = this.vertex(f, i, x1, y1, u2, v, r, g, b, a, hw, -hh, hw, hh, radius, bw, br, bg, bb, ba)
    // BR
    i = this.vertex(f, i, x2, y2, u2, v2, r, g, b, a, hw, hh, hw, hh, radius, bw, br, bg, bb, ba)
    // BL
    this.vertex(f, i, x3, y3, u, v2, r, g, b, a, -hw, hh, hw, hh, radius, bw, br, bg, bb, ba)
    const idx = this.indices
    let k = this.indexCount
    idx[k++] = base
    idx[k++] = base + 1
    idx[k++] = base + 2
    idx[k++] = base + 2
    idx[k++] = base + 3
    idx[k++] = base
    this.vertexCount += 4
    this.indexCount = k
    seg.indexCount += 6
    this.stats.sprites++
  }

  protected vertex(
    f: Float32Array,
    i: number,
    x: number,
    y: number,
    u: number,
    v: number,
    r: number,
    g: number,
    b: number,
    a: number,
    lx: number,
    ly: number,
    hw: number,
    hh: number,
    radius: number,
    bw: number,
    br: number,
    bg: number,
    bb: number,
    ba: number,
  ): number {
    f[i] = x
    f[i + 1] = y
    f[i + 2] = 0
    f[i + OFFSET_UV] = u
    f[i + OFFSET_UV + 1] = v
    f[i + OFFSET_COLOR] = r
    f[i + OFFSET_COLOR + 1] = g
    f[i + OFFSET_COLOR + 2] = b
    f[i + OFFSET_COLOR + 3] = a
    f[i + OFFSET_LOCAL] = lx
    f[i + OFFSET_LOCAL + 1] = ly
    f[i + OFFSET_SHAPE] = hw
    f[i + OFFSET_SHAPE + 1] = hh
    f[i + OFFSET_SHAPE + 2] = radius
    f[i + OFFSET_SHAPE + 3] = bw
    f[i + OFFSET_BORDER] = br
    f[i + OFFSET_BORDER + 1] = bg
    f[i + OFFSET_BORDER + 2] = bb
    f[i + OFFSET_BORDER + 3] = ba
    f[i + OFFSET_MODE] = this.mode
    f[i + OFFSET_DATA] = this.dataIndex
    return i + VERTEX_STRIDE
  }

  /** Append raw triangle data (used by PolygonSpriteBatch). */
  protected writeTriangles(tex: Texture, positions: ArrayLike<number>, uvs: ArrayLike<number>, triangles: ArrayLike<number>, r: number, g: number, b: number, a: number): void {
    this.assertBegun('drawPolygon')
    const vn = positions.length >> 1
    this.reserve(vn, triangles.length)
    const seg = this.useState(tex)
    const t = this.transform
    const ident = t.isIdentity()
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    const f = this.vertices
    const base = this.vertexCount
    let i = base * VERTEX_STRIDE
    for (let n = 0; n < vn; n++) {
      let x = positions[n * 2]!
      let y = positions[n * 2 + 1]!
      if (!ident) {
        const tx = t.applyX(x, y)
        y = t.applyY(x, y)
        x = tx
      }
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      i = this.vertex(f, i, x, y, uvs[n * 2]!, uvs[n * 2 + 1]!, r, g, b, a, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
    }
    const idx = this.indices
    let k = this.indexCount
    for (let n = 0; n < triangles.length; n++) idx[k++] = base + triangles[n]!
    if (vn > 0) {
      if (this.dirtyTracking) this.markDirty(minX, minY, maxX, maxY)
      if (minX < seg.minX) seg.minX = minX
      if (minY < seg.minY) seg.minY = minY
      if (maxX > seg.maxX) seg.maxX = maxX
      if (maxY > seg.maxY) seg.maxY = maxY
    }
    this.vertexCount += vn
    this.indexCount = k
    seg.indexCount += triangles.length
    this.stats.sprites += triangles.length / 3 / 2
  }

  protected colorState(): Color4 {
    return this._color
  }

  // ───────────────────────────── submission ─────────────────────────────

  /** Next unused mesh for `material` this frame (created on demand, bound to that material forever). */
  private acquireMesh(material: MeshBasicNodeMaterial): Mesh {
    let pool = this.meshPools.get(material)
    if (!pool) this.meshPools.set(material, (pool = []))
    const i = this.meshCursor.get(material) ?? 0
    this.meshCursor.set(material, i + 1)
    let mesh = pool[i]
    if (!mesh) {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new InterleavedBufferAttribute(this.interleaved, 3, 0))
      geometry.setAttribute('uv', new InterleavedBufferAttribute(this.interleaved, 2, OFFSET_UV))
      geometry.setAttribute('aColor', new InterleavedBufferAttribute(this.interleaved, 4, OFFSET_COLOR))
      geometry.setAttribute('aLocal', new InterleavedBufferAttribute(this.interleaved, 2, OFFSET_LOCAL))
      geometry.setAttribute('aShape', new InterleavedBufferAttribute(this.interleaved, 4, OFFSET_SHAPE))
      geometry.setAttribute('aBorder', new InterleavedBufferAttribute(this.interleaved, 4, OFFSET_BORDER))
      geometry.setAttribute('aMode', new InterleavedBufferAttribute(this.interleaved, 1, OFFSET_MODE))
      geometry.setAttribute('aData', new InterleavedBufferAttribute(this.interleaved, 1, OFFSET_DATA))
      geometry.setIndex(this.indexAttribute)
      geometry.addEventListener('dispose', this.onGeometryDispose)
      mesh = new Mesh(geometry, material)
      mesh.frustumCulled = false
      mesh.matrixAutoUpdate = false
      mesh.visible = false
      pool.push(mesh)
      this.meshes.push(mesh)
      this.scene.add(mesh)
    }
    return mesh
  }

  private submit(reason: FlushReason): void {
    const last = this.segmentCount > 0 ? this.segments[this.segmentCount - 1]! : undefined
    if (last && last.indexCount > 0) {
      this.closeSegment(last, reason)
    } else {
      this.stats.flushReasons[reason]++
    }
    if (this.indexCount === 0) return

    // upload only the used ranges
    this.interleaved.clearUpdateRanges()
    this.interleaved.addUpdateRange(0, this.vertexCount * VERTEX_STRIDE)
    this.interleaved.needsUpdate = true
    this.indexAttribute.clearUpdateRanges()
    this.indexAttribute.addUpdateRange(0, this.indexCount)
    this.indexAttribute.needsUpdate = true
    this.table.upload()

    for (const mesh of this.meshes) mesh.visible = false
    this.meshCursor.clear()
    this.segMeshes.length = 0
    for (let i = 0; i < this.segmentCount; i++) {
      const seg = this.segments[i]!
      const mesh = this.acquireMesh(this.materials.get(seg.texture!, seg.blend))
      mesh.geometry.setDrawRange(seg.indexStart, seg.indexCount)
      mesh.renderOrder = i
      mesh.visible = !this.renderer
      this.segMeshes[i] = mesh
    }

    if (this.renderer && this.camera) this.renderGroups(this.renderer, this.camera)

    if (reason === 'capacity' || reason === 'explicit') {
      // Everything buffered so far has been drawn; keep filling from the start.
      this.vertexCount = 0
      this.indexCount = 0
      this.segmentCount = 0
      this.segments.length = 0
      this.table.reset()
    }
  }

  /** Render consecutive segments sharing a clip rect with one `renderer.render()` each. */
  private renderGroups(renderer: BatchRenderer, camera: Camera): void {
    const prevAutoClear = renderer.autoClear
    const prevTest = renderer.getScissorTest()
    const prevScissor = renderer.getScissor(this.tmpScissor).clone()
    renderer.autoClear = false
    try {
      let i = 0
      const n = this.segmentCount
      const blur = this.backdrop
      const unprepared = (k: number): number => {
        if (!blur) return 0
        const seg = this.segments[k]!
        let bits = seg.backdrop
        if (bits === 0) return 0
        for (let level = 0; level < 3; level++) if (blur.isPrepared(level, seg.backdropEpoch)) bits &= ~(1 << level)
        return bits
      }
      // A scissor that contains everything its segment painted clips nothing: treat it as "no clip" so neighbouring
      // segments merge into one render() call (each call costs ~1 ms of fixed renderer overhead)
      const eff = this.effectiveClips
      eff.length = n
      for (let k = 0; k < n; k++) {
        const seg = this.segments[k]!
        const c = seg.clip
        eff[k] = c && !(seg.minX >= c.x - 1e-3 && seg.minY >= c.y - 1e-3 && seg.maxX <= c.x + c.width + 1e-3 && seg.maxY <= c.y + c.height + 1e-3) ? c : null
      }
      while (i < n) {
        const clip = eff[i]!
        // the blur must be built from everything rendered so far: prepare right before the first segment that needs it
        const need = unprepared(i)
        if (need !== 0) blur!.prepare(need, this.segments[i]!.backdropEpoch)
        let j = i + 1
        while (j < n && sameClip(eff[j]!, clip) && unprepared(j) === 0) j++
        for (let k = i; k < j; k++) this.segMeshes[k]!.visible = true
        if (clip) {
          if (clip.width <= 0 || clip.height <= 0) {
            // fully clipped: nothing to draw
          } else {
            this.applyScissor(renderer, camera, clip)
            renderer.setScissorTest(true)
            renderer.render(this.scene, camera)
            this.stats.renderPasses++
            this.stats.drawCalls += j - i
          }
        } else {
          renderer.setScissorTest(false)
          renderer.render(this.scene, camera)
          this.stats.renderPasses++
          this.stats.drawCalls += j - i
        }
        for (let k = i; k < j; k++) this.segMeshes[k]!.visible = false
        i = j
      }
    } finally {
      renderer.autoClear = prevAutoClear
      renderer.setScissorTest(prevTest)
      renderer.setScissor(prevScissor.x, prevScissor.y, prevScissor.z, prevScissor.w)
    }
  }

  private applyScissor(renderer: BatchRenderer, camera: Camera, clip: ClipRect): void {
    const vp = renderer.getViewport(this.tmpVec4)
    const p = this.tmpV3
    p.set(clip.x, clip.y, 0).project(camera)
    const sx0 = vp.x + ((p.x + 1) / 2) * vp.z
    p.set(clip.x + clip.width, clip.y + clip.height, 0).project(camera)
    const sx1 = vp.x + ((p.x + 1) / 2) * vp.z
    // `WebGPURenderer` (both backends) takes scissors from the top-left; a classic `WebGLRenderer` from the bottom-left (GL).
    const bottomLeft = (renderer as { isWebGLRenderer?: boolean }).isWebGLRenderer === true
    const row = (ndcY: number) => vp.y + (bottomLeft ? (ndcY + 1) / 2 : (1 - ndcY) / 2) * vp.w
    p.set(clip.x, clip.y, 0).project(camera)
    const sy0 = row(p.y)
    p.set(clip.x + clip.width, clip.y + clip.height, 0).project(camera)
    const sy1 = row(p.y)
    // tolerate float error from the projection so exact-pixel clips stay exact
    const x = Math.max(0, Math.floor(Math.min(sx0, sx1) + 1e-3))
    const y = Math.max(0, Math.floor(Math.min(sy0, sy1) + 1e-3))
    const w = Math.max(0, Math.ceil(Math.max(sx0, sx1) - 1e-3) - x)
    const h = Math.max(0, Math.ceil(Math.max(sy0, sy1) - 1e-3) - y)
    renderer.setScissor(x, y, w, h)
  }

  /**
   * Every pooled mesh has its own `BufferGeometry` but they all share ONE interleaved vertex buffer and ONE index buffer.
   * A classic `WebGLRenderer` deletes a geometry's GL buffers when it is disposed — and `WebGLNodesHandler` disposes the
   * geometry after every node-material build — which would leave the sibling meshes' VAOs pointing at deleted buffers
   * ("no buffer is bound to enabled attribute"). So disposing one geometry disposes them all: every mesh re-binds
   * against the re-created buffers on its next draw.
   */
  private cascading = false
  private readonly onGeometryDispose = (event: { target?: unknown }): void => {
    if (this.cascading || this.disposed) return
    this.cascading = true
    try {
      for (const mesh of this.meshes) if (mesh.geometry !== event.target) mesh.geometry.dispose()
    } finally {
      this.cascading = false
    }
  }

  /** Number of pooled meshes (one per distinct segment slot ever used). */
  get meshCount(): number {
    return this.meshes.length
  }

  /** Release GPU resources. Safe to call repeatedly. */
  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    for (const mesh of this.meshes) {
      mesh.geometry.dispose()
      this.scene.remove(mesh)
    }
    this.meshes.length = 0
    this.materials.dispose()
    this.table.dispose()
    this.backdrop?.dispose()
    this.whiteTexture?.dispose()
    this.whiteTexture = null
    this.whiteRegionCache = null
    this.renderer = null
    this.camera = null
  }

  get isDisposed(): boolean {
    return this.disposed
  }
}
