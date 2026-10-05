import type { UIDrawContext } from '../paint/DrawContext'
import type { ComputedStyle } from '../style/computed'

/** Paint background + border of a box. Uniform borders use the rounded-rect SDF; per-side borders are strips. */
export function paintBox(ctx: UIDrawContext, cs: ComputedStyle, x: number, y: number, w: number, h: number): void {
  const bw = cs.borderWidth ?? 0
  const t = cs.borderTopWidth ?? bw
  const r = cs.borderRightWidth ?? bw
  const b = cs.borderBottomWidth ?? bw
  const l = cs.borderLeftWidth ?? bw
  const rect = { x, y, width: w, height: h }
  if (t === r && r === b && b === l) {
    ctx.rect(rect, { color: cs.backgroundColor, radius: cs.borderRadius, borderWidth: t, borderColor: cs.borderColor })
    return
  }
  ctx.rect(rect, { color: cs.backgroundColor, radius: cs.borderRadius })
  const c = cs.borderColor
  if (t > 0) ctx.rect({ x, y, width: w, height: t }, { color: c })
  if (b > 0) ctx.rect({ x, y: y + h - b, width: w, height: b }, { color: c })
  if (l > 0) ctx.rect({ x, y: y + t, width: l, height: Math.max(0, h - t - b) }, { color: c })
  if (r > 0) ctx.rect({ x: x + w - r, y: y + t, width: r, height: Math.max(0, h - t - b) }, { color: c })
}
