import type { BoxGradient, BoxGradientStop } from '@implicit-invocation/three-2d'
import type { ResolvedGradient } from '../style/computed'
import type { Angle, GradientCorner, GradientLength } from '../style/types'

/** CSS angle → degrees. */
export function angleToDegrees(angle: Angle | GradientCorner): number | GradientCorner {
  if (typeof angle === 'number') return angle
  if (angle.startsWith('to ')) return angle as GradientCorner
  const n = parseFloat(angle)
  if (angle.endsWith('rad')) return (n * 180) / Math.PI
  if (angle.endsWith('turn')) return n * 360
  return n
}

/** Gradient line for a box: unit direction (y down) and the CSS gradient-line length. */
export function linearGeometry(angle: Angle | GradientCorner, w: number, h: number): { dx: number; dy: number; length: number } {
  const a = angleToDegrees(angle)
  let dx: number
  let dy: number
  if (typeof a === 'string') {
    // "to <corner>": the 50% line runs through the two other corners, i.e. the gradient line is perpendicular to the
    // diagonal that does not contain the target corner.
    const right = a.includes('right')
    const left = a.includes('left')
    const top = a.includes('top')
    const bottom = a.includes('bottom')
    if ((right || left) && (top || bottom)) {
      const sx = right ? 1 : -1
      const sy = bottom ? 1 : -1
      const vx = sx * h
      const vy = sy * w
      const len = Math.hypot(vx, vy) || 1
      dx = vx / len
      dy = vy / len
    } else {
      dx = right ? 1 : left ? -1 : 0
      dy = bottom ? 1 : top ? -1 : 0
    }
  } else {
    const r = (a * Math.PI) / 180
    dx = Math.sin(r)
    dy = -Math.cos(r)
  }
  return { dx, dy, length: Math.abs(w * dx) + Math.abs(h * dy) }
}

const toPx = (v: GradientLength, basis: number) => (typeof v === 'number' ? v : (parseFloat(v) / 100) * basis)

/**
 * CSS color-stop fix-up: first/last default to 0/1, positions never decrease, and runs of unpositioned stops are
 * spread evenly between their positioned neighbours. `basis` is the px length that 100% / 1.0 stands for.
 */
export function resolveStopPositions(stops: ResolvedGradient['stops'], basis: number, out: BoxGradientStop[]): BoxGradientStop[] {
  const n = stops.length
  out.length = n
  const pos: number[] = new Array(n)
  for (let i = 0; i < n; i++) {
    const p = stops[i]!.position
    pos[i] = p === undefined ? NaN : toPx(p, basis) / (basis || 1)
  }
  if (Number.isNaN(pos[0]!)) pos[0] = 0
  if (Number.isNaN(pos[n - 1]!)) pos[n - 1] = 1
  let max = -Infinity
  for (let i = 0; i < n; i++) {
    if (!Number.isNaN(pos[i]!)) {
      if (pos[i]! < max) pos[i] = max
      max = pos[i]!
    }
  }
  for (let i = 1; i < n - 1; ) {
    if (!Number.isNaN(pos[i]!)) {
      i++
      continue
    }
    let j = i
    while (Number.isNaN(pos[j]!)) j++
    const a = pos[i - 1]!
    const b = pos[j]!
    for (let k = i; k < j; k++) pos[k] = a + ((b - a) * (k - i + 1)) / (j - i + 1)
    i = j
  }
  for (let i = 0; i < n; i++) {
    const slot = out[i] ?? (out[i] = { color: stops[i]!.color, position: 0 })
    slot.color = stops[i]!.color
    slot.position = pos[i]!
  }
  return out
}

function resolveAt(at: ResolvedGradient & { type: 'radial' }, w: number, h: number): [number, number] {
  const x = at.at[0]
  const y = at.at[1]
  const px = x === 'left' ? 0 : x === 'center' ? w / 2 : x === 'right' ? w : toPx(x, w)
  const py = y === 'top' ? 0 : y === 'center' ? h / 2 : y === 'bottom' ? h : toPx(y, h)
  return [px, py]
}

/** Radial gradient center (relative to the box center) and radii in px. */
export function radialGeometry(g: ResolvedGradient & { type: 'radial' }, w: number, h: number): { cx: number; cy: number; rx: number; ry: number } {
  const [ax, ay] = resolveAt(g, w, h)
  const dl = ax
  const dr = w - ax
  const dt = ay
  const db = h - ay
  const closestSideX = Math.min(Math.abs(dl), Math.abs(dr))
  const closestSideY = Math.min(Math.abs(dt), Math.abs(db))
  const farSideX = Math.max(Math.abs(dl), Math.abs(dr))
  const farSideY = Math.max(Math.abs(dt), Math.abs(db))
  let rx: number
  let ry: number
  const size = g.size
  if (typeof size === 'number') {
    rx = ry = size
  } else if (Array.isArray(size)) {
    rx = toPx(size[0] as GradientLength, w)
    ry = toPx(size[1] as GradientLength, h)
  } else {
    const circle = g.shape === 'circle'
    switch (size) {
      case 'closest-side':
        rx = circle ? Math.min(closestSideX, closestSideY) : closestSideX
        ry = circle ? rx : closestSideY
        break
      case 'farthest-side':
        rx = circle ? Math.max(farSideX, farSideY) : farSideX
        ry = circle ? rx : farSideY
        break
      case 'closest-corner': {
        if (circle) {
          rx = ry = Math.hypot(closestSideX, closestSideY)
        } else {
          // same aspect ratio as closest-side, scaled to pass through the closest corner
          const k = Math.SQRT2
          rx = closestSideX * k
          ry = closestSideY * k
        }
        break
      }
      default: {
        // farthest-corner
        if (circle) {
          rx = ry = Math.hypot(farSideX, farSideY)
        } else {
          const k = Math.SQRT2
          rx = farSideX * k
          ry = farSideY * k
        }
      }
    }
  }
  return { cx: ax - w / 2, cy: ay - h / 2, rx: Math.max(rx, 1e-3), ry: Math.max(ry, 1e-3) }
}

const scratchStops: BoxGradientStop[] = []
const scratchLinear = { type: 'linear' as const, colorSpace: 'srgb' as 'srgb' | 'oklab', dx: 0, dy: 1, length: 1, stops: scratchStops }
const scratchRadial = { type: 'radial' as const, colorSpace: 'srgb' as 'srgb' | 'oklab', cx: 0, cy: 0, rx: 1, ry: 1, stops: scratchStops }

/**
 * Resolve a computed gradient against a box size. The result is a shared scratch object: consume it
 * (`fillBox` copies it into the table) before the next call.
 */
export function resolveGradientForBox(g: ResolvedGradient, w: number, h: number): BoxGradient | null {
  if (g.stops.length < 2) return null
  if (g.type === 'linear') {
    const geo = linearGeometry(g.angle, w, h)
    resolveStopPositions(g.stops, geo.length, scratchStops)
    scratchLinear.colorSpace = g.colorSpace
    scratchLinear.dx = geo.dx
    scratchLinear.dy = geo.dy
    scratchLinear.length = geo.length
    return scratchLinear
  }
  const geo = radialGeometry(g, w, h)
  // stop positions in px are measured along the (horizontal) radius
  resolveStopPositions(g.stops, geo.rx, scratchStops)
  scratchRadial.colorSpace = g.colorSpace
  scratchRadial.cx = geo.cx
  scratchRadial.cy = geo.cy
  scratchRadial.rx = geo.rx
  scratchRadial.ry = geo.ry
  return scratchRadial
}
