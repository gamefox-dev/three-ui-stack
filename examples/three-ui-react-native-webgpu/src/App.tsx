import { useEffect, useRef, useState } from 'react'
import { PixelRatio, View as RNView, type LayoutChangeEvent } from 'react-native'
import { Canvas, type CanvasRef } from 'react-native-webgpu'
import { Asset } from 'expo-asset'
import * as THREE from 'three/webgpu'
import { Three2D, TextureRegion, configureTexture } from 'three-2d'
import { packBitmapFont } from 'three-2d-font'
import { createThreeUI, FontRegistry, type ThreeUI } from 'three-ui'
import { createThreeUIRoot, type ThreeUIRoot } from 'three-ui-react'
import { Demo } from './Demo'

/**
 * Portability gate (spec §13.5 / milestone 7): Three's WebGPU renderer on `react-native-webgpu`, a batched sprite
 * (three-2d), the Yoga UI tree (asm.js — Hermes has no WebAssembly), the React renderer, Text + Image and touch input.
 * No DOM, no Canvas2D, no `window` is used by any library code.
 */
export default function App() {
  const canvas = useRef<CanvasRef>(null)
  const size = useRef({ width: 0, height: 0 })
  const [layoutKey, setLayoutKey] = useState(0)
  const ui = useRef<ThreeUI | null>(null)

  useEffect(() => {
    if (layoutKey === 0) return
    let disposed = false
    let cleanup: (() => void) | undefined
    ;(async () => {
      const context = canvas.current!.getContext('webgpu')!
      const { width, height } = size.current
      const pixelRatio = PixelRatio.get()

      // the native canvas carries the DOM-compatibility stubs Three expects (addEventListener, clientWidth, …)
      const renderer = new THREE.WebGPURenderer({ canvas: context.canvas as never, context: context as never, antialias: false })
      await renderer.init()
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(width, height, false)
      if (disposed) return renderer.dispose()

      // bake a bitmap font on the device with the pure-JS rasterizer (no image decoding needed on Hermes)
      const asset = Asset.fromModule(require('../../../test/fixtures/fonts/Inter_400Regular.ttf'))
      await asset.downloadAsync()
      const fontBytes = await (await fetch(asset.localUri ?? asset.uri)).arrayBuffer()
      const font = await packBitmapFont(fontBytes, { size: 48, characters: 'ascii', supersample: 3, padding: 2 })
      const fonts = new FontRegistry().register(font, { family: 'Inter', weight: 400 })

      const graphics = new Three2D({ renderer: renderer as never, clearColor: '#0b0b12' })
      graphics.resize(width, height)
      const spriteTexture = configureTexture(new THREE.DataTexture(new Uint8Array(16 * 16 * 4).map((_, i) => ((i >> 2) % 2 ^ (i >> 6) % 2 ? 255 : 90)), 16, 16))
      const sprite = new TextureRegion(spriteTexture)

      const instance = createThreeUI({ renderer: renderer as never, width, height, pixelRatio, fonts })
      instance.setTheme({ root: { color: '#fafafa', fontFamily: 'Inter', fontSize: 16 } })
      ui.current = instance
      const root: ThreeUIRoot = createThreeUIRoot(instance)
      root.render(<Demo />)

      let last = Date.now()
      let t = 0
      renderer.setAnimationLoop(() => {
        const now = Date.now()
        const dt = Math.min(0.1, (now - last) / 1000)
        last = now
        t += dt
        graphics.render((batch) => {
          batch.drawEx(sprite, { x: width - 90, y: 40, width: 56, height: 56, originX: 28, originY: 28, rotation: t * 2 }) // one batched sprite
        })
        instance.update(dt)
        instance.render() // draws over the sprite (no clearColor)
        context.present() // react-native-webgpu: present after submit, every frame
      })

      cleanup = () => {
        renderer.setAnimationLoop(null)
        root.unmount()
        instance.dispose()
        graphics.dispose()
        fonts.all().forEach((f) => f.sizes.forEach((s) => s.dispose()))
        renderer.dispose()
      }
    })()
    return () => {
      disposed = true
      cleanup?.()
      ui.current = null
    }
  }, [layoutKey])

  const touch = (type: 'down' | 'move' | 'up', e: { nativeEvent: { locationX: number; locationY: number; identifier?: string | number } }) => {
    const u = ui.current
    if (!u) return
    const { locationX: x, locationY: y } = e.nativeEvent
    const init = { pointerType: 'touch' as const, pointerId: Number(e.nativeEvent.identifier ?? 1) }
    if (type === 'down') u.input.pointerDown(x, y, init)
    else if (type === 'move') u.input.pointerMove(x, y, init)
    else u.input.pointerUp(x, y, init)
  }

  return (
    <RNView
      style={{ flex: 1, backgroundColor: '#0b0b12' }}
      onLayout={(e: LayoutChangeEvent) => {
        size.current = e.nativeEvent.layout
        setLayoutKey((k) => k + 1)
      }}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => touch('down', e)}
      onResponderMove={(e) => touch('move', e)}
      onResponderRelease={(e) => touch('up', e)}
      onResponderTerminate={(e) => touch('up', e)}
    >
      <Canvas ref={canvas} style={{ flex: 1 }} />
    </RNView>
  )
}
