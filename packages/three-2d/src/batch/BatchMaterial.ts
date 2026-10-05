import {
  AdditiveBlending,
  CustomBlending,
  DoubleSide,
  NormalBlending,
  OneFactor,
  SrcColorFactor,
  ZeroFactor,
  OneMinusSrcAlphaFactor,
  OneMinusSrcColorFactor,
  type Texture,
} from 'three'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { abs, attribute, clamp, float, fwidth, length, max, min, mix, select, sRGBTransferEOTF, texture, uv, vec3, vec4 } from 'three/tsl'
import type { BlendMode, Disposable } from '../types'

/**
 * Interleaved vertex layout shared by every batch (floats):
 * position(3) uv(2) color(4) local(2) shape(4) borderColor(4) mode(1)
 * - `local`  : position relative to the quad center in unrotated local units (drives the SDF)
 * - `shape`  : halfWidth, halfHeight, cornerRadius, borderWidth (halfWidth <= 0 disables the SDF path)
 * - `mode`   : 1 = solid fill (texture ignored — lets rects join a text/image segment without a texture switch)
 */
export const VERTEX_STRIDE = 20
export const OFFSET_POSITION = 0
export const OFFSET_UV = 3
export const OFFSET_COLOR = 5
export const OFFSET_LOCAL = 9
export const OFFSET_SHAPE = 11
export const OFFSET_BORDER = 15
export const OFFSET_MODE = 19

export interface BatchMaterialOptions {
  /**
   * Colors handed to the batch are sRGB-encoded (like CSS). When true the shader converts vertex colors
   * to linear so the renderer's output transform reproduces the authored values exactly.
   */
  srgbVertexColors: boolean
}

const BLEND_MODES: readonly BlendMode[] = ['normal', 'additive', 'multiply', 'screen', 'premultiplied']

// TSL's published typings for the transfer functions are narrower than their runtime behavior.
const srgbToLinear = sRGBTransferEOTF as unknown as (n: unknown) => ReturnType<typeof vec4>

function createMaterial(map: Texture, blend: BlendMode, options: BatchMaterialOptions): MeshBasicNodeMaterial {
  const material = new MeshBasicNodeMaterial()

  const vColor = attribute('aColor', 'vec4')
  const vLocal = attribute('aLocal', 'vec2')
  const vShape = attribute('aShape', 'vec4')
  const vBorder = attribute('aBorder', 'vec4')
  const vMode = attribute('aMode', 'float')

  const toLinear = (c: typeof vColor) =>
    options.srgbVertexColors ? vec4(srgbToLinear(c.rgb), c.a) : c

  const sampled = texture(map, uv())
  const tint = toLinear(vColor)
  // branch-free (nested conditionals trip the GLSL node builder): mode 1 = solid, 0 = textured
  const fill = mix(sampled.mul(tint), tint, vMode)
  const border = toLinear(vBorder)

  // Rounded box signed distance (negative inside), in local units.
  const half = vShape.xy
  const radius = vShape.z
  const bw = vShape.w
  const q = abs(vLocal).sub(half.sub(radius))
  const d = length(max(q, 0)).add(min(max(q.x, q.y), 0)).sub(radius)
  const aa = max(fwidth(d), 1e-4)
  const outer = clamp(d.negate().div(aa).add(0.5), 0, 1)
  const inner = select(bw.greaterThan(0), clamp(d.add(bw).negate().div(aa).add(0.5), 0, 1), float(1))
  const shaped = vec4(mix(border.rgb, fill.rgb, inner), mix(border.a, fill.a, inner).mul(outer))

  const color = select(half.x.greaterThan(0), shaped, fill)
  // Multiply / screen blend through the constant blend factors below, so the shader pre-weights rgb by alpha
  // (multiply: lerp toward white; screen: premultiply) to keep translucent pixels well-behaved.
  material.fragmentNode =
    blend === 'multiply'
      ? vec4(mix(vec3(1, 1, 1), color.rgb, color.a), color.a)
      : blend === 'screen'
        ? vec4(color.rgb.mul(color.a), color.a)
        : color

  material.transparent = true
  material.depthTest = false
  material.depthWrite = false
  material.side = DoubleSide
  // DoubleSide + transparent would otherwise render a back-face pass for *all* objects and then a front-face
  // pass, destroying painter's order across segments. One pass keeps draw order exactly as batched.
  material.forceSinglePass = true
  material.toneMapped = false
  material.fog = false

  switch (blend) {
    case 'additive':
      material.blending = AdditiveBlending
      break
    case 'multiply':
      // dst * src (Three's MultiplyBlending insists on premultipliedAlpha, so use explicit factors)
      material.blending = CustomBlending
      material.blendSrc = ZeroFactor
      material.blendDst = SrcColorFactor
      material.blendSrcAlpha = ZeroFactor
      material.blendDstAlpha = OneFactor
      break
    case 'screen':
      material.blending = CustomBlending
      material.blendSrc = OneFactor
      material.blendDst = OneMinusSrcColorFactor
      material.blendSrcAlpha = OneFactor
      material.blendDstAlpha = OneMinusSrcAlphaFactor
      break
    case 'premultiplied':
      material.blending = NormalBlending
      material.premultipliedAlpha = true
      break
    default:
      material.blending = NormalBlending
  }
  return material
}

/** Lazily creates and caches one TSL material per (texture, blend mode). */
export class BatchMaterialCache implements Disposable {
  private readonly cache = new Map<Texture, (MeshBasicNodeMaterial | undefined)[]>()
  private disposed = false

  constructor(private readonly options: BatchMaterialOptions) {}

  get(map: Texture, blend: BlendMode): MeshBasicNodeMaterial {
    let slots = this.cache.get(map)
    if (!slots) this.cache.set(map, (slots = []))
    const i = BLEND_MODES.indexOf(blend)
    let m = slots[i]
    if (!m) slots[i] = m = createMaterial(map, blend, this.options)
    return m
  }

  get size(): number {
    let n = 0
    for (const slots of this.cache.values()) for (const m of slots) if (m) n++
    return n
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    for (const slots of this.cache.values()) for (const m of slots) m?.dispose()
    this.cache.clear()
  }
}
