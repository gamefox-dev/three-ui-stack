import { describe, expect, it, vi } from 'vitest'
import { DEP_HOVER, Text, View, computeStyle, normalizeStyle, setDefaultClassNameResolver, type ClassNameResolver } from '../src'
import { resetWarnings } from '../src/dev'
import { makeUI } from './helpers'

const layer = (s: object) => normalizeStyle(s as never)

describe('style cascade', () => {
  it('locks precedence: component defaults < inherited < theme < className < style', () => {
    const parent = computeStyle([layer({ color: '#ff0000', fontSize: 20 })], null, undefined)
    const child = computeStyle([layer({ color: '#00ff00' }), layer({ color: '#0000ff', fontSize: 30 }), layer({ color: '#ffffff' })], parent, { color: '#123456', fontSize: 11, padding: 4 })
    expect(child.color.toHex()).toBe('#ffffff') // direct style beats className beats theme
    expect(child.fontSize).toBe(30)
    expect(child.padding).toBe(4) // component default applies to non-inherited props
    const plain = computeStyle([], parent, { color: '#123456', fontSize: 11 })
    expect(plain.color.toHex()).toBe('#ff0000') // inherited beats component defaults
    expect(plain.fontSize).toBe(20)
  })

  it('inherits text properties but never layout spacing or size', () => {
    const parent = computeStyle([layer({ color: '#fff', fontFamily: 'Inter', padding: 12, width: 100, backgroundColor: '#f00' })], null, undefined)
    const child = computeStyle([], parent, undefined)
    expect(child.fontFamily).toBe('Inter')
    expect(child.color.toHex()).toBe('#ffffff')
    expect(child.padding).toBeUndefined()
    expect(child.width).toBeUndefined()
    expect(child.backgroundColor.a).toBe(0)
  })

  it('normalizes flex shorthands and font weights', () => {
    expect(normalizeStyle({ flex: 1 })).toMatchObject({ flexGrow: 1, flexShrink: 1, flexBasis: 0 })
    expect(normalizeStyle({ flex: 'none' })).toMatchObject({ flexGrow: 0, flexShrink: 0, flexBasis: 'auto' })
    expect(normalizeStyle({ flex: '2 1 10%' })).toMatchObject({ flexGrow: 2, flexShrink: 1, flexBasis: '10%' })
    expect(computeStyle([layer({ fontWeight: 'bold' })], null, undefined).fontWeight).toBe(700)
    expect(computeStyle([layer({ fontWeight: '600' })], null, undefined).fontWeight).toBe(600)
  })

  it('applies style arrays in order (later wins)', () => {
    const ui = makeUI()
    const v = new View({ style: [{ padding: 4 }, null, false, { padding: 9 }] })
    ui.setRoot(v)
    ui.update()
    expect(v.computedStyle.padding).toBe(9)
  })
})

describe('className resolution', () => {
  const resolver: ClassNameResolver = {
    resolve: (className, node) => ({
      style: { backgroundColor: className.includes('red') ? '#ff0000' : '#0000ff', ...(className.includes('hover:') && node.hovered ? { backgroundColor: '#00ff00' } : {}), padding: 3 },
      deps: className.includes('hover:') ? DEP_HOVER : 0,
    }),
  }

  it('resolves classNames below direct style', () => {
    const ui = makeUI({ classNameResolver: resolver })
    const v = new View({ className: 'bg-red', style: { padding: 10 } })
    ui.setRoot(v)
    ui.update()
    expect(v.computedStyle.backgroundColor.toHex()).toBe('#ff0000')
    expect(v.computedStyle.padding).toBe(10) // style prop wins over className
  })

  it('warns once in development when className is used without a resolver', () => {
    resetWarnings()
    setDefaultClassNameResolver(null)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ui = makeUI()
    ui.setRoot(new View({ className: 'p-4', children: [new View({ className: 'p-2' })] }))
    ui.update()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]![0])).toMatch(/no ClassNameResolver/)
    warn.mockRestore()
  })

  it('theme layer sits between inherited values and className', () => {
    const ui = makeUI({ classNameResolver: resolver })
    ui.setTheme({ root: { color: '#111111', fontSize: 18 }, View: { padding: 7 } })
    const t = new Text({ text: 'x' })
    const v = new View({ children: [t] })
    ui.setRoot(v)
    ui.update()
    expect(t.computedStyle.color.toHex()).toBe('#111111')
    expect(t.computedStyle.fontSize).toBe(18)
    expect(v.computedStyle.padding).toBe(7)
  })
})

describe('invalidation', () => {
  it('paint-only changes do not relayout; layout changes do; inherited changes reach descendants only', () => {
    const ui = makeUI()
    const leaf = new Text({ text: 'hello' })
    const mid = new View({ children: [leaf] })
    const sibling = new View({ style: { height: 10 } })
    const root = new View({ children: [mid, sibling], style: { color: '#fff' } })
    ui.setRoot(root)
    ui.update()
    const base = { ...ui.stats }

    root.setStyle({ color: '#fff', backgroundColor: '#123' })
    ui.update()
    expect(ui.stats.layoutPasses).toBe(base.layoutPasses) // background is paint-only
    expect(ui.stats.styleRecomputes - base.styleRecomputes).toBe(1) // color unchanged → no descendant work

    const before = ui.stats.styleRecomputes
    root.setStyle({ color: '#f00' })
    ui.update()
    expect(leaf.computedStyle.color.toHex()).toBe('#ff0000')
    expect(ui.stats.styleRecomputes - before).toBe(4) // root + mid + leaf + sibling inherit color
    expect(ui.stats.layoutPasses).toBe(base.layoutPasses) // color is not a metric

    const l0 = ui.stats.layoutPasses
    sibling.setStyle({ height: 40 })
    ui.update()
    expect(ui.stats.layoutPasses).toBe(l0 + 1)
    expect(sibling.layout.height).toBe(40)
  })

  it('hover state only recomputes styles of nodes whose class depends on it', () => {
    const resolver: ClassNameResolver = {
      resolve: (c, node) => ({ style: node.hovered ? { backgroundColor: '#0f0' } : {}, deps: c === 'h' ? DEP_HOVER : 0 }),
    }
    const ui = makeUI({ classNameResolver: resolver })
    const a = new View({ className: 'h', style: { width: 50, height: 50 } })
    const b = new View({ className: 'static', style: { width: 50, height: 50 } })
    ui.setRoot(new View({ style: { flexDirection: 'row' }, children: [a, b] }))
    ui.update()
    const layouts = ui.stats.layoutPasses
    const recomputes = ui.stats.styleRecomputes
    ui.input.pointerMove(10, 10)
    ui.update()
    expect(a.hovered).toBe(true)
    expect(a.computedStyle.backgroundColor.toHex()).toBe('#00ff00')
    expect(ui.stats.styleRecomputes - recomputes).toBe(1)
    expect(ui.stats.layoutPasses).toBe(layouts)
    expect(ui.needsRender).toBe(true)
  })

  it('environment changes invalidate only dependent nodes', () => {
    const calls: string[] = []
    const resolver: ClassNameResolver = {
      resolve: (c, _n, env) => {
        calls.push(c)
        return { style: { backgroundColor: env.colorScheme === 'dark' ? '#000' : '#fff' }, deps: c === 'dark-aware' ? 16 : 0 }
      },
    }
    const ui = makeUI({ classNameResolver: resolver })
    const a = new View({ className: 'dark-aware' })
    const b = new View({ className: 'plain' })
    ui.setRoot(new View({ children: [a, b] }))
    ui.update()
    calls.length = 0
    ui.setColorScheme('dark')
    ui.update()
    expect(calls).toEqual(['dark-aware'])
    expect(a.computedStyle.backgroundColor.toHex()).toBe('#000000')
  })
})
