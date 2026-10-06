import { describe, expect, it } from 'vitest'
import { ScrollView, Text, View, type UIEvent } from '../src'
import { makeUI } from './helpers'

function setup() {
  const ui = makeUI({ width: 400, height: 300 })
  const log: string[] = []
  const rec = (name: string) => (e: UIEvent) => log.push(`${name}:${e.phase}`)
  const inner = new View({ name: 'inner', style: { width: 100, height: 100 } })
  const outer = new View({ name: 'outer', style: { padding: 20, alignSelf: 'flex-start' }, children: [inner] })
  const root = new View({ name: 'root', style: { flex: 1 }, children: [outer] })
  ui.setRoot(root)
  ui.update()
  return { ui, root, outer, inner, log, rec }
}

describe('event dispatch', () => {
  it('runs capture → target → bubble and honors stopPropagation', () => {
    const { ui, root, outer, inner, log, rec } = setup()
    for (const [n, name] of [[root, 'root'], [outer, 'outer'], [inner, 'inner']] as const) {
      n.addEventListener('pointerdown', rec(`${name}-capture`), true)
      n.addEventListener('pointerdown', rec(`${name}-bubble`))
    }
    ui.input.pointerDown(50, 50)
    expect(log).toEqual(['root-capture:capture', 'outer-capture:capture', 'inner-capture:target', 'inner-bubble:target', 'outer-bubble:bubble', 'root-bubble:bubble'])

    log.length = 0
    outer.addEventListener('pointerup', (e) => e.stopPropagation())
    root.addEventListener('pointerup', rec('root'))
    ui.input.pointerUp(50, 50)
    expect(log).not.toContain('root:bubble')
  })

  it('hit tests deepest node, honoring z-index and pointer-events', () => {
    const ui = makeUI()
    const a = new View({ name: 'a', style: { position: 'absolute', left: 0, top: 0, width: 100, height: 100 } })
    const b = new View({ name: 'b', style: { position: 'absolute', left: 0, top: 0, width: 100, height: 100, zIndex: -1 } })
    const c = new View({ name: 'c', style: { position: 'absolute', left: 0, top: 0, width: 100, height: 100, pointerEvents: 'none' } })
    ui.setRoot(new View({ style: { flex: 1 }, children: [a, b, c] }))
    ui.update()
    expect(ui.hitTest(10, 10)).toBe(a) // c ignores pointers, b is behind a (zIndex −1)
    expect(ui.hitTest(150, 150)).toBe(ui.root)
    expect(ui.hitTest(-5, 10)).toBeNull()
  })

  it('tracks hover and pressed state and fires enter/leave without bubbling', () => {
    const { ui, outer, inner } = setup()
    const log: string[] = []
    outer.addEventListener('pointerenter', () => log.push('outer-enter'))
    outer.addEventListener('pointerleave', () => log.push('outer-leave'))
    inner.addEventListener('pointerenter', () => log.push('inner-enter'))
    ui.input.pointerMove(50, 50)
    expect(inner.hovered && outer.hovered).toBe(true)
    expect(log).toEqual(['outer-enter', 'inner-enter'])
    ui.input.pointerDown(50, 50)
    expect(inner.pressed && outer.pressed).toBe(true)
    ui.input.pointerUp(50, 50)
    expect(inner.pressed).toBe(false)
    ui.input.pointerMove(380, 280)
    expect(inner.hovered).toBe(false)
    expect(log.at(-1)).toBe('outer-leave')
  })

  it('dispatches click to the common ancestor of press and release targets', () => {
    const ui = makeUI()
    const a = new View({ name: 'a', style: { width: 100, height: 100 } })
    const b = new View({ name: 'b', style: { width: 100, height: 100 } })
    const row = new View({ name: 'row', style: { flexDirection: 'row' }, children: [a, b] })
    ui.setRoot(row)
    ui.update()
    const clicks: string[] = []
    for (const n of [a, b, row]) n.addEventListener('click', () => clicks.push(n.name!))
    ui.input.pointerDown(10, 10)
    ui.input.pointerUp(10, 10)
    expect(clicks).toEqual(['a', 'row']) // bubbles
    clicks.length = 0
    ui.input.pointerDown(10, 10)
    ui.input.pointerUp(150, 10)
    expect(clicks).toEqual(['row']) // pressed on a, released on b → common ancestor only
  })

  it('routes events to a node with pointer capture', () => {
    const { ui, inner, root } = setup()
    const got: string[] = []
    inner.addEventListener('pointermove', () => got.push('inner'))
    root.addEventListener('pointermove', () => got.push('root'))
    ui.input.pointerDown(50, 50)
    ui.input.setPointerCapture(1, inner)
    ui.input.pointerMove(380, 280) // far outside inner
    expect(got).toEqual(['inner', 'root']) // target is the captured node, still bubbles
    ui.input.releasePointerCapture(1, inner)
    got.length = 0
    ui.input.pointerMove(380, 280)
    expect(got).toEqual(['root'])
  })

  it('ignores disabled subtrees: no events, no hover/active state', () => {
    const { ui, outer, inner } = setup()
    let hits = 0
    inner.addEventListener('pointerdown', () => hits++)
    outer.setDisabled(true)
    expect(ui.input.pointerDown(50, 50)).toBeNull()
    expect(hits).toBe(0)
    ui.input.pointerMove(50, 50)
    expect(inner.hovered).toBe(false)
  })

  it('manages focus, Tab traversal and Enter activation', () => {
    const ui = makeUI()
    const a = new View({ focusable: true, style: { width: 50, height: 50 } })
    const b = new View({ focusable: true, style: { width: 50, height: 50 } })
    const off = new View({ focusable: true, disabled: true, style: { width: 50, height: 50 } })
    ui.setRoot(new View({ style: { flexDirection: 'row' }, children: [a, off, b] }))
    ui.update()
    const log: string[] = []
    a.addEventListener('focus', () => log.push('focus-a'))
    a.addEventListener('blur', () => log.push('blur-a'))
    b.addEventListener('focus', () => log.push('focus-b'))
    b.addEventListener('click', () => log.push('click-b'))
    ui.input.pointerDown(10, 10)
    expect(a.focused).toBe(true)
    ui.input.keyDown('Tab')
    expect(b.focused && !a.focused).toBe(true) // skips the disabled one
    ui.input.keyDown('Enter')
    ui.input.keyDown('Tab', 'Tab', { shiftKey: true })
    expect(a.focused).toBe(true)
    expect(log).toEqual(['focus-a', 'blur-a', 'focus-b', 'click-b', 'focus-a'].slice(0, 1).concat(['blur-a', 'focus-b', 'click-b', 'focus-a']))
    ui.input.pointerDown(300, 250) // empty area blurs
    expect(ui.input.focused).toBeNull()
  })

  it('forgets detached nodes (hover, focus, capture)', () => {
    const { ui, outer, inner, root } = setup()
    inner.focusable = true
    ui.input.pointerMove(50, 50)
    ui.input.pointerDown(50, 50)
    expect(ui.input.focused).toBe(inner)
    root.remove(outer)
    expect(ui.input.focused).toBeNull()
    expect(inner.hovered).toBe(false)
    expect(inner.pressed).toBe(false)
  })
})

describe('ScrollView', () => {
  function scrollSetup(itemCount = 20) {
    const ui = makeUI({ width: 300, height: 400 })
    const items = Array.from({ length: itemCount }, (_, i) => new View({ name: `item${i}`, style: { height: 50 } }))
    const scroll = new ScrollView({ name: 'scroll', style: { height: 200, margin: 10 }, children: items })
    ui.setRoot(new View({ style: { flex: 1 }, children: [scroll] }))
    ui.update()
    return { ui, scroll, items }
  }

  it('derives content size from layout and bounds the offset', () => {
    const { scroll } = scrollSetup()
    expect(scroll.layout.height).toBe(200)
    expect(scroll.contentHeight).toBe(1000)
    expect(scroll.maxScrollY).toBe(800)
    scroll.scrollTo(0, 5000)
    expect(scroll.scrollY).toBe(800)
    scroll.scrollTo(0, -50)
    expect(scroll.scrollY).toBe(0)
  })

  it('scrolls with the wheel, consuming only when it can scroll (chaining outward)', () => {
    const { ui, scroll } = scrollSetup()
    const e = ui.input.wheel(100, 100, 0, 120)
    expect(e?.defaultPrevented).toBe(true)
    expect(scroll.scrollY).toBe(0) // a notched step eases toward its target…
    ui.update(1)
    expect(scroll.scrollY).toBe(120) // …and lands exactly on it
    scroll.scrollTo(0, 800)
    const e2 = ui.input.wheel(100, 100, 0, 50)
    expect(e2?.defaultPrevented).toBe(false) // at the end: lets an outer scroller take it
  })

  it('eases notched wheel steps, accumulates them, applies small (trackpad) deltas directly, and any other scroll cancels it', () => {
    const { ui, scroll } = scrollSetup()
    ui.input.wheel(100, 100, 0, 100)
    ui.input.wheel(100, 100, 0, 100) // a second notch before the first landed
    ui.update(0.016)
    expect(scroll.scrollY).toBeGreaterThan(0)
    expect(scroll.scrollY).toBeLessThan(200)
    ui.update(0.016)
    const mid = scroll.scrollY
    expect(mid).toBeGreaterThan(0)
    ui.update(1)
    expect(scroll.scrollY).toBe(200) // both notches counted
    expect(ui.needsRender).toBe(true) // the last frame is still to be drawn…
    ui.render()
    expect(ui.needsRender).toBe(false) // …and the animation stopped ticking

    ui.input.wheel(100, 100, 0, 20) // trackpad-sized: immediate
    expect(scroll.scrollY).toBe(220)
    ui.input.wheel(100, 100, 0, 100)
    scroll.scrollTo(0, 10) // programmatic scroll cancels the pending ease
    ui.update(1)
    expect(scroll.scrollY).toBe(10)
    const hard = new ScrollView({ smoothWheel: false, style: { height: 50 }, children: [new View({ style: { height: 400 } })] })
    ui.setRoot(new View({ style: { flex: 1 }, children: [hard] }))
    ui.update()
    ui.input.wheel(10, 10, 0, 100)
    expect(hard.scrollY).toBe(100)
  })

  it('hit-tests children through the scroll offset', () => {
    const { ui, scroll, items } = scrollSetup()
    expect(ui.hitTest(50, 20)).toBe(items[0]) // scroll top = 10 (margin)
    scroll.scrollTo(0, 100)
    expect(ui.hitTest(50, 20)).toBe(items[2])
    expect(ui.hitTest(50, 250)).toBe(ui.root) // below the scroll viewport (10..210) → outer root, not content
    scroll.scrollTo(0, 100)
    expect(items[2]!.getAbsoluteRect().y).toBe(10)
  })

  it('drags with the pointer, cancels child presses and suppresses the click', () => {
    const { ui, scroll, items } = scrollSetup()
    const log: string[] = []
    items[0]!.addEventListener('pointercancel', () => log.push('cancel'))
    items[0]!.addEventListener('click', () => log.push('click'))
    ui.input.pointerDown(50, 100, { timeStamp: 1000 })
    expect(items[0]!.pressed || items[1]!.pressed || items[2]!.pressed).toBe(true)
    ui.input.pointerMove(50, 95, { timeStamp: 1016 }) // below threshold
    expect(scroll.scrollY).toBe(0)
    ui.input.pointerMove(50, 60, { timeStamp: 1032 })
    expect(scroll.scrollY).toBe(40) // content follows the finger
    ui.input.pointerMove(50, 20, { timeStamp: 1048 })
    expect(scroll.scrollY).toBe(80)
    ui.input.pointerUp(50, 20, { timeStamp: 1050 })
    expect(items.every((i) => !i.pressed)).toBe(true)
    expect(log).not.toContain('click')
  })

  it('keeps moving with inertia after a fling and then stops at the bound', () => {
    const { ui, scroll } = scrollSetup()
    ui.input.pointerDown(50, 150, { timeStamp: 0 })
    ui.input.pointerMove(50, 130, { timeStamp: 16 })
    ui.input.pointerMove(50, 100, { timeStamp: 32 })
    ui.input.pointerMove(50, 70, { timeStamp: 48 })
    ui.input.pointerUp(50, 70, { timeStamp: 50 })
    const released = scroll.scrollY
    expect(ui.needsRender).toBe(true)
    for (let i = 0; i < 600; i++) ui.update(1 / 60)
    expect(scroll.scrollY).toBeGreaterThan(released)
    expect(scroll.scrollY).toBeLessThanOrEqual(scroll.maxScrollY)
    const settled = scroll.scrollY
    for (let i = 0; i < 60; i++) ui.update(1 / 60)
    expect(scroll.scrollY).toBe(settled)
  })

  it('lets the innermost scroller own a drag; it hands over only when it cannot scroll that way', () => {
    const ui = makeUI({ width: 300, height: 400 })
    const innerItems = Array.from({ length: 10 }, () => new View({ style: { height: 50 } }))
    const inner = new ScrollView({ name: 'inner', style: { height: 150 }, children: innerItems })
    const filler = new View({ style: { height: 600 } })
    const outer = new ScrollView({ name: 'outer', style: { flex: 1 }, children: [inner, filler] })
    ui.setRoot(new View({ style: { flex: 1 }, children: [outer] }))
    ui.update()
    expect(outer.maxScrollY).toBeGreaterThan(0)

    // drag up by 40px inside the inner list: only the inner scrolls, even across several moves
    ui.input.pointerDown(50, 100, { timeStamp: 0 })
    ui.input.pointerMove(50, 80, { timeStamp: 16 })
    ui.input.pointerMove(50, 60, { timeStamp: 32 })
    ui.input.pointerMove(50, 40, { timeStamp: 48 })
    ui.input.pointerUp(50, 40, { timeStamp: 400 }) // stale → no fling
    expect(inner.scrollY).toBeCloseTo(60)
    expect(outer.scrollY).toBe(0)

    // inner at its end: dragging further up hands the gesture to the outer scroller
    inner.scrollTo(0, 1e9)
    ui.input.pointerDown(50, 100, { timeStamp: 1000 })
    ui.input.pointerMove(50, 80, { timeStamp: 1016 })
    ui.input.pointerMove(50, 40, { timeStamp: 1032 })
    ui.input.pointerUp(50, 40, { timeStamp: 1500 })
    expect(outer.scrollY).toBeGreaterThan(0)
  })

  it('scrolls horizontally and via keyboard when focused', () => {
    const ui = makeUI({ width: 300, height: 200 })
    const cells = Array.from({ length: 10 }, () => new View({ style: { width: 100, height: 40 } }))
    const h = new ScrollView({ horizontal: true, focusable: true, style: { height: 60 }, children: cells })
    ui.setRoot(new View({ style: { flex: 1 }, children: [h] }))
    ui.update()
    expect(h.contentWidth).toBe(1000)
    ui.input.pointerDown(10, 10)
    ui.input.keyDown('ArrowRight')
    expect(h.scrollX).toBe(40)
    ui.input.keyDown('End')
    expect(h.scrollX).toBe(700)
    ui.input.wheel(50, 10, 0, -100)
    ui.update(1)
    expect(h.scrollX).toBe(600)
  })

  it('never paints outside its viewport: clipped segments and culled children', () => {
    const { ui, scroll } = scrollSetup(200)
    scroll.scrollTo(0, 3000)
    ui.render()
    const abs = scroll.getAbsoluteRect()
    expect(ui.stats.nodesCulled).toBeGreaterThan(100)
    expect(ui.stats.clipChanges).toBeGreaterThan(0)
    for (const seg of ui.batch.segments) {
      if (!seg.clip) continue
      expect(seg.clip.x).toBeGreaterThanOrEqual(abs.x)
      expect(seg.clip.y).toBeGreaterThanOrEqual(abs.y)
      expect(seg.clip.x + seg.clip.width).toBeLessThanOrEqual(abs.x + abs.width)
      expect(seg.clip.y + seg.clip.height).toBeLessThanOrEqual(abs.y + abs.height)
    }
  })
})

describe('painting counters', () => {
  it('reports paint ops, batch flushes and glyphs', () => {
    const ui = makeUI()
    ui.setRoot(new View({ style: { flex: 1, padding: 8, backgroundColor: '#123456' }, children: [new Text({ text: 'Hello', style: { fontSize: 20, color: '#fff' } }), new View({ style: { height: 10, backgroundColor: '#f00', borderRadius: 4 } })] }))
    ui.render()
    expect(ui.stats.glyphs).toBe(5)
    expect(ui.stats.paintOps).toBeGreaterThanOrEqual(3)
    expect(ui.stats.sprites).toBeGreaterThanOrEqual(7) // 2 rects + 5 glyphs (spaces excluded)
    expect(ui.stats.nodes).toBe(4) // viewRoot + 3
  })
})
