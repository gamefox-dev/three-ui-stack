import { Color, SRGBColorSpace, Scene, Vector4, type Camera, type OrthographicCamera } from 'three'
import { Color4, parseColor } from './color'
import { PolygonSpriteBatch } from './batch/PolygonSpriteBatch'
import type { BatchRenderer } from './batch/SpriteBatch'
import { ScreenViewport, type Viewport, type ViewportRenderer } from './camera/Viewport'
import type { ColorLike, Disposable, RenderStats } from './types'

/** Renderer surface used by the facade (a Three `WebGPURenderer` satisfies it). Caller-owned. */
export interface Three2DRenderer extends BatchRenderer, ViewportRenderer {
  setClearColor(color: unknown, alpha?: number): void
  getClearColor?(target: unknown): unknown
  getClearAlpha?(): number
}

export interface Three2DOptions {
  renderer: Three2DRenderer
  /** Defaults to a `ScreenViewport` (world units = logical pixels, y-down). */
  viewport?: Viewport
  maxSprites?: number
  /** When set, every `render()` first clears the target to this color. */
  clearColor?: ColorLike
}

/**
 * Convenience facade: owns a batch, a viewport and an internal camera/scene — but **never** the renderer
 * or the frame loop.
 *
 * ```ts
 * const graphics = new Three2D({ renderer })
 * graphics.resize(innerWidth, innerHeight)
 * // inside your own loop:
 * graphics.render((batch) => { batch.draw(region, 10, 10, 64, 64) })
 * ```
 */
export class Three2D implements Disposable {
  readonly batch: PolygonSpriteBatch
  readonly renderer: Three2DRenderer
  viewport: Viewport
  clearColor: Color4 | null

  private readonly clearScene = new Scene()
  private readonly vp = new Vector4()
  private readonly clearThree = new Color()
  private disposed = false

  constructor(options: Three2DOptions) {
    this.renderer = options.renderer
    this.viewport = options.viewport ?? new ScreenViewport()
    this.batch = new PolygonSpriteBatch({
      renderer: options.renderer,
      ...(options.maxSprites !== undefined ? { maxSprites: options.maxSprites } : {}),
    })
    this.clearColor = options.clearColor !== undefined ? parseColor(options.clearColor, new Color4()) : null
  }

  get camera(): OrthographicCamera {
    return this.viewport.camera
  }

  get stats(): RenderStats {
    return this.batch.stats
  }

  /** Update the viewport for a new logical (CSS) size. */
  resize(width: number, height: number): void {
    this.viewport.update(width, height, true)
  }

  /**
   * Run `draw(batch)` between `begin()`/`end()` using the viewport camera. Resets per-frame stats first.
   * The renderer's viewport is restored afterwards.
   */
  render(draw: (batch: PolygonSpriteBatch) => void, camera: Camera = this.viewport.camera): void {
    if (this.disposed) throw new Error('[three-2d] Three2D.render() after dispose()')
    const renderer = this.renderer
    this.batch.stats.reset()
    const prev = renderer.getViewport(this.vp).clone()
    this.viewport.applyTo(renderer)
    if (this.clearColor) {
      const c = this.clearColor
      // authored colors are sRGB; Color.setRGB converts into the renderer's working space
      renderer.setClearColor(this.clearThree.setRGB(c.r, c.g, c.b, SRGBColorSpace), c.a)
      const auto = renderer.autoClear
      renderer.autoClear = true
      renderer.render(this.clearScene, camera)
      renderer.autoClear = auto
    }
    this.batch.begin(camera)
    try {
      draw(this.batch)
    } finally {
      this.batch.end()
      renderer.setViewport(prev.x, prev.y, prev.z, prev.w)
    }
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.batch.dispose()
  }
}
