import { isDevMode, warnOnce } from '../dev'
import { createDefaultComputedStyle, computeStyle, flattenStyleProp, normalizeStyle, valuesEqual, type ComputedStyle } from '../style/computed'
import { INHERITED_KEYS, type Style, type StyleProp } from '../style/types'
import { syncYoga } from '../style/yogaSync'
import { getYogaConfig, getYogaRuntime, type YogaNode } from '../yoga/runtime'
import { StateFlags, type EventMap, type UIEvent, type UIEventHandler, type UIEventType } from '../input/events'
import { CHILD_ORDER_DIRTY, DEP_ACTIVE, DEP_DISABLED, DEP_FOCUS, DEP_HOVER, PAINT_DIRTY, STYLE_DIRTY, SUBTREE_STYLE_DIRTY, TEXT_DIRTY } from './flags'
import type { ThreeUI } from './ThreeUI'
import type { UIDrawContext } from '../paint/DrawContext'
import type { Extents } from '../paint/extents'
import type { NodeFx } from '../anim/engine'
import type { UIAnimation } from '../anim/Animation'
import type { AnimationOptions, Keyframes } from '../style/types'

export type NodeKind = 'View' | 'Text' | 'Image' | 'AnimatedImage' | 'NinePatchView' | 'ScrollView'

export interface LayoutRect {
  x: number
  y: number
  width: number
  height: number
}

export interface UINodeOptions {
  style?: StyleProp
  className?: string | undefined
  /** Debug name shown in warnings and tools. */
  name?: string | undefined
  disabled?: boolean | undefined
  focusable?: boolean | undefined
  children?: readonly UINode[] | undefined
}

interface Listener {
  type: string
  handler: (e: never) => void
  capture: boolean
}

let nextId = 1

const INTERACTIVE_EVENTS: readonly UIEventType[] = ['pointerdown', 'pointerup', 'pointercancel', 'pointermove', 'click', 'wheel']

/**
 * Retained UI node. NOT a Three `Object3D` — a tree of thousands of nodes renders through a handful of
 * batched meshes. Each node owns exactly one Yoga node (freed in `dispose()`).
 */
export abstract class UINode {
  abstract readonly kind: NodeKind

  readonly id = nextId++
  name: string | undefined
  parent: UINode | null = null
  focusable: boolean
  userData: unknown = undefined

  /** Last computed style (authoritative; Yoga is only the geometry calculator). */
  computedStyle: ComputedStyle = createDefaultComputedStyle()
  /** Layout result relative to the parent's origin, in logical pixels. */
  readonly layout: LayoutRect = { x: 0, y: 0, width: 0, height: 0 }

  /** @internal */ dirty = STYLE_DIRTY
  /** @internal */ state = 0
  /** @internal */ classDeps = 0
  /** @internal */ _ui: ThreeUI | null = null
  /** @internal */ readonly _yoga: YogaNode
  /** @internal Animation / transition state; null while nothing animates. */
  _fx: NodeFx | null = null

  private readonly _children: UINode[] = []
  /** @internal Paint / hit bounds in the parent's content space (`paint/extents.ts`); stale while `_extDirty`. */
  readonly _ext: Extents = { x0: 0, y0: 0, x1: 0, y1: 0 }
  /** @internal */
  _extDirty = true
  private _style: StyleProp
  private _className: string
  private _styleComputedOnce = false
  private _disposed = false
  private listeners: Listener[] | null = null

  constructor(options: UINodeOptions = {}) {
    this._yoga = getYogaRuntime().Node.create(getYogaConfig())
    this._style = options.style ?? null
    this._className = options.className ?? ''
    this.name = options.name
    this.focusable = options.focusable ?? false
    if (options.disabled) this.state |= StateFlags.DISABLED
    if (options.children) for (const c of options.children) this.append(c)
  }

  // ───────────────────────────── tree ─────────────────────────────

  get children(): readonly UINode[] {
    return this._children
  }

  get ui(): ThreeUI | null {
    return this._ui
  }

  get isDisposed(): boolean {
    return this._disposed
  }

  /** Text-like leaf nodes can't have children (Yoga measure functions require leaves). */
  protected get canHaveChildren(): boolean {
    return true
  }

  append(child: UINode): void {
    this.insert(child, this._children.length)
  }

  insert(child: UINode, index: number): void {
    this.assertAlive('insert')
    if (!this.canHaveChildren) throw new Error(`[three-ui] ${this.kind} cannot have children`)
    if (child === this) throw new Error('[three-ui] a node cannot be its own child')
    if (child._disposed) throw new Error('[three-ui] cannot insert a disposed node')
    for (let p: UINode | null = this; p; p = p.parent) {
      if (p === child) throw new Error('[three-ui] cyclic node parenting: the child is an ancestor of the new parent')
    }
    if (child.parent === this) {
      // moving within the same parent: reorder
      const from = this._children.indexOf(child)
      if (from === index || from + 1 === index) return
      this._children.splice(from, 1)
      this._yoga.removeChild(child._yoga)
      index = from < index ? index - 1 : index
    } else if (child.parent) {
      throw new Error('[three-ui] duplicate parent insertion: the node already has a parent; remove() it first')
    }
    index = Math.max(0, Math.min(index, this._children.length))
    this._children.splice(index, 0, child)
    this._yoga.insertChild(child._yoga, index)
    child.parent = this
    child._attach(this._ui)
    child.markDirty(STYLE_DIRTY)
    this.markDirty(CHILD_ORDER_DIRTY)
    this._markExtDirty()
  }

  remove(child: UINode): void {
    this.assertAlive('remove')
    const i = this._children.indexOf(child)
    if (i < 0) return
    this._children.splice(i, 1)
    this._yoga.removeChild(child._yoga)
    child.parent = null
    child._attach(null)
    this.markDirty(CHILD_ORDER_DIRTY)
    this._markExtDirty()
  }

  indexOf(child: UINode): number {
    return this._children.indexOf(child)
  }

  /** @internal */
  _attach(ui: ThreeUI | null): void {
    if (this._ui === ui) return
    const old = this._ui
    this._ui = ui
    if (old) old.engine.nodes.delete(this)
    if (ui && this._fx) ui.engine.nodes.add(this)
    if (old && !ui) old.input._nodeDetached(this)
    this.onAttach(old, ui)
    for (const c of this._children) c._attach(ui)
    if (ui) {
      this.dirty |= STYLE_DIRTY
      ui._requestUpdate()
    }
  }

  protected onAttach(_old: ThreeUI | null, _next: ThreeUI | null): void {}

  /** Depth-first traversal (pre-order). Return `false` from `visit` to skip a subtree. */
  traverse(visit: (node: UINode) => boolean | void): void {
    if (visit(this) === false) return
    for (const c of this._children) c.traverse(visit)
  }

  // ───────────────────────────── style ─────────────────────────────

  get style(): StyleProp {
    return this._style
  }

  setStyle(style: StyleProp): void {
    if (this._style === style) return
    this._style = style
    this.markDirty(STYLE_DIRTY)
  }

  get className(): string {
    return this._className
  }

  setClassName(className: string): void {
    if (this._className === className) return
    this._className = className
    this.markDirty(STYLE_DIRTY)
  }

  /** Component defaults (lowest cascade layer). */
  protected get defaultStyle(): Style | undefined {
    return undefined
  }

  // ───────────────────────────── state ─────────────────────────────

  get disabled(): boolean {
    return (this.state & StateFlags.DISABLED) !== 0
  }

  setDisabled(disabled: boolean): void {
    this._setState(StateFlags.DISABLED, disabled)
    if (disabled && this._ui) this._ui.input._nodeDisabled(this)
  }

  get hovered(): boolean {
    return (this.state & StateFlags.HOVER) !== 0
  }

  get pressed(): boolean {
    return (this.state & StateFlags.ACTIVE) !== 0
  }

  get focused(): boolean {
    return (this.state & StateFlags.FOCUS) !== 0
  }

  /** @internal */
  _setState(flag: number, on: boolean): void {
    const had = (this.state & flag) !== 0
    if (had === on) return
    this.state = on ? this.state | flag : this.state & ~flag
    const dep = flag === StateFlags.HOVER ? DEP_HOVER : flag === StateFlags.ACTIVE ? DEP_ACTIVE : flag === StateFlags.FOCUS ? DEP_FOCUS : DEP_DISABLED
    if (this.classDeps & dep) this.markDirty(STYLE_DIRTY)
  }

  // ───────────────────────────── invalidation ─────────────────────────────

  /** @internal Invalidate this node's paint bounds and its ancestors' (a node that is already stale has stale ancestors above it, up to its first clipping one). */
  _markExtDirty(): void {
    for (let n: UINode | null = this; n && !n._extDirty; n = n.parent) n._extDirty = true
  }

  markDirty(flags: number): void {
    this.dirty |= flags
    if (flags & STYLE_DIRTY) {
      for (let p = this.parent; p && !(p.dirty & SUBTREE_STYLE_DIRTY); p = p.parent) p.dirty |= SUBTREE_STYLE_DIRTY
    }
    this._ui?._requestUpdate()
  }

  /**
   * Recompute `computedStyle` from the cascade and push layout-affecting changes to Yoga.
   * Returns true when an inherited property changed (descendants must recompute too).
   * @internal
   */
  _recomputeStyle(ui: ThreeUI): boolean {
    const prev = this._styleComputedOnce ? this.computedStyle : null
    const parentStyle = this.parent ? this.parent.computedStyle : null
    const layers: Style[] = []
    const theme = ui._themeStyle(this)
    if (theme) layers.push(normalizeStyle(theme))
    let deps = 0
    if (this._className) {
      const resolver = ui.classNameResolver
      if (resolver) {
        const r = resolver.resolve(this._className, this, ui.environment)
        deps = r.deps
        layers.push(normalizeStyle(r.style))
      } else if (isDevMode()) {
        warnOnce(`no-resolver`, `className "${this._className}" was set but no ClassNameResolver is installed (see three-ui-tailwind). Class names are ignored.`)
      }
    }
    this.classDeps = deps
    for (const s of flattenStyleProp(this._style)) layers.push(normalizeStyle(s))
    const base = computeStyle(layers, parentStyle, this.defaultStyle)
    // animations and transitions write over a copy of the cascade result; `next` is what layout and paint see
    const next = ui.engine.resolve(this, base, this._fx?.base ?? prev, prev)
    const layoutChanged = syncYoga(this._yoga, prev, next)
    this.computedStyle = next
    this._styleComputedOnce = true
    this._markExtDirty()
    ui.stats.styleRecomputes++
    ui._paintDirty = true

    let inheritedChanged = prev === null
    if (prev) {
      for (const k of INHERITED_KEYS) {
        const a = prev[k]
        const b = next[k]
        if (valuesEqual(a, b)) continue
        inheritedChanged = true
        break
      }
    }
    this.onStyleApplied(prev, next, layoutChanged)
    return inheritedChanged
  }

  /**
   * Animate this node with Web-Animations-like keyframes. Time advances only through `ui.update(dt)`; the returned
   * handle can `pause()` / `cancel()` / `finish()` and its `finished` promise resolves at the end.
   * Layout properties (width, margin…) are ignored unless `options.layout` is true — they re-run Yoga every frame.
   */
  animate(keyframes: Keyframes, options: number | AnimationOptions = {}): UIAnimation {
    this.assertAlive('animate')
    const ui = this._ui
    if (!ui) throw new Error('[three-ui] animate() needs the node to be attached to a ThreeUI (setRoot / append first)')
    return ui.engine.animate(this, keyframes, options)
  }

  /** @internal The engine changed layout / text-affecting values of `computedStyle` in place. */
  _afterAnimatedStyle(prev: ComputedStyle, next: ComputedStyle, layoutChanged: boolean): void {
    this.onStyleApplied(prev, next, layoutChanged)
  }

  /** Hook for subclasses (e.g. invalidate cached text when font properties change). */
  protected onStyleApplied(_prev: ComputedStyle | null, _next: ComputedStyle, _layoutChanged: boolean): void {}

  /** Ask Yoga to re-measure this leaf (text content/font changed). */
  protected invalidateMeasure(): void {
    this.dirty |= TEXT_DIRTY | PAINT_DIRTY
    this._yoga.markDirty()
    if (this._ui) {
      this._ui._paintDirty = true
      this._ui._requestUpdate()
    }
  }

  /** Request a repaint without relayout. */
  protected invalidatePaint(): void {
    this.dirty |= PAINT_DIRTY
    if (this._ui) {
      this._ui._paintDirty = true
      this._ui._requestUpdate()
    }
  }

  // ───────────────────────────── geometry ─────────────────────────────

  /** When true, children whose own rect lies outside the active clip are skipped entirely (scroll containers). */
  get cullsChildren(): boolean {
    return false
  }

  /** Extra offset applied to children (ScrollView scrolling). */
  get childOffsetX(): number {
    return 0
  }

  get childOffsetY(): number {
    return 0
  }

  /** Rectangle in root coordinates (ignores paint-only transforms). */
  getAbsoluteRect(out: LayoutRect = { x: 0, y: 0, width: 0, height: 0 }): LayoutRect {
    let x = 0
    let y = 0
    for (let n: UINode | null = this; n; n = n.parent) {
      x += n.layout.x
      y += n.layout.y
      if (n.parent) {
        x += n.parent.childOffsetX
        y += n.parent.childOffsetY
      }
    }
    out.x = x
    out.y = y
    out.width = this.layout.width
    out.height = this.layout.height
    return out
  }

  /** @internal Copy Yoga results into `layout`. Returns true when the rect changed. */
  _readLayout(): boolean {
    const y = this._yoga
    const l = this.layout
    const x = y.getComputedLeft()
    const t = y.getComputedTop()
    const w = y.getComputedWidth()
    const h = y.getComputedHeight()
    const changed = x !== l.x || t !== l.y || w !== l.width || h !== l.height
    l.x = x
    l.y = t
    l.width = w
    l.height = h
    if (changed) this._markExtDirty()
    return changed
  }

  /** Called after a layout pass assigned new rects (ScrollView re-clamps offsets here). */
  protected onLayout(): void {}

  /** @internal */
  _afterLayout(): void {
    this.onLayout()
  }

  // ───────────────────────────── painting ─────────────────────────────

  /**
   * Paint this node's own visuals into `ctx` at absolute rect `(x, y, w, h)`. The painter handles
   * opacity, transforms, clipping, z-order and children.
   */
  paintSelf(_ctx: UIDrawContext, _x: number, _y: number, _w: number, _h: number): void {}

  /** Paint on top of the children (still inside this node's clip), e.g. scrollbars. */
  paintOverlay(_ctx: UIDrawContext, _x: number, _y: number, _w: number, _h: number): void {}

  // ───────────────────────────── events ─────────────────────────────

  addEventListener<K extends UIEventType>(type: K, handler: UIEventHandler<EventMap[K]>, options?: boolean | { capture?: boolean }): () => void {
    const capture = typeof options === 'boolean' ? options : (options?.capture ?? false)
    ;(this.listeners ??= []).push({ type, handler: handler as (e: never) => void, capture })
    return () => this.removeEventListener(type, handler, capture)
  }

  removeEventListener<K extends UIEventType>(type: K, handler: UIEventHandler<EventMap[K]>, options?: boolean | { capture?: boolean }): void {
    if (!this.listeners) return
    const capture = typeof options === 'boolean' ? options : (options?.capture ?? false)
    const i = this.listeners.findIndex((l) => l.type === type && l.handler === (handler as unknown) && l.capture === capture)
    if (i >= 0) this.listeners.splice(i, 1)
  }

  /** @internal Invoke listeners registered for the event's phase on this node. */
  _invoke(event: UIEvent, capturePhase: boolean): void {
    const ls = this.listeners
    if (!ls) return
    event.currentTarget = this
    // copy: handlers may add/remove listeners
    for (const l of ls.slice()) {
      if (l.type !== event.type) continue
      if (event.phase === 'target' ? false : l.capture !== capturePhase) continue
      ;(l.handler as UIEventHandler)(event)
    }
  }

  /** True when a listener for `type` (any phase) is registered on this node. */
  hasEventListener(type: UIEventType): boolean {
    return this.listeners !== null && this.listeners.some((l) => l.type === type)
  }

  /**
   * Would a press on this node do something? Enabled, and focusable, or listening for a press / drag / wheel event
   * (`pointerdown`, `pointerup`, `pointercancel`, `pointermove`, `click`, `wheel`), or — for a `ScrollView` — able to scroll.
   * Hover-only listeners (`pointerenter` / `pointerleave`) and animation events do not count, nor does being a decorative
   * background. Used by `ui.hitTestInteractive()`.
   */
  get isInteractive(): boolean {
    if (this.disabled || this._disposed) return false
    if (this.focusable) return true
    for (const t of INTERACTIVE_EVENTS) if (this.hasEventListener(t)) return true
    return false
  }

  /** Number of listeners (used by tests and the React renderer's leak checks). */
  get listenerCount(): number {
    return this.listeners?.length ?? 0
  }

  // ───────────────────────────── lifecycle ─────────────────────────────

  /** Remove from the parent, dispose the subtree and free the Yoga node. Idempotent. */
  dispose(): void {
    if (this._disposed) return
    if (this.parent) this.parent.remove(this)
    for (const c of [...this._children]) {
      this.remove(c)
      c.dispose()
    }
    this._ui?.input._nodeDetached(this)
    this._ui = null
    this._disposed = true
    this.listeners = null
    this._yoga.free()
  }

  protected assertAlive(what: string): void {
    if (this._disposed) throw new Error(`[three-ui] ${what}() on a disposed ${this.kind} (Yoga node already freed)`)
  }
}
