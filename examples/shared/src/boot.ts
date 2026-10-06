import * as THREE from 'three/webgpu'
import { WebGLRenderer } from 'three'
import { WebGLNodesHandler } from 'three/addons/tsl/WebGLNodesHandler.js'

export interface Boot {
  /** A `WebGPURenderer`, or — with `?renderer=webgl` — a classic `WebGLRenderer` + `WebGLNodesHandler` (same surface for the UI). */
  renderer: THREE.WebGPURenderer
  canvas: HTMLCanvasElement
  /** 'WebGPU' or 'WebGL2' (WebGPURenderer's backends), or 'WebGLRenderer' (classic renderer + WebGLNodesHandler). */
  backend: 'WebGPU' | 'WebGL2' | 'WebGLRenderer'
  /** Logical (CSS px) size and pixel ratio, kept up to date. */
  size: { width: number; height: number; pixelRatio: number }
}

/**
 * Create the Three renderer for an example. `?webgl` in the URL forces the WebGL2 backend; otherwise Three
 * uses WebGPU when available and falls back to WebGL2 on its own.
 * `onResize` runs once immediately and whenever the canvas box changes.
 */
export async function bootRenderer(canvas: HTMLCanvasElement, onResize: (size: Boot['size']) => void): Promise<Boot> {
  const params = new URLSearchParams(location.search)
  const forceWebGL = params.has('webgl')
  // `?renderer=webgl`: the classic WebGLRenderer driving TSL node materials through WebGLNodesHandler (three/addons)
  const classic = params.get('renderer') === 'webgl'
  let renderer: THREE.WebGPURenderer
  let backend: Boot['backend']
  if (classic) {
    const gl = new WebGLRenderer({ canvas, antialias: false, alpha: false })
    gl.setNodesHandler(new WebGLNodesHandler())
    renderer = gl as unknown as THREE.WebGPURenderer
    backend = 'WebGLRenderer'
  } else {
    renderer = new THREE.WebGPURenderer({ canvas, antialias: false, alpha: false, forceWebGL })
    await renderer.init()
    backend = (renderer as unknown as { backend: { isWebGPUBackend?: boolean } }).backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2'
  }
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
