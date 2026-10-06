import type { UINode } from '../core/UINode'
import type { AnimationDirection, AnimationFill } from '../style/types'
import { parseEasingFn, type EasingFn } from './easing'
import type { CompiledKeyframes } from './keyframes'

export type AnimationPlayState = 'running' | 'paused' | 'finished' | 'idle'

/** What `UIAnimation.advance` reports so the engine can fire DOM-like events after the tick. */
export interface AnimationNotice {
  type: 'start' | 'iteration' | 'end' | 'cancel'
  elapsed: number
}

export interface TimingSpec {
  duration: number
  delay: number
  iterations: number
  direction: AnimationDirection
  fill: AnimationFill
  /** Easing over a whole iteration (Web Animations `easing`); CSS animations ease per keyframe interval instead. */
  iterationEasing: string | undefined
}

/** Where an animation is at a point in time. */
export interface Sampled {
  phase: 'before' | 'active' | 'after'
  /** Directed progress 0..1 to sample the keyframes at (after the iteration easing). */
  progress: number
  iteration: number
}

/**
 * A running keyframe animation. `node.animate()` hands one out as a Web-Animations-like handle; style `animation`
 * entries create them internally. Time only advances through `ui.update(dt)`, so a paused / slowed / frozen game
 * (`dt = 0`) freezes every animation with no hidden clock.
 */
export class UIAnimation {
  /** Name of the `@keyframes` it came from (empty for `node.animate()`). */
  readonly name: string
  /** Resolves with the animation when it finishes; rejects with an `AbortError` when cancelled. */
  readonly finished: Promise<UIAnimation>
  /** Called once when the animation finishes (convenience over the `animationend` event). */
  onfinish: ((animation: UIAnimation) => void) | null = null

  /** @internal */ readonly compiled: CompiledKeyframes
  /** @internal */ readonly timing: TimingSpec
  /** @internal */ readonly source: 'style' | 'api'
  /** @internal */ _node: UINode
  /** @internal */ _signature = ''
  /** @internal */ _lastIteration = -1
  /** @internal */ _started = false
  /** @internal */ _cancelledByEngine = false

  private readonly iterationEasing: EasingFn | null
  private _time = 0
  private _rate = 1
  private _state: AnimationPlayState
  private resolveFinished!: (a: UIAnimation) => void
  private rejectFinished!: (e: Error) => void
  private readonly engineWake: (() => void) | null

  constructor(node: UINode, name: string, compiled: CompiledKeyframes, timing: TimingSpec, source: 'style' | 'api', paused: boolean, wake: (() => void) | null) {
    this._node = node
    this.name = name
    this.compiled = compiled
    this.timing = timing
    this.source = source
    this.engineWake = wake
    this._state = paused ? 'paused' : 'running'
    this.iterationEasing = timing.iterationEasing ? parseEasingFn(timing.iterationEasing) : null
    this.finished = new Promise<UIAnimation>((resolve, reject) => {
      this.resolveFinished = resolve
      this.rejectFinished = reject
    })
    // cancelling an animation nobody awaits must not surface as an unhandled rejection
    this.finished.catch(() => {})
  }

  get node(): UINode {
    return this._node
  }

  get playState(): AnimationPlayState {
    return this._state
  }

  /** Milliseconds since the animation started, including the delay. */
  get currentTime(): number {
    return this._time
  }

  set currentTime(ms: number) {
    this._time = Math.max(0, ms)
    this.engineWake?.()
  }

  get playbackRate(): number {
    return this._rate
  }

  set playbackRate(rate: number) {
    this._rate = rate
  }

  /** Total active time in ms (`duration × iterations`). */
  get activeDuration(): number {
    return this.timing.duration * this.timing.iterations
  }

  /** End of the animation in ms (delay + active time). */
  get endTime(): number {
    return this.timing.delay + this.activeDuration
  }

  play(): void {
    if (this._state === 'finished' || this._state === 'idle') {
      this._time = this._rate < 0 ? this.endTime : 0
      this._lastIteration = -1
      this._started = false
    }
    this._state = 'running'
    this.engineWake?.()
  }

  pause(): void {
    if (this._state === 'running') this._state = 'paused'
  }

  /** Jump to the end and fire `animationend`. */
  finish(): void {
    if (this._state === 'finished') return
    this._time = this.endTime
    this.engineWake?.()
  }

  /** Stop and remove the animation's effect (fires `animationcancel`); `finished` rejects. */
  cancel(): void {
    if (this._state === 'idle') return
    this._state = 'idle'
    this.rejectFinished(Object.assign(new Error('The animation was cancelled'), { name: 'AbortError' }))
    this.engineWake?.()
  }

  reverse(): void {
    this._rate = -this._rate
    if (this._state === 'finished') this.play()
  }

  /** @internal Mark finished (called by the engine once `animationend` fired). */
  _complete(): void {
    if (this._state === 'finished') return
    this._state = 'finished'
    this.resolveFinished(this)
    this.onfinish?.(this)
  }

  /** @internal Advance by `dtMs`; returns lifecycle notices in order. */
  _advance(dtMs: number, out: AnimationNotice[]): void {
    if (this._state === 'finished' || this._state === 'idle') return
    const before = this._time
    if (this._state === 'running') this._time = Math.max(0, Math.min(this.endTime, this._time + dtMs * this._rate))
    this._notices(before, out)
  }

  /** @internal Lifecycle notices for the time step `before → this._time`. */
  _notices(_before: number, out: AnimationNotice[]): void {
    const { delay } = this.timing
    const time = this._time
    const elapsedActive = Math.max(0, Math.min(time - delay, this.activeDuration)) / 1000
    if (!this._started && time >= delay) {
      this._started = true
      out.push({ type: 'start', elapsed: 0 })
    }
    const s = this.sample()
    if (s.phase !== 'before' && this.timing.duration > 0) {
      if (this._lastIteration >= 0 && s.iteration > this._lastIteration && s.phase === 'active') out.push({ type: 'iteration', elapsed: elapsedActive })
      this._lastIteration = s.iteration
    }
    if ((this._rate >= 0 && time >= this.endTime) || (this._rate < 0 && time <= 0)) out.push({ type: 'end', elapsed: elapsedActive })
  }

  /** @internal */
  sample(): Sampled {
    const { duration, delay, iterations, direction } = this.timing
    const active = this._time - delay
    if (active < 0) return { phase: 'before', progress: directed(0, 0, direction), iteration: 0 }
    const total = duration * iterations
    let phase: Sampled['phase'] = 'active'
    let iteration: number
    let p: number
    if (duration <= 0 || active >= total) {
      phase = 'after'
      const whole = Math.ceil(iterations) - 1
      const frac = iterations - Math.floor(iterations)
      iteration = Math.max(0, whole)
      p = iterations !== Math.floor(iterations) ? frac : 1
    } else {
      const f = active / duration
      iteration = Math.floor(f)
      p = f - iteration
    }
    p = directed(p, iteration, direction)
    if (this.iterationEasing) p = this.iterationEasing(p)
    return { phase, progress: p, iteration }
  }

  /** @internal Does the animation currently contribute values (honoring fill modes)? */
  contributes(phase: Sampled['phase']): boolean {
    if (this._state === 'idle') return false
    const fill = this.timing.fill
    if (phase === 'before') return fill === 'backwards' || fill === 'both'
    if (phase === 'after') return fill === 'forwards' || fill === 'both'
    return true
  }
}

function directed(p: number, iteration: number, direction: AnimationDirection): number {
  switch (direction) {
    case 'reverse':
      return 1 - p
    case 'alternate':
      return iteration % 2 === 1 ? 1 - p : p
    case 'alternate-reverse':
      return iteration % 2 === 0 ? 1 - p : p
    default:
      return p
  }
}
