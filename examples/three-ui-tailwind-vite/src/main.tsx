// Side effect: installs the Tailwind registry (built by the Vite plugin) as the className resolver.
import 'virtual:three-ui-tailwind/register'
import { createThreeUI } from 'three-ui'
import { attachDOMInput, bindPrefersColorScheme } from 'three-ui/web'
import { createThreeUIRoot } from 'three-ui-react'
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
attachDOMInput(ui, canvas)
// follow the OS color scheme at startup; the app's toggle then drives `ui.setColorScheme` explicitly
bindPrefersColorScheme(ui, window.matchMedia('(prefers-color-scheme: dark)'))

const root = createThreeUIRoot(ui)
root.render(<App backend={boot.backend} />)

const fpsEl = { fps: 0, acc: 0, n: 0 }
loop((dt) => {
  fpsEl.acc += dt
  fpsEl.n++
  if (fpsEl.acc > 0.5) {
    fpsEl.fps = Math.round(fpsEl.n / fpsEl.acc)
    fpsEl.acc = 0
    fpsEl.n = 0
    ;(window as unknown as { __fps: number }).__fps = fpsEl.fps
  }
  ui.update(dt)
  // clear color follows the scheme so overscroll/edges never flash
  ui.clearColor!.setFrom(ui.environment.colorScheme === 'dark' ? '#09090b' : '#f4f4f5')
  ui.render()
  ;(window as unknown as { __frames: number }).__frames = ((window as unknown as { __frames?: number }).__frames ?? 0) + 1
})
;(window as unknown as { __backend: string }).__backend = boot.backend
;(window as unknown as { __ui: unknown }).__ui = ui
