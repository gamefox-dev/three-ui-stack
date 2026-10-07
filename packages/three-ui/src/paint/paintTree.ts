import { Affine2 } from '@implicit-invocation/three-2d'
import type { UINode } from '../core/UINode'
import { orderedChildren } from '../input/InputManager'
import type { BatchDrawContext } from './BatchDrawContext'
import { cornerRadii } from '../core/paintBox'
import { buildTransform } from './transform'
import { ensureExtents, type Extents } from './extents'

export interface PaintTreeStats {
  nodesPainted: number
  nodesCulled: number
}

const matrix = new Affine2()
/** @internal Test switch: with `culling.enabled = false` every node is painted (the reference for culling-correctness tests). */
export const culling = { enabled: true }
const clipRadii: [number, number, number, number] = [0, 0, 0, 0]

/** True when `e` (in the parent's content space, origin `(ox, oy)`) lies entirely outside the active clip, or the viewport when there is none. */
function outside(e: Extents, ox: number, oy: number, ctx: BatchDrawContext, vw: number, vh: number): boolean {
  let x0 = ox + e.x0
  let y0 = oy + e.y0
  let x1 = ox + e.x1
  let y1 = oy + e.y1
  const t = ctx.batch.currentTransform
  // clips and the viewport are in screen space: take the screen bounds of the (possibly transformed) extents
  if (!t.isIdentity() && Number.isFinite(x0 + y0 + x1 + y1)) {
    const ax = t.applyX(x0, y0)
    const ay = t.applyY(x0, y0)
    const bx = t.applyX(x1, y0)
    const by = t.applyY(x1, y0)
    const cx = t.applyX(x1, y1)
    const cy = t.applyY(x1, y1)
    const dx = t.applyX(x0, y1)
    const dy = t.applyY(x0, y1)
    x0 = Math.min(ax, bx, cx, dx)
    y0 = Math.min(ay, by, cy, dy)
    x1 = Math.max(ax, bx, cx, dx)
    y1 = Math.max(ay, by, cy, dy)
  }
  const clip = ctx.batch.clip
  const minX = clip ? clip.x : 0
  const minY = clip ? clip.y : 0
  const maxX = clip ? clip.x + clip.width : vw
  const maxY = clip ? clip.y + clip.height : vh
  return x0 >= maxX || y0 >= maxY || x1 <= minX || y1 <= minY
}

/**
 * Depth-first paint traversal: absolute coordinates, opacity/transform/clip stacks, z-ordered children,
 * and culling of subtrees that fall outside the active clip or the viewport.
 */
export function paintTree(root: UINode, ctx: BatchDrawContext, viewportW: number, viewportH: number, stats: PaintTreeStats): void {
  paintNode(root, 0, 0, ctx, viewportW, viewportH, stats)
}

function paintNode(node: UINode, ox: number, oy: number, ctx: BatchDrawContext, vw: number, vh: number, stats: PaintTreeStats): void {
  const cs = node.computedStyle
  if (cs.display === 'none' || cs.opacity <= 0) return
  const l = node.layout
  const x = ox + l.x
  const y = oy + l.y
  const w = l.width
  const h = l.height

  // cull the whole subtree when its bounds (box, shadows, overflowing descendants, own transform) miss the clip / viewport
  if (culling.enabled && outside(ensureExtents(node), ox, oy, ctx, vw, vh)) {
    stats.nodesCulled++
    return
  }

  const hasTransform = buildTransform(cs.transform, w, h, matrix)
  stats.nodesPainted++
  const fade = cs.opacity < 1
  if (fade) ctx.pushOpacity(cs.opacity)
  if (hasTransform) {
    // `matrix` is built around the local origin; conjugate it into absolute coordinates: T(x,y) · M · T(−x,−y)
    const m = new Affine2().translate(x, y).multiply(matrix).translate(-x, -y)
    ctx.pushTransform(m)
  }
  node.paintSelf(ctx, x, y, w, h)

  const clips = cs.overflow !== 'visible'
  if (clips) ctx.pushClip({ x, y, width: w, height: h }, cs.borderRadius > 0 || cs.borderTopLeftRadius || cs.borderTopRightRadius || cs.borderBottomRightRadius || cs.borderBottomLeftRadius ? cornerRadii(cs, clipRadii) : undefined)
  const kids = node.children
  if (kids.length > 0) {
    const cox = x + node.childOffsetX
    const coy = y + node.childOffsetY
    const ordered = orderedChildren(node)
    for (let i = 0; i < ordered.length; i++) {
      const c = ordered[i]!
      paintNode(c, cox, coy, ctx, vw, vh, stats)
    }
  }
  node.paintOverlay(ctx, x, y, w, h)
  if (clips) ctx.popClip()
  if (hasTransform) ctx.popTransform()
  if (fade) ctx.popOpacity()
}
