import type { SpriteBatch } from '../batch/SpriteBatch'
import type { Disposable } from '../types'
import type { ParticleEmitter } from './ParticleEmitter'

/** A group of emitters sharing a position and lifecycle. */
export class ParticleEffect implements Disposable {
  readonly emitters: ParticleEmitter[]

  constructor(emitters: readonly ParticleEmitter[] = []) {
    this.emitters = [...emitters]
  }

  add(emitter: ParticleEmitter): this {
    this.emitters.push(emitter)
    return this
  }

  setPosition(x: number, y: number): this {
    for (const e of this.emitters) e.setPosition(x, y)
    return this
  }

  start(): void {
    for (const e of this.emitters) e.start()
  }

  reset(): void {
    for (const e of this.emitters) e.reset()
  }

  allowCompletion(): void {
    for (const e of this.emitters) e.allowCompletion()
  }

  isComplete(): boolean {
    return this.emitters.every((e) => e.isComplete())
  }

  get activeCount(): number {
    let n = 0
    for (const e of this.emitters) n += e.activeCount
    return n
  }

  update(dt: number): void {
    for (const e of this.emitters) e.update(dt)
  }

  draw(batch: SpriteBatch): void {
    for (const e of this.emitters) e.draw(batch)
  }

  dispose(): void {
    for (const e of this.emitters) e.dispose()
    this.emitters.length = 0
  }
}
