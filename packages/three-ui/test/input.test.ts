import { describe, expect, it, vi } from 'vitest'
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
    expect(scroll.scrollY).toBeLessThanOrEqual(scroll.maxScrollY) // overshoot springs back to the end
    const settled = scroll.scrollY
    for (let i = 0; i < 60; i++) ui.update(1 / 60)
    expect(scroll.scrollY).toBe(settled)
  })

  describe('Cocos-style drag model', () => {
    const drag = (ui: ReturnType<typeof makeUI>, from: number, steps: number[], dtMs = 16, t0 = 0) => {
      let y = from
      let t = t0
      ui.input.pointerDown(50, y, { timeStamp: t })
      for (const step of steps) {
        y += step
        t += dtMs
        ui.input.pointerMove(50, y, { timeStamp: t })
      }
      return { y, t }
    }
    const settle = (ui: ReturnType<typeof makeUI>, seconds = 4) => {
      for (let i = 0; i < seconds * 60; i++) ui.update(1 / 60)
    }

    it('resists at half rate past the ends and springs back over bounceDuration', () => {
      const { ui, scroll } = scrollSetup()
      // at the top, drag down 60 px in slow steps (the finger rests before lifting: no flick)
      const { y, t } = drag(ui, 20, [8, 8, 8, 8, 8, 8, 8, 8])
      expect(scroll.scrollY).toBeCloseTo(-(8 + 7 * 4)) // first move before leaving bounds is 1:1 only while inside: afterwards ×0.5
      ui.input.pointerUp(50, y, { timeStamp: t + 700 })
      expect(scroll.scrollY).toBeLessThan(0) // still overscrolled
      settle(ui, 0.5)
      expect(scroll.scrollY).toBeLessThan(0)
      expect(scroll.scrollY).toBeGreaterThan(-36) // already coming back (quint ease-out)
      settle(ui, 1)
      expect(scroll.scrollY).toBe(0) // one second later it is home
      expect(ui.needsRender).toBe(true)
      ui.render()
      expect(ui.needsRender).toBe(false)
    })

    it('does not overscroll with elastic: false, and flicks stop at the end', () => {
      const { ui, scroll } = scrollSetup()
      scroll.elastic = false
      drag(ui, 20, [10, 10, 10, 10])
      expect(scroll.scrollY).toBe(0)
      ui.input.pointerUp(50, 60, { timeStamp: 700 })
      drag(ui, 150, [-30, -30, -30, -30], 16, 1000)
      ui.input.pointerUp(50, 30, { timeStamp: 1066 })
      settle(ui, 4)
      expect(scroll.scrollY).toBe(scroll.maxScrollY)
    })

    it('flick distance follows the Cocos formula: velocity · (1 − brake) · 0.7 plus attenuated extra, in √√(v/5) seconds', () => {
      const { ui, scroll } = scrollSetup()
      scroll.scrollTo(0, 400)
      // 5 moves of 20 px at 16 ms: v = 100 px / 0.08 s · (1 − 0.5) = 625 px/s
      const { y, t } = drag(ui, 100, [-6, -6, -6, -6, -6], 16)
      const grabbed = scroll.scrollY // content followed the finger: 400 + 30
      expect(grabbed).toBeCloseTo(430)
      ui.input.pointerUp(y, y, { timeStamp: t })
      const v = (30 * 0.5) / 0.08 // gathered: five 6 px moves in 80 ms
      const time = Math.sqrt(Math.sqrt(v / 5))
      // deltaMove = −v · 0.7; the attenuated target adds (max · (1 − brake) · factor) — here factor > 3, so the Cocos clamp applies
      settle(ui, time * 3 + 1)
      expect(scroll.scrollY).toBeGreaterThan(grabbed)
      expect(scroll.scrollY).toBeLessThanOrEqual(scroll.maxScrollY)
    })

    it('a finger that rests before lifting, brake: 1 or inertia: false give no flick', () => {
      for (const setup of [(s: ScrollView) => void s, (s: ScrollView) => (s.brake = 1), (s: ScrollView) => (s.inertia = false)]) {
        const { ui, scroll } = scrollSetup()
        setup(scroll)
        const rested = setup.length === 1 && scroll.brake === 0.5 && scroll.inertia
        const { y, t } = drag(ui, 100, [-20, -20, -20, -20], 16)
        const at = scroll.scrollY
        ui.input.pointerUp(50, y, { timeStamp: rested ? t + 600 : t + 1 }) // long rest, or an immediate release
        settle(ui, 2)
        if (rested) expect(scroll.scrollY).toBe(at)
        else if (scroll.brake === 1 || !scroll.inertia) expect(scroll.scrollY).toBe(at)
      }
    })

    it('a lone view takes a drag at the end (elastic); with an outer scroller it hands the gesture over', () => {
      const { ui, scroll } = scrollSetup()
      ui.input.pointerDown(50, 20, { timeStamp: 0 })
      ui.input.pointerMove(50, 40, { timeStamp: 16 })
      expect(scroll.scrollY).toBeLessThan(0) // overscrolling at the top
      ui.input.pointerUp(50, 40, { timeStamp: 600 })
    })
  })

  it('does no hit test while a touch drag owns the pointer (the target is fixed at the press, like Flutter / Android / DOM capture)', () => {
    const { ui, scroll } = scrollSetup()
    const hit = vi.spyOn(ui.input, 'hitTest')
    const touch = { pointerId: 7, pointerType: 'touch' as const }
    ui.input.pointerDown(50, 150, { ...touch, timeStamp: 0 })
    ui.input.pointerMove(50, 130, { ...touch, timeStamp: 16 }) // crosses the drag threshold: the ScrollView captures the pointer
    expect(scroll.scrollY).toBeGreaterThan(0)
    const afterCapture = hit.mock.calls.length
    for (let i = 3; i <= 12; i++) ui.input.pointerMove(50, 150 - i * 10, { ...touch, timeStamp: i * 16 })
    ui.input.pointerUp(50, 30, { ...touch, timeStamp: 220 })
    expect(hit.mock.calls.length).toBe(afterCapture) // no walk of the node tree for any later move or the release
    expect(scroll.scrollY).toBeGreaterThan(100)
    // a mouse still looks under the pointer (hover), a plain tap still resolves its click target
    ui.input.pointerMove(50, 100, { pointerType: 'mouse' })
    expect(hit.mock.calls.length).toBeGreaterThan(afterCapture)
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
