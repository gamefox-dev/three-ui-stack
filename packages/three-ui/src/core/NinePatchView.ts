import type { NinePatch } from '@implicit-invocation/three-2d'
import type { UIDrawContext } from '../paint/DrawContext'
import type { Style } from '../style/types'
import { STYLE_DIRTY } from './flags'
import { paintBox } from './paintBox'
import { View } from './View'
import type { NodeKind, UINodeOptions } from './UINode'

export interface NinePatchViewOptions extends UINodeOptions {
  patch?: NinePatch | null | undefined
}

/** Container painted with a scalable `NinePatch`. Its minimum size comes from the patch borders. */
export class NinePatchView extends View {
  override readonly kind: NodeKind = 'NinePatchView'
  private _patch: NinePatch | null

  constructor(options: NinePatchViewOptions = {}) {
    super(options)
    this._patch = options.patch ?? null
  }

  get patch(): NinePatch | null {
    return this._patch
  }

  setPatch(patch: NinePatch | null): void {
    if (patch === this._patch) return
    this._patch = patch
    this.markDirty(STYLE_DIRTY) // intrinsic minimum size is part of the component defaults
  }

  protected override get defaultStyle(): Style | undefined {
    return this._patch ? { minWidth: this._patch.minWidth, minHeight: this._patch.minHeight } : undefined
  }

  override paintSelf(ctx: UIDrawContext, x: number, y: number, w: number, h: number): void {
    const cs = this.computedStyle
    if (cs.backgroundColor.a > 0 || (cs.borderWidth ?? 0) > 0) paintBox(ctx, cs, x, y, w, h)
    if (this._patch) ctx.ninePatch(this._patch, { x, y, width: w, height: h }, { tint: cs.tintColor })
  }
}
