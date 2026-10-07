import { Affine2 } from '@implicit-invocation/three-2d'
import type { UINode } from '../core/UINode'
import { buildTransform } from './transform'

/** Axis-aligned bounds `[x0, x1] × [y0, y1]`. */
export interface Extents {
  x0: number
  y0: number
  x1: number
  y1: number
}

const matrix = new Affine2()

/**
 * Bounds of everything a node can paint or be hit on (its box, outer shadows, text shadows / stroke, descendants that overflow it,
 * and its own paint transform), in its parent's content space. Cached on the node; `UINode._markExtDirty()` invalidates the node
 * and its ancestors, so a scroll (which changes no layout or style) never recomputes anything.
 *
 * Nodes that clip (`overflow` other than `visible`) bound their descendants, so only their own box counts. A node that scrolls its
 * children (`cullsChildren`) but lets them overflow cannot cache a bound that depends on the offset: it is unbounded.
 */
export function ensureExtents(node: UINode): Extents {
  const e = node._ext
  if (!node._extDirty) return e
  node._extDirty = false
  const cs = node.computedStyle
  const l = node.layout
  const w = l.width
  const h = l.height
  let x0 = 0
  let y0 = 0
  let x1 = w
  let y1 = h

  const reach = paintReach(cs)
  x0 -= reach
  y0 -= reach
  x1 += reach
  y1 += reach

  if (cs.overflow === 'visible') {
    if (node.cullsChildren) {
      e.x0 = e.y0 = -Infinity
      e.x1 = e.y1 = Infinity
      return e
    }
    const kids = node.children
    for (let i = 0; i < kids.length; i++) {
      const c = kids[i]!
      if (c.computedStyle.display === 'none') continue
      const ce = ensureExtents(c)
      if (ce.x0 < x0) x0 = ce.x0
      if (ce.y0 < y0) y0 = ce.y0
      if (ce.x1 > x1) x1 = ce.x1
      if (ce.y1 > y1) y1 = ce.y1
    }
  }

  // the paint transform acts on the node and everything inside it, around the node's own origin
  if (buildTransform(cs.transform, w, h, matrix)) {
    const ax = matrix.applyX(x0, y0)
    const ay = matrix.applyY(x0, y0)
    const bx = matrix.applyX(x1, y0)
    const by = matrix.applyY(x1, y0)
    const cx = matrix.applyX(x1, y1)
    const cy = matrix.applyY(x1, y1)
    const dx = matrix.applyX(x0, y1)
    const dy = matrix.applyY(x0, y1)
    x0 = Math.min(ax, bx, cx, dx)
    y0 = Math.min(ay, by, cy, dy)
    x1 = Math.max(ax, bx, cx, dx)
    y1 = Math.max(ay, by, cy, dy)
  }

  e.x0 = l.x + x0
  e.y0 = l.y + y0
  e.x1 = l.x + x1
  e.y1 = l.y + y1
  return e
}

/** How far a node's own paint reaches past its box: outer shadows, text shadows, text stroke, image drop shadows. */
function paintReach(cs: UINode['computedStyle']): number {
  let reach = 0
  for (const sh of cs.boxShadow) {
    if (sh.inset) continue
    reach = Math.max(reach, Math.max(Math.abs(sh.offsetX), Math.abs(sh.offsetY)) + sh.blur * 1.5 + Math.max(0, sh.spread))
  }
  for (const sh of cs.textShadow) reach = Math.max(reach, Math.max(Math.abs(sh.offsetX), Math.abs(sh.offsetY)) + sh.blur * 1.5)
  for (const sh of cs.dropShadow) reach = Math.max(reach, Math.max(Math.abs(sh.offsetX), Math.abs(sh.offsetY)) + sh.blur * 1.5)
  if (cs.textStrokeWidth > 0) reach = Math.max(reach, cs.textStrokeWidth)
  return reach
}
