import type { Animation, TextureRegion } from 'three-2d'
import { Image, type ImageOptions } from './Image'
import type { NodeKind } from './UINode'
import type { ThreeUI } from './ThreeUI'

export interface AnimatedImageOptions extends Omit<ImageOptions, 'source'> {
  animation?: Animation<TextureRegion> | null | undefined
  playing?: boolean | undefined
}

/** Image that plays a frame `Animation`. Time advances through `ui.update(dt)` (no hidden clock). */
export class AnimatedImage extends Image {
  override readonly kind: NodeKind = 'AnimatedImage'
  private _animation: Animation<TextureRegion> | null = null
  private _time = 0
  private _playing: boolean

  constructor(options: AnimatedImageOptions = {}) {
    super(options)
    this._playing = options.playing ?? true
    this.setAnimation(options.animation ?? null)
  }

  get animation(): Animation<TextureRegion> | null {
    return this._animation
  }

  setAnimation(animation: Animation<TextureRegion> | null): void {
    this._animation = animation
    this._time = 0
    this.setSource(animation ? animation.getKeyFrame(0) : null)
    this.updateTicking()
  }

  get playing(): boolean {
    return this._playing
  }

  setPlaying(playing: boolean): void {
    this._playing = playing
    this.updateTicking()
  }

  /** Seconds into the animation. */
  get time(): number {
    return this._time
  }

  protected override onAttach(old: ThreeUI | null, next: ThreeUI | null): void {
    old?._unregisterTickable(this)
    if (next) this.updateTicking()
  }

  private updateTicking(): void {
    const ui = this._ui
    if (!ui) return
    if (this._playing && this._animation) ui._registerTickable(this)
    else ui._unregisterTickable(this)
  }

  /** @internal */
  _tick(dt: number): void {
    const anim = this._animation
    if (!anim || !this._playing) return
    this._time += dt
    const frame = anim.getKeyFrame(this._time)
    if (frame !== this._source) {
      this._source = frame
      this.invalidatePaint()
    }
    if (anim.isAnimationFinished(this._time)) this.setPlaying(false)
  }
}
