import { describe, expect, it } from 'vitest'
import { compileTailwind, cssToRegistry } from '../src/compiler'
import { evalCalc, parseCssColor, resolveVars, rgbaToHex, toLength } from '../src/css/values'
import { parseCss, unescapeCssIdent } from '../src/css/parse'

const CSS = `@import "tailwindcss";
@theme { --color-primary: #6d5dfc; --spacing: 4px; --font-ui: Inter; }`

async function compileTokens(tokens: string[], css = CSS) {
  return compileTailwind({ css, base: import.meta.dirname, candidates: tokens })
}

const styleOf = (registry: { rules: { token: string; style: object; when?: unknown }[] }, token: string) => registry.rules.find((r) => r.token === token && !r.when)?.style

describe('css helpers', () => {
  it('parses nested CSS, strings and escapes', () => {
    const ast = parseCss(`@layer utilities { .a\\:b\\/c { color: red; @media (width >= 40rem) { margin: 1px } } } /* c */ @property --x { syntax: "*"; initial-value: 0 }`)
    expect(ast).toHaveLength(2)
    expect(unescapeCssIdent('hover\\:bg-white\\/50')).toBe('hover:bg-white/50')
  })

  it('evaluates calc() with px, %, rem and unitless math', () => {
    expect(evalCalc('calc(4px * 4)')).toEqual({ value: 16, unit: 'px' })
    expect(evalCalc('calc(1 / 2 * 100%)')).toEqual({ value: 50, unit: '%' })
    expect(evalCalc('calc(0.25rem * -2)')).toEqual({ value: -8, unit: 'px' })
    expect(evalCalc('calc(1.75 / 1.125)')?.value).toBeCloseTo(1.5556, 3)
    expect(evalCalc('calc(100% - 10px)')).toBeNull() // mixed units can't be resolved statically
    expect(toLength('calc(infinity * 1px)')).toBe(1e9)
  })

  it('resolves var() chains, fallbacks and local overrides', () => {
    const g = new Map([['--a', 'var(--b)'], ['--b', '12px']])
    expect(resolveVars('calc(var(--a) * 2)', new Map(), g)).toBe('calc(12px * 2)')
    expect(resolveVars('var(--missing, 3px)', new Map(), g)).toBe('3px')
    expect(resolveVars('var(--missing)', new Map(), g)).toBeNull()
    expect(resolveVars('var(--a)', new Map([['--a', '1px']]), g)).toBe('1px')
  })

  it('converts oklch / color-mix / hsl / hex colors to sRGB', () => {
    expect(rgbaToHex(parseCssColor('oklch(63.7% 0.237 25.331)')!)).toBe('#fb2c36') // tailwind red-500
    expect(rgbaToHex(parseCssColor('oklch(14.1% 0.005 285.823)')!)).toBe('#09090b') // zinc-950
    expect(rgbaToHex(parseCssColor('color-mix(in oklab, #fff 50%, transparent)')!)).toBe('#ffffff80')
    expect(rgbaToHex(parseCssColor('oklch(98.5% 0 none)')!)).toBe('#fafafa') // zinc-50: `none` hue
    expect(rgbaToHex(parseCssColor('hsl(120 100% 50%)')!)).toBe('#00ff00')
    expect(rgbaToHex(parseCssColor('#abc')!)).toBe('#aabbcc')
    expect(parseCssColor('currentcolor')).toBeNull()
  })
})

describe('Tailwind v4 → registry', () => {
  it('compiles the required layout / paint / text utilities to style data', async () => {
    const { registry, warnings } = await compileTokens([
      'flex', 'flex-row', 'flex-col', 'flex-1', 'grow', 'shrink', 'items-center', 'justify-between', 'self-end', 'gap-4', 'gap-x-2', 'size-10', 'w-1/2', 'h-full', 'min-w-0', 'max-h-20',
      'p-4', 'px-2', 'pt-1', 'm-2', 'mx-auto', '-mt-2', 'absolute', 'relative', 'inset-0', 'top-2', 'aspect-video', 'bg-zinc-950', 'bg-primary', 'bg-white/50', 'opacity-50',
      'border', 'border-2', 'border-red-500', 'rounded-xl', 'rounded-full', 'overflow-hidden', 'text-white', 'text-lg', 'text-3xl', 'font-bold', 'leading-tight', 'tracking-tight', 'text-center', 'italic', 'hidden',
    ])
    const s = (t: string) => styleOf(registry, t)
    expect(s('flex')).toEqual({ display: 'flex' })
    expect(registry.rules.find((r) => r.token === 'flex')!.defaults).toEqual({ flexDirection: 'row' })
    expect(s('flex-col')).toEqual({ flexDirection: 'column' })
    expect(s('flex-1')).toEqual({ flex: 1 })
    expect(s('grow')).toMatchObject({ flexGrow: 1 })
    expect(s('items-center')).toEqual({ alignItems: 'center' })
    expect(s('justify-between')).toEqual({ justifyContent: 'space-between' })
    expect(s('self-end')).toEqual({ alignSelf: 'flex-end' })
    expect(s('gap-4')).toEqual({ gap: 16 }) // theme --spacing: 4px
    expect(s('gap-x-2')).toEqual({ columnGap: 8 })
    expect(s('size-10')).toEqual({ width: 40, height: 40 })
    expect(s('w-1/2')).toEqual({ width: '50%' })
    expect(s('p-4')).toEqual({ padding: 16 })
    expect(s('px-2')).toMatchObject({ paddingLeft: 8, paddingRight: 8 })
    expect(s('-mt-2')).toEqual({ marginTop: -8 })
    expect(s('inset-0')).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    expect(s('aspect-video')).toEqual({ aspectRatio: 16 / 9 })
    expect(s('bg-zinc-950')).toEqual({ backgroundColor: '#09090b' })
    expect(s('bg-primary')).toEqual({ backgroundColor: '#6d5dfc' }) // CSS-first @theme color
    expect(s('bg-white/50')).toEqual({ backgroundColor: '#ffffff80' })
    expect(s('opacity-50')).toEqual({ opacity: 0.5 })
    expect(s('border')).toEqual({ borderWidth: 1 })
    expect(s('border-red-500')).toEqual({ borderColor: '#fb2c36' })
    expect(s('rounded-xl')).toEqual({ borderRadius: 12 })
    expect(s('rounded-full')).toEqual({ borderRadius: 9999 })
    expect(s('overflow-hidden')).toEqual({ overflow: 'hidden' })
    expect(s('text-white')).toEqual({ color: '#ffffff' })
    expect(s('text-lg')).toMatchObject({ fontSize: 18, lineHeight: '1.5556em' })
    expect(s('font-bold')).toEqual({ fontWeight: 700 })
    expect(s('leading-tight')).toEqual({ lineHeight: '1.25em' })
    expect(s('tracking-tight')).toEqual({ letterSpacing: '-0.025em' })
    expect(s('text-center')).toEqual({ textAlign: 'center' })
    expect(s('italic')).toEqual({ fontStyle: 'italic' })
    expect(s('hidden')).toEqual({ display: 'none' })
    expect(warnings.filter((w) => !/mx-auto/.test(w))).toEqual([])
    expect(registry.vars['--color-primary']).toBe('#6d5dfc')
    expect(registry.vars['--spacing']).toBe('4px')
  })

  it('emits state, dark and responsive variants as conditions', async () => {
    const { registry } = await compileTokens(['hover:bg-zinc-800', 'active:scale-95', 'focus:bg-primary', 'disabled:opacity-40', 'dark:bg-black', 'sm:p-8', 'md:flex-col', 'max-md:hidden'])
    const when = (t: string) => registry.rules.find((r) => r.token === t)?.when
    expect(when('hover:bg-zinc-800')).toEqual([{ state: 'hover' }])
    expect(when('active:scale-95')).toEqual([{ state: 'active' }])
    expect(when('focus:bg-primary')).toEqual([{ state: 'focus' }])
    expect(when('disabled:opacity-40')).toEqual([{ state: 'disabled' }])
    expect(when('dark:bg-black')).toEqual([{ scheme: 'dark' }])
    expect(when('sm:p-8')).toEqual([{ minWidth: 640 }])
    expect(when('md:flex-col')).toEqual([{ minWidth: 768 }])
    expect(when('max-md:hidden')).toEqual([{ maxWidth: 768 }])
    expect(registry.rules.find((r) => r.token === 'active:scale-95')!.style).toEqual({ transform: [{ scale: 0.95 }] })
  })

  it('warns for unsupported utilities instead of emitting nonsense', async () => {
    const { registry, warnings } = await compileTokens(['grid', 'shadow-md', 'space-x-4', 'group-hover:bg-white', 'first:p-2', 'rounded-t-lg', 'uppercase', 'p-4'])
    const text = warnings.join('\n')
    expect(text).toMatch(/"grid".*display/)
    expect(text).toMatch(/"shadow-md".*box-shadow/)
    expect(text).toMatch(/space-x-4/)
    expect(text).toMatch(/group-hover/)
    expect(text).toMatch(/first:p-2|pseudo-class :first-child/)
    expect(text).toMatch(/rounded-t-lg/)
    expect(text).toMatch(/uppercase.*text-transform/)
    expect(registry.rules.map((r) => r.token)).toEqual(['p-4'])
  })

  it('preserves Tailwind rule ordering deterministically', async () => {
    const tokens = ['p-4', 'bg-red-500', 'hover:bg-blue-500', 'flex', 'md:p-8', 'p-2']
    const a = await compileTokens(tokens)
    const b = await compileTokens([...tokens].reverse())
    expect(JSON.stringify(a.registry)).toBe(JSON.stringify(b.registry)) // candidate order is irrelevant
    const order = (t: string) => a.registry.rules.find((r) => r.token === t)!.order
    expect(order('hover:bg-blue-500')).toBeGreaterThan(order('bg-red-500')) // variants sort after base utilities
    expect(order('md:p-8')).toBeGreaterThan(order('p-4'))
    // conflicting utilities: p-4 vs p-2 follow Tailwind's order (here by value), not class-string order
    expect(order('p-4')).toBeGreaterThan(order('p-2'))
  })

  it('maps important utilities to the highest priority', () => {
    const { registry } = cssToRegistry('@layer utilities { .a { padding: 1px } .b { padding: 2px !important } .c { padding: 3px } }')
    const o = (t: string) => registry.rules.find((r) => r.token === t)!.order
    expect(o('b')).toBeGreaterThan(o('c'))
  })
})
