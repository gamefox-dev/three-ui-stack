import type { ColorLike } from '../types'

/** Per-corner values in CSS order: top-left, top-right, bottom-right, bottom-left. */
export type Radii4 = readonly [number, number, number, number]
/** Per-side values in CSS order: top, right, bottom, left. */
export type Sides4 = readonly [number, number, number, number]

export interface BoxGradientStop {
  color: ColorLike
  /** Position along the gradient: 0..1 of the gradient line (linear) or of the radius (radial). Must be non-decreasing. */
  position: number
}

/**
 * Gradient geometry already resolved to pixels relative to the box center (y down). The UI layer turns CSS
 * `linear-gradient(<angle>, …)` / `radial-gradient(<shape> <size> at <position>, …)` into this.
 */
export type BoxGradient =
  | {
      type: 'linear'
      /** Interpolation space for the stops (default `srgb`). `oklab` interpolates premultiplied OKLab, as Tailwind v4 does. */
      colorSpace?: 'srgb' | 'oklab'
      /** Unit vector along the gradient line. */
      dx: number
      dy: number
      /** Length of the gradient line in pixels (position 0 → 1). */
      length: number
      stops: readonly BoxGradientStop[]
    }
  | {
      type: 'radial'
      colorSpace?: 'srgb' | 'oklab'
      /** Center relative to the box center. */
      cx: number
      cy: number
      /** Ellipse radii (position 1). */
      rx: number
      ry: number
      stops: readonly BoxGradientStop[]
    }

/**
 * CSS corner-overlap rule: when the radii of adjacent corners add up to more than a side, every radius is
 * scaled by the same factor. This is what turns Tailwind's `rounded-full` (9999px) into a pill.
 */
export function normalizeRadii(radii: Radii4 | undefined, w: number, h: number, out: [number, number, number, number] = [0, 0, 0, 0]): [number, number, number, number] {
  if (!radii) {
    out[0] = out[1] = out[2] = out[3] = 0
    return out
  }
  const tl = Math.max(0, radii[0])
  const tr = Math.max(0, radii[1])
  const br = Math.max(0, radii[2])
  const bl = Math.max(0, radii[3])
  let f = 1
  const fit = (side: number, sum: number) => {
    if (sum > side && sum > 0) f = Math.min(f, side / sum)
  }
  fit(w, tl + tr)
  fit(w, bl + br)
  fit(h, tl + bl)
  fit(h, tr + br)
  out[0] = tl * f
  out[1] = tr * f
  out[2] = br * f
  out[3] = bl * f
  return out
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))

/** sRGB-encoded 0..1 channels → OKLab (L, a, b). */
export function srgbToOklab(r: number, g: number, b: number, out: [number, number, number] = [0, 0, 0]): [number, number, number] {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  out[0] = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  out[1] = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  out[2] = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return out
}
