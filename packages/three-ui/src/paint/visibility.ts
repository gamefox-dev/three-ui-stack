import { Affine2 } from '@implicit-invocation/three-2d'
import type { UINode } from '../core/UINode'
import { ensureExtents } from './extents'
import { buildTransform } from './transform'

const matrix = new Affine2()

/**
 * Conservative visibility of a node's entire paint, including overflowing descendants and shadows.
 * Used for animation invalidation, not hit testing. Rounded corners are conservatively treated as rectangles.
 * Rotated/sheared ancestor clips are screen-space AABBs in SpriteBatch: do not tighten them in local space.
 * Such ancestry deliberately falls back to visible rather than risking lost pixels.
 */
export function isPaintVisible(node: UINode, width: number, height: number): boolean {
  const cs = node.computedStyle
  if (cs.display === 'none' || cs.opacity <= 0) return false
  for (let p = node.parent; p; p = p.parent) {
    const s = p.computedStyle
    if (s.display === 'none' || s.opacity <= 0) return false
    if (buildTransform(s.transform, p.layout.width, p.layout.height, matrix) && (matrix.b !== 0 || matrix.c !== 0)) return true
  }
  const e = ensureExtents(node)
  let x0 = e.x0, y0 = e.y0, x1 = e.x1, y1 = e.y1
  for (let p = node.parent; p; p = p.parent) {
    x0 += p.childOffsetX; x1 += p.childOffsetX
    y0 += p.childOffsetY; y1 += p.childOffsetY
    if (p.computedStyle.overflow !== 'visible') {
      x0 = Math.max(x0, 0); y0 = Math.max(y0, 0)
      x1 = Math.min(x1, p.layout.width); y1 = Math.min(y1, p.layout.height)
    }
    if (x0 >= x1 || y0 >= y1) return false
    if (buildTransform(p.computedStyle.transform, p.layout.width, p.layout.height, matrix)) {
      if (!Number.isFinite(x0 + y0 + x1 + y1)) return true
      const ax = matrix.applyX(x0, y0), ay = matrix.applyY(x0, y0)
      const bx = matrix.applyX(x1, y1), by = matrix.applyY(x1, y1)
      x0 = Math.min(ax, bx); x1 = Math.max(ax, bx)
      y0 = Math.min(ay, by); y1 = Math.max(ay, by)
    }
    x0 += p.layout.x; x1 += p.layout.x
    y0 += p.layout.y; y1 += p.layout.y
  }
  // Unknown/unbounded custom paint is never suppressed.
  if (Number.isNaN(x0 + y0 + x1 + y1)) return true
  return x0 < width && y0 < height && x1 > 0 && y1 > 0
}
