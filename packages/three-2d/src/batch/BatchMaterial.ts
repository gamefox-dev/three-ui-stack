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
import { MeshBasicNodeMaterial, TextureNode } from 'three/webgpu'
import { Fn, If, nodeObject, positionGeometry, workingToColorSpace, abs, attribute, clamp, dFdx, dFdy, dot, exp, float, floor, fwidth, int, ivec2, length, max, min, mix, pow, select, sign, sqrt, sRGBTransferEOTF, step, texture, uv, vec2, vec3, vec4 } from 'three/tsl'
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
/** Box: per-corner radii, per-side border, solid background (reads a table entry). */
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
/** Box with a gradient of at most {@link GRADIENT_SMALL_STOPS} stops (cheap loop). */
export const MODE_BOX_GRADIENT_SMALL = 8
/** Box with a gradient of up to `maxGradientStops` stops. */
export const MODE_BOX_GRADIENT = 9
/** Sprite / solid / glyph quads that carry a rounded-rect SDF (radius or border); plain ones never pay for it. */
export const MODE_SPRITE_SHAPED = 10
export const MODE_SOLID_SHAPED = 11
export const MODE_GLYPH_SHAPED = 12
/** Shadows without blur: two SDF coverages instead of the Gaussian integral. */
export const MODE_SHADOW_OUTER_HARD = 13
export const MODE_SHADOW_INSET_HARD = 14
/**
 * `aMode` packs the quad's texture slot with its mode: `mode + slot * MODE_RADIX` (modes stay below the radix), so multi-texture
 * batching costs no vertex bandwidth.
 */
export const MODE_RADIX = 16
/** Quads of a shader-clipped batch also carry their 1-based clip entry: `mode + slot * MODE_RADIX + clip * CLIP_RADIX` (slots < 8). */
export const CLIP_RADIX = 128

/** Texels per fixed-size table entry. Box entries add the gradient stops (see `SpriteBatch.fillBox`). */
export const BOX_ENTRY_BASE = 6
export const SHADOW_ENTRY = 6
export const BACKDROP_ENTRY = 2
export const MAX_GRADIENT_STOPS = 8
/** Gradients with at most this many stops take the cheaper {@link MODE_BOX_GRADIENT_SMALL} path (2 mixes instead of 7). */
export const GRADIENT_SMALL_STOPS = 3

/** Texture slots a material can sample at most (one fragment fetch each; the others are never touched). */
export const MAX_TEXTURE_SLOTS = 8

/** Stop-count classes of the gradient shader: `[small, full]` (equal when `maxGradientStops` is already small). */
export function gradientClasses(maxGradientStops: number): [number, number] {
  const full = Math.max(2, Math.min(MAX_GRADIENT_STOPS, Math.floor(maxGradientStops)))
  return [Math.min(GRADIENT_SMALL_STOPS, full), full]
}

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
  /** Present when `pushClip` clips in the shader: per-clip entries (3 texels: rect, rounded-rect center/half, corner radii). */
  clipTable?: BoxTable | undefined
  /** Textures one draw call can sample (1 = classic one-texture-per-draw behaviour). */
  maxTextures: number
  /** Upper bound of the gradient shader's loop (2…{@link MAX_GRADIENT_STOPS}). */
  maxGradientStops: number
  /** One distinct texture per slot, bound to the slots a segment does not use. */
  placeholders: Texture[]
}

// TSL's published typings are far narrower than what the node graph accepts at runtime; the shader below is
// written against this loose alias on purpose.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any

const srgbToLinear = sRGBTransferEOTF as unknown as (n: N) => N

// TextureNode's published typings omit `setUpdateMatrix` / `setupUV`, so it is extended through a loose constructor type.
const LooseTextureNode = TextureNode as unknown as new (value: Texture) => N

/**
 * Texel-fetch node for the box / clip tables: never transformed by `texture.matrix` and never y-flipped (they are ordinary data
 * textures). A plain `texture(table).load(i)` would add a mat3 uniform, a flip uniform and a `textureSize()` to every single fetch.
 * `clone()` keeps the subclass, so every `.load()` of it is plain too.
 */
class TableTextureNode extends LooseTextureNode {
  setUpdateMatrix(): this {
    ;(this as N).updateMatrix = false
    return this
  }
  setupUV(_builder: unknown, uvNode: N): N {
    return uvNode
  }
}

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
 *
 * The material samples up to `maxTextures` texture *slots*; which texture sits in a slot is a per-draw value
 * ({@link setTextures}), never part of the shader — so the shader (and its GPU program) does not depend on the textures.
 */
export class BatchNodeMaterial extends MeshBasicNodeMaterial {
  /** Set false for materials that render into render targets (their values are not encoded). */
  encodeOutput = true
  /**
   * Materials with equal keys compile to the same shader text. A classic `WebGLRenderer` then links ONE GL program for all of
   * them (its program cache is keyed by this); node ids would otherwise make every material instance a program of its own.
   * Left null for `WebGPURenderer`, whose pipeline cache would also share the *bindings* of the first material.
   */
  sharedProgramKey: string | null = null
  /** Base texture nodes of the slots (their `value` is the texture sampled by that slot). */
  slots: { value: unknown }[] = []

  /** Bind `textures[k]` to slot `k`; unused slots get `placeholders[k]`. */
  setTextures(textures: readonly Texture[], placeholders: readonly Texture[]): void {
    const slots = this.slots
    for (let k = 0; k < slots.length; k++) slots[k]!.value = textures[k] ?? placeholders[k]
  }

  override customProgramCacheKey(): string {
    return this.sharedProgramKey ?? super.customProgramCacheKey()
  }

  override setupOutput(builder: Parameters<MeshBasicNodeMaterial['setupOutput']>[0], outputNode: Parameters<MeshBasicNodeMaterial['setupOutput']>[1]): ReturnType<MeshBasicNodeMaterial['setupOutput']> {
    const node = super.setupOutput(builder, outputNode)
    const b = builder as unknown as { context: { getOutput?: unknown }; renderer: { outputColorSpace: string } }
    if (!this.encodeOutput || !b.context.getOutput) return node
    return (workingToColorSpace as unknown as (n: unknown, space: string) => typeof node)(node, b.renderer.outputColorSpace)
  }
}

function createMaterial(blend: BlendMode, options: BatchMaterialOptions, sharedProgram: boolean): BatchNodeMaterial {
  const material = new BatchNodeMaterial()
  const slotCount = Math.max(1, Math.min(MAX_TEXTURE_SLOTS, Math.floor(options.maxTextures)))
  const [gradSmall, gradFull] = gradientClasses(options.maxGradientStops)

  const vColor = attribute('aColor', 'vec4')
  const vLocal = attribute('aLocal', 'vec2')
  const vShape = attribute('aShape', 'vec4')
  const vBorder = attribute('aBorder', 'vec4')
  const vMode = attribute('aMode', 'float')
  const vData = attribute('aData', 'float')

  const toLinear = (c: N): N => (options.srgbVertexColors ? vec4(srgbToLinear(c.rgb), c.a) : c)
  const rgbToLinear = (c: N): N => (options.srgbVertexColors ? srgbToLinearInline(c) : c)

  const tableNode = nodeObject(new TableTextureNode(options.table.texture)) as unknown as N
  options.table.subscribe(tableNode as unknown as { value: unknown })
  /** Texel `base + k` of the box table (entries are addressed linearly and may wrap rows). */
  const fetch = (base: N, k: number | N): N => {
    const idx = base.add(k)
    const y = floor(idx.div(TABLE_WIDTH))
    const x = idx.sub(y.mul(TABLE_WIDTH))
    return (tableNode as N).load(ivec2(int(x), int(y)))
  }

  // Every slot starts on its own placeholder: Three de-duplicates texture uniforms by texture *identity* when a shader is built, so
  // two slots holding the same texture at that moment would share one uniform for good and later differ in value only on paper.
  const clipTableNode: N = options.clipTable ? nodeObject(new TableTextureNode(options.clipTable.texture)) : null
  if (clipTableNode) options.clipTable!.subscribe(clipTableNode as unknown as { value: unknown })
  const clipFetch = (base: N, k: number): N => {
    const idx = base.add(k)
    const y = floor(idx.div(TABLE_WIDTH))
    const x = idx.sub(y.mul(TABLE_WIDTH))
    return clipTableNode.load(ivec2(int(x), int(y)))
  }

  const slotNodes: N[] = []
  for (let k = 0; k < slotCount; k++) slotNodes.push(texture(options.placeholders[k]!))
  material.slots = slotNodes as { value: unknown }[]

  // Every value more than one branch needs is declared (`toVar`) at the top level: a node first touched inside a branch is hoisted
  // lazily into that branch and would be out of scope in the next. Derivatives are taken here too (uniform control flow).
  material.fragmentNode = Fn(() => {
    const packed = vMode.add(0.5).floor().toVar()
    const clipIdx = options.clipTable ? floor(packed.div(CLIP_RADIX)).toVar() : float(0)
    const packedMode = options.clipTable ? packed.sub(clipIdx.mul(CLIP_RADIX)).toVar() : packed
    const slot = floor(packedMode.div(MODE_RADIX)).toVar()
    const mode = packedMode.sub(slot.mul(MODE_RADIX)).toVar()
    const tint = toLinear(vColor).toVar()
    const uvA = uv().toVar()
    const uvDx = dFdx(uvA).toVar()
    const uvDy = dFdy(uvA).toVar()
    // Anti-aliasing width of the local coordinate system (≈ one screen pixel).
    const px = max(max(fwidth(vLocal.x), fwidth(vLocal.y)), 1e-4).toVar()
    const base = vData.add(0.5).floor().toVar()
    const p = vLocal
    // world position + its per-pixel width, for the shader clip (derivatives at the top level)
    const wp = positionGeometry.xy
    const pxw = options.clipTable ? max(max(fwidth(wp.x), fwidth(wp.y)), 1e-4).toVar() : float(1)

    // ── texture sampling: one fetch, only for quads that read their texture ──────────────────────────────────────────
    // A flat if / else-if over the slot index (real branches, one fetch). Explicit gradients keep the sample legal inside
    // non-uniform control flow (WGSL forbids implicit derivatives there); they are taken above, once, for all slots.
    const sampled = vec4(1, 1, 1, 1).toVar()
    const textured = mode
      .equal(MODE_SPRITE)
      .or(mode.equal(MODE_SPRITE_SHAPED))
      .or(mode.equal(MODE_GLYPH))
      .or(mode.equal(MODE_GLYPH_SHAPED))
      .or(mode.equal(MODE_GLYPH_EFFECT))
      .toVar()
    const sampleSlot = (k: number) => (): void => {
      // `sample()` clones the slot node (which follows the base node's value); the clone must not apply `texture.matrix` to the uv
      sampled.assign((slotNodes[k] as N).sample(uvA).setUpdateMatrix(false).grad(uvDx, uvDy))
    }
    if (slotCount === 1) {
      If(textured, sampleSlot(0))
    } else {
      let sampling: N = If(textured.and(slot.lessThan(0.5)), sampleSlot(0))
      for (let k = 1; k < slotCount; k++) sampling = sampling.ElseIf(k === slotCount - 1 ? textured : textured.and(slot.lessThan(k + 0.5)), sampleSlot(k))
      void sampling
    }

    // ── sprite family: no table access ──────────────────────────────────────────────────────────────────────────────
    const spriteOut = sampled.mul(tint)
    const glyphOut = vec4(tint.rgb, sampled.a.mul(tint.a))
    const dist = sampled.r
    const soft = max(max(vShape.y, fwidth(dist)), 1e-4).toVar()
    const covOuter = clamp(dist.sub(vShape.x).div(soft).add(0.5), 0, 1)
    const covInner = clamp(dist.sub(vShape.z).div(soft).add(0.5), 0, 1)
    const effectOut = vec4(tint.rgb, tint.a.mul(covOuter).mul(float(1).sub(covInner)))

    /** Rounded sprite / rect (images with a radius, solid rects with a radius or border): `color` clipped by the SDF. */
    const shaped = (color: N): N => {
      const half = vShape.xy
      const radius = vShape.z
      const bw = vShape.w
      const border = toLinear(vBorder)
      const q = abs(vLocal).sub(half.sub(radius))
      const d = length(max(q, 0)).add(min(max(q.x, q.y), 0)).sub(radius)
      const outer = clamp(d.negate().div(px).add(0.5), 0, 1)
      const inner: N = select(bw.greaterThan(0), clamp(d.add(bw).negate().div(px).add(0.5), 0, 1), float(1))
      const rgb: N = mix(border.rgb, color.rgb, inner)
      const a: N = mix(border.a, color.a, inner).mul(outer)
      return vec4(rgb, a)
    }

    const out = vec4(0, 0, 0, 0).toVar()

    // ── table family ────────────────────────────────────────────────────────────────────────────────────────────────
    // One flat If / ElseIf chain: Three's GLSL node builder cannot build nested conditionals, and `.toVar()` inside a
    // branch trips it too, so branches are pure expressions that only `assign` the shared `out`.

    /** Box body; `stops` > 0 adds a gradient whose loop is unrolled for at most that many stops. */
    const boxBody = (stops: number): void => {
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
      if (stops > 0) {
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
        for (let i = 1; i < stops; i++) {
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

    /** Shadow body; `hard` skips the Gaussian (blur 0): the shadow shape is just an SDF coverage. */
    const shadowBody = (hard: boolean) => (): void => {
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
      const s = hard ? clamp(roundedBoxSdf(ps, t2.xy, corner).negate().div(px).add(0.5), 0, 1) : blurredRoundedBox(ps, t2.xy, corner, max(t2.z, 0.4))
      const outerMode = hard ? MODE_SHADOW_OUTER_HARD : MODE_SHADOW_OUTER
      const alpha = select(mode.equal(outerMode), s.mul(float(1).sub(cMask)), float(1).sub(s).mul(cMask))
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
      const src = (backdropNodes[level] as N).sample(uv()).setUpdateMatrix(false).level(0)
      const lum = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722))
      const adjusted = mix(vec3(lum, lum, lum), src.rgb, t0.w).mul(t0.z)
      // the blurred levels hold sRGB-encoded values; the raw copy is linear on WebGPU (Three's internal frame buffer)
      const rgb = clamp(adjusted, 0, 1)
      out.assign(vec4(level === BACKDROP_RAW && options.backdrop!.captureIsLinear ? rgb : rgbToLinear(rgb), c.mul(vColor.a)))
    }

    // Most frequent modes first (conditions are evaluated in order); plain sprites and glyphs cost one texture fetch and no
    // table access, boxes fetch only their own entry.
    let chain: N = If(mode.equal(MODE_SPRITE), () => {
      out.assign(spriteOut)
    })
      .ElseIf(mode.equal(MODE_GLYPH), () => {
        out.assign(glyphOut)
      })
      .ElseIf(mode.equal(MODE_BOX), () => boxBody(0))
      .ElseIf(mode.equal(MODE_BOX_GRADIENT_SMALL), () => boxBody(gradSmall))
    if (gradFull > gradSmall) chain = chain.ElseIf(mode.equal(MODE_BOX_GRADIENT), () => boxBody(gradFull))
    else chain = chain.ElseIf(mode.equal(MODE_BOX_GRADIENT), () => boxBody(gradSmall))
    chain = chain
      .ElseIf(mode.equal(MODE_SOLID), () => {
        out.assign(tint)
      })
      .ElseIf(mode.equal(MODE_SHADOW_OUTER).or(mode.equal(MODE_SHADOW_INSET)), shadowBody(false))
      .ElseIf(mode.equal(MODE_SHADOW_OUTER_HARD).or(mode.equal(MODE_SHADOW_INSET_HARD)), shadowBody(true))
      .ElseIf(mode.equal(MODE_GLYPH_EFFECT), () => {
        out.assign(effectOut)
      })
      .ElseIf(mode.equal(MODE_SPRITE_SHAPED), () => {
        out.assign(shaped(spriteOut))
      })
      .ElseIf(mode.equal(MODE_SOLID_SHAPED), () => {
        out.assign(shaped(tint))
      })
      .ElseIf(mode.equal(MODE_GLYPH_SHAPED), () => {
        out.assign(shaped(glyphOut))
      })
    if (options.backdrop) {
      chain = chain
        .ElseIf(mode.equal(MODE_BACKDROP).and(vShape.x.lessThan(0.5)), backdropBody(BACKDROP_RAW))
        .ElseIf(mode.equal(MODE_BACKDROP).and(vShape.x.lessThan(1.5)), backdropBody(BACKDROP_SMALL))
        .ElseIf(mode.equal(MODE_BACKDROP), backdropBody(BACKDROP_LARGE))
    }
    void chain

    if (options.clipTable) {
      // Shader clip: coverage of the clip rectangle (and of its rounded rect) multiplies the quad's alpha. Only quads that straddle
      // a clip edge or corner carry an entry; everything else skips this branch.
      If(clipIdx.greaterThan(0.5), () => {
        const cb = clipIdx.sub(1).mul(3)
        const r0 = clipFetch(cb, 0)
        const r1 = clipFetch(cb, 1)
        const r2 = clipFetch(cb, 2)
        const covX = clamp(min(wp.x.sub(r0.x), r0.z.sub(wp.x)).div(pxw).add(0.5), 0, 1)
        const covY = clamp(min(wp.y.sub(r0.y), r0.w.sub(wp.y)).div(pxw).add(0.5), 0, 1)
        const pc = wp.sub(r1.xy)
        const covR = clamp(roundedBoxSdf(pc, r1.zw, cornerRadius(pc, r2)).negate().div(pxw).add(0.5), 0, 1)
        const mask = covX.mul(covY).mul(covR)
        out.assign(blend === 'premultiplied' ? out.mul(mask) : vec4(out.rgb, out.a.mul(mask)))
      })
    }

    // Multiply / screen blend through the constant blend factors below, so the shader pre-weights rgb by alpha
    // (multiply: lerp toward white; screen: premultiply) to keep translucent pixels well-behaved.
    if (blend === 'multiply') return vec4(mix(vec3(1, 1, 1), out.rgb, out.a), out.a)
    if (blend === 'screen') return vec4(out.rgb.mul(out.a), out.a)
    return out
  })()

  if (sharedProgram) {
    material.sharedProgramKey = `three-2d:${blend}:${options.clipTable ? 'clip' : 'noclip'}:t${slotCount}:g${gradSmall}-${gradFull}:${options.srgbVertexColors ? 's' : 'l'}:${options.backdrop ? (options.backdrop.captureIsLinear ? 'bdL' : 'bdS') : 'nobd'}`
  }

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

/** Materials per blend mode (see {@link BatchMaterialCache}). */
export const MATERIALS_PER_BLEND = 2

/**
 * Lazily creates and caches batch materials: {@link MATERIALS_PER_BLEND} per blend mode, however many draw calls a frame has. Draw call
 * `i` of a blend uses material `i % 2` and binds its texture slots right before it is drawn (`mesh.onBeforeRender`), so the shader is
 * built twice per blend mode — not once per draw call (a build costs ~20 ms the first time a draw call index is reached). Two, not one,
 * because a classic `WebGLRenderer` only re-uploads a material's uniforms (the slot textures) when the material *changes* between two
 * consecutive draws; consecutive draw calls of one blend alternate, and draws of different blends use different materials.
 */
export class BatchMaterialCache implements Disposable {
  private readonly cache = new Map<BlendMode, BatchNodeMaterial[]>()
  private disposed = false

  constructor(private readonly options: BatchMaterialOptions) {}

  get(blend: BlendMode, index: number, sharedProgram: boolean): BatchNodeMaterial {
    let list = this.cache.get(blend)
    if (!list) this.cache.set(blend, (list = []))
    const k = index % MATERIALS_PER_BLEND
    let m = list[k]
    if (!m) list[k] = m = createMaterial(blend, this.options, sharedProgram)
    return m
  }

  get placeholders(): Texture[] {
    return this.options.placeholders
  }

  get size(): number {
    let n = 0
    for (const list of this.cache.values()) for (const m of list) if (m) n++
    return n
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    for (const list of this.cache.values()) for (const m of list) m?.dispose()
    this.cache.clear()
  }
}
