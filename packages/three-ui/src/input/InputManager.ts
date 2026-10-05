import { Affine2 } from 'three-2d'
import type { UINode } from '../core/UINode'
import { buildTransform } from '../paint/transform'
import {
  NO_MODIFIERS,
  StateFlags,
  UIEvent,
  UIFocusEvent,
  UIKeyEvent,
  UIPointerEvent,
  UIWheelEvent,
  type KeyInit,
  type Modifiers,
  type PointerEventInit,
} from './events'
import type { ThreeUI } from '../core/ThreeUI'

interface PressRecord {
  target: UINode
  path: UINode[]
  startX: number
  startY: number
  suppressClick: boolean
  init: PointerEventInit
}

const MOUSE_ID = 1

/** Children in paint order (z-index stable sort). Shared by painting and hit testing. */
export function orderedChildren(node: UINode): readonly UINode[] {
  const kids = node.children
  let hasZ = false
  for (let i = 0; i < kids.length; i++) {
    if (kids[i]!.computedStyle.zIndex !== 0) {
      hasZ = true
      break
    }
  }
  if (!hasZ) return kids
  return kids
    .map((c, i) => [c, i] as const)
    .sort((a, b) => a[0].computedStyle.zIndex - b[0].computedStyle.zIndex || a[1] - b[1])
    .map(([c]) => c)
}

/**
 * Platform-independent input: adapters feed raw pointer/wheel/key data; this class does hit testing,
 * capture → target → bubble dispatch, pointer capture and hovered/pressed/focused/disabled state.
 */
export class InputManager {
  private hoverPath: UINode[] = []
  private readonly presses = new Map<number, PressRecord>()
  private readonly captures = new Map<number, UINode>()
  private focusedNode: UINode | null = null
  private readonly tmp = new Affine2()

  constructor(private readonly ui: ThreeUI) {}

  get focused(): UINode | null {
    return this.focusedNode
  }

  // ───────────────────────────── hit testing ─────────────────────────────

  /** Deepest node under the root-space point, honoring clips, scroll offsets, transforms and `pointerEvents`. */
  hitTest(x: number, y: number): UINode | null {
    const root = this.ui.viewRoot
    return this.hit(root, x, y)
  }

  private hit(node: UINode, x: number, y: number): UINode | null {
    const cs = node.computedStyle
    if (cs.display === 'none') return null
    // x,y are in the parent's content space; move into this node's local space
    let lx = x - node.layout.x
    let ly = y - node.layout.y
    if (cs.transform && cs.transform.length > 0) {
      const m = this.tmp
      if (buildTransform(cs.transform, node.layout.width, node.layout.height, m)) {
        m.invert()
        const tx = m.applyX(lx, ly)
        ly = m.applyY(lx, ly)
        lx = tx
      }
    }
    const w = node.layout.width
    const h = node.layout.height
    const inside = lx >= 0 && ly >= 0 && lx < w && ly < h
    if (cs.overflow !== 'visible' && !inside) return null
    const kids = orderedChildren(node)
    // children are painted at layout - scroll offset, so undo the offset to land in their layout space
    const cx = lx - node.childOffsetX
    const cy = ly - node.childOffsetY
    for (let i = kids.length - 1; i >= 0; i--) {
      // children live in this node's content space: their layout offsets are applied inside `hit`
      const r = this.hit(kids[i]!, cx, cy)
      if (r) return r
    }
    return inside && cs.pointerEvents !== 'none' ? node : null
  }

  // ───────────────────────────── dispatch ─────────────────────────────

  private pathTo(node: UINode): UINode[] {
    const path: UINode[] = []
    for (let n: UINode | null = node; n; n = n.parent) path.push(n)
    return path.reverse()
  }

  private isDisabledPath(node: UINode): boolean {
    for (let n: UINode | null = node; n; n = n.parent) if (n.disabled) return true
    return false
  }

  /** Capture → target → bubble. */
  dispatch(event: UIEvent): void {
    const path = this.pathTo(event.target)
    const last = path.length - 1
    for (let i = 0; i < last && !event.propagationStopped; i++) {
      event.phase = 'capture'
      path[i]!._invoke(event, true)
    }
    if (!event.propagationStopped) {
      event.phase = 'target'
      path[last]!._invoke(event, false)
    }
    if (event.bubbles) {
      for (let i = last - 1; i >= 0 && !event.propagationStopped; i--) {
        event.phase = 'bubble'
        path[i]!._invoke(event, false)
      }
    }
    event.phase = 'none'
    event.currentTarget = null
  }

  // ───────────────────────────── pointer ─────────────────────────────

  pointerDown(x: number, y: number, init: PointerEventInit = {}): UIPointerEvent | null {
    const id = init.pointerId ?? MOUSE_ID
    const target = this.captures.get(id) ?? this.hitTest(x, y)
    if (!target || this.isDisabledPath(target)) return null
    if (init.pointerType === 'touch' || (init.pointerType !== undefined && init.pointerType !== 'mouse')) this.updateHover([], x, y, init)
    else this.hoverTo(target, x, y, init)
    const path = this.pathTo(target)
    for (const n of path) n._setState(StateFlags.ACTIVE, true)
    this.presses.set(id, { target, path, startX: x, startY: y, suppressClick: false, init })
    // focus: nearest focusable ancestor, or blur
    let f: UINode | null = target
    while (f && !f.focusable) f = f.parent
    this.focus(f)
    const e = new UIPointerEvent('pointerdown', target, x, y, { ...init, pointerId: id, buttons: init.buttons ?? 1 })
    this.dispatch(e)
    this.ui._paintDirty = true
    return e
  }

  pointerMove(x: number, y: number, init: PointerEventInit = {}): UIPointerEvent | null {
    const id = init.pointerId ?? MOUSE_ID
    const captured = this.captures.get(id)
    const hit = this.hitTest(x, y)
    const target = captured ?? hit
    if (!target) {
      this.updateHover([], x, y, init)
      return null
    }
    if ((init.pointerType ?? 'mouse') === 'mouse') this.hoverTo(captured ? (hit ?? target) : target, x, y, init)
    if (this.isDisabledPath(target)) return null
    const e = new UIPointerEvent('pointermove', target, x, y, { ...init, pointerId: id })
    this.dispatch(e)
    return e
  }

  pointerUp(x: number, y: number, init: PointerEventInit = {}): UIPointerEvent | null {
    const id = init.pointerId ?? MOUSE_ID
    const press = this.presses.get(id)
    const captured = this.captures.get(id)
    const hit = this.hitTest(x, y)
    const target = captured ?? hit ?? press?.target ?? null
    this.presses.delete(id)
    this.captures.delete(id)
    let e: UIPointerEvent | null = null
    if (target && !this.isDisabledPath(target)) {
      e = new UIPointerEvent('pointerup', target, x, y, { ...init, pointerId: id, buttons: 0 })
      this.dispatch(e)
    }
    if (press) {
      for (const n of press.path) n._setState(StateFlags.ACTIVE, false)
      if (!press.suppressClick && hit && (init.button ?? 0) === 0 && !this.isDisabledPath(hit)) {
        const common = this.commonAncestor(press.target, hit)
        if (common && !this.isDisabledPath(common)) this.dispatch(new UIPointerEvent('click', common, x, y, { ...init, pointerId: id, buttons: 0 }))
      }
    }
    if ((init.pointerType ?? 'mouse') !== 'mouse') this.updateHover([], x, y, init)
    this.ui._paintDirty = true
    return e
  }

  pointerCancel(init: PointerEventInit & { x?: number; y?: number } = {}): void {
    const id = init.pointerId ?? MOUSE_ID
    const press = this.presses.get(id)
    this.presses.delete(id)
    this.captures.delete(id)
    if (press) {
      for (const n of press.path) n._setState(StateFlags.ACTIVE, false)
      if (!press.target.isDisposed) this.dispatch(new UIPointerEvent('pointercancel', press.target, init.x ?? press.startX, init.y ?? press.startY, { ...init, pointerId: id }))
    }
  }

  /** The (mouse) pointer left the surface: clear hover. */
  pointerLeave(x = 0, y = 0): void {
    this.updateHover([], x, y, {})
  }

  private commonAncestor(a: UINode, b: UINode): UINode | null {
    const pa = this.pathTo(a)
    const pb = this.pathTo(b)
    let common: UINode | null = null
    for (let i = 0; i < Math.min(pa.length, pb.length) && pa[i] === pb[i]; i++) common = pa[i]!
    return common
  }

  private hoverTo(target: UINode, x: number, y: number, init: PointerEventInit): void {
    this.updateHover(this.isDisabledPath(target) ? [] : this.pathTo(target), x, y, init)
  }

  private updateHover(next: UINode[], x: number, y: number, init: PointerEventInit): void {
    const prev = this.hoverPath
    if (prev.length === next.length && prev.every((n, i) => n === next[i])) return
    const nextSet = new Set(next)
    const prevSet = new Set(prev)
    for (let i = prev.length - 1; i >= 0; i--) {
      const n = prev[i]!
      if (nextSet.has(n)) continue
      n._setState(StateFlags.HOVER, false)
      if (!n.isDisposed) {
        const ev = new UIPointerEvent('pointerleave', n, x, y, init)
        n._invoke(Object.assign(ev, { phase: 'target' as const }), false)
      }
    }
    for (const n of next) {
      if (prevSet.has(n)) continue
      n._setState(StateFlags.HOVER, true)
      const ev = new UIPointerEvent('pointerenter', n, x, y, init)
      n._invoke(Object.assign(ev, { phase: 'target' as const }), false)
    }
    this.hoverPath = next
    this.ui._paintDirty = true
  }

  // ───────────────────────────── capture ─────────────────────────────

  /**
   * Route all further events of `pointerId` to `node` (still bubbling from there).
   * `cancelOthers` cancels the gesture for the nodes that received the press (their `:active` state
   * clears, they get `pointercancel`, and no click is generated) — used by drag-to-scroll.
   */
  setPointerCapture(pointerId: number, node: UINode, options: { cancelOthers?: boolean } = {}): void {
    this.captures.set(pointerId, node)
    const press = this.presses.get(pointerId)
    if (!press) return
    if (options.cancelOthers) {
      press.suppressClick = true
      const keep = new Set(this.pathTo(node))
      for (const n of press.path) {
        if (keep.has(n)) continue
        n._setState(StateFlags.ACTIVE, false)
      }
      if (!press.target.isDisposed) {
        // cancel only the nodes below the capturing node: the event must not bubble into the capturer itself
        const cancel = new UIPointerEvent('pointercancel', press.target, press.startX, press.startY, { ...press.init, pointerId })
        cancel.phase = 'target'
        for (let i = press.path.length - 1; i >= 0; i--) {
          const n = press.path[i]!
          if (keep.has(n)) break
          n._invoke(cancel, false)
        }
      }
    }
  }

  releasePointerCapture(pointerId: number, node?: UINode): void {
    if (node && this.captures.get(pointerId) !== node) return
    this.captures.delete(pointerId)
  }

  hasPointerCapture(pointerId: number, node: UINode): boolean {
    return this.captures.get(pointerId) === node
  }

  // ───────────────────────────── wheel ─────────────────────────────

  wheel(x: number, y: number, deltaX: number, deltaY: number, init: Partial<Modifiers> & { timeStamp?: number } = {}): UIWheelEvent | null {
    const target = this.hitTest(x, y)
    if (!target || this.isDisabledPath(target)) return null
    const e = new UIWheelEvent(target, x, y, deltaX, deltaY, init)
    this.dispatch(e)
    return e
  }

  // ───────────────────────────── focus & keyboard ─────────────────────────────

  focus(node: UINode | null): void {
    if (node && (node.disabled || !node.focusable || node.isDisposed)) return
    const prev = this.focusedNode
    if (prev === node) return
    this.focusedNode = node
    if (prev) {
      prev._setState(StateFlags.FOCUS, false)
      if (!prev.isDisposed) this.dispatch(new UIFocusEvent('blur', prev, node))
    }
    if (node) {
      node._setState(StateFlags.FOCUS, true)
      this.dispatch(new UIFocusEvent('focus', node, prev))
    }
    this.ui._paintDirty = true
  }

  blur(): void {
    this.focus(null)
  }

  keyDown(key: string, code = key, init: KeyInit = {}): UIKeyEvent {
    const target = this.focusedNode ?? this.ui.viewRoot
    const e = new UIKeyEvent('keydown', target, key, code, init)
    this.dispatch(e)
    if (!e.defaultPrevented) this.defaultKeyAction(e)
    return e
  }

  keyUp(key: string, code = key, init: KeyInit = {}): UIKeyEvent {
    const target = this.focusedNode ?? this.ui.viewRoot
    const e = new UIKeyEvent('keyup', target, key, code, init)
    this.dispatch(e)
    return e
  }

  private defaultKeyAction(e: UIKeyEvent): void {
    if (e.key === 'Tab') {
      this.focusNext(e.shiftKey ? -1 : 1)
      e.preventDefault()
    } else if ((e.key === 'Enter' || e.key === ' ') && this.focusedNode) {
      const n = this.focusedNode
      const r = n.getAbsoluteRect()
      this.dispatch(new UIPointerEvent('click', n, r.x + r.width / 2, r.y + r.height / 2, { pointerType: 'mouse', ...NO_MODIFIERS }))
      e.preventDefault()
    }
  }

  /** Move focus to the next/previous focusable, enabled node in tree order (wraps). */
  focusNext(direction: 1 | -1 = 1): void {
    const list: UINode[] = []
    this.ui.viewRoot.traverse((n) => {
      if (n.computedStyle.display === 'none' || n.disabled) return false
      if (n.focusable) list.push(n)
      return undefined
    })
    if (list.length === 0) return
    const i = this.focusedNode ? list.indexOf(this.focusedNode) : -1
    const next = i < 0 ? (direction === 1 ? list[0]! : list[list.length - 1]!) : list[(i + direction + list.length) % list.length]!
    this.focus(next)
  }

  // ───────────────────────────── bookkeeping ─────────────────────────────

  /** @internal A node left the UI tree: forget it everywhere. */
  _nodeDetached(node: UINode): void {
    const inSubtree = (n: UINode | null) => {
      for (let p = n; p; p = p.parent) if (p === node) return true
      return false
    }
    if (this.focusedNode && inSubtree(this.focusedNode)) {
      this.focusedNode._setState(StateFlags.FOCUS, false)
      this.focusedNode = null
    }
    this.hoverPath = this.hoverPath.filter((n) => {
      if (!inSubtree(n)) return true
      n._setState(StateFlags.HOVER, false)
      return false
    })
    for (const [id, c] of this.captures) if (inSubtree(c)) this.captures.delete(id)
    for (const [id, p] of this.presses) {
      if (!inSubtree(p.target)) continue
      for (const n of p.path) n._setState(StateFlags.ACTIVE, false)
      this.presses.delete(id)
    }
  }

  /** @internal A node became disabled: drop hover/active/focus on its subtree. */
  _nodeDisabled(node: UINode): void {
    this._nodeDetached(node)
  }
}
