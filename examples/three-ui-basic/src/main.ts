import { AnimatedImage, Image, NinePatchView, ScrollView, Text, View, createThreeUI, type Style, type UINode, type UIPointerEvent } from '@implicit-invocation/three-ui'
import { attachDOMInput } from '@implicit-invocation/three-ui/web'
import { Animation } from '@implicit-invocation/three-2d'
import { FpsMeter, bootRenderer, loop, makeAvatar, makeLandscape, makeNinePatch, makeWalkCycle, registerInterFonts } from 'example-shared'

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
const U = ui
await registerInterFonts(U.fonts)
attachDOMInput(U, canvas)

// ── palettes: the *inherited* text color comes from the theme layer; surfaces are re-styled on toggle ──────────
const palettes = {
  dark: { bg: '#09090b', surface: '#18181b', surface2: '#27272a', text: '#fafafa', muted: '#a1a1aa', accent: '#8b5cf6', border: '#3f3f46' },
  light: { bg: '#f4f4f5', surface: '#ffffff', surface2: '#e4e4e7', text: '#18181b', muted: '#52525b', accent: '#6d28d9', border: '#d4d4d8' },
}
let scheme: keyof typeof palettes = 'dark'
const P = () => palettes[scheme]

/** Re-apply palette-dependent styles when the theme toggles. */
const themed: (() => void)[] = []
function bind<T extends UINode>(node: T, style: (p: (typeof palettes)['dark']) => Style): T {
  const apply = () => node.setStyle(style(P()))
  themed.push(apply)
  apply()
  return node
}

// ── tiny widgets on the plain three-ui API (hover/press/focus via event listeners, no React, no className) ──────────
function button(label: string, onClick: (e: UIPointerEvent) => void, style: (p: ReturnType<typeof P>) => Style = () => ({})): View {
  const text = new Text({ text: label, style: { fontWeight: 700, fontSize: 14 } })
  const view = new View({ focusable: true, children: [text] })
  const refresh = () =>
    view.setStyle({
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: P().accent,
      color: '#ffffff',
      alignItems: 'center',
      ...style(P()),
      ...(view.pressed ? { backgroundColor: '#5b21b6', transform: [{ scale: 0.96 }] } : view.hovered ? { backgroundColor: '#a78bfa' } : {}),
      ...(view.focused ? { borderWidth: 2, borderColor: '#fbbf24' } : {}),
    })
  themed.push(refresh)
  refresh()
  for (const t of ['pointerenter', 'pointerleave', 'pointerdown', 'pointerup', 'pointercancel', 'focus', 'blur'] as const) view.addEventListener(t, refresh)
  view.addEventListener('click', onClick)
  return view
}

function card(title: string, body: UINode, extra: Style = {}): View {
  const heading = bind(new Text({ text: title }), (p) => ({ fontSize: 12, fontWeight: 700, color: p.muted, letterSpacing: '0.06em' }))
  const view = new View({ children: [heading, body] })
  return bind(view, (p) => ({ backgroundColor: p.surface, borderRadius: 12, borderWidth: 1, borderColor: p.border, padding: 14, gap: 10, ...extra }))
}

// ── content ────────────────────────────────────────────────────────────────────────────────────────────────────────
const avatars = Array.from({ length: 8 }, (_, i) => makeAvatar(i + 1))
const landscape = makeLandscape()
const walk = makeWalkCycle()
const panel = makeNinePatch()

const stats = new Text({ text: '', style: { fontSize: 12, color: '#86efac' } })
const widthLabel = bind(new Text({ text: '' }), (p) => ({ fontSize: 12, color: p.muted }))

const list = new ScrollView({ name: 'list', style: { flex: 1, gap: 6, paddingRight: 8 } })
let itemId = 0
function addItem(): void {
  const i = itemId++
  const row = new View()
  const close = button('×', () => {
    list.remove(row)
    row.dispose()
  }, (p) => ({ paddingHorizontal: 9, paddingVertical: 4, backgroundColor: p.border, color: p.text }))
  const label = new View({
    style: { flex: 1 },
    children: [new Text({ text: `Item ${i + 1}`, style: { fontWeight: 700 } }), bind(new Text({ text: 'Rows are plain View + Image + Text nodes.' }), (p) => ({ fontSize: 12, color: p.muted }))],
  })
  row.append(new Image({ source: avatars[i % avatars.length]!, style: { width: 36, height: 36, borderRadius: 18 } }))
  row.append(label)
  row.append(close)
  bind(row, (p) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8, backgroundColor: p.surface2 }))
  list.append(row)
}
for (let i = 0; i < 24; i++) addItem()

// resizable left column: dragging the handle changes a layout property → Yoga relayout + text re-wrap
let sideWidth = 300
const side = new View({ style: { width: sideWidth, gap: 12 } })
const handle = new View({ name: 'handle' })
const setHandle = (active: boolean) => bind(handle, (p) => ({ width: 8, borderRadius: 4, backgroundColor: active ? p.accent : p.border, alignSelf: 'stretch' }))
setHandle(false)
let dragging = false
handle.addEventListener('pointerdown', (e) => {
  dragging = true
  U.input.setPointerCapture(e.pointerId, handle)
  e.preventDefault()
})
handle.addEventListener('pointermove', (e) => {
  if (!dragging) return
  sideWidth = Math.round(Math.min(560, Math.max(180, e.x - 16)))
  side.setStyle({ width: sideWidth, gap: 12 })
  widthLabel.setText(`left column: ${sideWidth}px`)
})
handle.addEventListener('pointerup', () => ((dragging = false), setHandle(false)))
handle.addEventListener('pointerenter', () => setHandle(true))
handle.addEventListener('pointerleave', () => !dragging && setHandle(false))
widthLabel.setText(`left column: ${sideWidth}px  ·  drag the divider →`)

const para = new Text({
  text: 'Text measurement runs through Yoga measure callbacks and a cached bitmap-font GlyphLayout. Drag the divider and this paragraph re-wraps. Colors and font sizes are inherited from ancestors.',
  style: { fontSize: 14 },
})
const inherited = new Text({ text: 'This line overrides color + weight locally.', style: { color: '#fbbf24', fontWeight: 700, fontSize: 13 } })
side.append(card('TEXT + INHERITANCE', new View({ style: { gap: 8 }, children: [para, inherited, widthLabel] })))

const modeRow = new View({ style: { flexDirection: 'row', gap: 8 } })
for (const mode of ['contain', 'cover', 'stretch', 'center'] as const) {
  const thumb = bind(new Image({ source: landscape, resizeMode: mode }), (p) => ({ width: 64, height: 64, borderRadius: 8, backgroundColor: p.surface2, overflow: 'hidden' }))
  modeRow.append(
    new View({
      style: { alignItems: 'center', gap: 4 },
      children: [thumb, bind(new Text({ text: mode }), (p) => ({ fontSize: 10, color: p.muted }))],
    }),
  )
}
side.append(
  card(
    'IMAGES',
    new View({
      style: { gap: 10 },
      children: [
        modeRow,
        new View({
          style: { flexDirection: 'row', alignItems: 'center', gap: 10 },
          children: [new AnimatedImage({ animation: new Animation(0.1, walk.frames, 'loop'), style: { width: 48, height: 48 } }), bind(new Text({ text: 'AnimatedImage (frame Animation)' }), (p) => ({ fontSize: 12, color: p.muted }))],
        }),
      ],
    }),
  ),
)
side.append(
  new NinePatchView({
    patch: panel,
    style: { padding: 22, alignItems: 'center' },
    children: [new Text({ text: 'NinePatchView', style: { fontWeight: 700, color: '#ffffff' } }), new Text({ text: 'stretches around its content', style: { fontSize: 12, color: '#a1a1aa' } })],
  }),
)

const clipDemo = bind(
  new View({
    children: [new Text({ text: 'This long line is clipped by overflow: hidden and a rounded parent.', style: { fontSize: 13, width: 320 } })],
  }),
  (p) => ({ width: 130, height: 56, overflow: 'hidden', borderRadius: 12, backgroundColor: p.surface2, justifyContent: 'center', paddingLeft: 10 }),
)

const toolbar = new View({
  style: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  children: [
    button('Add item', () => {
      addItem()
      list.scrollTo(0, 1e9)
    }),
    button('Clear', () => {
      for (const c of [...list.children]) {
        list.remove(c)
        c.dispose()
      }
    }, (p) => ({ backgroundColor: p.border, color: p.text })),
    button('Toggle theme', () => {
      scheme = scheme === 'dark' ? 'light' : 'dark'
      applyTheme()
    }, () => ({ backgroundColor: '#0e7490' })),
  ],
})

const header = new View({
  style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  children: [
    new View({
      children: [new Text({ text: '@implicit-invocation/three-ui', style: { fontSize: 30, fontWeight: 700 } }), bind(new Text({ text: 'retained UI · Yoga flexbox · no React · no DOM' }), (p) => ({ fontSize: 13, color: p.muted }))],
    }),
    new View({ style: { alignItems: 'flex-end', gap: 2 }, children: [new Text({ text: boot.backend, style: { fontWeight: 700, color: '#fbbf24' } }), stats] }),
  ],
})

const right = new View({
  style: { flex: 1, gap: 12 },
  children: [
    card('SCROLLVIEW · drag, wheel, fling, Tab/arrow keys', list, { flex: 1 }),
    card('CLIPPING + BUTTONS', new View({ style: { flexDirection: 'row', alignItems: 'center', gap: 12 }, children: [clipDemo, toolbar] })),
  ],
})
const main = new View({ style: { flex: 1, flexDirection: 'row', gap: 8 }, children: [side, handle, right] })
const root = new View({ style: { flex: 1, padding: 16, gap: 14 }, children: [header, main] })
U.setRoot(root)

function applyTheme(): void {
  const p = P()
  U.setTheme({ root: { backgroundColor: p.bg, color: p.text, fontFamily: 'Inter', fontSize: 14 } })
  U.clearColor!.setFrom(p.bg)
  for (const apply of themed) apply()
}
applyTheme()

const fps = new FpsMeter()
let statTimer = 0
loop((dt) => {
  fps.tick(dt)
  U.update(dt)
  statTimer += dt
  if (statTimer > 0.5) {
    statTimer = 0
    const s = U.stats
    stats.setText(`${fps.fps} fps · nodes ${s.nodes} · layouts ${s.layoutPasses} · styles ${s.styleRecomputes} · draw calls ${s.drawCalls} · glyphs ${s.glyphs}`)
  }
  U.render()
  ;(window as unknown as { __frames: number }).__frames = ((window as unknown as { __frames?: number }).__frames ?? 0) + 1
})
;(window as unknown as { __backend: string }).__backend = boot.backend
;(window as unknown as { __ui: unknown }).__ui = U
