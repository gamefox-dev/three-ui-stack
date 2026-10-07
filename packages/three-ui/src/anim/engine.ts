import { Color4 } from '@implicit-invocation/three-2d'
import { warnOnce } from '../dev'
import { STYLE_DIRTY } from '../core/flags'
import type { ThreeUI } from '../core/ThreeUI'
import type { UINode } from '../core/UINode'
import { UIAnimationEvent, UITransitionEvent, type UIEvent } from '../input/events'
import { valuesEqual, type ComputedStyle, type ResolvedTransition } from '../style/computed'
import { syncYoga } from '../style/yogaSync'
import { INHERITED_KEYS, type AnimationOptions, type AnimationSpec, type Keyframes } from '../style/types'
import { UIAnimation, type AnimationNotice, type TimingSpec } from './Animation'
import { parseEasingFn, type EasingFn } from './easing'
import { ANIMATABLE, PAINT_ANIMATABLE, interpolateValue, isLayoutProperty } from './interpolate'
import { compileKeyframes, sampleTrack } from './keyframes'

const INHERITED: ReadonlySet<string> = new Set(INHERITED_KEYS)

/** A running property transition (style change → eased interpolation over `duration`). */
interface Transition {
  key: string
  from: unknown
  to: unknown
  duration: number
  delay: number
  easing: EasingFn
  elapsed: number
  started: boolean
  scratch: { color: Color4 }
}

/** Per-node animation state. Exists only while the node has animations or transitions. */
export interface NodeFx {
  /** Cascade result (what the style says, before animation). */
  base: ComputedStyle | null
  /** The object paint reads: `base` with animated values written over it. */
  visible: ComputedStyle | null
  /** Style-driven animations in spec order, then `node.animate()` ones. */
  animations: UIAnimation[]
  /** Style animations by signature; finished ones stay so they are not restarted by a later recompute. */
  styleAnims: Map<string, UIAnimation>
  transitions: Map<string, Transition>
  animatedKeys: Set<string>
  dirty: boolean
}

const newFx = (): NodeFx => ({ base: null, visible: null, animations: [], styleAnims: new Map(), transitions: new Map(), animatedKeys: new Set(), dirty: true })

const keyframesIds = new WeakMap<object, number>()
let nextKeyframesId = 1
const idOf = (o: object): number => {
  let id = keyframesIds.get(o)
  if (id === undefined) keyframesIds.set(o, (id = nextKeyframesId++))
  return id
}

function signature(spec: AnimationSpec, index: number): string {
  return `${index}|${spec.name ?? ''}|${spec.keyframes ? idOf(spec.keyframes) : ''}|${spec.duration ?? 0}|${spec.delay ?? 0}|${spec.easing ?? ''}|${spec.iterations ?? 1}|${spec.direction ?? ''}|${spec.fill ?? ''}|${spec.paused ? 1 : 0}|${spec.layout ? 1 : 0}`
}

function iterationsOf(v: number | 'infinite' | undefined): number {
  if (v === undefined) return 1
  if (v === 'infinite' || v === Infinity) return Infinity
  return Math.max(0, v)
}

/**
 * Drives CSS-like animations, transitions and Web-Animations-like handles from the app's `ui.update(dt)`.
 * Cost: nothing for nodes without animation; per animated node and frame, one pass over its animated properties
 * (plus a Yoga relayout when — and only when — layout properties were explicitly opted in).
 */
export class AnimationEngine {
  /** Attached nodes that currently carry animation state. */
  readonly nodes = new Set<UINode>()
  private pending: UIEvent[] = []
  private readonly scratchNotices: AnimationNotice[] = []

  constructor(private readonly ui: ThreeUI) {}

  /** True while something is moving (the host should keep rendering). */
  get hasRunning(): boolean {
    for (const node of this.nodes) {
      const fx = node._fx
      if (!fx) continue
      if (fx.transitions.size > 0 || fx.dirty) return true
      for (const a of fx.animations) if (a.playState === 'running') return true
    }
    return false
  }

  /** `node.animate()` */
  animate(node: UINode, keyframes: Keyframes, options: number | AnimationOptions = {}): UIAnimation {
    const o: AnimationOptions = typeof options === 'number' ? { duration: options } : options
    const compiled = compileKeyframes(keyframes, o.layout === true, undefined, 'node.animate()')
    const timing: TimingSpec = {
      duration: Math.max(0, o.duration ?? 0),
      delay: o.delay ?? 0,
      iterations: iterationsOf(o.iterations),
      direction: o.direction ?? 'normal',
      fill: o.fill ?? 'none',
      iterationEasing: o.easing,
    }
    const fx = (node._fx ??= newFx())
    if (!fx.base) {
      // first effect on a node whose style is already computed: paint reads our copy from now on
      fx.base = node.computedStyle
      fx.visible = { ...fx.base }
      node.computedStyle = fx.visible
    }
    const anim = new UIAnimation(node, '', compiled, timing, 'api', o.paused === true, () => this.wake(node))
    fx.animations.push(anim)
    fx.dirty = true
    if (node._ui === this.ui) this.nodes.add(node)
    this.ui._requestUpdate()
    return anim
  }

  private wake(node: UINode): void {
    const fx = node._fx
    if (fx) fx.dirty = true
    this.ui._requestUpdate()
  }

  // ───────────────────────────── style cascade hook ─────────────────────────────

  /**
   * Called by `UINode._recomputeStyle` with the fresh cascade result. Starts / retargets transitions and style
   * animations and returns the style paint should read (`base` itself when nothing animates).
   */
  resolve(node: UINode, base: ComputedStyle, prevBase: ComputedStyle | null, prevVisible: ComputedStyle | null): ComputedStyle {
    let fx = node._fx
    const wantsAnim = base.animation.length > 0 || (fx !== null && fx.styleAnims.size > 0)
    const wantsTransition = prevBase !== null && base.transition.length > 0
    if (!fx && !wantsAnim && !wantsTransition) return base
    fx ??= node._fx = newFx()
    fx.base = base
    this.syncStyleAnimations(node, fx, base)
    if (wantsTransition) this.startTransitions(node, fx, prevBase!, prevVisible ?? prevBase!, base)
    if (!this.hasEffects(fx)) {
      this.drop(node, fx)
      return base
    }
    if (node._ui === this.ui) this.nodes.add(node)
    fx.visible = { ...base }
    fx.animatedKeys.clear()
    this.apply(node, fx, false)
    fx.dirty = false
    return fx.visible
  }

  private hasEffects(fx: NodeFx): boolean {
    return fx.animations.length > 0 || fx.transitions.size > 0
  }

  private drop(node: UINode, fx: NodeFx): void {
    this.nodes.delete(node)
    if (node._fx === fx) node._fx = null
  }

  // ───────────────────────────── style `animation` ─────────────────────────────

  private syncStyleAnimations(node: UINode, fx: NodeFx, base: ComputedStyle): void {
    const specs = base.animation
    const keep = new Set<string>()
    const ordered: UIAnimation[] = []
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i]!
      const sig = signature({ ...spec, layout: spec.layout ?? base.animationLayout }, i)
      keep.add(sig)
      let anim = fx.styleAnims.get(sig)
      if (!anim) {
        const created = this.createStyleAnimation(node, spec, base, sig)
        if (!created) continue
        anim = created
        fx.styleAnims.set(sig, anim)
      }
      ordered.push(anim)
    }
    for (const [sig, anim] of fx.styleAnims) {
      if (keep.has(sig)) continue
      fx.styleAnims.delete(sig)
      if (anim.playState === 'running' || anim.playState === 'paused') this.emitCancel(node, anim)
      anim._cancelledByEngine = true
    }
    // style animations first (spec order), imperative ones after: later effects win
    const imperative = fx.animations.filter((a) => a.source === 'api')
    fx.animations = [...ordered, ...imperative]
  }

  private createStyleAnimation(node: UINode, spec: AnimationSpec, base: ComputedStyle, sig: string): UIAnimation | null {
    const keyframes = spec.keyframes ?? (spec.name ? this.ui.lookupKeyframes(spec.name) : undefined)
    if (!keyframes) {
      if (spec.name) warnOnce(`kf-missing-${spec.name}`, `animation "${spec.name}": no @keyframes with that name (register it with ui.registerKeyframes or define it in Tailwind @theme)`)
      return null
    }
    const label = spec.name ?? 'inline'
    const compiled = compileKeyframes(keyframes, spec.layout ?? base.animationLayout, spec.easing ?? 'ease', label)
    const timing: TimingSpec = {
      duration: Math.max(0, spec.duration ?? 0),
      delay: spec.delay ?? 0,
      iterations: iterationsOf(spec.iterations),
      direction: spec.direction ?? 'normal',
      fill: spec.fill ?? 'none',
      iterationEasing: undefined,
    }
    const anim = new UIAnimation(node, spec.name ?? '', compiled, timing, 'style', spec.paused === true, () => this.wake(node))
    anim._signature = sig
    return anim
  }

  // ───────────────────────────── transitions ─────────────────────────────

  private startTransitions(node: UINode, fx: NodeFx, prevBase: ComputedStyle, prevVisible: ComputedStyle, base: ComputedStyle): void {
    const byKey = new Map<string, ResolvedTransition>()
    for (const spec of base.transition) {
      if (spec.property === 'all') {
        for (const k in PAINT_ANIMATABLE) byKey.set(k, spec)
      } else if (spec.property in ANIMATABLE) {
        byKey.set(spec.property, spec)
      } else {
        warnOnce(`tr-prop-${spec.property}`, `transition-property "${spec.property}" is not animatable (ignored)`)
      }
    }
    const b = base as unknown as Record<string, unknown>
    const pb = prevBase as unknown as Record<string, unknown>
    const pv = prevVisible as unknown as Record<string, unknown>
    for (const [key, spec] of byKey) {
      const to = b[key]
      const running = fx.transitions.get(key)
      const prevTarget = running ? running.to : pb[key]
      if (valuesEqual(prevTarget, to)) continue
      if (running) {
        this.pending.push(new UITransitionEvent('transitioncancel', node, key, running.elapsed / 1000))
        fx.transitions.delete(key)
      }
      const from = pv[key]
      fx.transitions.set(key, { key, from, to, duration: spec.duration, delay: spec.delay, easing: parseEasingFn(spec.easing), elapsed: 0, started: false, scratch: { color: new Color4() } })
    }
  }

  // ───────────────────────────── per-frame ─────────────────────────────

  /**
   * Advance time by `dt` seconds. With `dt = 0` nothing moves — the engine only reacts to cancel / finish / seek
   * requests — so a paused or frozen game freezes every animation.
   */
  tick(dt: number): void {
    if (this.nodes.size === 0) return
    const dtMs = Math.max(0, dt) * 1000
    const notices = this.scratchNotices
    for (const node of [...this.nodes]) {
      const fx = node._fx
      if (!fx || !fx.base || node.isDisposed) {
        this.nodes.delete(node)
        continue
      }
      let changed = fx.dirty
      let finished: UIAnimation[] | null = null
      for (const a of fx.animations) {
        if (a.playState === 'finished') continue
        if (a.playState === 'idle') {
          if (!a._cancelledByEngine) this.emitCancel(node, a)
          a._cancelledByEngine = true
          changed = true
          continue
        }
        notices.length = 0
        const before = a.currentTime
        a._advance(dtMs, notices)
        if (a.currentTime !== before || notices.length > 0) changed = true
        for (const n of notices) {
          const type = n.type === 'start' ? 'animationstart' : n.type === 'iteration' ? 'animationiteration' : n.type === 'end' ? 'animationend' : 'animationcancel'
          this.pending.push(new UIAnimationEvent(type, node, a.name, n.elapsed))
          if (n.type === 'end') (finished ??= []).push(a)
        }
      }
      let doneTransitions: Transition[] | null = null
      if (fx.transitions.size > 0) {
        changed = true
        for (const t of fx.transitions.values()) {
          if (dtMs > 0) t.elapsed += dtMs
          if (!t.started && t.elapsed >= t.delay) {
            t.started = true
            this.pending.push(new UITransitionEvent('transitionstart', node, t.key, 0))
          }
          if (t.elapsed >= t.delay + t.duration) (doneTransitions ??= []).push(t)
        }
      }
      // one pass at the new time; finished work wrote its final value (or restored the base) here already
      if (changed) this.apply(node, fx, true)
      fx.dirty = false
      if (finished) for (const a of finished) a._complete()
      if (doneTransitions) {
        for (const t of doneTransitions) {
          fx.transitions.delete(t.key)
          this.pending.push(new UITransitionEvent('transitionend', node, t.key, t.duration / 1000))
        }
      }
      // animations that no longer contribute anything (finished without fill, cancelled) leave the list
      if (fx.animations.some((a) => !this.keeps(a))) fx.animations = fx.animations.filter((a) => this.keeps(a))
      if (!this.hasEffects(fx) && fx.styleAnims.size === 0) this.drop(node, fx)
    }
    this.flushEvents()
  }

  private keeps(a: UIAnimation): boolean {
    if (a.playState === 'idle') return false
    if (a.playState === 'finished') return a.timing.fill === 'forwards' || a.timing.fill === 'both' || a.source === 'style'
    return true
  }

  private emitCancel(node: UINode, anim: UIAnimation): void {
    this.pending.push(new UIAnimationEvent('animationcancel', node, anim.name, Math.max(0, anim.currentTime - anim.timing.delay) / 1000))
  }

  private flushEvents(): void {
    if (this.pending.length === 0) return
    const events = this.pending
    this.pending = []
    for (const e of events) if (!e.target.isDisposed) this.ui.input.dispatch(e)
  }

  /**
   * Write the animated values over `fx.visible` (restoring properties that stopped animating) and, when asked,
   * propagate layout / inherited changes. Returns nothing: the node's `computedStyle` object is updated in place.
   */
  private apply(node: UINode, fx: NodeFx, live: boolean): void {
    const base = fx.base!
    const vis = fx.visible ?? (fx.visible = { ...base })
    // animated transforms / shadows move the node's paint bounds (and mutate `computedStyle` in place, so nothing else tells the node)
    node._markExtDirty()
    const v = vis as unknown as Record<string, unknown>
    const b = base as unknown as Record<string, unknown>
    // remember outgoing layout values so Yoga only sees real changes
    let before: Record<string, unknown> | null = null
    for (const k of fx.animatedKeys) {
      if (isLayoutProperty(k)) (before ??= {})[k] = v[k]
      v[k] = b[k]
    }
    fx.animatedKeys.clear()
    const ctx = { width: node.layout.width, height: node.layout.height }

    for (const t of fx.transitions.values()) {
      let value: unknown
      if (t.elapsed < t.delay) value = t.from
      else {
        const p = t.duration <= 0 ? 1 : Math.min(1, (t.elapsed - t.delay) / t.duration)
        value = p >= 1 ? t.to : interpolateValue(t.key, t.from, t.to, t.easing(p), ctx, t.scratch)
      }
      if (isLayoutProperty(t.key)) (before ??= {})[t.key] ??= v[t.key]
      v[t.key] = value
      fx.animatedKeys.add(t.key)
    }
    for (const a of fx.animations) {
      const s = a.sample()
      if (!a.contributes(s.phase)) continue
      for (const track of a.compiled.tracks) {
        if (isLayoutProperty(track.key)) (before ??= {})[track.key] ??= v[track.key]
        v[track.key] = sampleTrack(track, s.progress, base, ctx)
        fx.animatedKeys.add(track.key)
      }
    }
    if (!live) return

    // inherited properties (text color, stroke…) feed descendants
    let inherited = false
    for (const k of fx.animatedKeys) if (INHERITED.has(k)) inherited = true
    if (!inherited && before === null) {
      this.ui._paintDirty = true
      return
    }
    if (inherited) for (const c of node.children) c.markDirty(STYLE_DIRTY)
    if (before) {
      const prevView = Object.create(vis) as ComputedStyle
      for (const k in before) (prevView as unknown as Record<string, unknown>)[k] = before[k]
      const layoutChanged = syncYoga(node._yoga, prevView, vis)
      node._afterAnimatedStyle(prevView, vis, layoutChanged)
    }
    this.ui._paintDirty = true
  }
}
