// Pixel parity between the three renderer paths: WebGPURenderer (WebGPU), WebGPURenderer (forced WebGL2 backend) and a
// classic WebGLRenderer + WebGLNodesHandler (`?renderer=webgl`).
//
//   bun add -d playwright-core && bun run dev   (port 5175)  →  node parity.mjs [chrome-path]
//
// Screenshots the same frozen scenes (`?still`, no HUD animation) on each path and diffs them in the browser. The stats
// box (bottom-left) is masked because it prints the backend name.
//
// Expected: WebGPU ≡ WebGL2 backend for opaque and translucent content. The classic WebGLRenderer matches for opaque content;
// translucent layers (rings, shadows, blur) differ slightly because WebGPURenderer blends in a linear half-float frame buffer
// while WebGLRenderer blends in the sRGB-encoded default framebuffer (what CSS does).
import { chromium } from 'playwright-core'

const chrome = process.argv[2] ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const base = process.env.BASE ?? 'http://localhost:5175/'
const args = ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-features=Vulkan', '--use-angle=metal']
const paths = [
  { name: 'WebGPURenderer / WebGPU', query: '' },
  { name: 'WebGPURenderer / WebGL2', query: 'webgl' },
  { name: 'WebGLRenderer + WebGLNodesHandler', query: 'renderer=webgl' },
]
const scenes = [
  { name: 'stress 300, opaque gradients only', query: 'stress=300&still&blur=off&flat' },
  { name: 'stress 300 panels', query: 'stress=300&still&blur=off' },
  { name: 'stress 300 + backdrop blur', query: 'stress=300&still&blur=full&modal' },
  { name: 'HUD + modal (backdrop blur)', query: 'modal&still&blur=full' },
]

const browser = await chromium.launch({ executablePath: chrome, headless: true, args })
const shots = {}
for (const sc of scenes) {
  for (const p of paths) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })
    await page.goto(`${base}?${sc.query}${p.query ? `&${p.query}` : ''}`)
    await page.waitForFunction(() => (window.__frames ?? 0) > 5, null, { timeout: 20000 })
    await page.waitForTimeout(1500) // let the modal's pop animation finish
    shots[`${sc.name}|${p.name}`] = (await page.screenshot()).toString('base64')
    await page.close()
  }
}
const cmp = await browser.newPage()
const diff = (a, b) =>
  cmp.evaluate(async ([a, b]) => {
    const load = (b64) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${b64}` })
    const px = async (b64) => {
      const i = await load(b64)
      const c = document.createElement('canvas')
      c.width = i.width
      c.height = i.height
      const g = c.getContext('2d')
      g.drawImage(i, 0, 0)
      return g.getImageData(0, 0, c.width, c.height)
    }
    const [A, B] = await Promise.all([px(a), px(b)])
    let sum = 0, over = 0, max = 0, n = 0
    for (let y = 0; y < A.height; y++) {
      for (let x = 0; x < A.width; x++) {
        if (x < 380 && y > 570 && y < 650) continue // stats box
        const i = (y * A.width + x) * 4
        const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]))
        sum += d
        if (d > 8) over++
        if (d > max) max = d
        n++
      }
    }
    return { mean: sum / n, over: (100 * over) / n, max }
  }, [a, b])
console.log('| scene | compared paths | mean abs diff (0–255) | pixels off by > 8 | max |')
console.log('| --- | --- | ---: | ---: | ---: |')
for (const sc of scenes) {
  const ref = shots[`${sc.name}|${paths[0].name}`]
  for (const p of paths.slice(1)) {
    const r = await diff(ref, shots[`${sc.name}|${p.name}`])
    console.log(`| ${sc.name} | ${paths[0].name} vs ${p.name} | ${r.mean.toFixed(3)} | ${r.over.toFixed(3)}% | ${r.max} |`)
  }
}
await browser.close()
