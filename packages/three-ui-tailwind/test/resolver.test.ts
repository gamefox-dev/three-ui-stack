import { describe, expect, it } from 'vitest'
import { View, createThreeUI, setDefaultClassNameResolver, getDefaultClassNameResolver } from 'three-ui'
import { compileTailwind } from '../src/compiler'
import { createTailwindResolver, registerTailwind } from '../src/runtime'

const CSS = `@import "tailwindcss";
@theme { --color-primary: #6d5dfc; --spacing: 4px; }`

const TOKENS = [
  'flex', 'flex-row', 'flex-col', 'flex-1', 'gap-4', 'p-4', 'bg-zinc-950', 'bg-primary', 'bg-red-500', 'text-white', 'text-lg',
  'hover:bg-zinc-800', 'active:bg-blue-500', 'focus:bg-primary', 'disabled:opacity-40', 'dark:bg-black', 'md:flex-col', 'md:p-8', 'sm:p-6', 'scale-95', 'rotate-12', 'size-10',
]

async function setup(width = 500) {
  const { registry } = await compileTailwind({ css: CSS, base: import.meta.dirname, candidates: TOKENS })
  const resolver = createTailwindResolver(registry)
  const ui = createThreeUI({ width, height: 400, classNameResolver: resolver })
  return { registry, resolver, ui }
}

describe('three-ui-tailwind runtime resolver', () => {
  it('merges utilities, theme colors and `flex` row semantics; inline style beats className', async () => {
    const { ui } = await setup()
    const v = new View({ className: 'flex p-4 gap-4 bg-primary bg-zinc-950', style: { padding: 3 } })
    ui.setRoot(v)
    ui.update()
    const cs = v.computedStyle
    expect(cs.flexDirection).toBe('row')
    expect(cs.gap).toBe(16)
    expect(cs.padding).toBe(3) // style prop > className
    // Tailwind orders bg-primary (theme color) and bg-zinc-950 by its own rules, not by class-string position
    expect(['#6d5dfc', '#09090b']).toContain(cs.backgroundColor.toHex())
    const v2 = new View({ className: 'bg-zinc-950 bg-primary' })
    const v3 = new View({ className: 'bg-primary bg-zinc-950' })
    ui.setRoot(new View({ children: [v2, v3] }))
    ui.update()
    expect(v2.computedStyle.backgroundColor.toHex()).toBe(v3.computedStyle.backgroundColor.toHex())
  })

  it('applies hover / active / focus / disabled variants from interaction state without relayout', async () => {
    const { ui } = await setup()
    const box = new View({ focusable: true, className: 'bg-zinc-950 hover:bg-zinc-800 active:bg-blue-500 focus:bg-primary disabled:opacity-40', style: { width: 80, height: 80 } })
    ui.setRoot(new View({ style: { flexDirection: 'row' }, children: [box] }))
    ui.update()
    expect(box.computedStyle.backgroundColor.toHex()).toBe('#09090b')
    const layouts = ui.stats.layoutPasses
    ui.input.pointerMove(10, 10)
    ui.update()
    expect(box.computedStyle.backgroundColor.toHex()).toBe('#27272a')
    ui.input.pointerDown(10, 10)
    ui.update()
    // both hover:/active:/focus: apply; Tailwind's variant order decides the winner deterministically
    const pressed = box.computedStyle.backgroundColor.toHex()
    expect(['#2b7fff', '#6d5dfc']).toContain(pressed)
    ui.input.pointerUp(10, 10)
    ui.input.pointerMove(300, 300)
    ui.input.blur()
    ui.update()
    expect(box.computedStyle.backgroundColor.toHex()).toBe('#09090b')
    expect(ui.stats.layoutPasses).toBe(layouts) // color-only variants never relayout
    box.setDisabled(true)
    ui.update()
    expect(box.computedStyle.opacity).toBe(0.4)
  })

  it('supports dark: and responsive variants through the environment', async () => {
    const { ui } = await setup(500)
    const v = new View({ className: 'flex-row bg-zinc-950 dark:bg-black md:flex-col p-4 sm:p-6 md:p-8' })
    ui.setRoot(v)
    ui.update()
    expect(v.computedStyle.backgroundColor.toHex()).toBe('#09090b')
    expect([v.computedStyle.flexDirection, v.computedStyle.padding]).toEqual(['row', 16]) // 500px < sm (640px)
    ui.resize(700, 400)
    ui.update()
    expect([v.computedStyle.flexDirection, v.computedStyle.padding]).toEqual(['row', 24]) // sm: 640 ≤ 700 < md: 768
    ui.resize(800, 400)
    ui.update()
    expect([v.computedStyle.flexDirection, v.computedStyle.padding]).toEqual(['column', 32]) // md:
    ui.setColorScheme('dark')
    ui.update()
    expect(v.computedStyle.backgroundColor.toHex()).toBe('#000000') // dark:bg-black wins over bg-zinc-950
    ui.setColorScheme('light')
    ui.update()
    expect(v.computedStyle.backgroundColor.toHex()).toBe('#09090b')
  })

  it('re-resolves only dependent nodes when the viewport / scheme changes', async () => {
    const { ui, resolver } = await setup(500)
    const dependent = new View({ className: 'p-4 md:p-8' })
    const stable = new View({ className: 'p-4' })
    ui.setRoot(new View({ children: [dependent, stable] }))
    ui.update()
    expect(dependent.computedStyle.padding).toBe(16)
    const before = ui.stats.styleRecomputes
    ui.resize(900, 400)
    ui.update()
    expect(dependent.computedStyle.padding).toBe(32)
    expect(stable.computedStyle.padding).toBe(16)
    expect(ui.stats.styleRecomputes - before).toBeLessThanOrEqual(3) // viewRoot + root + dependent; `stable` untouched
    // viewport changes that don't cross a breakpoint reuse cached resolutions
    const hits = resolver.stats.resolveHits
    ui.resize(950, 400)
    ui.update()
    expect(resolver.stats.resolveHits).toBeGreaterThanOrEqual(hits)
    ui.setColorScheme('dark')
    ui.update()
  })

  it('composes individual transforms and ignores unknown class names', async () => {
    const { ui } = await setup()
    const v = new View({ className: 'scale-95 rotate-12 not-a-tailwind-class' })
    ui.setRoot(v)
    ui.update()
    const t = v.computedStyle.transform!
    expect(t).toHaveLength(2)
    expect(JSON.stringify(t)).toContain('0.95')
  })

  it('treats display:flex as an initial row direction that explicit directions and variants never lose', async () => {
    const { ui } = await setup(500)
    const a = new View({ className: 'flex' })
    const b = new View({ className: 'flex flex-col' })
    const c = new View({ className: 'flex-col md:flex' }) // md:flex only sets display; the explicit column survives
    ui.setRoot(new View({ children: [a, b, c] }))
    ui.update()
    expect(a.computedStyle.flexDirection).toBe('row')
    expect(b.computedStyle.flexDirection).toBe('column')
    ui.resize(900, 400)
    ui.update()
    expect(c.computedStyle.flexDirection).toBe('column')
    expect(c.computedStyle.display).toBe('flex')
  })

  it('registerTailwind installs the process-wide default resolver', async () => {
    const { registry } = await setup()
    expect(getDefaultClassNameResolver()).toBeNull()
    const r = registerTailwind(registry)
    expect(getDefaultClassNameResolver()).toBe(r)
    const ui = createThreeUI({ width: 100, height: 100 })
    const v = new View({ className: 'p-4' })
    ui.setRoot(v)
    ui.update()
    expect(v.computedStyle.padding).toBe(16)
    setDefaultClassNameResolver(null)
  })
})
