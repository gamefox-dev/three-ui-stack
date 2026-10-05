import { Affine2 } from '@implicit-invocation/three-2d'
import type { UINode } from '../core/UINode'
import { orderedChildren } from '../input/InputManager'
import type { BatchDrawContext } from './BatchDrawContext'
import { buildTransform } from './transform'

export interface PaintTreeStats {
  nodesPainted: number
  nodesCulled: number
}

const matrix = new Affine2()

/**
 * Depth-first paint traversal: absolute coordinates, opacity/transform/clip stacks, z-ordered children,
 * and culling of subtrees that fall outside the active clip or the viewport.
 */
export function paintTree(root: UINode, ctx: BatchDrawContext, viewportW: number, viewportH: number, stats: PaintTreeStats): void {
  paintNode(root, 0, 0, ctx, viewportW, viewportH, 0, stats, false)
}

function paintNode(node: UINode, ox: number, oy: number, ctx: BatchDrawContext, vw: number, vh: number, transformDepth: number, stats: PaintTreeStats, parentCulls: boolean): void {
  const cs = node.computedStyle
  if (cs.display === 'none' || cs.opacity <= 0) return
  const l = node.layout
  const x = ox + l.x
  const y = oy + l.y
  const w = l.width
  const h = l.height

  const hasTransform = buildTransform(cs.transform, w, h, matrix)
  const transforming = hasTransform || transformDepth > 0
  if (!transforming) {
    // cull against the active clip / viewport (children outside a clip are invisible by definition)
    const clip = ctx.batch.clip
    const minX = clip ? clip.x : 0
    const minY = clip ? clip.y : 0
    const maxX = clip ? clip.x + clip.width : vw
    const maxY = clip ? clip.y + clip.height : vh
    const mayCull = parentCulls || cs.overflow !== 'visible' || node.children.length === 0
    if (mayCull && (x >= maxX || y >= maxY || x + w <= minX || y + h <= minY)) {
      stats.nodesCulled++
      return
    }
  }

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
  if (clips) ctx.pushClip({ x, y, width: w, height: h })
  const kids = node.children
  if (kids.length > 0) {
    const cox = x + node.childOffsetX
    const coy = y + node.childOffsetY
    const ordered = orderedChildren(node)
    for (let i = 0; i < ordered.length; i++) {
      const c = ordered[i]!
      paintNode(c, cox, coy, ctx, vw, vh, transforming ? transformDepth + 1 : transformDepth, stats, node.cullsChildren)
    }
  }
  node.paintOverlay(ctx, x, y, w, h)
  if (clips) ctx.popClip()
  if (hasTransform) ctx.popTransform()
  if (fade) ctx.popOpacity()
}
