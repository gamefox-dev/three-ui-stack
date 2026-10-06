import { describe, expect, it } from 'vitest'
import { View, createThreeUI } from '@implicit-invocation/three-ui'
import { compileTailwind } from '../src/compiler'
import { createTailwindResolver } from '../src/runtime'

const CSS = `@import "tailwindcss";
@theme {
  --color-primary: #6d5dfc;
  --spacing: 4px;
  --animate-wiggle: wiggle 1s ease-in-out infinite;
  @keyframes wiggle { 0%, 100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }
}`

async function setup(tokens: string[], width = 500) {
  const { registry, warnings } = await compileTailwind({ css: CSS, base: import.meta.dirname, candidates: tokens })
  const resolver = createTailwindResolver(registry)
  const ui = createThreeUI({ width, height: 400, classNameResolver: resolver })
  return { registry, warnings, resolver, ui }
}

/** Resolve a className on a fresh node and return the computed style. */
function resolveClass(ui: ReturnType<typeof createThreeUI>, className: string) {
  const v = new View({ className })
  ui.setRoot(v)
  ui.update()
  return v.computedStyle
}

describe('gradients', () => {
  const tokens = ['bg-linear-to-r', 'bg-linear-45', 'bg-radial', 'bg-radial-[at_25%_25%]', 'from-red-500', 'via-blue-500', 'to-green-500', 'from-10%', 'to-90%', 'bg-[linear-gradient(135deg,#f00_0%,#00f_100%)]', 'bg-none']

  it('builds stops from from-/via-/to- utilities for bg-linear-* and keeps the oklab interpolation space', async () => {
    const { ui, warnings } = await setup(tokens)
    expect(warnings.filter((w) => /gradient|bg-/.test(w))).toEqual([])
    const g = resolveClass(ui, 'bg-linear-to-r from-red-500 via-blue-500 to-green-500').backgroundGradient!
    expect(g.type).toBe('linear')
    if (g.type !== 'linear') throw new Error('unreachable')
    expect(g.angle).toBe('to right')
    expect(g.colorSpace).toBe('oklab')
    expect(g.stops.map((s) => s.color.toHex())).toEqual(['#fb2c36', '#2b7fff', '#00c950'])
    expect(g.stops.every((s) => s.position === undefined)).toBe(true) // evenly spaced (0% / 50% / 100%) unless from-10% etc.
  })

  it('applies explicit positions, angles and radial positions', async () => {
    const { ui } = await setup(tokens)
    const g = resolveClass(ui, 'bg-linear-45 from-red-500 from-10% to-green-500 to-90%').backgroundGradient!
    if (g.type !== 'linear') throw new Error('expected linear')
    expect(g.angle).toBe(45)
    expect(g.stops.map((s) => s.position)).toEqual(['10%', '90%'])
    const r = resolveClass(ui, 'bg-radial-[at_25%_25%] from-red-500 to-green-500').backgroundGradient!
    if (r.type !== 'radial') throw new Error('expected radial')
    expect(r.at).toEqual(['25%', '25%'])
  })

  it('parses arbitrary gradients with explicit stops and ignores helpers', async () => {
    const { ui } = await setup(tokens)
    const g = resolveClass(ui, 'bg-[linear-gradient(135deg,#f00_0%,#00f_100%)]').backgroundGradient!
    if (g.type !== 'linear') throw new Error('expected linear')
    expect(g.colorSpace).toBe('srgb') // CSS default when `in <space>` is absent
    expect(g.stops.map((s) => [s.color.toHex(), s.position])).toEqual([['#ff0000', '0%'], ['#0000ff', '100%']])
  })

  it('bg-none clears the gradient and a gradient without stops paints nothing', async () => {
    const { ui } = await setup(tokens)
    expect(resolveClass(ui, 'bg-linear-to-r from-red-500 to-green-500 bg-none').backgroundGradient).toBeUndefined()
    expect(resolveClass(ui, 'bg-linear-to-r').backgroundGradient).toBeUndefined()
  })
})

describe('shadows, rings, insets', () => {
  const tokens = [
    'shadow-lg', 'shadow-red-500', 'shadow-red-500/50', 'shadow-[0_4px_0_#000]', 'shadow-none', 'ring-2', 'ring', 'ring-blue-500', 'ring-offset-2', 'ring-offset-white', 'ring-inset',
    'inset-shadow-sm', 'inset-shadow-indigo-500', 'inset-ring-2', 'inset-ring-white/10', 'shadow-xl/30', 'text-white', 'hover:shadow-xl', 'text-shadow-lg', 'text-shadow-red-500',
    'drop-shadow-lg', 'drop-shadow-red-500', 'drop-shadow-none', '[box-shadow:0_0_10px_red]',
  ]

  it('shadow-lg composes the two real layers with Tailwind\'s default alpha', async () => {
    const { ui } = await setup(tokens)
    const s = resolveClass(ui, 'shadow-lg').boxShadow
    expect(s.map((l) => [l.offsetX, l.offsetY, l.blur, l.spread, l.inset])).toEqual([
      [0, 10, 15, -3, false],
      [0, 4, 6, -4, false],
    ])
    expect(s[0]!.color.a).toBeCloseTo(0.1, 2)
  })

  it('color utilities recolor every layer; opacity modifiers and arbitrary colors work', async () => {
    const { ui } = await setup(tokens)
    const red = resolveClass(ui, 'shadow-lg shadow-red-500').boxShadow
    expect(red.map((l) => l.color.toHex())).toEqual(['#fb2c36', '#fb2c36'])
    const half = resolveClass(ui, 'shadow-lg shadow-red-500/50').boxShadow
    expect(half[0]!.color.a).toBeCloseTo(0.5, 2)
    const hard = resolveClass(ui, 'shadow-[0_4px_0_#000]').boxShadow
    expect(hard).toHaveLength(1)
    expect(hard[0]).toMatchObject({ offsetX: 0, offsetY: 4, blur: 0, spread: 0 })
    expect(hard[0]!.color.toHex()).toBe('#000000')
    expect(resolveClass(ui, 'shadow-lg shadow-none').boxShadow).toEqual([])
  })

  it('ring-N paints a spread-only layer in the ring color (default currentColor) and ring-offset adds the gap layer', async () => {
    const { ui } = await setup(tokens)
    const plain = resolveClass(ui, 'ring-2').boxShadow
    expect(plain).toHaveLength(1)
    expect(plain[0]).toMatchObject({ offsetX: 0, offsetY: 0, blur: 0, spread: 2, inset: false, currentColor: true })
    const blue = resolveClass(ui, 'ring-2 ring-blue-500').boxShadow
    expect(blue[0]!.color.toHex()).toBe('#2b7fff')
    expect(blue[0]!.currentColor).toBe(false)
    const offset = resolveClass(ui, 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white').boxShadow
    // CSS order: ring-offset (painted under the ring) comes before ring, ring spread includes the offset width
    expect(offset.map((l) => [l.spread, l.color.toHex()])).toEqual([
      [2, '#ffffff'],
      [4, '#2b7fff'],
    ])
    expect(resolveClass(ui, 'ring-2 ring-inset').boxShadow[0]!.inset).toBe(true)
  })

  it('stacks inset-shadow, inset-ring, ring and shadow in CSS order (first = top-most)', async () => {
    const { ui } = await setup(tokens)
    const s = resolveClass(ui, 'shadow-lg ring-2 ring-blue-500 inset-shadow-sm inset-ring-2 inset-ring-white/10').boxShadow
    expect(s.map((l) => (l.inset ? 'inset' : 'outer') + ':' + l.spread)).toEqual(['inset:0', 'inset:2', 'outer:2', 'outer:-3', 'outer:-4'])
    expect(s[1]!.color.a).toBeCloseTo(0.1, 2)
    expect(s[0]!.color.a).toBeCloseTo(0.05, 2)
  })

  it('resolves hover: shadows and arbitrary [box-shadow:…] properties', async () => {
    const { ui } = await setup(tokens)
    expect(resolveClass(ui, '[box-shadow:0_0_10px_red]').boxShadow[0]).toMatchObject({ blur: 10, offsetX: 0 })
    const v = new View({ className: 'shadow-lg hover:shadow-xl' })
    ui.setRoot(v)
    ui.update()
    const before = v.computedStyle.boxShadow[0]!.offsetY
    v._setState(1, true) // hover
    ui.update()
    expect(v.computedStyle.boxShadow[0]!.offsetY).toBeGreaterThan(before)
  })

  it('text-shadow and drop-shadow compose like their box counterparts', async () => {
    const { ui } = await setup(tokens)
    const t = resolveClass(ui, 'text-shadow-lg').textShadow
    expect(t).toHaveLength(3)
    expect(t[2]).toMatchObject({ offsetY: 4, blur: 8 })
    expect(resolveClass(ui, 'text-shadow-lg text-shadow-red-500').textShadow.every((l) => l.color.toHex() === '#fb2c36')).toBe(true)
    const d = resolveClass(ui, 'drop-shadow-lg').dropShadow
    expect(d[0]).toMatchObject({ offsetY: 4, blur: 4 })
    expect(resolveClass(ui, 'drop-shadow-lg drop-shadow-red-500').dropShadow[0]!.color.toHex()).toBe('#fb2c36')
    expect(resolveClass(ui, 'drop-shadow-lg drop-shadow-none').dropShadow).toEqual([])
  })
})

describe('text, image and misc utilities', () => {
  it('maps text stroke arbitrary properties, paint-order, ellipsis and line clamp', async () => {
    const { ui, warnings } = await setup(['[-webkit-text-stroke:3px_#123456]', '[paint-order:stroke_fill]', 'truncate', 'line-clamp-2', 'text-ellipsis', 'whitespace-nowrap', 'object-cover', 'object-contain', 'object-fill', 'object-none', 'object-scale-down'])
    expect(warnings.filter((w) => /webkit|paint-order|clamp|object|ellipsis|nowrap/.test(w))).toEqual([])
    const s = resolveClass(ui, '[-webkit-text-stroke:3px_#123456] [paint-order:stroke_fill]')
    expect(s.textStrokeWidth).toBe(3)
    expect(s.textStrokeColor!.toHex()).toBe('#123456')
    expect(s.paintOrder).toBe('stroke')
    const t = resolveClass(ui, 'truncate')
    expect(t.whiteSpace).toBe('nowrap')
    expect(t.textOverflow).toBe('ellipsis')
    expect(t.overflow).toBe('hidden')
    expect(resolveClass(ui, 'line-clamp-2').numberOfLines).toBe(2)
    expect(resolveClass(ui, 'object-cover').objectFit).toBe('cover')
    expect(resolveClass(ui, 'object-scale-down').objectFit).toBe('scale-down')
  })

  it('maps backdrop utilities and per-corner radii', async () => {
    const { ui } = await setup(['backdrop-blur-md', 'backdrop-brightness-50', 'backdrop-saturate-150', 'backdrop-blur-none', 'rounded-t-xl', 'rounded-tl-none', 'rounded-full', 'rounded-lg'])
    const b = resolveClass(ui, 'backdrop-blur-md backdrop-brightness-50 backdrop-saturate-150')
    expect(b.backdropBlur).toBe(12)
    expect(b.backdropBrightness).toBe(0.5)
    expect(b.backdropSaturate).toBe(1.5)
    expect(resolveClass(ui, 'backdrop-blur-md backdrop-blur-none').backdropBlur).toBe(0)
    const r = resolveClass(ui, 'rounded-t-xl')
    expect([r.borderTopLeftRadius, r.borderTopRightRadius, r.borderBottomRightRadius]).toEqual([12, 12, undefined])
    expect(resolveClass(ui, 'rounded-lg rounded-tl-none').borderTopLeftRadius).toBe(0)
  })
})

describe('transforms', () => {
  it('translate utilities accept percentages of the node size, composed with scale and rotate', async () => {
    const { ui, warnings } = await setup(['-translate-x-1/2', 'translate-y-4', 'scale-110', 'rotate-12', '-translate-y-full'])
    expect(warnings.filter((w) => /translate/.test(w))).toEqual([])
    expect(resolveClass(ui, '-translate-x-1/2 translate-y-4').transform).toEqual([{ translateX: '-50%' }, { translateY: 16 }])
    expect(resolveClass(ui, '-translate-y-full scale-110').transform).toEqual([{ translateY: '-100%' }, { scale: 1.1 }])
  })
})

describe('animation and transition utilities', () => {
  const tokens = [
    'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce', 'animate-wiggle', 'animate-[spin_2s_linear_infinite]', 'animate-none',
    'transition', 'transition-colors', 'transition-all', 'transition-opacity', 'transition-transform', 'transition-none', 'transition-[width,height]',
    'duration-300', 'ease-out', 'ease-in-out', 'delay-150', 'ease-[cubic-bezier(.2,.8,.2,1)]', 'duration-[2s]',
    'motion-reduce:animate-none', 'motion-safe:animate-spin', 'hover:scale-110', '[--ui-animate-layout:1]',
  ]

  it('compiles built-in and custom @keyframes into the registry', async () => {
    const { registry, resolver, warnings } = await setup(tokens)
    expect(warnings.filter((w) => /keyframes|animate|transition/i.test(w))).toEqual([])
    expect(Object.keys(registry.keyframes ?? {}).sort()).toEqual(['bounce', 'ping', 'pulse', 'spin', 'wiggle'])
    const bounce = resolver.keyframes('bounce') as readonly Record<string, unknown>[]
    expect(bounce.map((k) => k.offset)).toEqual([0, 0.5, 1])
    expect(bounce[0]).toMatchObject({ easing: 'cubic-bezier(0.8,0,1,1)', transform: [{ translateY: '-25%' }] })
    expect(bounce[1]).toMatchObject({ transform: [] })
    expect(resolver.keyframes('ping')).toEqual([{ offset: 0.75, transform: [{ scale: 2 }], opacity: 0 }, { offset: 1, transform: [{ scale: 2 }], opacity: 0 }])
  })

  it('animate-* resolves to animation specs; animate-none clears; motion-reduce overrides by media flag', async () => {
    const { ui } = await setup(tokens)
    expect(resolveClass(ui, 'animate-spin').animation).toEqual([{ name: 'spin', duration: 1000, easing: 'linear', iterations: 'infinite' }])
    expect(resolveClass(ui, 'animate-[spin_2s_linear_infinite]').animation[0]).toMatchObject({ name: 'spin', duration: 2000 })
    expect(resolveClass(ui, 'animate-wiggle').animation[0]).toMatchObject({ name: 'wiggle', easing: 'ease-in-out' })
    expect(resolveClass(ui, 'animate-spin motion-reduce:animate-none').animation).toHaveLength(1)
    ui.setMediaFlags({ reducedMotion: true })
    expect(resolveClass(ui, 'animate-spin motion-reduce:animate-none').animation).toHaveLength(0)
    expect(resolveClass(ui, 'motion-safe:animate-spin').animation).toHaveLength(0)
    ui.setMediaFlags({ reducedMotion: false })
    expect(resolveClass(ui, 'motion-safe:animate-spin').animation).toHaveLength(1)
  })

  it('transition-* / duration-* / ease-* / delay-* compose into per-property transitions', async () => {
    const { ui } = await setup(tokens)
    const t = resolveClass(ui, 'transition-colors duration-300 ease-out delay-150').transition
    expect(t.map((x) => x.property)).toEqual(['color', 'backgroundColor', 'borderColor', 'backgroundGradient'])
    expect(t[0]).toMatchObject({ duration: 300, delay: 150, easing: 'cubic-bezier(0,0,0.2,1)' })
    const dflt = resolveClass(ui, 'transition-opacity').transition
    expect(dflt).toEqual([{ property: 'opacity', duration: 150, delay: 0, easing: 'cubic-bezier(0.4,0,0.2,1)' }])
    expect(resolveClass(ui, 'transition-opacity transition-none').transition).toEqual([])
    expect(resolveClass(ui, 'transition-[width,height] duration-[2s]').transition.map((x) => [x.property, x.duration])).toEqual([['width', 2000], ['height', 2000]])
    expect(resolveClass(ui, 'transition-transform').transition.map((x) => x.property)).toEqual(['transform'])
    expect(resolveClass(ui, '[--ui-animate-layout:1]').animationLayout).toBe(true)
  })
})
