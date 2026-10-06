import type { Radii4, Sides4 } from '@implicit-invocation/three-2d'
import { resolveGradientForBox } from '../paint/gradient'
import type { UIDrawContext } from '../paint/DrawContext'
import type { ComputedStyle } from '../style/computed'

const rect = { x: 0, y: 0, width: 0, height: 0 }
const radii: [number, number, number, number] = [0, 0, 0, 0]
const borders: [number, number, number, number] = [0, 0, 0, 0]

/** Corner radii (TL, TR, BR, BL) of a computed style: per-corner keys override `borderRadius`. */
export function cornerRadii(cs: ComputedStyle, out: [number, number, number, number] = radii): [number, number, number, number] {
  const r = cs.borderRadius
  out[0] = cs.borderTopLeftRadius ?? r
  out[1] = cs.borderTopRightRadius ?? r
  out[2] = cs.borderBottomRightRadius ?? r
  out[3] = cs.borderBottomLeftRadius ?? r
  return out
}

/** Border widths (top, right, bottom, left). */
export function borderWidths(cs: ComputedStyle, out: [number, number, number, number] = borders): [number, number, number, number] {
  const bw = cs.borderWidth ?? 0
  out[0] = cs.borderTopWidth ?? bw
  out[1] = cs.borderRightWidth ?? bw
  out[2] = cs.borderBottomWidth ?? bw
  out[3] = cs.borderLeftWidth ?? bw
  return out
}

/**
 * Paint a node's box: outer shadows, then background (+ gradient) and border in one SDF quad, then inset shadows.
 * Cost: 1 quad for the box plus 1 quad per shadow layer, all inside the current draw call.
 */
export function paintBox(ctx: UIDrawContext, cs: ComputedStyle, x: number, y: number, w: number, h: number): void {
  if (w <= 0 || h <= 0) return
  const r: Radii4 = cornerRadii(cs)
  const b: Sides4 = borderWidths(cs)
  const hasBorder = (b[0] > 0 || b[1] > 0 || b[2] > 0 || b[3] > 0) && cs.borderColor.a > 0
  const shadows = cs.boxShadow
  rect.x = x
  rect.y = y
  rect.width = w
  rect.height = h

  // CSS paints the first shadow on top, so iterate backwards; outer shadows go under the box, inset ones over it
  for (let i = shadows.length - 1; i >= 0; i--) {
    const s = shadows[i]!
    if (s.inset) continue
    const color = s.currentColor ? cs.color : s.color
    if (color.a <= 0) continue
    ctx.shadow(rect, { radii: r, offsetX: s.offsetX, offsetY: s.offsetY, blur: s.blur, spread: s.spread, color, inset: false })
  }

  // `backdrop-filter` samples what is behind the box; it sits between the outer shadows and the (usually translucent) background
  if (cs.backdropBlur > 0 || cs.backdropBrightness !== 1 || cs.backdropSaturate !== 1) {
    ctx.backdrop(rect, { radii: r, blur: cs.backdropBlur, brightness: cs.backdropBrightness, saturate: cs.backdropSaturate })
  }

  const gradient = cs.backgroundGradient ? resolveGradientForBox(cs.backgroundGradient, w, h) : null
  if (cs.backgroundColor.a > 0 || hasBorder || gradient) {
    ctx.box(rect, {
      radii: r,
      ...(hasBorder ? { borderWidths: b, borderColor: cs.borderColor } : {}),
      ...(cs.backgroundColor.a > 0 ? { background: cs.backgroundColor } : {}),
      ...(gradient ? { gradient } : {}),
    })
  }

  for (let i = shadows.length - 1; i >= 0; i--) {
    const s = shadows[i]!
    if (!s.inset) continue
    const color = s.currentColor ? cs.color : s.color
    if (color.a <= 0) continue
    ctx.shadow(rect, { radii: r, borderWidths: b, offsetX: s.offsetX, offsetY: s.offsetY, blur: s.blur, spread: s.spread, color, inset: true })
  }
}
