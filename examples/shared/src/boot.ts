import * as THREE from 'three/webgpu'

export interface Boot {
  renderer: THREE.WebGPURenderer
  canvas: HTMLCanvasElement
  /** 'WebGPU' or 'WebGL2' — whichever backend Three picked. */
  backend: 'WebGPU' | 'WebGL2'
  /** Logical (CSS px) size and pixel ratio, kept up to date. */
  size: { width: number; height: number; pixelRatio: number }
}

/**
 * Create the Three renderer for an example. `?webgl` in the URL forces the WebGL2 backend; otherwise Three
 * uses WebGPU when available and falls back to WebGL2 on its own.
 * `onResize` runs once immediately and whenever the canvas box changes.
 */
export async function bootRenderer(canvas: HTMLCanvasElement, onResize: (size: Boot['size']) => void): Promise<Boot> {
  const forceWebGL = new URLSearchParams(location.search).has('webgl')
  const renderer = new THREE.WebGPURenderer({ canvas, antialias: false, alpha: false, forceWebGL })
  await renderer.init()
  const backend = (renderer as unknown as { backend: { isWebGPUBackend?: boolean } }).backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2'
  const size = { width: 1, height: 1, pixelRatio: 1 }
  const apply = () => {
    size.width = Math.max(1, canvas.clientWidth)
    size.height = Math.max(1, canvas.clientHeight)
    size.pixelRatio = Math.min(window.devicePixelRatio || 1, 3)
    renderer.setPixelRatio(size.pixelRatio)
    renderer.setSize(size.width, size.height, false)
    onResize(size)
  }
  apply()
  new ResizeObserver(apply).observe(canvas)
  window.addEventListener('beforeunload', () => renderer.dispose())
  return { renderer, canvas, backend, size }
}

/** Fixed-timestep-free frame loop helper: calls `frame(dtSeconds)` every animation frame. */
export function loop(frame: (dt: number, now: number) => void): () => void {
  let last = performance.now()
  let id = 0
  const tick = (now: number) => {
    // rAF timestamps can precede `performance.now()` taken at registration: clamp to ≥ 0
    const dt = Math.max(0, Math.min(0.1, (now - last) / 1000))
    last = now
    frame(dt, now)
    id = requestAnimationFrame(tick)
  }
  id = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(id)
}

/** Smoothed FPS counter. */
export class FpsMeter {
  fps = 0
  private acc = 0
  private frames = 0
  tick(dt: number): number {
    this.acc += dt
    this.frames++
    if (this.acc >= 0.5) {
      this.fps = Math.round(this.frames / this.acc)
      this.acc = 0
      this.frames = 0
    }
    return this.fps
  }
}
