// Headless measurement of the stress screen on all three renderer paths: WebGPURenderer (WebGPU), WebGPURenderer (WebGL2
// backend) and a classic WebGLRenderer + WebGLNodesHandler (`?renderer=webgl`).
//
//   bun add -d playwright-core        # not a repo dependency (browser binaries are yours)
//   bun run dev                        # in another terminal (port 5175)
//   node measure.mjs [chrome-path]     # prints a markdown table
//
// "CPU ms" = JS time of ui.update()+ui.render() (style → layout → paint → batch → renderer.render submission) averaged over
// 1.5 s windows. "frame ms" = 1000 / fps with vsync and the frame-rate limit disabled, i.e. what the whole pipeline
// including the GPU sustains. Draw calls come from ui.stats (renderer.render submissions that draw geometry).
import { chromium } from 'playwright-core'

const chrome = process.argv[2] ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const base = process.env.BASE ?? 'http://localhost:5175/'
const counts = [100, 500, 1000, 2000]
const paths = [
  { id: 'webgpu', query: {} },
  { id: 'webgl', query: { webgl: '' } },
  { id: 'classic', query: { renderer: 'webgl' } },
]
const args = ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-features=Vulkan', '--use-angle=metal', '--disable-frame-rate-limit', '--disable-gpu-vsync']

const rows = []
const scenarios = [
  { name: 'HUD', query: {} },
  { name: 'HUD + modal (backdrop blur)', query: { modal: '' } },
]
const browser = await chromium.launch({ executablePath: chrome, headless: true, args })
for (const path of paths) {
  for (const animate of [false, true]) {
    for (const n of counts) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })
      const q = new URLSearchParams({ stress: String(n) })
      if (animate) q.set('anim', '1')
      for (const [k, v] of Object.entries(path.query)) q.set(k, v)
      await page.goto(`${base}?${q}`)
      await page.waitForFunction(() => (window.__frames ?? 0) > 5, null, { timeout: 20000 })
      await page.waitForTimeout(1500) // settle (pipeline compile, first uploads)
      const samples = []
      for (let i = 0; i < 4; i++) {
        await page.waitForTimeout(1500)
        samples.push(await page.evaluate(() => window.__perf))
      }
      const avg = (k) => samples.reduce((a, s) => a + s[k], 0) / samples.length
      const last = samples.at(-1)
      rows.push({ backend: last.backend, animate, n, cpu: avg('cpuMs'), fps: avg('fps'), draw: last.drawCalls, passes: last.renderPasses, quads: last.sprites, boxes: last.boxes, shadows: last.shadows })
      await page.close()
    }
  }
}

for (const path of paths) {
  for (const sc of scenarios) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })
    const q = new URLSearchParams(sc.query)
    for (const [k, v] of Object.entries(path.query)) q.set(k, v)
    await page.goto(`${base}?${q}`)
    await page.waitForFunction(() => (window.__frames ?? 0) > 5, null, { timeout: 20000 })
    await page.waitForTimeout(3000)
    const samples = []
    for (let i = 0; i < 4; i++) {
      await page.waitForTimeout(1500)
      samples.push(await page.evaluate(() => window.__perf))
    }
    const avg = (k) => samples.reduce((a, s) => a + s[k], 0) / samples.length
    const last = samples.at(-1)
    rows.push({ backend: last.backend, label: sc.name, animate: false, n: 0, cpu: avg('cpuMs'), fps: avg('fps'), draw: last.drawCalls, passes: last.renderPasses, quads: last.sprites, copies: last.backdropCopies, blurPasses: last.backdropPasses })
    await page.close()
  }
}
await browser.close()

console.log('| backend | scene | animated | draw calls | render passes | quads | backdrop copies + blur passes | CPU ms/frame | frame ms (uncapped) |')
console.log('| --- | --- | :---: | ---: | ---: | ---: | ---: | ---: | ---: |')
for (const r of rows) console.log(`| ${r.backend} | ${r.label ?? `${r.n} panels`} | ${r.animate ? 'yes' : 'no'} | ${r.draw} | ${r.passes} | ${r.quads} | ${r.copies !== undefined ? `${r.copies} + ${r.blurPasses}` : '—'} | ${r.cpu.toFixed(2)} | ${(1000 / r.fps).toFixed(2)} |`)
