export type PlayMode = 'normal' | 'reversed' | 'loop' | 'loopReversed' | 'loopPingPong' | 'loopRandom'

/**
 * Frame animation (libGDX `Animation<T>`). Time is always passed explicitly — there is no
 * hidden clock, so the app owns the frame loop.
 */
export class Animation<T> {
  readonly frames: readonly T[]
  frameDuration: number
  playMode: PlayMode

  constructor(frameDuration: number, frames: readonly T[], playMode: PlayMode = 'normal') {
    if (frames.length === 0) throw new Error('[three-2d] Animation needs at least one frame')
    this.frameDuration = frameDuration
    this.frames = frames
    this.playMode = playMode
  }

  get animationDuration(): number {
    return this.frames.length * this.frameDuration
  }

  getKeyFrameIndex(stateTime: number): number {
    const n = this.frames.length
    if (n === 1) return 0
    let i = Math.floor(stateTime / this.frameDuration)
    switch (this.playMode) {
      case 'normal':
        i = Math.min(n - 1, i)
        break
      case 'loop':
        i = i % n
        break
      case 'loopPingPong': {
        const period = n * 2 - 2
        i = i % period
        if (i >= n) i = period - i
        break
      }
      case 'loopRandom':
        i = hash01(i) * n | 0
        break
      case 'reversed':
        i = Math.max(n - i - 1, 0)
        break
      case 'loopReversed':
        i = n - 1 - (i % n)
        break
    }
    return i < 0 ? 0 : i
  }

  getKeyFrame(stateTime: number): T {
    return this.frames[this.getKeyFrameIndex(stateTime)]!
  }

  isAnimationFinished(stateTime: number): boolean {
    if (this.playMode !== 'normal' && this.playMode !== 'reversed') return false
    return stateTime >= this.animationDuration
  }
}

/** Deterministic pseudo-random in [0,1) so `loopRandom` is reproducible and testable. */
function hash01(n: number): number {
  let x = (n + 0x9e3779b9) | 0
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  x ^= x >>> 16
  return (x >>> 0) / 4294967296
}
