/** CSS timing functions → `(t: 0..1) => eased`. */
export type EasingFn = (t: number) => number

const cache = new Map<string, EasingFn>()

const linear: EasingFn = (t) => t

/**
 * Unit cubic Bézier through (0,0) and (1,1) with control points (x1,y1) (x2,y2): Newton iterations with a bisection
 * fallback, like browsers. Control-point y values may leave 0..1 (overshoot).
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFn {
  if (x1 === y1 && x2 === y2) return linear
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  const solveT = (x: number): number => {
    let t = x
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x
      if (Math.abs(err) < 1e-6) return t
      const d = slopeX(t)
      if (Math.abs(d) < 1e-6) break
      t -= err / d
    }
    let lo = 0
    let hi = 1
    t = x
    while (lo < hi) {
      const v = sampleX(t)
      if (Math.abs(v - x) < 1e-6) return t
      if (x > v) lo = t
      else hi = t
      t = (hi - lo) / 2 + lo
      if (hi - lo < 1e-7) break
    }
    return t
  }
  return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solveT(x)))
}

export type StepJump = 'jump-start' | 'jump-end' | 'jump-none' | 'jump-both' | 'start' | 'end'

/** CSS `steps(n, jump)`. */
export function steps(n: number, jump: StepJump = 'jump-end'): EasingFn {
  const count = Math.max(1, Math.floor(n))
  return (t) => {
    if (t <= 0 && (jump === 'jump-end' || jump === 'end' || jump === 'jump-none')) return 0
    if (t >= 1) return 1
    const s = Math.floor(t * count)
    switch (jump) {
      case 'jump-start':
      case 'start':
        return Math.min(1, (s + 1) / count)
      case 'jump-none':
        return count === 1 ? 0 : Math.min(1, s / (count - 1))
      case 'jump-both':
        return Math.min(1, (s + 1) / (count + 1))
      default:
        return s / count
    }
  }
}

const NAMED: Record<string, EasingFn> = {
  linear,
  ease: cubicBezier(0.25, 0.1, 0.25, 1),
  'ease-in': cubicBezier(0.42, 0, 1, 1),
  'ease-out': cubicBezier(0, 0, 0.58, 1),
  'ease-in-out': cubicBezier(0.42, 0, 0.58, 1),
  'step-start': steps(1, 'jump-start'),
  'step-end': steps(1, 'jump-end'),
}

/** Parse a CSS timing function string; unknown strings fall back to `linear`. Results are cached. */
export function parseEasingFn(value: string | undefined): EasingFn {
  if (!value) return linear
  const key = value.trim().toLowerCase()
  const hit = cache.get(key)
  if (hit) return hit
  let fn: EasingFn | undefined = NAMED[key]
  if (!fn) {
    const bez = /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/.exec(key)
    if (bez) {
      const [x1, y1, x2, y2] = [Number(bez[1]), Number(bez[2]), Number(bez[3]), Number(bez[4])] as [number, number, number, number]
      // x control points must stay in 0..1 (CSS invalidates the function otherwise)
      if (x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1) fn = cubicBezier(x1, y1, x2, y2)
    }
    const st = /^steps\(\s*(\d+)\s*(?:,\s*(jump-start|jump-end|jump-none|jump-both|start|end)\s*)?\)$/.exec(key)
    if (st) fn = steps(Number(st[1]), (st[2] as StepJump | undefined) ?? 'jump-end')
  }
  fn ??= linear
  cache.set(key, fn)
  return fn
}
