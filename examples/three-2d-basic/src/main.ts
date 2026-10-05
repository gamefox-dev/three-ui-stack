import {
  ExtendViewport,
  FillViewport,
  FitViewport,
  ParticleEffect,
  ParticleEmitter,
  ScreenViewport,
  StretchViewport,
  Three2D,
  type BatchDrawOptions,
  type Viewport,
} from 'three-2d'
import { packBitmapFont } from 'three-2d-font'
import type { BitmapFont } from 'three-2d'
import { FpsMeter, bootRenderer, loadBitmapFont, loop, makeGemAtlas, makeNinePatch, makeWalkCycle } from 'example-shared'

const canvas = document.getElementById('c') as HTMLCanvasElement
let graphics: Three2D | null = null
const boot = await bootRenderer(canvas, ({ width, height }) => graphics?.resize(width, height))
const { renderer } = boot

// ── viewports (press V) ────────────────────────────────────────────────────────────────────────
const WORLD_W = 960
const WORLD_H = 540
const viewports: [string, () => Viewport][] = [
  ['FitViewport (letterbox)', () => new FitViewport(WORLD_W, WORLD_H)],
  ['FillViewport (crop)', () => new FillViewport(WORLD_W, WORLD_H)],
  ['ExtendViewport', () => new ExtendViewport(WORLD_W, WORLD_H)],
  ['StretchViewport', () => new StretchViewport(WORLD_W, WORLD_H)],
  ['ScreenViewport (1:1 px)', () => new ScreenViewport()],
]
let viewportIndex = 0
graphics = new Three2D({ renderer: renderer as never, viewport: viewports[0]![1](), clearColor: '#050507' })
graphics.resize(boot.size.width, boot.size.height)

// ── assets ───────────────────────────────────────────────────────────────────────────────────────
const [fontRegular, fontBold] = await Promise.all([loadBitmapFont('inter-regular-48'), loadBitmapFont('inter-bold-48')])
const { gems, coin } = makeGemAtlas()
const walk = makeWalkCycle()
const panel = makeNinePatch()

// ── swarm (all gems share one texture → one draw call) ──────────────────────────────────────────────────
const ARENA = { x: 24, y: 120, w: 600, h: 312 }
const MAX = 20000
const sx = new Float32Array(MAX)
const sy = new Float32Array(MAX)
const svx = new Float32Array(MAX)
const svy = new Float32Array(MAX)
const srot = new Float32Array(MAX)
const svr = new Float32Array(MAX)
const skind = new Uint8Array(MAX)
for (let i = 0; i < MAX; i++) {
  sx[i] = ARENA.x + Math.random() * ARENA.w
  sy[i] = ARENA.y + Math.random() * ARENA.h
  const a = Math.random() * Math.PI * 2
  const sp = 30 + Math.random() * 120
  svx[i] = Math.cos(a) * sp
  svy[i] = Math.sin(a) * sp
  srot[i] = Math.random() * 6.28
  svr[i] = (Math.random() - 0.5) * 6
  skind[i] = i % gems.length
}
let count = Number(new URLSearchParams(location.search).get('n') ?? 1500)
let paused = false
let clipArena = true

// ── particles ──────────────────────────────────────────────────────────────────────────────────────────
const trail = new ParticleEmitter({
  region: gems[1]!,
  emissionRate: 90,
  lifetime: [0.4, 0.9],
  speed: [10, 60],
  startScale: [0.5, 1],
  endScale: 0,
  startColor: '#fbbf24',
  endColor: '#f43f5e00',
  size: 28,
  blend: 'additive',
  maxParticles: 400,
})
const burst = new ParticleEffect([
  new ParticleEmitter({ region: gems[5]!, emissionRate: 0, lifetime: [0.6, 1.4], speed: [80, 320], gravityY: 380, startScale: [0.6, 1.2], endScale: 0.1, rotation: [0, 360], angularVelocity: [-360, 360], startColor: '#ffffff', endColor: '#6d5dfc00', size: 30, blend: 'additive', maxParticles: 600 }),
])

// ── interactive nine-patch panel ──────────────────────────────────────────────────────────────────────
const box = { x: 650, y: 120, w: 280, h: 250 }
let resizing = false
let pointer = { x: 0, y: 0, inside: false }
const LOREM = 'A nine-patch keeps its corners crisp while the center stretches. Drag the handle at the bottom-right to resize this panel; the text re-wraps with GlyphLayout. '

canvas.addEventListener('pointermove', (e) => {
  const w = g.viewport.unproject(e.offsetX, e.offsetY)
  pointer = { x: w.x, y: w.y, inside: true }
  if (resizing) {
    box.w = Math.max(96, w.x - box.x + 8)
    box.h = Math.max(96, w.y - box.y + 8)
  }
})
canvas.addEventListener('pointerleave', () => (pointer.inside = false))
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId)
  const w = g.viewport.unproject(e.offsetX, e.offsetY)
  if (Math.hypot(w.x - (box.x + box.w), w.y - (box.y + box.h)) < 22) resizing = true
  else burst.setPosition(w.x, w.y), burst.emitters[0]!.burst(90)
})
canvas.addEventListener('pointerup', () => (resizing = false))
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') count = Math.min(MAX, count * 2)
  else if (e.key === 'ArrowDown') count = Math.max(50, Math.floor(count / 2))
  else if (e.key === 'v' || e.key === 'V') {
    viewportIndex = (viewportIndex + 1) % viewports.length
    g.viewport = viewports[viewportIndex]![1]()
    g.resize(boot.size.width, boot.size.height)
  } else if (e.key === 'p' || e.key === 'P') paused = !paused
  else if (e.key === 'c' || e.key === 'C') clipArena = !clipArena
  else if (e.key === 'f' || e.key === 'F') void packFonts()
})

// ── runtime font packing (press F): bake Inter Bold twice — on the GPU (Three render target) and with the CPU rasterizer ──────
let packed: { gpu: BitmapFont; cpu: BitmapFont; gpuMs: number; cpuMs: number } | null = null
let packing = false
async function packFonts(): Promise<void> {
  if (packing) return
  packing = true
  const bytes = await (await fetch('/fonts/Inter_700Bold.ttf')).arrayBuffer()
  const options = { size: 40, characters: 'ascii' as const, supersample: 4, padding: 2 }
  let t = performance.now()
  const gpu = await packBitmapFont(bytes, { ...options, renderer: boot.renderer as never })
  const gpuMs = Math.round(performance.now() - t)
  t = performance.now()
  const cpu = await packBitmapFont(bytes, options)
  const cpuMs = Math.round(performance.now() - t)
  packed = { gpu, cpu, gpuMs, cpuMs }
  packing = false
}

// ── frame ───────────────────────────────────────────────────────────────────────────────────────────────
const fps = new FpsMeter()
let last: string[] = []
const opts: BatchDrawOptions = { x: 0, y: 0, width: 24, height: 24, originX: 12, originY: 12, rotation: 0 }
let time = 0
const star: number[] = [] // reused polygon vertex scratch
const text = (batch: Parameters<Parameters<Three2D['render']>[0]>[0], str: string, x: number, y: number, size: number, color: string, bold = false, width?: number) =>
  (bold ? fontBold : fontRegular).draw(batch, str, x, y, { scale: size / 48, color, ...(width ? { width } : {}) })

const g: Three2D = graphics
const drawFrame = (b: Parameters<Parameters<Three2D['render']>[0]>[0]) => {
  // world backdrop shows the viewport rectangle (bars appear outside it for Fit/Fill)
  b.fillRect(0, 0, g.viewport.worldWidth, g.viewport.worldHeight, { color: '#0d0d14' })
  text(b, 'three-2d', 24, 18, 40, '#ffffff', true)
  text(b, 'batched sprites · atlas · animation · bitmap fonts · nine-patch · particles · viewports', 26, 64, 15, '#a1a1aa')
  text(b, `${boot.backend} · ${g.viewport.constructor.name}`, 26, 86, 13, '#71717a')

  // arena: clipped through the batch clip stack (scissor); toggle with C
  b.fillRect(ARENA.x, ARENA.y, ARENA.w, ARENA.h, { color: '#14141d', radius: 12, borderWidth: 1, borderColor: '#2a2a3a' })
  if (clipArena) b.pushClip(ARENA.x, ARENA.y, ARENA.w, ARENA.h)
  for (let i = 0; i < count; i++) {
    opts.x = sx[i]! - 12
    opts.y = sy[i]! - 12
    opts.rotation = srot[i]!
    b.drawEx(gems[skind[i]!]!, opts)
  }
  if (clipArena) b.popClip()
  text(b, `${count.toLocaleString()} sprites · 1 texture`, ARENA.x + 12, ARENA.y + ARENA.h + 10, 14, '#d4d4d8')
  text(b, '↑/↓ sprite count   V viewport   C clip   P pause   F pack fonts   click = burst', ARENA.x + 12, ARENA.y + ARENA.h + 32, 12, '#71717a')

  // animations
  const walkFrame = walk.frames[Math.floor(time * 10) % walk.frames.length]!
  for (let i = 0; i < 4; i++) {
    b.drawEx(walkFrame, { x: 24 + ((time * 70 + i * 150) % 560), y: 478, width: 48, height: 48, flipX: false })
  }
  b.draw(coin.getKeyFrame(time), 584, 486, 32, 32)

  // blend modes: same texture, four modes
  const modes = ['normal', 'additive', 'multiply', 'screen'] as const
  modes.forEach((m, i) => {
    b.setBlendMode('normal')
    b.fillRect(650 + i * 70, 410, 62, 40, { color: '#3b3b55', radius: 6 })
    b.setBlendMode(m)
    b.drawEx(gems[i * 2]!, { x: 658 + i * 70, y: 414, width: 46, height: 46, originX: 23, originY: 23, rotation: time + i })
    b.setBlendMode('normal')
    text(b, m, 652 + i * 70, 458, 11, '#a1a1aa')
  })

  // nine-patch panel + wrapped text
  panel.draw(b, box.x, box.y, box.w, box.h)
  text(b, 'NinePatch', box.x + 20, box.y + 16, 18, '#ffffff', true)
  text(b, LOREM, box.x + 22, box.y + 46, 12.5, '#c4c4d4', false, Math.max(40, box.w - 44))
  b.fillRect(box.x + box.w - 14, box.y + box.h - 14, 20, 20, { color: resizing ? '#fbbf24' : '#6d5dfc', radius: 10, borderWidth: 2, borderColor: '#ffffff' })

  // polygon: textured star fan (PolygonSpriteBatch)
  star.length = 0
  star.push(560, 52) // fan center
  for (let i = 0; i <= 10; i++) {
    const r = i % 2 === 0 ? 22 : 10
    const a = (i / 10) * Math.PI * 2 + time
    star.push(560 + Math.cos(a) * r, 52 + Math.sin(a) * r)
  }
  b.drawPolygon(gems[2]!, star)

  // runtime-packed fonts (GPU rasterizer vs CPU rasterizer): identical glyphs, different baking path
  if (packed) {
    const sample = 'Sphinx of black quartz, judge my vow 0123'
    packed.gpu.draw(b, `GPU ${packed.gpuMs}ms  ${sample}`, 24, 500, { scale: 0.42, color: '#86efac' })
    packed.cpu.draw(b, `CPU ${packed.cpuMs}ms  ${sample}`, 24, 520, { scale: 0.42, color: '#93c5fd' })
  } else if (packing) {
    text(b, 'baking fonts…', 24, 500, 14, '#fbbf24')
  }

  // particles over everything
  trail.draw(b)
  burst.draw(b)

  // stats overlay: counters from the previous frame (this frame's are still being collected)
  b.fillRect(WORLD_W - 232, 12, 220, 124, { color: '#0b0b12e6', radius: 10, borderWidth: 1, borderColor: '#2a2a3a' })
  last.forEach((l, i) => fontRegular.draw(b, l, WORLD_W - 220, 20 + i * 15, { scale: 12 / 48, color: i === 0 ? '#86efac' : '#d4d4d8' }))
}

loop((dt) => {
  fps.tick(dt)
  if (!paused) {
    time += dt
    for (let i = 0; i < count; i++) {
      sx[i]! += svx[i]! * dt
      sy[i]! += svy[i]! * dt
      srot[i]! += svr[i]! * dt
      if (sx[i]! < ARENA.x || sx[i]! > ARENA.x + ARENA.w) svx[i]! *= -1
      if (sy[i]! < ARENA.y || sy[i]! > ARENA.y + ARENA.h) svy[i]! *= -1
    }
    trail.update(dt)
    burst.update(dt)
  }
  trail.setPosition(pointer.inside ? pointer.x : -100, pointer.y)

  g.render(drawFrame)
  const s = g.stats
  last = [
    `fps ${fps.fps}`,
    `sprites ${s.sprites}`,
    `draw calls ${s.drawCalls}`,
    `render passes ${s.renderPasses}`,
    `flushes ${s.flushes}`,
    `glyphs ${s.glyphs}`,
    `clip changes ${s.clipChanges}`,
  ]
  ;(window as unknown as { __frames: number }).__frames = ((window as unknown as { __frames?: number }).__frames ?? 0) + 1
})
;(window as unknown as { __backend: string }).__backend = boot.backend

