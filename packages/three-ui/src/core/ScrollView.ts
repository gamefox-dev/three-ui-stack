import { Color4 } from '@implicit-invocation/three-2d'
import type { UIDrawContext } from '../paint/DrawContext'
import type { Style } from '../style/types'
import { YGEnums as E } from '../yoga/runtime'
import type { UIKeyEvent, UIPointerEvent, UIWheelEvent } from '../input/events'
import { View } from './View'
import type { NodeKind, UINodeOptions } from './UINode'
import type { ThreeUI } from './ThreeUI'

export interface ScrollViewOptions extends UINodeOptions {
  /** Scroll along x instead of y. */
  horizontal?: boolean | undefined
  showsScrollIndicator?: boolean | undefined
  onScroll?: ((x: number, y: number) => void) | undefined
  /**
   * Ease notched mouse-wheel steps (|delta| ≥ 50) toward their target instead of jumping (libGDX `smoothScrolling`, like browsers do).
   * Trackpad / fine-grained deltas always apply directly. Default true.
   */
  smoothWheel?: boolean | undefined
}

const DRAG_THRESHOLD = 6
/** Wheel deltas at least this large come from a notched wheel (a trackpad sends many small ones). */
const NOTCH_DELTA = 50
/** Exponential approach rate (1/s) of smoothed wheel scrolling: ~70 ms time constant. */
const SMOOTH_RATE = 14
/** Inertia decay per millisecond (iOS-like deceleration rate). */
const DECELERATION_PER_MS = 0.998
const MIN_VELOCITY = 0.02
const INDICATOR = new Color4(0.5, 0.5, 0.55, 0.45)
const INDICATOR_ACTIVE = new Color4(0.6, 0.6, 0.66, 0.75)

interface Press {
  pointerId: number
  lastPos: number
  lastTime: number
  startPos: number
  velocity: number
  dragging: boolean
}

/**
 * Scrolling container with clipping, pointer/touch drag, mouse wheel, keyboard and inertia. The
 * content size is derived from Yoga layout; offsets are bounded. No DOM scroll containers.
 */
export class ScrollView extends View {
  override readonly kind: NodeKind = 'ScrollView'
  scrollX = 0
  scrollY = 0
  contentWidth = 0
  contentHeight = 0
  onScroll: ((x: number, y: number) => void) | undefined
  showsScrollIndicator: boolean

  private readonly _horizontal: boolean
  private press: Press | null = null
  private velocity = 0
  private inertia = false
  /** Pending target of a smoothed wheel scroll (null when not animating). */
  private smoothTarget: number | null = null
  smoothWheel: boolean

  constructor(options: ScrollViewOptions = {}) {
    super(options)
    this._horizontal = options.horizontal ?? false
    this.showsScrollIndicator = options.showsScrollIndicator ?? true
    this.smoothWheel = options.smoothWheel ?? true
    this.onScroll = options.onScroll
    this.addEventListener('wheel', (e) => this.handleWheel(e))
    this.addEventListener('pointerdown', (e) => this.handlePointerDown(e))
    this.addEventListener('pointermove', (e) => this.handlePointerMove(e))
    this.addEventListener('pointerup', (e) => this.handlePointerUp(e))
    this.addEventListener('pointercancel', () => this.endPress(false))
    this.addEventListener('keydown', (e) => this.handleKey(e))
    this.builtinListeners = this.listenerCount
  }

  get horizontal(): boolean {
    return this._horizontal
  }

  protected override get defaultStyle(): Style | undefined {
    return { overflow: 'scroll', flexDirection: this._horizontal ? 'row' : 'column' }
  }

  override get cullsChildren(): boolean {
    return true
  }

  override get childOffsetX(): number {
    return -this.scrollX
  }

  override get childOffsetY(): number {
    return -this.scrollY
  }

  /** A scroll view that can actually scroll consumes presses (drag) and wheel, even without listeners. */
  override get isInteractive(): boolean {
    if (this.disabled || this.isDisposed) return false
    // the scroll view's own gesture handlers do not make it interactive; scrollable content, focus or user listeners do
    return this.focusable || this.maxScrollX > 0 || this.maxScrollY > 0 || this.listenerCount > this.builtinListeners
  }

  private builtinListeners = 0

  get maxScrollX(): number {
    return Math.max(0, this.contentWidth - this.layout.width)
  }

  get maxScrollY(): number {
    return Math.max(0, this.contentHeight - this.layout.height)
  }

  /** Scroll to an absolute offset (clamped), cancelling a smoothed wheel scroll in progress. Returns true if the offset changed. */
  scrollTo(x: number, y: number): boolean {
    this.stopSmooth()
    return this.applyScroll(x, y)
  }

  private applyScroll(x: number, y: number): boolean {
    const nx = this._horizontal ? Math.min(Math.max(x, 0), this.maxScrollX) : 0
    const ny = this._horizontal ? 0 : Math.min(Math.max(y, 0), this.maxScrollY)
    if (nx === this.scrollX && ny === this.scrollY) return false
    this.scrollX = nx
    this.scrollY = ny
    this.invalidatePaint()
    this.onScroll?.(nx, ny)
    return true
  }

  scrollBy(dx: number, dy: number): boolean {
    return this.scrollTo(this.scrollX + dx, this.scrollY + dy)
  }

  private stopSmooth(): void {
    if (this.smoothTarget === null) return
    this.smoothTarget = null
    if (!this.inertia) this._ui?._unregisterTickable(this)
  }

  protected override onLayout(): void {
    let right = 0
    let bottom = 0
    for (const c of this.children) {
      if (c.computedStyle.display === 'none') continue
      const l = c.layout
      right = Math.max(right, l.x + l.width + Math.max(0, c._yoga.getComputedMargin(E.Edge.Right)))
      bottom = Math.max(bottom, l.y + l.height + Math.max(0, c._yoga.getComputedMargin(E.Edge.Bottom)))
    }
    this.contentWidth = Math.max(this.layout.width, right + this._yoga.getComputedPadding(E.Edge.Right))
    this.contentHeight = Math.max(this.layout.height, bottom + this._yoga.getComputedPadding(E.Edge.Bottom))
    // content or viewport size may have shrunk: re-clamp
    this.applyScroll(this.scrollX, this.scrollY)
    if (this.smoothTarget !== null) this.smoothTarget = Math.min(Math.max(this.smoothTarget, 0), this._horizontal ? this.maxScrollX : this.maxScrollY)
  }

  // ───────────────────────────── input ─────────────────────────────

  private axisDelta(e: UIWheelEvent): number {
    return this._horizontal ? (e.deltaX !== 0 ? e.deltaX : e.deltaY) : e.deltaY
  }

  private handleWheel(e: UIWheelEvent): void {
    this.stopInertia()
    const d = this.axisDelta(e)
    if (d === 0) return
    const before = this._horizontal ? this.scrollX : this.scrollY
    if (this.smoothWheel && Math.abs(d) >= NOTCH_DELTA) {
      // notches accumulate on the pending target, so a fast spin keeps accelerating toward the end
      const max = this._horizontal ? this.maxScrollX : this.maxScrollY
      const from = this.smoothTarget ?? before
      const target = Math.min(Math.max(from + d, 0), max)
      if (target !== before) {
        if (this.smoothTarget === null && !this.inertia) this._ui?._registerTickable(this)
        this.smoothTarget = target
        e.stopPropagation()
        e.preventDefault()
      }
      return
    }
    this.stopSmooth()
    this.scrollBy(this._horizontal ? d : 0, this._horizontal ? 0 : d)
    const after = this._horizontal ? this.scrollX : this.scrollY
    // consume only if we actually scrolled; at the end the wheel chains to an outer ScrollView
    if (after !== before) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  private pos(e: UIPointerEvent): number {
    return this._horizontal ? e.x : e.y
  }

  private now(e: { timeStamp: number }): number {
    return e.timeStamp > 0 ? e.timeStamp : Date.now()
  }

  private handlePointerDown(e: UIPointerEvent): void {
    if (e.button !== 0 || this.press) return
    this.stopInertia()
    this.stopSmooth()
    const p = this.pos(e)
    this.press = { pointerId: e.pointerId, lastPos: p, lastTime: this.now(e), startPos: p, velocity: 0, dragging: false }
  }

  private handlePointerMove(e: UIPointerEvent): void {
    const press = this.press
    if (!press || e.pointerId !== press.pointerId) return
    // A nested scroller that already owns this gesture consumed the event: do not fight it for pointer capture.
    if (e.defaultPrevented && !press.dragging) {
      this.press = null
      return
    }
    const p = this.pos(e)
    if (!press.dragging) {
      const moved = p - press.startPos
      if (Math.abs(moved) < DRAG_THRESHOLD) return
      // Content follows the finger (scrolls by −moved). If we can't scroll that way (content fits, or we're at the
      // end), leave the gesture to an outer scroller instead of swallowing it.
      if (!this.canScrollAlong(-moved)) {
        this.press = null
        return
      }
      press.dragging = true
      // from now on this ScrollView owns the gesture: children get pointercancel, no click fires
      this._ui?.input.setPointerCapture(e.pointerId, this, { cancelOthers: true })
    }
    const t = this.now(e)
    const dt = Math.max(1, t - press.lastTime)
    const delta = p - press.lastPos
    press.velocity = press.velocity * 0.6 + (delta / dt) * 0.4
    press.lastPos = p
    press.lastTime = t
    if (this._horizontal) this.scrollBy(-delta, 0)
    else this.scrollBy(0, -delta) // (scrollBy cancels a smoothed wheel scroll)
    e.preventDefault()
  }

  /** Can the scroll offset still move in direction `delta` (+ = towards the end) along this view's axis? */
  private canScrollAlong(delta: number): boolean {
    const pos = this._horizontal ? this.scrollX : this.scrollY
    const max = this._horizontal ? this.maxScrollX : this.maxScrollY
    return delta > 0 ? pos < max : pos > 0
  }

  private handlePointerUp(e: UIPointerEvent): void {
    const press = this.press
    if (!press || e.pointerId !== press.pointerId) return
    const stale = this.now(e) - press.lastTime > 100
    const v = stale ? 0 : -press.velocity
    this.endPress(press.dragging && Math.abs(v) > MIN_VELOCITY, v)
  }

  private endPress(startInertia: boolean, v = 0): void {
    const press = this.press
    this.press = null
    if (press?.dragging) this._ui?.input.releasePointerCapture(press.pointerId, this)
    if (startInertia) {
      this.velocity = v
      this.inertia = true
      this._ui?._registerTickable(this)
    }
  }

  private stopInertia(): void {
    if (!this.inertia) return
    this.inertia = false
    this.velocity = 0
    if (this.smoothTarget === null) this._ui?._unregisterTickable(this)
  }

  private handleKey(e: UIKeyEvent): void {
    const page = (this._horizontal ? this.layout.width : this.layout.height) * 0.9
    let delta = 0
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        delta = 40
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        delta = -40
        break
      case 'PageDown':
        delta = page
        break
      case 'PageUp':
        delta = -page
        break
      case ' ':
        delta = e.shiftKey ? -page : page
        break
      case 'Home':
        delta = -Infinity
        break
      case 'End':
        delta = Infinity
        break
      default:
        return
    }
    const cur = this._horizontal ? this.scrollX : this.scrollY
    const target = Number.isFinite(delta) ? cur + delta : delta < 0 ? 0 : Infinity
    this.scrollTo(this._horizontal ? target : 0, this._horizontal ? 0 : target)
    e.preventDefault()
  }

  protected override onAttach(old: ThreeUI | null, next: ThreeUI | null): void {
    if (old && !next) {
      old._unregisterTickable(this)
      this.press = null
      this.inertia = false
      this.smoothTarget = null
    }
  }

  /** @internal Inertia integration step (dt in seconds). */
  _tick(dt: number): void {
    if (this.smoothTarget !== null) {
      const cur = this._horizontal ? this.scrollX : this.scrollY
      const diff = this.smoothTarget - cur
      // exponential approach, never slower than 200 px/s near the end (libGDX uses max(200 · dt, diff · 7 · dt))
      const step = Math.max(Math.abs(diff) * (1 - Math.exp(-SMOOTH_RATE * dt)), 200 * dt)
      const next = Math.abs(diff) <= step ? this.smoothTarget : cur + Math.sign(diff) * step
      const done = next === this.smoothTarget
      this.applyScroll(this._horizontal ? next : 0, this._horizontal ? 0 : next)
      if (done) this.smoothTarget = null
      if (done && !this.inertia) this._ui?._unregisterTickable(this)
      return
    }
    if (!this.inertia) return
    const ms = dt * 1000
    const before = this._horizontal ? this.scrollX : this.scrollY
    this.applyScroll(this._horizontal ? this.scrollX + this.velocity * ms : 0, this._horizontal ? 0 : this.scrollY + this.velocity * ms)
    const after = this._horizontal ? this.scrollX : this.scrollY
    this.velocity *= Math.pow(DECELERATION_PER_MS, ms)
    if (Math.abs(this.velocity) < MIN_VELOCITY || after === before) this.stopInertia()
  }

  // ───────────────────────────── painting ─────────────────────────────

  override paintOverlay(ctx: UIDrawContext, x: number, y: number, w: number, h: number): void {
    if (!this.showsScrollIndicator) return
    const color = this.press?.dragging || this.inertia ? INDICATOR_ACTIVE : INDICATOR
    if (this._horizontal) {
      const max = this.maxScrollX
      if (max <= 0) return
      const trackW = w - 8
      const thumbW = Math.max(24, (w / this.contentWidth) * trackW)
      const tx = x + 4 + (this.scrollX / max) * (trackW - thumbW)
      ctx.rect({ x: tx, y: y + h - 7, width: thumbW, height: 4 }, { color, radius: 2 })
    } else {
      const max = this.maxScrollY
      if (max <= 0) return
      const trackH = h - 8
      const thumbH = Math.max(24, (h / this.contentHeight) * trackH)
      const ty = y + 4 + (this.scrollY / max) * (trackH - thumbH)
      ctx.rect({ x: x + w - 7, y: ty, width: 4, height: thumbH }, { color, radius: 2 })
    }
  }
}
