// Side effect: installs the Tailwind registry (classes, @theme, @keyframes compiled at build time) as the className resolver.
import 'virtual:three-ui-tailwind/register'
import { Image, Text, View, createThreeUI, type ThreeUI, type UINode, type UIPointerEvent } from '@implicit-invocation/three-ui'
import { attachDOMInput } from '@implicit-invocation/three-ui/web'
import { bootRenderer, loop, makeAvatar, makeGemAtlas, makeLandscape, registerDisplayFonts, registerInterFonts } from 'example-shared'
import { createWorld } from './world'
import { buildStress, type StressHandle } from './stress'

const params = new URLSearchParams(location.search)
const blur = (params.get('blur') ?? 'full') as 'off' | 'low' | 'full'
// `?renderer=webgl`: a classic THREE.WebGLRenderer + WebGLNodesHandler instead of WebGPURenderer (same UI code, same output)
const classic = params.get('renderer') === 'webgl'
// `?still`: freeze the 3D scene so screenshots of different renderers can be compared pixel for pixel
const still = params.has('still')

const canvas = document.getElementById('c') as HTMLCanvasElement
let ui: ThreeUI | null = null
const world = createWorld()
const boot = await bootRenderer(canvas, ({ width, height, pixelRatio }) => {
  ui?.resize(width, height, pixelRatio)
  world.resize(width, height)
})
boot.renderer.setClearColor(0x0b1020, 1)

ui = createThreeUI({
  renderer: boot.renderer as never,
  width: boot.size.width,
  height: boot.size.height,
  pixelRatio: boot.size.pixelRatio,
  backdropBlur: blur,
  // a stress screen with thousands of panels writes several quads each; keep them in ONE buffer (no capacity flushes)
  maxSprites: 40000,
})
const U = ui
await Promise.all([registerInterFonts(U.fonts), registerDisplayFonts(U.fonts)])
attachDOMInput(U, canvas)
world.resize(boot.size.width, boot.size.height)

// ── tiny helpers on the plain three-ui API: every look below is a Tailwind class string ──────────────────────────
const v = (className: string, children: UINode[] = [], extra: ConstructorParameters<typeof View>[0] = {}) => new View({ className, children, ...extra })
const t = (text: string, className = '') => new Text({ text, className })
const img = (source: NonNullable<ConstructorParameters<typeof Image>[0]>['source'], className: string) => new Image({ source, className })

function button(label: string, className: string, onClick: (e: UIPointerEvent) => void): View {
  const b = v(className, [t(label, 'font-extrabold')], { focusable: true })
  b.addEventListener('click', onClick)
  return b
}

const { gems } = makeGemAtlas()
const avatar = makeAvatar(3, 128)
const portrait = makeLandscape()

// shared button looks (full utility strings so the build-time scanner sees them)
const PRIMARY =
  'items-center justify-center rounded-2xl px-8 py-3 bg-linear-to-b from-amber-300 to-amber-500 text-amber-950 text-lg shadow-[0_5px_0_#92400e,0_10px_18px_#00000066] ring-2 ring-amber-100/60 ' +
  'transition duration-150 ease-out hover:from-amber-200 hover:to-amber-400 hover:scale-105 active:scale-95 active:translate-y-1 active:shadow-[0_1px_0_#92400e,0_2px_6px_#00000066]'
const SECONDARY =
  'items-center justify-center rounded-xl px-4 py-2 bg-linear-to-b from-slate-600 to-slate-800 text-white text-sm shadow-[0_3px_0_#0f172a] ring-1 ring-white/20 ' +
  'transition duration-150 hover:from-slate-500 hover:to-slate-700 active:translate-y-0.5 active:shadow-[0_0px_0_#0f172a]'
const TOGGLE_ON = 'from-emerald-400 to-emerald-600 text-emerald-950'
const CHIP =
  'flex-row items-center gap-2 rounded-full bg-linear-to-b from-slate-700 to-slate-900 pl-2 pr-4 py-1.5 ring-1 ring-white/20 shadow-md text-sm ' +
  'transition duration-150 hover:from-slate-600 hover:scale-105 active:scale-95'

// ── HUD: top bar ─────────────────────────────────────────────────────────────────────────────────────────────────
const topBar = v('absolute top-3 inset-x-3 flex-row items-center gap-3', [
  v('flex-row items-center gap-3 rounded-full bg-slate-900/60 backdrop-blur-md ring-1 ring-white/25 pl-1.5 pr-6 py-1.5 shadow-xl', [
    img(avatar, 'size-14 rounded-full ring-[3px] ring-amber-400 object-cover shadow-lg'),
    v('gap-0.5', [t('Aria the Bold', 'font-extrabold text-base text-shadow-lg'), t('Level 27  ·  Paladin', 'text-xs text-amber-300')]),
  ]),
  v('flex-1'),
  v(CHIP, [img(gems[0]!, 'size-8 drop-shadow-lg'), t('12,480', 'font-bold text-amber-200')]),
  v(CHIP, [img(gems[5]!, 'size-8 drop-shadow-lg'), t('320', 'font-bold text-sky-200')]),
  v(CHIP, [img(gems[2]!, 'size-8 drop-shadow-lg [tint-color:#475569]'), t('locked', 'font-bold text-slate-400')]),
])

// ── HUD: quest panel (framed panel: gradient + ring + outer shadow + inset highlight) ───────────────────────────
const questFill = v('h-full w-[60%] rounded-full bg-linear-to-r from-emerald-400 to-lime-300 transition-[width] duration-500 ease-out', [
  v('absolute inset-y-1 left-0 w-[34px] rounded-full bg-white/40 animate-shine motion-reduce:animate-none'),
])
const questPanel = v('absolute left-4 top-24 w-[350px] gap-3 rounded-3xl bg-linear-to-b from-slate-700 to-slate-950 p-5 ring-2 ring-amber-500/70 shadow-2xl inset-shadow-sm inset-shadow-white/25', [
  v('flex-row items-center justify-between', [
    t('Slay the Dummy', 'font-display font-extrabold text-[30px] text-amber-300 outlined text-shadow-lg'),
  ]),
  t('The training dummy has been terrorising the barracks for weeks. Land five clean hits before the sun sets over the keep, then report back to the quartermaster for your reward.', 'text-sm text-slate-200 leading-snug line-clamp-3'),
  v('gap-1.5', [
    v('flex-row justify-between', [t('Progress', 'text-xs font-bold text-slate-300'), t('3 / 5', 'text-xs font-bold text-emerald-300')]),
    v('h-4 rounded-full bg-black/50 ring-1 ring-white/20 inset-shadow-sm inset-shadow-black/60 overflow-hidden', [questFill]),
  ]),
  v('flex-row items-center gap-2 pt-1', [
    t('Reward', 'text-xs font-bold text-slate-300'),
    img(gems[0]!, 'size-7 drop-shadow-lg'),
    t('×250', 'text-sm font-extrabold text-amber-200'),
    img(gems[4]!, 'size-7 drop-shadow-lg'),
    t('×3', 'text-sm font-extrabold text-sky-200'),
    v('flex-1'),
    t('NEW', 'rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-extrabold ring-1 ring-rose-200/60 animate-glow motion-reduce:animate-none'),
  ]),
])

// ── HUD: boss + attack ───────────────────────────────────────────────────────────────────────────────────────────
let bossHp = 100
const bossFill = v('h-full w-full rounded-full bg-linear-to-r from-rose-600 via-orange-500 to-amber-300 transition-[width] duration-500 ease-out')
const bossName = t('Training Dummy', 'font-display font-extrabold text-2xl text-white outlined-thin text-shadow-lg')
const damageLayer = v('absolute inset-0 pointer-events-none')
const bossCard = v('absolute right-6 top-28 w-[300px] gap-3 items-center rounded-3xl bg-slate-900/55 backdrop-blur-lg p-4 ring-1 ring-white/25 shadow-2xl', [
  bossName,
  img(portrait, 'w-full h-[150px] rounded-2xl object-cover ring-2 ring-rose-400/80 shadow-lg'),
  v('w-full h-5 rounded-full bg-black/55 ring-1 ring-white/25 inset-shadow-sm inset-shadow-black/70 overflow-hidden', [bossFill]),
])

function spawnDamage(x: number, y: number, crit: boolean): void {
  const amount = crit ? 40 + Math.floor(Math.random() * 30) : 8 + Math.floor(Math.random() * 14)
  const label = t(
    crit ? `${amount}!` : String(amount),
    crit
      ? 'absolute font-display font-extrabold text-[44px] text-yellow-300 outlined text-shadow-lg'
      : 'absolute font-display font-extrabold text-[28px] text-white outlined-thin text-shadow-lg',
  )
  label.setStyle({ left: x - 20, top: y - 24 })
  damageLayer.append(label)
  const drift = (Math.random() - 0.5) * 70
  const a = label.animate(
    [
      { offset: 0, opacity: 0, transform: [{ translateY: 10 }, { scale: 0.5 }], easing: 'ease-out' },
      { offset: 0.15, opacity: 1, transform: [{ translateY: -8 }, { scale: crit ? 1.5 : 1.25 }], easing: 'ease-out' },
      { offset: 0.55, opacity: 1, transform: [{ translateX: drift * 0.4 }, { translateY: -40 }, { scale: 1 }], easing: 'ease-in' },
      { offset: 1, opacity: 0, transform: [{ translateX: drift }, { translateY: -90 }, { scale: 1 }] },
    ],
    { duration: crit ? 1100 : 850 },
  )
  a.finished.then(() => label.dispose(), () => label.dispose())
  bossHp = Math.max(0, bossHp - amount * 0.25)
  bossFill.setStyle({ width: `${bossHp}%` })
  if (bossHp === 0) {
    bossHp = 100
    setTimeout(() => bossFill.setStyle({ width: '100%' }), 700)
  }
}

bossCard.addEventListener('click', (e) => spawnDamage(e.x, e.y, Math.random() < 0.25))

const attack = button('ATTACK!', PRIMARY, () => {
  const r = bossCard.getAbsoluteRect()
  spawnDamage(r.x + r.width / 2 + (Math.random() - 0.5) * 120, r.y + 120 + Math.random() * 40, Math.random() < 0.3)
})

// ── modal over the busy scene ────────────────────────────────────────────────────────────────────────────────────
const DIALOG = 'w-[400px] gap-4 items-center rounded-3xl bg-white/10 backdrop-blur-xl p-7 ring-1 ring-white/35 shadow-2xl inset-shadow-sm inset-shadow-white/30'
const dialog = v(DIALOG, [
  t('VICTORY!', 'font-display font-extrabold text-[54px] text-amber-300 outlined text-shadow-lg'),
  t('The dummy has been thoroughly defeated.', 'text-center text-slate-100 text-sm'),
  v('flex-row gap-3 items-center', [
    ...[0, 2, 4, 7].map((i) => v('size-16 items-center justify-center rounded-2xl bg-black/30 ring-1 ring-white/25 shadow-inner-lg', [img(gems[i]!, 'size-11 drop-shadow-lg')])),
  ]),
  button('CLAIM REWARD', PRIMARY, () => setModal(false)),
])
const modal = v('absolute inset-0 items-center justify-center bg-black/35 backdrop-blur-sm', [dialog], { style: { display: 'none' } })
function setModal(open: boolean): void {
  modal.setStyle({ display: open ? 'flex' : 'none' })
  dialog.setClassName(open ? `${DIALOG} animate-pop motion-reduce:animate-none` : DIALOG)
}

// ── controls + stats ─────────────────────────────────────────────────────────────────────────────────────────────
let reduced = false
let stress: StressHandle | null = null
const statsText = t('', 'text-[11px] leading-snug text-emerald-300')
const statsBox = v('absolute left-4 bottom-20 rounded-xl bg-black/55 px-3 py-2 ring-1 ring-white/15', [statsText])

function toggle(label: string, isOn: () => boolean, onToggle: () => void): View {
  const b = button(label, `${SECONDARY} ${''}`, () => {
    onToggle()
    paint()
  })
  const paint = () => b.setClassName(`${SECONDARY} ${isOn() ? TOGGLE_ON : ''}`)
  paint()
  return b
}

const stressPicker = v('flex-row gap-2', [100, 500, 1000, 2000].map((n) => button(String(n), SECONDARY, () => startStress(n))), { style: { display: 'none' } })
const controls = v('absolute bottom-4 inset-x-4 flex-row items-center gap-3', [
  attack,
  button('Quest done', SECONDARY, () => setModal(true)),
  v('flex-1'),
  stressPicker,
  toggle('Stress', () => stress !== null, () => (stress ? stopStress() : startStress(500))),
  toggle('Reduced motion', () => reduced, () => U.setMediaFlags({ reducedMotion: (reduced = !reduced) })),
  button(classic ? 'WebGLRenderer' : 'WebGPURenderer', SECONDARY, () => {
    if (classic) params.delete('renderer')
    else params.set('renderer', 'webgl')
    location.search = params.toString()
  }),
  button(`Blur: ${blur}`, SECONDARY, () => {
    const next = blur === 'full' ? 'low' : blur === 'low' ? 'off' : 'full'
    params.set('blur', next)
    location.search = params.toString()
  }),
])

const hud = v('absolute inset-0', [topBar, questPanel, bossCard])
const stressSlot = v('absolute inset-0')
// controls + stats stay above everything but the modal; the layer itself never eats pointer events
const controlLayer = v('absolute inset-0 pointer-events-none', [controls, statsBox])
const root = v('flex-1 font-ui text-white', [hud, stressSlot, damageLayer, controlLayer, modal])
U.setRoot(root)

function startStress(n: number): void {
  stress?.dispose()
  stress = buildStress(U, stressSlot, n, params.get('anim') === '1', params.has('flat'))
  hud.setStyle({ display: 'none' })
  stressPicker.setStyle({ display: 'flex' })
}
function stopStress(): void {
  stress?.dispose()
  stress = null
  hud.setStyle({ display: 'flex' })
  stressPicker.setStyle({ display: 'none' })
}

// ── frame loop + measurements (also exposed on window.__perf for the headless harness) ───────────────────────────
const perf = { frames: 0, cpuMs: 0, windowStart: performance.now(), windowFrames: 0, cpuAvg: 0, fps: 0 }
let statsTimer = 0
const w = window as unknown as Record<string, unknown>

loop((dt) => {
  if (!still) world.update(dt)
  boot.renderer.render(world.scene, world.camera)
  // measured: the UI only (style → layout → paint → batch → renderer.render submission); the 3D scene above is not counted
  const t0 = performance.now()
  U.update(dt)
  U.render()
  const t1 = performance.now()
  perf.frames++
  perf.windowFrames++
  perf.cpuMs += t1 - t0
  const elapsed = t1 - perf.windowStart
  if (elapsed >= 500) {
    perf.cpuAvg = perf.cpuMs / perf.windowFrames
    perf.fps = (perf.windowFrames * 1000) / elapsed
    perf.cpuMs = 0
    perf.windowFrames = 0
    perf.windowStart = t1
  }
  statsTimer += dt
  if (statsTimer > 0.25) {
    statsTimer = 0
    const s = U.stats
    statsText.setText(
      `${boot.backend} · ${perf.fps.toFixed(0)} fps · CPU ${perf.cpuAvg.toFixed(2)} ms/frame\n` +
        `draw calls ${s.drawCalls} (${s.renderPasses} passes) · quads ${s.sprites} · boxes ${s.boxes} · shadows ${s.shadows}\n` +
        `backdrop: ${s.backdropCopies} copy + ${s.backdropPasses} blur passes · nodes ${s.nodes} · blur ${blur}`,
    )
  }
  w.__frames = perf.frames
  w.__perf = { backend: boot.backend, fps: perf.fps, cpuMs: perf.cpuAvg, ...U.stats, stress: stress?.count ?? 0 }
})

w.__backend = boot.backend
w.__renderer = boot.renderer
w.__ui = U
w.__startStress = startStress
w.__stopStress = stopStress
w.__setModal = setModal
w.__spawnDamage = spawnDamage

if (params.has('stress')) startStress(Number(params.get('stress')) || 500)
if (params.has('modal')) setModal(true)
