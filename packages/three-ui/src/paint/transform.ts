import type { Affine2 } from 'three-2d'
import type { TransformOp } from '../style/types'

function angle(v: number | `${number}deg` | `${number}rad`): number {
  if (typeof v === 'number') return v
  return v.endsWith('deg') ? (parseFloat(v) * Math.PI) / 180 : parseFloat(v)
}

/**
 * Build the paint transform `T(center) · ops · T(−center)` for a node of size `w × h` whose top-left is the
 * origin of the target space. Returns false when `ops` is empty.
 */
export function buildTransform(ops: readonly TransformOp[] | undefined, w: number, h: number, out: Affine2): boolean {
  if (!ops || ops.length === 0) return false
  out.identity().translate(w / 2, h / 2)
  for (const op of ops) {
    if ('translateX' in op) out.translate(op.translateX, 0)
    else if ('translateY' in op) out.translate(0, op.translateY)
    else if ('scale' in op) out.scale(op.scale, op.scale)
    else if ('scaleX' in op) out.scale(op.scaleX, 1)
    else if ('scaleY' in op) out.scale(1, op.scaleY)
    else if ('rotate' in op) out.rotate(angle(op.rotate))
  }
  out.translate(-w / 2, -h / 2)
  return true
}
