import * as THREE from 'three/webgpu'

/** A deliberately busy 3D "game world" behind the UI so backdrop blur has something to blur: orbiting, spinning cubes. */
export function createWorld(): { scene: THREE.Scene; camera: THREE.PerspectiveCamera; update(dt: number): void; resize(w: number, h: number): void } {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 100)
  camera.position.set(0, 7, 13)
  camera.lookAt(0, 0, 0)

  const count = 360
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), count)
  scene.add(mesh)
  // flat per-instance colours: colour-managed identically by WebGPURenderer and a classic WebGLRenderer (parity-testable)
  const tint = new THREE.Color()
  for (let i = 0; i < count; i++) mesh.setColorAt(i, tint.setHSL((i * 0.618) % 1, 0.75, 0.3 + ((i * 37) % 10) * 0.045))
  const dummy = new THREE.Object3D()
  const seeds = Array.from({ length: count }, (_, i) => ({ r: 2 + (i % 24) * 0.42, a: i * 2.399, y: Math.sin(i * 1.7) * 2.4, s: 0.25 + ((i * 37) % 10) / 14, w: 0.15 + (i % 7) * 0.05 }))
  let t = 0

  const update = (dt: number) => {
    t += dt
    for (let i = 0; i < count; i++) {
      const s = seeds[i]!
      const a = s.a + t * s.w
      dummy.position.set(Math.cos(a) * s.r, s.y + Math.sin(t + i) * 0.4, Math.sin(a) * s.r)
      dummy.rotation.set(t * s.w * 2, a, t * 0.6)
      dummy.scale.setScalar(s.s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    camera.position.x = Math.sin(t * 0.12) * 3
    camera.lookAt(0, 0, 0)
  }
  const resize = (w: number, h: number) => {
    camera.aspect = w / Math.max(1, h)
    camera.updateProjectionMatrix()
  }
  update(0)
  return { scene, camera, update, resize }
}
