import type { NinePatch } from '@implicit-invocation/three-2d'
import type { UIDrawContext } from '../paint/DrawContext'
import type { Style } from '../style/types'
import { STYLE_DIRTY } from './flags'
import { paintBox } from './paintBox'
import { View } from './View'
import type { NodeKind, UINodeOptions } from './UINode'

export interface NinePatchViewOptions extends UINodeOptions {
  patch?: NinePatch | null | undefined
  /** Logical units per source pixel; overrides the patch's own `scale` for this view (default: the patch's). */
  patchScale?: number | undefined
}

/**
 * Container painted with a scalable `NinePatch`. Its minimum size comes from the (scaled) patch borders and, when the patch has
 * content padding (atlas `pad:`), that padding is the view's default padding (an explicit `padding*` style wins).
 */
export class NinePatchView extends View {
  override readonly kind: NodeKind = 'NinePatchView'
  private _patch: NinePatch | null
  private _patchScale: number | undefined

  constructor(options: NinePatchViewOptions = {}) {
    super(options)
    this._patch = options.patch ?? null
    this._patchScale = options.patchScale
  }

  get patch(): NinePatch | null {
    return this._patch
  }

  setPatch(patch: NinePatch | null): void {
    if (patch === this._patch) return
    this._patch = patch
    this.markDirty(STYLE_DIRTY) // intrinsic minimum size and padding are part of the component defaults
  }

  get patchScale(): number | undefined {
    return this._patchScale
  }

  /** Override the patch's scale for this view; `undefined` goes back to the patch's own. */
  setPatchScale(scale: number | undefined): void {
    if (scale === this._patchScale) return
    this._patchScale = scale
    this.markDirty(STYLE_DIRTY)
  }

  private get effectiveScale(): number {
    return this._patchScale ?? this._patch?.scale ?? 1
  }

  protected override get defaultStyle(): Style | undefined {
    const p = this._patch
    if (!p) return undefined
    const k = this.effectiveScale / p.scale
    const style: Style = { minWidth: p.minWidth * k, minHeight: p.minHeight * k }
    const pad = p.padding
    if (pad) {
      style.paddingTop = pad[0] * k
      style.paddingRight = pad[1] * k
      style.paddingBottom = pad[2] * k
      style.paddingLeft = pad[3] * k
    }
    return style
  }

  override paintSelf(ctx: UIDrawContext, x: number, y: number, w: number, h: number): void {
    const cs = this.computedStyle
    if (cs.backgroundColor.a > 0 || (cs.borderWidth ?? 0) > 0) paintBox(ctx, cs, x, y, w, h)
    if (this._patch) ctx.ninePatch(this._patch, { x, y, width: w, height: h }, { tint: cs.tintColor, scale: this.effectiveScale })
  }
}
