import { describe, expect, it } from 'vitest'
import { Text, View } from '../src'
import { makeUI } from './helpers'

describe('UI layout', () => {
  it('lays out flex rows/columns and fills the viewport through the internal root', () => {
    const ui = makeUI({ width: 400, height: 300 })
    const a = new View({ style: { width: 100, height: 50 } })
    const b = new View({ style: { flex: 1 } })
    const root = new View({ style: { flex: 1, flexDirection: 'row', padding: 10, gap: 10 }, children: [a, b] })
    ui.setRoot(root)
    ui.update()
    expect(root.layout).toMatchObject({ x: 0, y: 0, width: 400, height: 300 })
    expect(a.layout).toMatchObject({ x: 10, y: 10, width: 100, height: 50 })
    expect(b.layout).toMatchObject({ x: 120, y: 10, width: 270, height: 280 })
  })

  it('re-lays out on resize and keeps logical layout independent of pixel ratio', () => {
    const ui = makeUI({ width: 400, height: 300, pixelRatio: 1 })
    const child = new View({ style: { width: '50%', height: 20 } })
    ui.setRoot(new View({ style: { flex: 1 }, children: [child] }))
    ui.update()
    expect(child.layout.width).toBe(200)
    ui.resize(600, 300, 2)
    ui.update()
    expect(child.layout.width).toBe(300)
    ui.resize(600, 300, 3)
    ui.update()
    expect(child.layout.width).toBe(300)
  })

  it('measures text deterministically and wraps to the available width', () => {
    const ui = makeUI({ width: 300, height: 300 })
    const long = 'The quick brown fox jumps over the lazy dog and keeps running'
    const t = new Text({ text: long, style: { fontSize: 16 } })
    const single = new Text({ text: 'Hello', style: { fontSize: 16 } })
    ui.setRoot(new View({ style: { flex: 1, alignItems: 'flex-start' }, children: [t, single] }))
    ui.update()
    // wrapped: width never exceeds the container, height is a whole number of lines
    expect(t.layout.width).toBeLessThanOrEqual(300)
    const face = ui.fonts.resolve('system-ui', 400, 'normal')!
    const lineHeight = (face.canonical.data.lineHeight * 16) / face.canonical.size
    expect(single.layout.height).toBeGreaterThanOrEqual(lineHeight)
    const lines = Math.round(t.layout.height / lineHeight)
    expect(lines).toBeGreaterThanOrEqual(2)
    expect(Math.abs(t.layout.height - lines * lineHeight)).toBeLessThan(1) // whole lines (± pixel rounding)
    // identical inputs → identical results (cache hits)
    const misses = ui.textLayouts.misses
    ui.resize(300, 301)
    ui.update()
    expect(ui.textLayouts.misses).toBe(misses)
  })

  it('text size follows inherited fontSize and fontWeight', () => {
    const ui = makeUI()
    const small = new Text({ text: 'Inherited fonts inherit' })
    const big = new Text({ text: 'Inherited fonts inherit', style: { fontSize: 32 } })
    const bold = new Text({ text: 'Inherited fonts inherit', style: { fontWeight: 700 } })
    ui.setRoot(new View({ style: { fontSize: 16, alignItems: 'flex-start' }, children: [small, big, bold] }))
    ui.update()
    expect(small.computedStyle.fontSize).toBe(16)
    expect(big.layout.width / small.layout.width).toBeCloseTo(2, 1)
    expect(bold.layout.width).toBeGreaterThan(small.layout.width) // bold face is wider
  })

  it('changing text re-measures; changing paint props does not', () => {
    const ui = makeUI()
    const t = new Text({ text: 'a', style: { alignSelf: 'flex-start' } })
    ui.setRoot(new View({ children: [t] }))
    ui.update()
    const w1 = t.layout.width
    t.setText('a much longer string')
    ui.update()
    expect(t.layout.width).toBeGreaterThan(w1 * 3)
    const passes = ui.stats.layoutPasses
    t.setStyle({ alignSelf: 'flex-start', color: '#f00' })
    ui.update()
    expect(ui.stats.layoutPasses).toBe(passes)
  })
})

describe('tree invariants', () => {
  it('rejects duplicate parents, cycles and children of leaf nodes', () => {
    const a = new View()
    const b = new View()
    const c = new View()
    a.append(c)
    expect(() => b.append(c)).toThrow(/duplicate parent/)
    expect(() => c.append(a)).toThrow(/cyclic/)
    expect(() => new Text({ text: 'x' }).append(new View())).toThrow(/cannot have children/)
  })

  it('frees Yoga nodes on dispose and rejects use afterwards', () => {
    const parent = new View()
    const child = new View()
    parent.append(child)
    parent.dispose()
    parent.dispose()
    expect(child.isDisposed).toBe(true)
    expect(() => parent.append(new View())).toThrow(/disposed/)
  })

  it('keeps Yoga child order in sync with insert/remove/reorder', () => {
    const ui = makeUI()
    const [a, b, c] = [new View({ style: { height: 10 } }), new View({ style: { height: 20 } }), new View({ style: { height: 30 } })]
    const root = new View({ children: [a, b, c] })
    ui.setRoot(root)
    ui.update()
    expect([a, b, c].map((n) => n.layout.y)).toEqual([0, 10, 30])
    root.insert(c, 0) // move c to the front
    ui.update()
    expect([c, a, b].map((n) => n.layout.y)).toEqual([0, 30, 40])
    root.remove(a)
    ui.update()
    expect(b.layout.y).toBe(30)
    expect(a.parent).toBeNull()
    a.dispose()
  })
})
