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
  /** Drag past the ends with resistance and spring back (Cocos `elastic`). Default true. */
  elastic?: boolean | undefined
  /** Keep scrolling after a flick, decelerating (Cocos `inertia`). Default true. */
  inertia?: boolean | undefined
  /** 0…1: how much of a flick's speed is taken away; 1 = no inertia (Cocos `brake`). Default 0.5. */
  brake?: number | undefined
  /** Seconds the spring-back from an overscroll takes (Cocos `bounceDuration`). Default 1. */
  bounceDuration?: number | undefined
}

const DRAG_THRESHOLD = 7
/** Wheel deltas at least this large come from a notched wheel (a trackpad sends many small ones). */
const NOTCH_DELTA = 50
/** Exponential approach rate (1/s) of smoothed wheel scrolling: ~70 ms time constant. */
const SMOOTH_RATE = 14
const INDICATOR = new Color4(0.5, 0.5, 0.55, 0.45)
const INDICATOR_ACTIVE = new Color4(0.6, 0.6, 0.66, 0.75)

// ── Cocos Creator `ScrollView` constants (cocos/ui/scroll-view.ts) ─────────────────────────────────────────────────────
/** Last N drag moves that make up the release velocity. */
const GATHERED_MOVES = 5
/** While an inertia scroll runs into an end, time runs 1/0.05 = 20× faster and the overshoot is cut to 5 %. */
const OUT_OF_BOUNDARY_BREAKING_FACTOR = 0.05
const EPSILON = 1e-4
/** A flick travels this fraction of (release velocity · (1 − brake)) before attenuation. */
const MOVEMENT_FACTOR = 0.7
/** Seconds of drag history above which the finger is considered to have stopped (no inertia). */
const MAX_VELOCITY_WINDOW = 0.5

const quintEaseOut = (t: number): number => {
  t -= 1
  return t * t * t * t * t + 1
}

interface Press {
  pointerId: number
  lastPos: number
  lastTime: number
  startPos: number
  dragging: boolean
}

/** A running inertia / bounce-back animation, in content-position space (offset = −position). */
interface AutoScroll {
  start: number
  delta: number
  total: number
  acc: number
  attenuate: boolean
  braking: boolean
  brakeStart: number
  /** Started out of bounds (a bounce-back): never brakes. */
  outOfBounds: boolean
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
  private auto: AutoScroll | null = null
  private readonly moveD: number[] = []
  private readonly moveT: number[] = []
  elastic: boolean
  inertia: boolean
  brake: number
  bounceDuration: number
  /** Pending target of a smoothed wheel scroll (null when not animating). */
  private smoothTarget: number | null = null
  smoothWheel: boolean

  constructor(options: ScrollViewOptions = {}) {
    super(options)
    this._horizontal = options.horizontal ?? false
    this.showsScrollIndicator = options.showsScrollIndicator ?? true
    this.smoothWheel = options.smoothWheel ?? true
    this.elastic = options.elastic ?? true
    this.inertia = options.inertia ?? true
    this.brake = Math.min(Math.max(options.brake ?? 0.5, 0), 1)
    this.bounceDuration = options.bounceDuration ?? 1
    this.onScroll = options.onScroll
    this.addEventListener('wheel', (e) => this.handleWheel(e))
    this.addEventListener('pointerdown', (e) => this.handlePointerDown(e))
    this.addEventListener('pointermove', (e) => this.handlePointerMove(e))
    this.addEventListener('pointerup', (e) => this.handlePointerUp(e))
    this.addEventListener('pointercancel', () => {
      this.endPress()
      this.processInertia()
    })
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
    this.stopAuto()
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
    if (!this.auto) this._ui?._unregisterTickable(this)
  }

  private stopAuto(): void {
    if (!this.auto) return
    this.auto = null
    if (this.smoothTarget === null) this._ui?._unregisterTickable(this)
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
    if (!this.auto && !this.press?.dragging) this.applyScroll(this.scrollX, this.scrollY)
    if (this.smoothTarget !== null) this.smoothTarget = Math.min(Math.max(this.smoothTarget, 0), this._horizontal ? this.maxScrollX : this.maxScrollY)
  }

  // ───────────────────────────── input ─────────────────────────────

  private axisDelta(e: UIWheelEvent): number {
    return this._horizontal ? (e.deltaX !== 0 ? e.deltaX : e.deltaY) : e.deltaY
  }

  private handleWheel(e: UIWheelEvent): void {
    this.stopAuto()
    const d = this.axisDelta(e)
    if (d === 0) return
    const before = this._horizontal ? this.scrollX : this.scrollY
    if (this.smoothWheel && Math.abs(d) >= NOTCH_DELTA) {
      // notches accumulate on the pending target, so a fast spin keeps accelerating toward the end
      const max = this._horizontal ? this.maxScrollX : this.maxScrollY
      const from = this.smoothTarget ?? before
      const target = Math.min(Math.max(from + d, 0), max)
      if (target !== before) {
        if (this.smoothTarget === null && !this.auto) this._ui?._registerTickable(this)
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
    this.stopAuto()
    this.stopSmooth()
    const p = this.pos(e)
    this.moveD.length = 0
    this.moveT.length = 0
    this.press = { pointerId: e.pointerId, lastPos: p, lastTime: this.now(e), startPos: p, dragging: false }
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
      // Content follows the finger. If we can't scroll that way (content fits, or we're at the end) leave the gesture to an
      // outer scroller; a lone elastic view still takes it, to overscroll and spring back.
      if (!this.canDrag(moved)) {
        this.press = null
        return
      }
      press.dragging = true
      // from now on this ScrollView owns the gesture: children get pointercancel, no click fires
      this._ui?.input.setPointerCapture(e.pointerId, this, { cancelOthers: true })
    }
    const t = this.now(e)
    const delta = p - press.lastPos
    this.gatherMove(delta, Math.max(0, t - press.lastTime) / 1000)
    press.lastPos = p
    press.lastTime = t
    this.dragBy(delta)
    e.preventDefault()
  }

  /** Can a drag by `moved` px (finger direction) start here? */
  private canDrag(moved: number): boolean {
    const max = this._horizontal ? this.maxScrollX : this.maxScrollY
    if (max <= 0) return false
    const pos = this._horizontal ? this.scrollX : this.scrollY
    if (moved < 0 ? pos < max : pos > 0) return true // can still move that way
    return this.elastic && !this.hasOuterScroller()
  }

  private hasOuterScroller(): boolean {
    for (let n = this.parent; n; n = n.parent) {
      if (n instanceof ScrollView && n._horizontal === this._horizontal && (n._horizontal ? n.maxScrollX : n.maxScrollY) > 0) return true
    }
    return false
  }

  private handlePointerUp(e: UIPointerEvent): void {
    const press = this.press
    if (!press || e.pointerId !== press.pointerId) return
    if (press.dragging) {
      const t = this.now(e)
      const p = this.pos(e)
      // the release itself is a (possibly zero) move: a finger that rested before lifting shows up as a long time delta → no flick
      this.gatherMove(p - press.lastPos, Math.max(0, t - press.lastTime) / 1000)
    }
    this.endPress()
    this.processInertia()
  }

  private endPress(): void {
    const press = this.press
    this.press = null
    if (press?.dragging) this._ui?.input.releasePointerCapture(press.pointerId, this)
  }

  // ───────────────── Cocos Creator ScrollView model: elastic drag, flick velocity, attenuated inertia, bounce back ─────────────────
  // Everything below works in content-position space `c = −offset` like Cocos, where a finger moving by f moves the content by f.

  private get c(): number {
    return -(this._horizontal ? this.scrollX : this.scrollY)
  }

  private setC(c: number): void {
    const offset = 0 - c
    const nx = this._horizontal ? offset : 0
    const ny = this._horizontal ? 0 : offset
    if (nx === this.scrollX && ny === this.scrollY) return
    this.scrollX = nx
    this.scrollY = ny
    this.invalidatePaint()
    this.onScroll?.(nx, ny)
  }

  private get maxAxis(): number {
    return this._horizontal ? this.maxScrollX : this.maxScrollY
  }

  /** How far the content must move to be back inside its bounds (Cocos `_getHowMuchOutOfBoundary`); 0 when inside. */
  private outOfBoundary(c = this.c): number {
    if (c > 0) return -c
    const min = -this.maxAxis
    return c < min ? min - c : 0
  }

  /** Cocos `_clampDelta`: content that fits the view does not move. */
  private clampDelta(d: number): number {
    return this.maxAxis <= 0 ? 0 : d
  }

  /** Cocos `_gatherTouchMove`: keep the last 5 moves and the time each took. */
  private gatherMove(delta: number, dt: number): void {
    while (this.moveD.length >= GATHERED_MOVES) {
      this.moveD.shift()
      this.moveT.shift()
    }
    this.moveD.push(this.clampDelta(delta))
    this.moveT.push(dt)
  }

  /** Cocos `_scrollChildren`: while out of bounds the content follows the finger at half rate (elastic), else it is clamped. */
  private dragBy(finger: number): void {
    const d = this.clampDelta(finger)
    if (this.elastic) {
      this.setC(this.c + d * (this.outOfBoundary() === 0 ? 1 : 0.5))
    } else {
      this.setC(Math.min(0, Math.max(-this.maxAxis, this.c + d)))
    }
  }

  /** Cocos `_startBounceBackIfNeeded`. */
  private startBounceBackIfNeeded(): boolean {
    if (!this.elastic) return false
    const back = this.clampDelta(this.outOfBoundary())
    if (Math.abs(back) <= EPSILON) return false
    this.startAuto(back, Math.max(this.bounceDuration, 0), true)
    return true
  }

  /** Cocos `_processInertiaScroll`, run on release. */
  private processInertia(): void {
    if (this.startBounceBackIfNeeded()) return
    if (!this.inertia || this.brake >= 1) return
    let total = 0
    for (const t of this.moveT) total += t
    if (total <= 0 || total >= MAX_VELOCITY_WINDOW) return // finger rested (or no drag): no flick
    let moved = 0
    for (const d of this.moveD) moved += d
    const v = (moved * (1 - this.brake)) / total
    if (Math.abs(v) <= EPSILON) return
    this.startAttenuatingAuto(v * MOVEMENT_FACTOR, v)
  }

  /** Cocos `_calculateAttenuatedFactor`. */
  private attenuatedFactor(distance: number): number {
    if (this.brake <= 0) return 1 - this.brake
    return (1 - this.brake) * (1 / (1 + distance * 0.000014 + distance * distance * 0.000000008))
  }

  /** Cocos `_startAttenuatingAutoScroll` (+ `_calculateAutoScrollTimeByInitialSpeed`). */
  private startAttenuatingAuto(deltaMove: number, initialVelocity: number): void {
    const totalMove = this.maxAxis
    let target = Math.sign(deltaMove) * totalMove * (1 - this.brake) * this.attenuatedFactor(totalMove)
    const originalLength = Math.abs(deltaMove)
    let factor = Math.abs(target) / originalLength
    target += deltaMove
    if (this.brake > 0 && factor > 7) {
      factor = Math.sqrt(factor)
      target = deltaMove * factor + deltaMove
    }
    let time = Math.sqrt(Math.sqrt(Math.abs(initialVelocity) / 5))
    if (this.brake > 0 && factor > 3) {
      factor = 3
      time *= factor
    }
    if (this.brake === 0 && factor > 1) time *= factor
    this.startAuto(target, time, true)
  }

  /** Cocos `_startAutoScroll`. */
  private startAuto(delta: number, time: number, attenuate: boolean): void {
    this.smoothTarget = null
    this.auto = { start: this.c, delta: this.clampDelta(delta), total: time, acc: 0, attenuate, braking: false, brakeStart: 0, outOfBounds: this.outOfBoundary() !== 0 }
    this._ui?._registerTickable(this)
  }

  /** Cocos `_processAutoScrolling`. */
  private stepAuto(dt: number): void {
    const a = this.auto!
    let brake = a.braking
    if (!brake && this.outOfBoundary() !== 0) {
      if (!a.outOfBounds) {
        // an inertia scroll just ran past an end: slow to 5 % and let the bounce-back take over
        a.outOfBounds = true
        a.braking = brake = true
        a.brakeStart = this.c
      }
    } else if (!brake) {
      a.outOfBounds = false
    }
    const brakingFactor = brake ? OUT_OF_BOUNDARY_BREAKING_FACTOR : 1
    a.acc += dt * (1 / brakingFactor)
    let percentage = a.total > 0 ? Math.min(1, a.acc / a.total) : 1
    if (a.attenuate) percentage = quintEaseOut(percentage)
    let pos = a.start + a.delta * percentage
    let reachedEnd = Math.abs(percentage - 1) <= EPSILON
    if (this.elastic) {
      let offset = pos - a.brakeStart
      if (brake) offset *= brakingFactor
      pos = a.brakeStart + offset
    } else {
      const over = this.outOfBoundary(pos)
      if (over !== 0) {
        pos += over
        reachedEnd = true
      }
    }
    if (reachedEnd) this.auto = null
    this.setC(pos)
    if (reachedEnd) {
      // float residue of the last step must not leave the view a hair outside its bounds
      const over = this.outOfBoundary()
      if (over !== 0 && Math.abs(over) < 0.01) this.setC(this.c + over)
      else if (this.elastic) this.startBounceBackIfNeeded()
    }
    if (!this.auto && this.smoothTarget === null) this._ui?._unregisterTickable(this)
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
      this.auto = null
      this.smoothTarget = null
    }
  }

  /** @internal Animation step (dt in seconds): smoothed wheel scrolling, inertia and bounce-back. */
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
      if (done && !this.auto) this._ui?._unregisterTickable(this)
      return
    }
    if (this.auto) this.stepAuto(dt)
  }

  // ───────────────────────────── painting ─────────────────────────────

  override paintOverlay(ctx: UIDrawContext, x: number, y: number, w: number, h: number): void {
    if (!this.showsScrollIndicator) return
    const color = this.press?.dragging || this.auto ? INDICATOR_ACTIVE : INDICATOR
    if (this._horizontal) {
      const max = this.maxScrollX
      if (max <= 0) return
      const trackW = w - 8
      const thumbW = Math.max(24, (w / this.contentWidth) * trackW)
      const tx = x + 4 + Math.min(1, Math.max(0, this.scrollX / max)) * (trackW - thumbW)
      ctx.rect({ x: tx, y: y + h - 7, width: thumbW, height: 4 }, { color, radius: 2 })
    } else {
      const max = this.maxScrollY
      if (max <= 0) return
      const trackH = h - 8
      const thumbH = Math.max(24, (h / this.contentHeight) * trackH)
      const ty = y + 4 + Math.min(1, Math.max(0, this.scrollY / max)) * (trackH - thumbH)
      ctx.rect({ x: x + w - 7, y: ty, width: 4, height: thumbH }, { color, radius: 2 })
    }
  }
}
