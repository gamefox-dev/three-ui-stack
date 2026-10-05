import { DataTexture, RGBAFormat, UnsignedByteType, Vector4, type Camera, type Object3D, type Mesh } from 'three'
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
