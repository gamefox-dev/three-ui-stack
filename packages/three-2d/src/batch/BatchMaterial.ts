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
import { Fn, If, workingToColorSpace, abs, attribute, clamp, dot, exp, float, floor, fwidth, int, ivec2, length, max, min, mix, pow, select, sign, sqrt, sRGBTransferEOTF, step, texture, uv, vec2, vec3, vec4 } from 'three/tsl'
import type { BlendMode, Disposable } from '../types'
import { BACKDROP_LARGE, BACKDROP_RAW, BACKDROP_SMALL, type BackdropBlur } from './BackdropBlur'
import { TABLE_WIDTH, type BoxTable } from './BoxTable'
import { linearToSrgbInline, srgbToLinearInline } from './colorNodes'

/**
 * Interleaved vertex layout shared by every batch (floats):
 * position(3) uv(2) color(4) local(2) shape(4) borderColor(4) mode(1) data(1)
 * - `local`  : position relative to the quad center in unrotated local units (drives the SDF)
 * - `shape`  : sprite path: halfWidth, halfHeight, cornerRadius, borderWidth (halfWidth <= 0 disables the SDF path);
 *              glyph-effect path: threshold, softness, inner threshold
 * - `mode`   : see the `MODE_*` constants
 * - `data`   : first texel of the quad's entry in the box table (box / shadow / backdrop modes)
 */
export const VERTEX_STRIDE = 21
export const OFFSET_POSITION = 0
export const OFFSET_UV = 3
export const OFFSET_COLOR = 5
export const OFFSET_LOCAL = 9
export const OFFSET_SHAPE = 11
export const OFFSET_BORDER = 15
export const OFFSET_MODE = 19
export const OFFSET_DATA = 20

/** Textured sprite (the texture's texels times the vertex color). */
export const MODE_SPRITE = 0
/** Solid fill: texture ignored, so it joins any texture segment without a draw-call switch. */
export const MODE_SOLID = 1
/** Box: per-corner radii, per-side border, solid + gradient background (reads a table entry). */
export const MODE_BOX = 2
/** Analytic blurred rounded-rect shadow outside its casting box (reads a table entry). */
export const MODE_SHADOW_OUTER = 3
/** Analytic blurred inset shadow inside its box's padding area (reads a table entry). */
export const MODE_SHADOW_INSET = 4
/** Glyph quad painted from the atlas' distance channel (text stroke / text shadow). */
export const MODE_GLYPH_EFFECT = 5
/** Glyph quad painted from the atlas' coverage channel (RGB of the atlas is ignored). */
export const MODE_GLYPH = 6
/** Screen-space blurred backdrop clipped to a rounded rect (the quad's texture is the blurred framebuffer copy). */
export const MODE_BACKDROP = 7

/** Texels per fixed-size table entry. Box entries add the gradient stops (see `SpriteBatch.fillBox`). */
export const BOX_ENTRY_BASE = 6
export const SHADOW_ENTRY = 6
export const BACKDROP_ENTRY = 2
export const MAX_GRADIENT_STOPS = 8

export interface BatchMaterialOptions {
  /**
   * Colors handed to the batch are sRGB-encoded (like CSS). When true the shader converts vertex colors
   * to linear so the renderer's output transform reproduces the authored values exactly.
   */
  srgbVertexColors: boolean
  /** Per-frame float table read by box / shadow / backdrop quads. */
  table: BoxTable
  /** Present when backdrop blur is enabled: its three sources are bound in every material. */
  backdrop?: BackdropBlur | undefined
}

const BLEND_MODES: readonly BlendMode[] = ['normal', 'additive', 'multiply', 'screen', 'premultiplied']

// TSL's published typings are far narrower than what the node graph accepts at runtime; the shader below is
// written against this loose alias on purpose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any

const srgbToLinear = sRGBTransferEOTF as unknown as (n: N) => N

/** OKLab (L, a, b) → linear sRGB. */
function oklabToLinear(c: N): N {
  const l_ = c.x.add(c.y.mul(0.3963377774)).add(c.z.mul(0.2158037573))
  const m_ = c.x.sub(c.y.mul(0.1055613458)).sub(c.z.mul(0.0638541728))
  const s_ = c.x.sub(c.y.mul(0.0894841775)).sub(c.z.mul(1.291485548))
  const l = l_.mul(l_).mul(l_)
  const m = m_.mul(m_).mul(m_)
  const s = s_.mul(s_).mul(s_)
  return vec3(
    l.mul(4.0767416621).sub(m.mul(3.3077115913)).add(s.mul(0.2309699292)),
    l.mul(-1.2684380046).add(m.mul(2.6097574011)).sub(s.mul(0.3413193965)),
    l.mul(-0.0041960863).sub(m.mul(0.7034186147)).add(s.mul(1.707614701)),
  )
}

/** Abramowitz–Stegun 7.1.27 (max error 5e-4); enough for a shadow falloff. */
function erf(x: N): N {
  const a = abs(x)
  const a2 = a.mul(a)
  const d = a.mul(0.278393).add(a2.mul(0.230389)).add(a2.mul(a).mul(0.000972)).add(a2.mul(a2).mul(0.078108)).add(1)
  const d2 = d.mul(d)
  return sign(x).mul(float(1).sub(float(1).div(d2.mul(d2))))
}

/** Radius of the corner the point `p` (relative to the box center) falls in. `rad` = (TL, TR, BR, BL). */
function cornerRadius(p: N, rad: N): N {
  return select(p.x.lessThan(0), select(p.y.lessThan(0), rad.x, rad.w), select(p.y.lessThan(0), rad.y, rad.z))
}

/** Signed distance to a rounded box (negative inside), in local units. */
function roundedBoxSdf(p: N, half: N, r: N): N {
  const q: N = abs(p).sub(half.sub(r))
  return length(max(q, 0)).add(min(max(q.x, q.y), 0)).sub(r)
}

/** Raph Levien's blurred rounded rectangle: the Gaussian is integrated analytically along x and sampled 4× along y. */
function blurredRoundedBox(p: N, half: N, corner: N, sigma: N): N {
  const k = float(0.7071067811865476).div(sigma)
  const row = (y: N): N => {
    const delta = min(half.y.sub(corner).sub(abs(y)), 0)
    const curved = half.x.sub(corner).add(sqrt(max(corner.mul(corner).sub(delta.mul(delta)), 0)))
    const hi = erf(p.x.add(curved).mul(k))
    const lo = erf(p.x.sub(curved).mul(k))
    return hi.sub(lo).mul(0.5)
  }
  const low = p.y.sub(half.y)
  const high = p.y.add(half.y)
  const s3 = sigma.mul(3)
  const start = clamp(s3.negate(), low, high)
  const end = clamp(s3, low, high)
  const dy = end.sub(start).mul(0.25)
  const norm = float(0.3989422804014327).div(sigma)
  const inv2s2 = float(-0.5).div(sigma.mul(sigma))
  let value: N = float(0)
  for (let i = 0; i < 4; i++) {
    const y = start.add(dy.mul(i + 0.5))
    value = value.add(row(p.y.sub(y)).mul(exp(y.mul(y).mul(inv2s2))).mul(norm).mul(dy))
  }
  return clamp(value, 0, 1)
}

/**
 * Batch material. Under a classic `WebGLRenderer` + `WebGLNodesHandler`, `NodeMaterial` applies the output transform
 * (working → output colour space) only for materials *without* a `fragmentNode`, so ours would come out linear and far too
 * dark. Apply it here — only when that handler is present (`builder.context.getOutput`); `WebGPURenderer` (both of its
 * backends) converts on its own. Tone mapping is deliberately not applied: UI colours must reach the screen as authored.
 */
export class BatchNodeMaterial extends MeshBasicNodeMaterial {
  /** Set false for materials that render into render targets (their values are not encoded). */
  encodeOutput = true

  override setupOutput(builder: Parameters<MeshBasicNodeMaterial['setupOutput']>[0], outputNode: Parameters<MeshBasicNodeMaterial['setupOutput']>[1]): ReturnType<MeshBasicNodeMaterial['setupOutput']> {
    const node = super.setupOutput(builder, outputNode)
    const b = builder as unknown as { context: { getOutput?: unknown }; renderer: { outputColorSpace: string } }
    if (!this.encodeOutput || !b.context.getOutput) return node
    return (workingToColorSpace as unknown as (n: unknown, space: string) => typeof node)(node, b.renderer.outputColorSpace)
  }
}

function createMaterial(map: Texture, blend: BlendMode, options: BatchMaterialOptions): MeshBasicNodeMaterial {
  const material = new BatchNodeMaterial()

  const vColor = attribute('aColor', 'vec4')
  const vLocal = attribute('aLocal', 'vec2')
  const vShape = attribute('aShape', 'vec4')
  const vBorder = attribute('aBorder', 'vec4')
  const vMode = attribute('aMode', 'float')
  const vData = attribute('aData', 'float')

  const toLinear = (c: N): N => (options.srgbVertexColors ? vec4(srgbToLinear(c.rgb), c.a) : c)
  const rgbToLinear = (c: N): N => (options.srgbVertexColors ? srgbToLinearInline(c) : c)

  const tableNode = texture(options.table.texture)
  options.table.subscribe(tableNode as unknown as { value: unknown })
  /** Texel `base + k` of the box table (entries are addressed linearly and may wrap rows). */
  const fetch = (base: N, k: number): N => {
    const idx = base.add(k)
    const y = floor(idx.div(TABLE_WIDTH))
    const x = idx.sub(y.mul(TABLE_WIDTH))
    return (tableNode as N).load(ivec2(int(x), int(y)))
  }

  material.fragmentNode = Fn(() => {
    const mode = vMode.add(0.5).floor()
    const sampled = texture(map, uv())
    const tint = toLinear(vColor)
    // Anti-aliasing width of the local coordinate system (≈ one screen pixel). Derivatives must be taken in uniform
    // control flow, so every derivative the branches need is computed up here.
    const px = max(max(fwidth(vLocal.x), fwidth(vLocal.y)), 1e-4)

    // ── sprite family (modes 0, 1, 5, 6): no table access ──────────────────────────────────────────────
    const spriteTex = sampled.mul(tint)
    const glyph = vec4(tint.rgb, sampled.a.mul(tint.a))
    const dist = sampled.r
    const soft = max(max(vShape.y, fwidth(dist)), 1e-4)
    const covOuter = clamp(dist.sub(vShape.x).div(soft).add(0.5), 0, 1)
    const covInner = clamp(dist.sub(vShape.z).div(soft).add(0.5), 0, 1)
    const effect = vec4(tint.rgb, tint.a.mul(covOuter).mul(float(1).sub(covInner)))
    const sprite = select(mode.equal(MODE_SPRITE), spriteTex, select(mode.equal(MODE_SOLID), tint, select(mode.equal(MODE_GLYPH_EFFECT), effect, glyph)))

    // legacy rounded sprite / rect (images with a radius, solid rects with a radius or border)
    const half = vShape.xy
    const radius = vShape.z
    const bw = vShape.w
    const border = toLinear(vBorder)
    const q = abs(vLocal).sub(half.sub(radius))
    const d = length(max(q, 0)).add(min(max(q.x, q.y), 0)).sub(radius)
    const outer = clamp(d.negate().div(px).add(0.5), 0, 1)
    const inner = select(bw.greaterThan(0), clamp(d.add(bw).negate().div(px).add(0.5), 0, 1), float(1))
    const shaped = vec4(mix(border.rgb, sprite.rgb, inner), mix(border.a, sprite.a, inner).mul(outer))
    const useShape = half.x.greaterThan(0).and(mode.lessThan(1.5).or(mode.equal(MODE_GLYPH)))
    // Declare and assign `out` at the top level before any conditional: a variable first touched inside a branch is
    // hoisted lazily, which crashes Three's GLSL builder while it infers the branch type.
    const out = vec4(0, 0, 0, 0).toVar()
    out.assign(select(useShape, shaped, sprite))

    // ── table family (modes 2, 3, 4, 7) ─────────────────────────────────────────────────────────────────
    // One flat If / ElseIf chain: Three's GLSL node builder cannot build nested conditionals, and `.toVar()` inside a
    // branch trips it too, so branches are pure expressions that only `assign` the shared `out`.
    const base = vData.add(0.5).floor()
    const p = vLocal

    /** Box body; `gradient` selects the variant (the branch cannot be nested inside the box branch). */
    const boxBody = (gradient: boolean): void => {
      const t0 = fetch(base, 0)
      const rad = fetch(base, 1)
      const bws = fetch(base, 2) // top, right, bottom, left
      const borderColor = fetch(base, 3)
      const bg = fetch(base, 4)
      const boxHalf = t0.xy
      const n = t0.w

      const dOuter = roundedBoxSdf(p, boxHalf, cornerRadius(p, rad))
      const cOuter = clamp(dOuter.negate().div(px).add(0.5), 0, 1)

      // padding box: the border box inset by the per-side border widths (corner radii shrink by the larger adjacent width)
      const bT = bws.x
      const bR = bws.y
      const bB = bws.z
      const bL = bws.w
      const innerCenter = vec2(bL.sub(bR), bT.sub(bB)).mul(0.5)
      const innerHalf = max(boxHalf.sub(vec2(bL.add(bR), bT.add(bB)).mul(0.5)), 0)
      const innerRad = vec4(max(rad.x.sub(max(bL, bT)), 0), max(rad.y.sub(max(bR, bT)), 0), max(rad.z.sub(max(bR, bB)), 0), max(rad.w.sub(max(bL, bB)), 0))
      const pi = p.sub(innerCenter)
      const dInner = roundedBoxSdf(pi, innerHalf, cornerRadius(pi, innerRad))
      const cInner = clamp(dInner.negate().div(px).add(0.5), 0, 1)
      const hasBorder = bT.add(bR).add(bB).add(bL).greaterThan(0)

      // background colour, then the gradient over it (premultiplied, sRGB-encoded like CSS compositing)
      let premulRgb: N = bg.rgb.mul(bg.a)
      let premulA: N = bg.a
      if (gradient) {
        const gp = fetch(base, 5)
        const kind = t0.z
        const radial = kind.equal(2).or(kind.equal(4))
        const t = select(radial, length(p.sub(gp.xy).mul(gp.zw)), dot(p, gp.xy).add(0.5))
        const posBase = base.add(BOX_ENTRY_BASE).add(n)
        const posA = fetch(posBase, 0)
        const posB = fetch(posBase, 1)
        const comp = ['x', 'y', 'z', 'w'] as const
        const stopPos = (i: number): N => (i < 4 ? posA[comp[i]!] : posB[comp[i - 4]!])
        const colBase = base.add(BOX_ENTRY_BASE)
        let col: N = fetch(colBase, 0)
        let prev: N = stopPos(0)
        for (let i = 1; i < MAX_GRADIENT_STOPS; i++) {
          const pos = stopPos(i)
          const active = step(float(i).add(0.5), n)
          const f = clamp(t.sub(prev).div(max(pos.sub(prev), 1e-5)), 0, 1).mul(active)
          col = mix(col, fetch(colBase, i), f)
          prev = mix(prev, pos, active)
        }
        // OKLab gradients interpolate premultiplied OKLab; convert the result back to premultiplied encoded sRGB
        const straight = col.rgb.div(max(col.a, 1e-5))
        const encoded = linearToSrgbInline(clamp(oklabToLinear(straight), 0, 1)).mul(col.a)
        const gradRgb = select(kind.greaterThan(2.5), encoded, col.rgb)
        premulRgb = gradRgb.add(premulRgb.mul(float(1).sub(col.a)))
        premulA = col.a.add(premulA.mul(float(1).sub(col.a)))
      }
      const bgRgb = premulRgb.mul(cOuter)
      const bgA = premulA.mul(cOuter)
      // border ring = outer shape minus padding box, composited over the background
      const ring = select(hasBorder, cOuter.mul(float(1).sub(cInner)), float(0)).mul(borderColor.a)
      const rgbP = borderColor.rgb.mul(ring).add(bgRgb.mul(float(1).sub(ring)))
      const a = ring.add(bgA.mul(float(1).sub(ring)))
      out.assign(vec4(rgbToLinear(rgbP.div(max(a, 1e-5))), a.mul(vColor.a)))
    }

    const shadowBody = (): void => {
      const t0 = fetch(base, 0) // mask box: half.xy, center.zw
      const t1 = fetch(base, 1) // mask box radii
      const t2 = fetch(base, 2) // shadow shape: half.xy, sigma.z
      const t3 = fetch(base, 3) // shadow shape radii
      const color = fetch(base, 4)
      const t5 = fetch(base, 5) // shadow shape center.xy
      const pm = p.sub(t0.zw)
      const cMask = clamp(roundedBoxSdf(pm, t0.xy, cornerRadius(pm, t1)).negate().div(px).add(0.5), 0, 1)
      const ps = p.sub(t5.xy)
      const corner = min(cornerRadius(ps, t3), min(t2.x, t2.y))
      const s = blurredRoundedBox(ps, t2.xy, corner, max(t2.z, 0.4))
      const alpha = select(mode.equal(MODE_SHADOW_OUTER), s.mul(float(1).sub(cMask)), float(1).sub(s).mul(cMask))
      out.assign(vec4(rgbToLinear(color.rgb), alpha.mul(color.a).mul(vColor.a)))
    }

    // Backdrop quads sample a screen-space texture (raw framebuffer copy / small blur / large blur) bound next to the atlas.
    // The level rides in shape.x. `.level(0)`: explicit LOD, because texture sampling with implicit derivatives
    // may not sit inside a branch in WGSL.
    const backdropNodes: N[] = []
    if (options.backdrop) {
      for (const level of [BACKDROP_RAW, BACKDROP_SMALL, BACKDROP_LARGE]) {
        const node = texture(options.backdrop.textureFor(level))
        options.backdrop.subscribe(level, node as unknown as { value: unknown })
        backdropNodes.push(node)
      }
    }
    const backdropBody = (level: number) => (): void => {
      const t0 = fetch(base, 0)
      const rad = fetch(base, 1)
      const c = clamp(roundedBoxSdf(p, t0.xy, cornerRadius(p, rad)).negate().div(px).add(0.5), 0, 1)
      const src = (backdropNodes[level] as N).sample(uv()).level(0)
      const lum = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722))
      const adjusted = mix(vec3(lum, lum, lum), src.rgb, t0.w).mul(t0.z)
      // the blurred levels hold sRGB-encoded values; the raw copy is linear on WebGPU (Three's internal frame buffer)
      const rgb = clamp(adjusted, 0, 1)
      out.assign(vec4(level === BACKDROP_RAW && options.backdrop!.captureIsLinear ? rgb : rgbToLinear(rgb), c.mul(vColor.a)))
    }

    // the gradient kind lives in table texel 0 (`.z`); fetching it for every box fragment is one cheap load
    const boxKind = fetch(base, 0).z
    let chain: N = If(mode.equal(MODE_BOX).and(boxKind.lessThan(0.5)), () => boxBody(false))
      .ElseIf(mode.equal(MODE_BOX), () => boxBody(true))
      .ElseIf(mode.equal(MODE_SHADOW_OUTER).or(mode.equal(MODE_SHADOW_INSET)), shadowBody)
    if (options.backdrop) {
      chain = chain
        .ElseIf(mode.equal(MODE_BACKDROP).and(vShape.x.lessThan(0.5)), backdropBody(BACKDROP_RAW))
        .ElseIf(mode.equal(MODE_BACKDROP).and(vShape.x.lessThan(1.5)), backdropBody(BACKDROP_SMALL))
        .ElseIf(mode.equal(MODE_BACKDROP), backdropBody(BACKDROP_LARGE))
    }
    void chain

    // Multiply / screen blend through the constant blend factors below, so the shader pre-weights rgb by alpha
    // (multiply: lerp toward white; screen: premultiply) to keep translucent pixels well-behaved.
    if (blend === 'multiply') return vec4(mix(vec3(1, 1, 1), out.rgb, out.a), out.a)
    if (blend === 'screen') return vec4(out.rgb.mul(out.a), out.a)
    return out
  })()

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
