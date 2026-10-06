import { DataTexture, RGBAFormat, UnsignedByteType, Vector2, Vector4, type Camera, type Object3D, type Mesh, type RenderTarget } from 'three'
import { configureTexture, type BatchRenderer } from '../src'

export function makeTexture(width = 64, height = 64): DataTexture {
  const tex = new DataTexture(new Uint8Array(width * height * 4).fill(255), width, height, RGBAFormat, UnsignedByteType)
  return configureTexture(tex)
}

export interface RenderCall {
  scissor: [number, number, number, number] | null
  meshes: { start: number; count: number; renderOrder: number }[]
}

/** Records what the batch would draw; stands in for a caller-owned WebGPURenderer. */
export class MockRenderer implements BatchRenderer {
  autoClear = true
  calls: RenderCall[] = []
  viewport = new Vector4(0, 0, 800, 600)
  private scissor = new Vector4(0, 0, 800, 600)
  private scissorTest = false

  render(scene: Object3D, _camera: Camera): void {
    const meshes: RenderCall['meshes'] = []
    scene.traverse((o) => {
      const m = o as Mesh
      if (m.isMesh && m.visible) {
        meshes.push({ start: m.geometry.drawRange.start, count: m.geometry.drawRange.count, renderOrder: m.renderOrder })
      }
    })
    this.calls.push({ scissor: this.scissorTest ? [this.scissor.x, this.scissor.y, this.scissor.z, this.scissor.w] : null, meshes })
  }
  getViewport(target: Vector4): Vector4 {
    return target.copy(this.viewport)
  }
  getScissor(target: Vector4): Vector4 {
    return target.copy(this.scissor)
  }
  setScissor(x: number, y: number, w: number, h: number): void {
    this.scissor.set(x, y, w, h)
  }
  getScissorTest(): boolean {
    return this.scissorTest
  }
  setScissorTest(v: boolean): void {
    this.scissorTest = v
  }
}

/** MockRenderer + the extra surface backdrop blur needs; records the order of renders / copies / render-target switches. */
export class MockBackdropRenderer extends MockRenderer {
  events: string[] = []
  private target: RenderTarget | null = null
  drawingBuffer = new Vector2(800, 600)

  override render(scene: Object3D, camera: Camera): void {
    const before = this.calls.length
    super.render(scene, camera)
    this.events.push(this.target ? 'blur-pass' : `render:${this.calls[before]!.meshes.length}`)
  }
  getRenderTarget(): RenderTarget | null {
    return this.target
  }
  setRenderTarget(t: RenderTarget | null): void {
    this.target = t
  }
  getDrawingBufferSize(target: Vector2): Vector2 {
    return target.copy(this.drawingBuffer)
  }
  copyFramebufferToTexture(): void {
    this.events.push('copy')
  }
}
