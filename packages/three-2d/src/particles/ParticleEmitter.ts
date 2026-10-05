import type { Texture } from 'three'
import type { BatchDrawOptions, SpriteBatch } from '../batch/SpriteBatch'
import { Color4, parseColor } from '../color'
import { TextureRegion, fullRegion } from '../texture/TextureRegion'
import type { BlendMode, ColorLike, Disposable } from '../types'

export type Range = number | readonly [number, number]

export interface ParticleEmitterConfig {
  region: TextureRegion | Texture
  /** Hard cap on live particles. Default 256. */
  maxParticles?: number
  /** Particles per second while active. Default 50. */
  emissionRate?: number
  /** Seconds the emitter keeps emitting (Infinity = continuous). Default Infinity. */
  duration?: number
  /** Restart after `duration` elapses. */
  loop?: boolean
  /** Particle lifetime in seconds. Default [0.6, 1.2]. */
  lifetime?: Range
  /** Initial speed in units/sec. Default [40, 120]. */
  speed?: Range
  /** Emission direction in degrees; 0 = +x, 90 = +y (down). Default [0, 360]. */
  angle?: Range
  gravityX?: number
  gravityY?: number
  /** Per-axis velocity damping per second (0 = none). */
  drag?: number
  /** Particle size multiplier over life. */
  startScale?: Range
  endScale?: Range
  /** Initial rotation in degrees and angular velocity in degrees/sec. */
  rotation?: Range
  angularVelocity?: Range
  startColor?: ColorLike
  endColor?: ColorLike
  /** Base particle size in world units (region size by default). */
  size?: number
  blend?: BlendMode
  /** Spawn rectangle relative to the emitter position. Default a point. */
  spawnWidth?: number
  spawnHeight?: number
  /** Deterministic randomness for tests and replays. */
  seed?: number
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DEG = Math.PI / 180

/** Pooled, allocation-free particle emitter. Time is passed explicitly via `update(dt)`. */
export class ParticleEmitter implements Disposable {
  x = 0
  y = 0
  region: TextureRegion
  blend: BlendMode
  readonly maxParticles: number

  private readonly cfg: Required<Omit<ParticleEmitterConfig, 'region' | 'seed'>>
  private rand: () => number
  private readonly seed: number | undefined

  // SoA particle storage
  private readonly px: Float32Array
  private readonly py: Float32Array
  private readonly vx: Float32Array
  private readonly vy: Float32Array
  private readonly life: Float32Array
  private readonly maxLife: Float32Array
  private readonly rot: Float32Array
  private readonly angVel: Float32Array
  private readonly s0: Float32Array
  private readonly s1: Float32Array
  private count = 0

  private readonly c0 = new Color4()
  private readonly c1 = new Color4()
  private readonly opts: BatchDrawOptions = { x: 0, y: 0, width: 0, height: 0 }

  private emitting = true
  private elapsed = 0
  private carry = 0

  constructor(config: ParticleEmitterConfig) {
    this.region = config.region instanceof TextureRegion ? config.region : fullRegion(config.region)
    this.maxParticles = config.maxParticles ?? 256
    this.blend = config.blend ?? 'additive'
    this.seed = config.seed
    this.rand = mulberry32(config.seed ?? 0x1234abcd)
    this.cfg = {
      maxParticles: this.maxParticles,
      emissionRate: config.emissionRate ?? 50,
      duration: config.duration ?? Infinity,
      loop: config.loop ?? false,
      lifetime: config.lifetime ?? [0.6, 1.2],
      speed: config.speed ?? [40, 120],
      angle: config.angle ?? [0, 360],
      gravityX: config.gravityX ?? 0,
      gravityY: config.gravityY ?? 0,
      drag: config.drag ?? 0,
      startScale: config.startScale ?? 1,
      endScale: config.endScale ?? 0,
      rotation: config.rotation ?? 0,
      angularVelocity: config.angularVelocity ?? 0,
      startColor: config.startColor ?? '#ffffff',
      endColor: config.endColor ?? '#ffffff00',
      size: config.size ?? Math.max(1, this.region.regionWidth),
      blend: this.blend,
      spawnWidth: config.spawnWidth ?? 0,
      spawnHeight: config.spawnHeight ?? 0,
    }
    parseColor(this.cfg.startColor, this.c0)
    parseColor(this.cfg.endColor, this.c1)
    const n = this.maxParticles
    this.px = new Float32Array(n)
    this.py = new Float32Array(n)
    this.vx = new Float32Array(n)
    this.vy = new Float32Array(n)
    this.life = new Float32Array(n)
    this.maxLife = new Float32Array(n)
    this.rot = new Float32Array(n)
    this.angVel = new Float32Array(n)
    this.s0 = new Float32Array(n)
    this.s1 = new Float32Array(n)
  }

  get activeCount(): number {
    return this.count
  }

  setPosition(x: number, y: number): this {
    this.x = x
    this.y = y
    return this
  }

  start(): void {
    this.emitting = true
    this.elapsed = 0
  }

  /** Stop emitting new particles; existing ones live out their lifetime. */
  allowCompletion(): void {
    this.emitting = false
  }

  /** Remove all particles and restart emission. */
  reset(): void {
    this.count = 0
    this.elapsed = 0
    this.carry = 0
    this.emitting = true
    this.rand = mulberry32(this.seed ?? 0x1234abcd)
  }

  isComplete(): boolean {
    return !this.emitting && this.count === 0
  }

  /** Emit `n` particles immediately (burst). */
  burst(n: number): void {
    for (let i = 0; i < n; i++) this.spawn()
  }

  update(dt: number): void {
    const cfg = this.cfg
    if (this.emitting) {
      this.elapsed += dt
      if (this.elapsed >= cfg.duration) {
        if (cfg.loop) this.elapsed -= cfg.duration
        else this.emitting = false
      }
      if (this.emitting) {
        this.carry += cfg.emissionRate * dt
        const n = Math.floor(this.carry)
        this.carry -= n
        for (let i = 0; i < n; i++) this.spawn()
      }
    }
    const damp = cfg.drag > 0 ? Math.max(0, 1 - cfg.drag * dt) : 1
    let i = 0
    while (i < this.count) {
      this.life[i]! += dt
      if (this.life[i]! >= this.maxLife[i]!) {
        // swap-remove
        const last = --this.count
        if (i !== last) this.copyParticle(last, i)
        continue
      }
      this.vx[i]! = (this.vx[i]! + cfg.gravityX * dt) * damp
      this.vy[i]! = (this.vy[i]! + cfg.gravityY * dt) * damp
      this.px[i]! += this.vx[i]! * dt
      this.py[i]! += this.vy[i]! * dt
      this.rot[i]! += this.angVel[i]! * dt
      i++
    }
  }

  draw(batch: SpriteBatch): void {
    const prevBlend = batch.blendMode
    const pr = batch.color.r
    const pg = batch.color.g
    const pb = batch.color.b
    const pa = batch.color.a
    batch.setBlendMode(this.blend)
    const o = this.opts
    const base = this.cfg.size
    const aspect = this.region.regionHeight / Math.max(1, this.region.regionWidth)
    for (let i = 0; i < this.count; i++) {
      const t = this.life[i]! / this.maxLife[i]!
      const s = (this.s0[i]! + (this.s1[i]! - this.s0[i]!) * t) * base
      if (s <= 0) continue
      const w = s
      const h = s * aspect
      batch.setColorRGBA(
        this.c0.r + (this.c1.r - this.c0.r) * t,
        this.c0.g + (this.c1.g - this.c0.g) * t,
        this.c0.b + (this.c1.b - this.c0.b) * t,
        this.c0.a + (this.c1.a - this.c0.a) * t,
      )
      o.x = this.px[i]! - w / 2
      o.y = this.py[i]! - h / 2
      o.width = w
      o.height = h
      o.originX = w / 2
      o.originY = h / 2
      o.rotation = this.rot[i]! * DEG
      batch.drawEx(this.region, o)
    }
    batch.setBlendMode(prevBlend)
    batch.setColorRGBA(pr, pg, pb, pa)
  }

  dispose(): void {
    this.count = 0
    this.emitting = false
  }

  private sample(r: Range): number {
    if (typeof r === 'number') return r
    return r[0] + (r[1] - r[0]) * this.rand()
  }

  private spawn(): void {
    if (this.count >= this.maxParticles) return
    const cfg = this.cfg
    const i = this.count++
    const angle = this.sample(cfg.angle) * DEG
    const speed = this.sample(cfg.speed)
    this.px[i] = this.x + (cfg.spawnWidth ? (this.rand() - 0.5) * cfg.spawnWidth : 0)
    this.py[i] = this.y + (cfg.spawnHeight ? (this.rand() - 0.5) * cfg.spawnHeight : 0)
    this.vx[i] = Math.cos(angle) * speed
    this.vy[i] = Math.sin(angle) * speed
    this.life[i] = 0
    this.maxLife[i] = Math.max(0.0001, this.sample(cfg.lifetime))
    this.rot[i] = this.sample(cfg.rotation)
    this.angVel[i] = this.sample(cfg.angularVelocity)
    this.s0[i] = this.sample(cfg.startScale)
    this.s1[i] = this.sample(cfg.endScale)
  }

  private copyParticle(from: number, to: number): void {
    this.px[to] = this.px[from]!
    this.py[to] = this.py[from]!
    this.vx[to] = this.vx[from]!
    this.vy[to] = this.vy[from]!
    this.life[to] = this.life[from]!
    this.maxLife[to] = this.maxLife[from]!
    this.rot[to] = this.rot[from]!
    this.angVel[to] = this.angVel[from]!
    this.s0[to] = this.s0[from]!
    this.s1[to] = this.s1[from]!
  }
}
