import { createThreeUI } from '@implicit-invocation/three-ui'
import { attachDOMInput } from '@implicit-invocation/three-ui/web'
import { createThreeUIRoot } from '@implicit-invocation/three-ui-react'
import { bootRenderer, loop, registerInterFonts } from 'example-shared'
import { App } from './App'

const canvas = document.getElementById('c') as HTMLCanvasElement
let ui: ReturnType<typeof createThreeUI> | null = null
const boot = await bootRenderer(canvas, ({ width, height, pixelRatio }) => ui?.resize(width, height, pixelRatio))

ui = createThreeUI({
  renderer: boot.renderer as never,
  width: boot.size.width,
  height: boot.size.height,
  pixelRatio: boot.size.pixelRatio,
  clearColor: '#09090b',
})
await registerInterFonts(ui.fonts)
ui.setTheme({ root: { color: '#fafafa', fontFamily: 'Inter', fontSize: 14 } })
attachDOMInput(ui, canvas)

// React renders into a mutable three-ui tree through react-reconciler (mutation mode).
const root = createThreeUIRoot(ui)
root.render(<App backend={boot.backend} />)

loop((dt) => {
  ui.update(dt)
  ui.renderIfNeeded() // an idle UI costs nothing: the canvas keeps its last picture
  ;(window as unknown as { __frames: number }).__frames = ((window as unknown as { __frames?: number }).__frames ?? 0) + 1
})
;(window as unknown as { __backend: string }).__backend = boot.backend
;(window as unknown as { __ui: unknown }).__ui = ui
