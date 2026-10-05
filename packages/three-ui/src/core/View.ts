import type { UIDrawContext } from '../paint/DrawContext'
import { paintBox } from './paintBox'
import { UINode, type NodeKind, type UINodeOptions } from './UINode'

/** Generic flexbox container: background, border, radius, clipping, children. */
export class View extends UINode {
  readonly kind: NodeKind = 'View'

  constructor(options: UINodeOptions = {}) {
    super(options)
  }

  override paintSelf(ctx: UIDrawContext, x: number, y: number, w: number, h: number): void {
    paintBox(ctx, this.computedStyle, x, y, w, h)
  }
}
