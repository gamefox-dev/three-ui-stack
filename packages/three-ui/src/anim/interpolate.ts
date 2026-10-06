import { Color4 } from '@implicit-invocation/three-2d'
import type { ComputedStyle, ResolvedBoxShadow, ResolvedGradient, ResolvedTextShadow } from '../style/computed'
import type { TransformOp } from '../style/types'

/** How a style property interpolates. */
export type AnimKind = 'number' | 'color' | 'transform' | 'boxShadow' | 'textShadow' | 'gradient' | 'length'

/** Properties animations and transitions can drive without touching layout. */
export const PAINT_ANIMATABLE: Readonly<Record<string, AnimKind>> = {
  opacity: 'number',
  backgroundColor: 'color',
  borderColor: 'color',
  color: 'color',
  tintColor: 'color',
  textStrokeColor: 'color',
  textStrokeWidth: 'number',
  borderRadius: 'number',
  borderTopLeftRadius: 'number',
  borderTopRightRadius: 'number',
  borderBottomRightRadius: 'number',
  borderBottomLeftRadius: 'number',
  transform: 'transform',
  boxShadow: 'boxShadow',
  textShadow: 'textShadow',
  dropShadow: 'textShadow',
  backgroundGradient: 'gradient',
  backdropBlur: 'number',
  backdropBrightness: 'number',
  backdropSaturate: 'number',
}

/** Layout properties: animating them re-runs Yoga every frame, so they need an explicit opt-in. */
export const LAYOUT_ANIMATABLE: Readonly<Record<string, AnimKind>> = {
  width: 'length',
  height: 'length',
  minWidth: 'length',
  minHeight: 'length',
  maxWidth: 'length',
  maxHeight: 'length',
  flexGrow: 'number',
  flexShrink: 'number',
  flexBasis: 'length',
  gap: 'length',
  rowGap: 'length',
  columnGap: 'length',
  margin: 'length',
  marginHorizontal: 'length',
  marginVertical: 'length',
  marginTop: 'length',
  marginRight: 'length',
  marginBottom: 'length',
  marginLeft: 'length',
  padding: 'length',
  paddingHorizontal: 'length',
  paddingVertical: 'length',
  paddingTop: 'length',
  paddingRight: 'length',
  paddingBottom: 'length',
  paddingLeft: 'length',
  top: 'length',
  right: 'length',
  bottom: 'length',
  left: 'length',
  borderWidth: 'number',
  borderTopWidth: 'number',
  borderRightWidth: 'number',
  borderBottomWidth: 'number',
  borderLeftWidth: 'number',
  fontSize: 'number',
  letterSpacing: 'number',
}

export const ANIMATABLE: Readonly<Record<string, AnimKind>> = { ...PAINT_ANIMATABLE, ...LAYOUT_ANIMATABLE }

export function isLayoutProperty(key: string): boolean {
  return key in LAYOUT_ANIMATABLE
}

/** Node size, used to resolve `%` translations when units differ. */
export interface InterpolationContext {
  width: number
  height: number
}

// ───────────────────────────── primitives ─────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Premultiplied sRGB interpolation (CSS `color` interpolation); writes into `out`. */
export function lerpColor(a: Color4, b: Color4, t: number, out: Color4): Color4 {
  const aa = a.a
  const ba = b.a
  const alpha = lerp(aa, ba, t)
  if (alpha <= 1e-6) return out.set(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t), 0)
  const r = lerp(a.r * aa, b.r * ba, t) / alpha
  const g = lerp(a.g * aa, b.g * ba, t) / alpha
  const bl = lerp(a.b * aa, b.b * ba, t) / alpha
  return out.set(r, g, bl, alpha)
}

function angle(v: number | `${number}deg` | `${number}rad`): number {
  if (typeof v === 'number') return v
  return v.endsWith('deg') ? (parseFloat(v) * Math.PI) / 180 : parseFloat(v)
}

const tkind = (op: TransformOp): string => Object.keys(op)[0]!
const identity = (op: TransformOp): TransformOp => {
  const k = tkind(op)
  switch (k) {
    case 'scale':
      return { scale: 1 }
    case 'scaleX':
      return { scaleX: 1 }
    case 'scaleY':
      return { scaleY: 1 }
    case 'rotate':
      return { rotate: 0 }
    case 'translateX':
      return { translateX: typeof tval(op) === 'string' ? '0%' : 0 }
    default:
      return { translateY: typeof tval(op) === 'string' ? '0%' : 0 }
  }
}
const tval = (op: TransformOp): number | `${number}%` | `${number}deg` | `${number}rad` => (op as unknown as Record<string, never>)[tkind(op)]!

function lerpLength(a: number | `${number}%`, b: number | `${number}%`, t: number, basis: number): number | `${number}%` {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, t)
  if (typeof a === 'string' && typeof b === 'string') return `${lerp(parseFloat(a), parseFloat(b), t)}%` as `${number}%`
  const pa = typeof a === 'number' ? a : (parseFloat(a) / 100) * basis
  const pb = typeof b === 'number' ? b : (parseFloat(b) / 100) * basis
  return lerp(pa, pb, t)
}

/** Decompose a transform list (about the origin) into translate / rotate / scale for mismatched-list interpolation. */
function decompose(ops: readonly TransformOp[], w: number, h: number): { tx: number; ty: number; rot: number; sx: number; sy: number } {
  let a = 1
  let b = 0
  let c = 0
  let d = 1
  let tx = 0
  let ty = 0
  const mul = (ma: number, mb: number, mc: number, md: number, mtx: number, mty: number) => {
    const na = a * ma + c * mb
    const nb = b * ma + d * mb
    const nc = a * mc + c * md
    const nd = b * mc + d * md
    tx += a * mtx + c * mty
    ty += b * mtx + d * mty
    a = na
    b = nb
    c = nc
    d = nd
  }
  for (const op of ops) {
    const k = tkind(op)
    const v = tval(op)
    if (k === 'translateX') mul(1, 0, 0, 1, typeof v === 'number' ? v : (parseFloat(v) / 100) * w, 0)
    else if (k === 'translateY') mul(1, 0, 0, 1, 0, typeof v === 'number' ? v : (parseFloat(v) / 100) * h)
    else if (k === 'scale') mul(v as number, 0, 0, v as number, 0, 0)
    else if (k === 'scaleX') mul(v as number, 0, 0, 1, 0, 0)
    else if (k === 'scaleY') mul(1, 0, 0, v as number, 0, 0)
    else {
      const r = angle(v as number)
      mul(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0)
    }
  }
  const sx = Math.hypot(a, b)
  const rot = Math.atan2(b, a)
  const sy = sx === 0 ? 0 : (a * d - b * c) / sx
  return { tx, ty, rot, sx, sy }
}

export function lerpTransform(a: readonly TransformOp[] | undefined, b: readonly TransformOp[] | undefined, t: number, ctx: InterpolationContext): readonly TransformOp[] {
  const la = a ?? []
  const lb = b ?? []
  const n = Math.max(la.length, lb.length)
  if (n === 0) return la
  let matching = true
  for (let i = 0; i < n && matching; i++) {
    const oa = la[i]
    const ob = lb[i]
    if (oa && ob && tkind(oa) !== tkind(ob)) matching = false
  }
  if (!matching) {
    const da = decompose(la, ctx.width, ctx.height)
    const db = decompose(lb, ctx.width, ctx.height)
    return [
      { translateX: lerp(da.tx, db.tx, t) },
      { translateY: lerp(da.ty, db.ty, t) },
      { rotate: lerp(da.rot, shortestArc(da.rot, db.rot), t) },
      { scaleX: lerp(da.sx, db.sx, t) },
      { scaleY: lerp(da.sy, db.sy, t) },
    ]
  }
  const out: TransformOp[] = []
  for (let i = 0; i < n; i++) {
    const oa = la[i] ?? identity(lb[i]!)
    const ob = lb[i] ?? identity(la[i]!)
    const k = tkind(oa)
    const va = tval(oa)
    const vb = tval(ob)
    if (k === 'translateX' || k === 'translateY') {
      const basis = k === 'translateX' ? ctx.width : ctx.height
      out.push({ [k]: lerpLength(va as number | `${number}%`, vb as number | `${number}%`, t, basis) } as unknown as TransformOp)
    } else if (k === 'rotate') {
      const ra = angle(va as number)
      out.push({ rotate: lerp(ra, angle(vb as number), t) })
    } else {
      out.push({ [k]: lerp(va as number, vb as number, t) } as unknown as TransformOp)
    }
  }
  return out
}

const shortestArc = (from: number, to: number) => {
  let d = to - from
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return from + d
}

function lerpShadowList<T extends ResolvedBoxShadow | ResolvedTextShadow>(a: readonly T[], b: readonly T[], t: number, zero: (like: T) => T, merge: (a: T, b: T, t: number) => T | null): readonly T[] | null {
  const n = Math.max(a.length, b.length)
  const out: T[] = []
  for (let i = 0; i < n; i++) {
    const sa = a[i] ?? zero(b[i]!)
    const sb = b[i] ?? zero(a[i]!)
    const m = merge(sa, sb, t)
    if (m === null) return null // incompatible layers → discrete
    out.push(m)
  }
  return out
}

function lerpBoxShadows(a: readonly ResolvedBoxShadow[], b: readonly ResolvedBoxShadow[], t: number): readonly ResolvedBoxShadow[] {
  const r = lerpShadowList(
    a,
    b,
    t,
    (like) => ({ ...like, offsetX: 0, offsetY: 0, blur: 0, spread: 0, color: new Color4(like.color.r, like.color.g, like.color.b, 0) }),
    (x, y, u) => {
      if (x.inset !== y.inset || x.currentColor !== y.currentColor) return null
      return {
        offsetX: lerp(x.offsetX, y.offsetX, u),
        offsetY: lerp(x.offsetY, y.offsetY, u),
        blur: lerp(x.blur, y.blur, u),
        spread: lerp(x.spread, y.spread, u),
        color: lerpColor(x.color, y.color, u, new Color4()),
        currentColor: x.currentColor,
        inset: x.inset,
      }
    },
  )
  return r ?? (t < 0.5 ? a : b)
}

function lerpTextShadows(a: readonly ResolvedTextShadow[], b: readonly ResolvedTextShadow[], t: number): readonly ResolvedTextShadow[] {
  const r = lerpShadowList(
    a,
    b,
    t,
    (like) => ({ ...like, offsetX: 0, offsetY: 0, blur: 0, color: new Color4(like.color.r, like.color.g, like.color.b, 0) }),
    (x, y, u) => ({
      offsetX: lerp(x.offsetX, y.offsetX, u),
      offsetY: lerp(x.offsetY, y.offsetY, u),
      blur: lerp(x.blur, y.blur, u),
      color: lerpColor(x.color, y.color, u, new Color4()),
    }),
  )
  return r ?? (t < 0.5 ? a : b)
}

function lerpGradient(a: ResolvedGradient | undefined, b: ResolvedGradient | undefined, t: number): ResolvedGradient | undefined {
  const discrete = t < 0.5 ? a : b
  if (!a || !b || a.type !== b.type || a.colorSpace !== b.colorSpace || a.stops.length !== b.stops.length) return discrete
  const stops = a.stops.map((sa, i) => {
    const sb = b.stops[i]!
    let position = sa.position
    if (sa.position !== sb.position) {
      const pa = sa.position
      const pb = sb.position
      if (typeof pa === 'number' && typeof pb === 'number') position = lerp(pa, pb, t)
      else if (typeof pa === 'string' && typeof pb === 'string') position = `${lerp(parseFloat(pa), parseFloat(pb), t)}%` as `${number}%`
      else position = t < 0.5 ? pa : pb
    }
    return { color: lerpColor(sa.color, sb.color, t, new Color4()), position }
  })
  if (a.type === 'linear' && b.type === 'linear') {
    const aa = a.angle
    const ba = b.angle
    const angleOut = typeof aa === 'number' && typeof ba === 'number' ? lerp(aa, ba, t) : aa === ba ? aa : t < 0.5 ? aa : ba
    return { type: 'linear', colorSpace: a.colorSpace, angle: angleOut, stops }
  }
  if (a.type === 'radial' && b.type === 'radial') {
    const same = a.shape === b.shape && JSON.stringify(a.size) === JSON.stringify(b.size) && JSON.stringify(a.at) === JSON.stringify(b.at)
    if (!same) return discrete
    return { ...a, stops }
  }
  return discrete
}

/**
 * Interpolate one computed property value. `a` / `b` are computed representations (`Color4`, shadow lists, ops…);
 * `t` may leave 0..1 for overshooting easings. Values that cannot interpolate switch at 50%.
 */
export function interpolateValue(key: string, a: unknown, b: unknown, t: number, ctx: InterpolationContext, out: { color: Color4 }): unknown {
  const kind = ANIMATABLE[key]
  switch (kind) {
    case 'number':
      return typeof a === 'number' && typeof b === 'number' ? lerp(a, b, t) : t < 0.5 ? a : b
    case 'length': {
      if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, t)
      if (typeof a === 'string' && typeof b === 'string' && a.endsWith('%') && b.endsWith('%')) return `${lerp(parseFloat(a), parseFloat(b), t)}%`
      return t < 0.5 ? a : b
    }
    case 'color':
      return a instanceof Color4 && b instanceof Color4 ? lerpColor(a, b, t, out.color) : t < 0.5 ? a : b
    case 'transform':
      return lerpTransform(a as readonly TransformOp[] | undefined, b as readonly TransformOp[] | undefined, t, ctx)
    case 'boxShadow':
      return lerpBoxShadows(a as readonly ResolvedBoxShadow[], b as readonly ResolvedBoxShadow[], t)
    case 'textShadow':
      return lerpTextShadows(a as readonly ResolvedTextShadow[], b as readonly ResolvedTextShadow[], t)
    case 'gradient':
      return lerpGradient(a as ResolvedGradient | undefined, b as ResolvedGradient | undefined, t)
    default:
      return t < 0.5 ? a : b
  }
}

/** Is the computed value of `key` equal in both styles (used to detect transition triggers). */
export function snapshot(cs: ComputedStyle, key: string): unknown {
  return (cs as unknown as Record<string, unknown>)[key]
}
