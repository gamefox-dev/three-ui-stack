import {
  FramebufferTexture,
  LinearFilter,
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  RenderTarget,
  Scene,
  UnsignedByteType,
  Vector2,
  type Camera,
  type Object3D,
  type Texture,
} from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { clamp, float, texture, uniform, uv, vec2, vec4 } from 'three/tsl'
import { linearToSrgbInline } from './colorNodes'
import type { Disposable } from '../types'

export type BackdropQuality = 'off' | 'low' | 'full'

/** Blur sources a backdrop quad can sample. */
export const BACKDROP_RAW = 0
export const BACKDROP_SMALL = 1
export const BACKDROP_LARGE = 2

/** Blur radius (px) above which `full` quality switches from the small to the large blur. */
export const LARGE_BLUR_RADIUS = 20

/** Structural subset of Three's `WebGPURenderer` the blur needs (caller-owned). */
export interface BackdropRenderer {
  autoClear: boolean
  render(scene: Object3D, camera: Camera): void
  getRenderTarget(): RenderTarget | null
  setRenderTarget(target: RenderTarget | null): void
  getScissorTest(): boolean
  setScissorTest(enable: boolean): void
  getDrawingBufferSize(target: Vector2): Vector2
  copyFramebufferToTexture(texture: FramebufferTexture, rectangle?: unknown): void
}

/** Anything with a mutable texture slot (a TSL texture node): pointed at the current texture whenever it is re-created. */
export interface TextureSlot {
  value: unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any

interface Pass {
  material: MeshBasicNodeMaterial
  mesh: Mesh
  target: RenderTarget
  /** The sampled input; its texture is assigned right before the pass runs. */
  input: { value: unknown }
  /** Destination texel size, kept in sync with `target`. */
  texel: { value: Vector2 }
}

/** Dual-Kawase downsample: 5 taps (center ×4 + four diagonals) / 8, offsets are half destination texels. */
function downsample(sample: (o: N) => N, texel: N): N {
  const hp = texel.mul(0.5)
  const sum = sample(vec2(0, 0))
    .mul(4)
    .add(sample(vec2(hp.x.negate(), hp.y.negate())))
    .add(sample(vec2(hp.x, hp.y)))
    .add(sample(vec2(hp.x, hp.y.negate())))
    .add(sample(vec2(hp.x.negate(), hp.y)))
  return vec4(sum.rgb.div(8), float(1))
}

/** Dual-Kawase upsample: 8-tap tent; `texel` is the (finer) destination texel, so the source is 2 texels per tap. */
function upsample(sample: (o: N) => N, texel: N): N {
  const t = texel
  const sum = sample(vec2(t.x.mul(-2), 0))
    .add(sample(vec2(t.x.negate(), t.y)).mul(2))
    .add(sample(vec2(0, t.y.mul(2))))
    .add(sample(vec2(t.x, t.y)).mul(2))
    .add(sample(vec2(t.x.mul(2), 0)))
    .add(sample(vec2(t.x, t.y.negate())).mul(2))
    .add(sample(vec2(0, t.y.mul(-2))))
    .add(sample(vec2(t.x.negate(), t.y.negate())).mul(2))
  return vec4(sum.rgb.div(12), float(1))
}

function makeTarget(w: number, h: number): RenderTarget {
  const rt = new RenderTarget(w, h, { type: UnsignedByteType, format: RGBAFormat, depthBuffer: false, generateMipmaps: false, samples: 1 } as never)
  rt.texture.minFilter = LinearFilter
  rt.texture.magFilter = LinearFilter
  return rt
}

// resolution divisors of [d1, d2, d3, d4, u3, u2, u1]
const DIVISORS = [2, 4, 8, 16, 8, 4, 2] as const

/**
 * Screen-space backdrop for `backdrop-filter: blur()`: ONE framebuffer copy per frame (taken the first time something
 * needs the backdrop, so it contains everything painted before it), then a dual-Kawase downsample/upsample chain at
 * 1/2 … 1/16 resolution. Two blur strengths exist (small / large) and every element shares them — cost is independent
 * of the number of blurred elements, and nothing runs in a frame where no element asked for a backdrop.
 *
 * Per frame: 1 copy + 3 passes (small blur, ≤ 1/2 res) and/or 6 passes (large blur, ≤ 1/2 res). `low` quality
 * has the small blur only. Works on WebGPU and WebGL2 (it needs only `copyFramebufferToTexture` + render targets).
 */
export class BackdropBlur implements Disposable {
  readonly quality: Exclude<BackdropQuality, 'off'>
  private readonly renderer: BackdropRenderer
  private readonly scene = new Scene()
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private readonly geometry = new PlaneGeometry(2, 2)
  private readonly size = new Vector2()
  private capture: FramebufferTexture
  private readonly slots: [Set<TextureSlot>, Set<TextureSlot>, Set<TextureSlot>] = [new Set(), new Set(), new Set()]
  /** [d1, d2, d3, d4, u3, u2, u1] */
  private readonly targets: RenderTarget[] = []
  private passes: Pass[] = []
  private bufferW = 0
  private bufferH = 0
  private preparedMask = 0
  /** The capture generation the textures currently hold (a new one starts when a blurred element overlaps UI painted after the last copy). */
  epoch = 0
  private copiedEpoch = false
  private disposed = false

  /**
   * Three's WebGPU backend renders into an internal linear frame buffer and converts on output, so the framebuffer copy holds
   * linear values there (WebGL2 copies the already-encoded default framebuffer). The first blur pass normalizes both to
   * sRGB-encoded 8-bit, which every later pass and the shader assume.
   */
  readonly captureIsLinear: boolean

  /** Blur passes run since the last `beginFrame()` (stats / tests). */
  passCount = 0
  /** Framebuffer copies since the last `beginFrame()`: one per capture generation (usually exactly 1). */
  copyCount = 0

  constructor(renderer: BackdropRenderer, quality: Exclude<BackdropQuality, 'off'>) {
    this.quality = quality
    this.renderer = renderer
    this.captureIsLinear = (renderer as unknown as { backend?: { isWebGPUBackend?: boolean } }).backend?.isWebGPUBackend === true
    this.capture = BackdropBlur.makeCapture(1, 1)
    for (let i = 0; i < DIVISORS.length; i++) this.targets.push(makeTarget(1, 1))
  }

  private static makeCapture(w: number, h: number): FramebufferTexture {
    const t = new FramebufferTexture(w, h)
    t.minFilter = LinearFilter
    t.magFilter = LinearFilter
    return t
  }

  /** Source texture for a blur level (stable except `BACKDROP_RAW`, which is re-created when the canvas resizes). */
  textureFor(level: number): Texture {
    if (level === BACKDROP_RAW) return this.capture
    return level === BACKDROP_SMALL ? this.targets[6]!.texture : this.targets[5]!.texture
  }

  /** Follow a level's texture across re-allocations (sets `slot.value` now and whenever it changes). */
  subscribe(level: number, slot: TextureSlot): void {
    slot.value = this.textureFor(level)
    this.slots[level]!.add(slot)
  }

  /** Which level an element with this blur radius samples. */
  levelFor(blurRadius: number): number {
    if (blurRadius <= 0) return BACKDROP_RAW
    if (this.quality === 'low') return BACKDROP_SMALL
    return blurRadius > LARGE_BLUR_RADIUS ? BACKDROP_LARGE : BACKDROP_SMALL
  }

  beginFrame(): void {
    this.epoch = 0
    this.preparedMask = 0
    this.passCount = 0
    this.copyCount = 0
  }

  isPrepared(level: number, epoch: number): boolean {
    return epoch === this.epoch && (this.preparedMask & (1 << level)) !== 0
  }

  /**
   * Make the levels in `mask` (`1 << level` bits) available: copy the framebuffer once, run the blur chains that were
   * asked for. Call between render submissions so the copy sees everything drawn so far.
   */
  prepare(mask: number, epoch: number): void {
    if (this.disposed) return
    if (epoch !== this.epoch) {
      // a new capture generation: everything built from the previous copy is stale
      this.epoch = epoch
      this.preparedMask = 0
      this.copiedEpoch = false
    }
    const need = mask & ~this.preparedMask
    if (need === 0) return
    const r = this.renderer
    if (r.getRenderTarget() !== null) return // only the default framebuffer can be copied
    this.ensureSize()
    const prevAuto = r.autoClear
    const prevScissor = r.getScissorTest()
    r.autoClear = false
    r.setScissorTest(false)
    try {
      if (!this.copiedEpoch) {
        r.copyFramebufferToTexture(this.capture)
        this.copiedEpoch = true
        this.copyCount++
      }
      const blurBits = (1 << BACKDROP_SMALL) | (1 << BACKDROP_LARGE)
      if (need & blurBits) {
        const [d1, d2, d3, d4, u3, u2, u1] = this.passes as [Pass, Pass, Pass, Pass, Pass, Pass, Pass]
        if (!(this.preparedMask & blurBits)) {
          this.run(d1, this.capture) // capture → 1/2
          this.run(d2, d1.target.texture) // → 1/4
        }
        if (need & (1 << BACKDROP_SMALL)) this.run(u1, d2.target.texture) // → 1/2 (small blur)
        if (need & (1 << BACKDROP_LARGE)) {
          this.run(d3, d2.target.texture) // → 1/8
          this.run(d4, d3.target.texture) // → 1/16
          this.run(u3, d4.target.texture) // → 1/8
          this.run(u2, u3.target.texture) // → 1/4 (large blur)
        }
      }
    } finally {
      r.setRenderTarget(null)
      r.autoClear = prevAuto
      r.setScissorTest(prevScissor)
    }
    this.preparedMask |= need | (1 << BACKDROP_RAW)
  }

  private run(pass: Pass, source: Texture): void {
    pass.input.value = source
    this.scene.clear()
    this.scene.add(pass.mesh)
    this.renderer.setRenderTarget(pass.target)
    this.renderer.render(this.scene, this.camera)
    this.passCount++
  }

  /** Size every buffer to the drawing buffer; the copy texture is re-created when it changes. */
  private ensureSize(): void {
    const s = this.renderer.getDrawingBufferSize(this.size)
    const w = Math.max(1, Math.floor(s.x))
    const h = Math.max(1, Math.floor(s.y))
    if (w === this.bufferW && h === this.bufferH && this.passes.length > 0) return
    this.bufferW = w
    this.bufferH = h
    const old = this.capture
    this.capture = BackdropBlur.makeCapture(w, h)
    old.dispose()
    for (const slot of this.slots[BACKDROP_RAW]) slot.value = this.capture
    this.targets.forEach((t, i) => t.setSize(Math.max(1, Math.ceil(w / DIVISORS[i]!)), Math.max(1, Math.ceil(h / DIVISORS[i]!))))
    if (this.passes.length === 0) this.passes = this.targets.map((target, i) => this.makePass(target, i >= 4, i === 0))
    for (const p of this.passes) p.texel.value.set(1 / p.target.width, 1 / p.target.height)
  }

  private makePass(target: RenderTarget, up: boolean, first: boolean): Pass {
    const input = texture(this.capture)
    const texel = { value: new Vector2(1, 1) }
    const texelNode: N = uniform(texel.value)
    const base = uv()
    const sample = (o: N): N => input.sample(base.add(o))
    const material = new MeshBasicNodeMaterial()
    const body: N = up ? upsample(sample, texelNode) : downsample(sample, texelNode)
    // the first pass reads the raw copy: store it sRGB-encoded (see captureIsLinear)
    material.fragmentNode = first && this.captureIsLinear ? vec4(linearToSrgbInline(clamp(body.rgb, 0, 1)), float(1)) : body
    material.blending = NoBlending
    material.depthTest = false
    material.depthWrite = false
    material.toneMapped = false
    const mesh = new Mesh(this.geometry, material)
    mesh.frustumCulled = false
    return { material, mesh, target, input: input as unknown as { value: unknown }, texel }
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.capture.dispose()
    for (const t of this.targets) t.dispose()
    for (const p of this.passes) p.material.dispose()
    this.geometry.dispose()
    for (const s of this.slots) s.clear()
  }
}
