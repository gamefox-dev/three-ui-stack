import { describe, expect, it } from 'vitest'
import { ScrollView, Text, View } from '../src'
import { makeUI, dumpBatch } from './helpers'

function clipped() {
  const ui = makeUI({ width: 200, height: 200 })
  const dot = new View({ style: { position: 'absolute', left: 0, top: 120, width: 12, height: 12, backgroundColor: '#fff' } })
  const parent = new View({ style: { width: 100, height: 100, overflow: 'hidden', backgroundColor: '#123' }, children: [dot] })
  ui.setRoot(new View({ style: { flex: 1 }, children: [parent] }))
  ui.render()
  return { ui, dot, parent }
}

describe('animation visibility invalidation', () => {
  it('advances clipped animation clocks/events without repainting the unchanged picture', async () => {
    const { ui, dot } = clipped()
    const notices: string[] = []
    for (const type of ['animationstart', 'animationiteration', 'animationend'] as const) dot.addEventListener(type, e => notices.push(e.type))
    const a = dot.animate([{ opacity: 1 }, { opacity: .5 }], { duration: 100, iterations: 2, fill: 'forwards' })
    ui.update(0)
    const picture = dumpBatch(ui)
    expect(ui.needsUpdate).toBe(true)
    expect(ui.engine.hasRunning).toBe(true)
    expect(ui.needsRender).toBe(false)
    for (let i = 0; i < 20; i++) {
      ui.update(.01)
      expect(ui.renderIfNeeded()).toBe(false)
      expect(dumpBatch(ui)).toEqual(picture)
    }
    expect(a.currentTime).toBeCloseTo(200)
    expect(a.playState).toBe('finished')
    expect(notices).toEqual(['animationstart', 'animationiteration', 'animationend'])
    await expect(a.finished).resolves.toBe(a)
    expect(ui.needsUpdate).toBe(false)
    ui.dispose()
  })

  it('paints an animated transform entering the viewport and erases it when leaving', () => {
    const ui = makeUI({ width: 100, height: 100 })
    const dot = new View({ style: { position: 'absolute', left: 150, top: 0, width: 12, height: 12, backgroundColor: '#fff' } })
    ui.setRoot(new View({ children: [dot] }))
    ui.render()
    const a = dot.animate([{ transform: [{ translateX: 0 }] }, { transform: [{ translateX: -100 }] }], { duration: 100, easing: 'linear', fill: 'forwards' })
    ui.update(.1)
    expect(ui.renderIfNeeded()).toBe(true)
    expect(ui.stats.sprites).toBe(1)
    a.cancel()
    ui.update(0)
    expect(ui.renderIfNeeded()).toBe(true)
    expect(ui.stats.sprites).toBe(0)
    ui.dispose()
  })

  it('reveals the current animation phase when hidden content is scrolled into view', () => {
    const ui = makeUI({ width: 200, height: 200 })
    const dot = new View({ style: { position: 'absolute', top: 150, left: 0, width: 12, height: 12, backgroundColor: '#fff' } })
    const wrapper = new View({ style: { height: 250 }, children: [dot] })
    const scroll = new ScrollView({ showsScrollIndicator: false, style: { width: 100, height: 100 }, children: [wrapper] })
    ui.setRoot(new View({ children: [scroll] }))
    ui.render()
    const a = dot.animate([{ opacity: 1 }, { opacity: .5 }], { duration: 1000, easing: 'linear', fill: 'forwards' })
    ui.update(.5)
    expect(ui.renderIfNeeded()).toBe(false)
    expect(a.currentTime).toBe(500)
    scroll.scrollTo(0, 100)
    ui.update(0)
    expect(ui.renderIfNeeded()).toBe(true)
    expect(dot.computedStyle.opacity).toBeCloseTo(.75)
    expect(dumpBatch(ui).join('\n')).toContain('a=0.75')
    ui.dispose()
  })

  it('does not skip overflowing descendants or shadows that reach the viewport', () => {
    for (const overflow of [true, false]) {
      const ui = makeUI({ width: 100, height: 100 })
      const node = new View({ style: { position: 'absolute', left: 110, top: 0, width: 12, height: 12,
        ...(overflow ? {} : { backgroundColor: '#fff', boxShadow: [{ offsetX: -30, offsetY: 0, blur: 0, spread: 0, color: '#fff' }] }) },
        children: overflow ? [new View({ style: { position: 'absolute', left: -40, top: 0, width: 12, height: 12, backgroundColor: '#fff' } })] : [] })
      ui.setRoot(new View({ children: [node] }))
      ui.render()
      node.animate([{ opacity: 1 }, { opacity: .5 }], { duration: 1000 })
      ui.update(.1)
      expect(ui.renderIfNeeded()).toBe(true)
      expect(ui.stats.sprites).toBeGreaterThan(0)
      ui.dispose()
    }
  })

  it('handles translated/scaled ancestor clips and conservatively keeps rotated ancestry live', () => {
    for (const transform of [[{ translateX: 50 }, { scale: 2 }], [{ rotate: 45 }]] as const) {
      const { ui, dot, parent } = clipped()
      parent.setStyle({ width: 100, height: 100, overflow: 'hidden', transform: [...transform] })
      ui.render()
      dot.animate([{ opacity: 1 }, { opacity: .5 }], { duration: 1000 })
      ui.update(.1)
      expect(ui.needsRender).toBe(transform[0] && 'rotate' in transform[0])
      ui.dispose()
    }
  })

  it('keeps layout effects live when an offscreen node moves visible siblings', () => {
    const ui = makeUI({ width: 200, height: 200 })
    const hidden = new View({ style: { width: 10, height: 10, opacity: 0 } })
    const sibling = new View({ style: { width: 10, height: 10, backgroundColor: '#fff' } })
    ui.setRoot(new View({ children: [hidden, sibling] }))
    ui.render()
    hidden.animate([{ height: 10 }, { height: 50 }], { duration: 1000, layout: true, easing: 'linear' })
    ui.update(.5)
    expect(ui.renderIfNeeded()).toBe(true)
    expect(sibling.layout.y).toBeCloseTo(30)
    ui.dispose()
  })

  it('propagates inherited effects and restores descendants on cancellation', () => {
    const ui = makeUI()
    const text = new Text({ text: 'hello' })
    const parent = new View({ style: { color: '#000' }, children: [text] })
    ui.setRoot(parent)
    ui.render()
    const a = parent.animate([{ color: '#000' }, { color: '#fff' }], { duration: 1000, easing: 'linear' })
    ui.update(.5)
    expect(text.computedStyle.color.r).toBeCloseTo(.5)
    ui.render()
    a.cancel()
    ui.update(0)
    expect(text.computedStyle.color.r).toBe(0)
    expect(ui.renderIfNeeded()).toBe(true)
    ui.dispose()
  })

  it('matches always-painted output across changing clips, scroll, transforms and reveal', () => {
    let seed = 12345
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 0x100000000 }
    for (let run = 0; run < 20; run++) {
      const make = () => {
        const ui = makeUI({ width: 200, height: 200 })
        const dot = new View({ style: { position: 'absolute', left: 0, top: 180, width: 12, height: 12, backgroundColor: '#fff' } })
        const content = new View({ style: { height: 300 }, children: [dot] })
        const scroll = new ScrollView({ showsScrollIndicator: false, style: { width: 100, height: 100 }, children: [content] })
        const parent = new View({ style: { width: 100, height: 100, overflow: 'hidden' }, children: [scroll] })
        ui.setRoot(new View({ style: { width: 200, height: 200, overflow: 'hidden' }, children: [parent] })); ui.render()
        dot.animate([{ opacity: 1, transform: [{ translateX: -30 }] }, { opacity: .1, transform: [{ translateX: 100 }] }], { duration: 1000, iterations: 'infinite' })
        return { ui, scroll, parent }
      }
      const a = make(), ref = make()
      for (let step = 0; step < 30; step++) {
        if (step % 5 === 0) {
          const offset = random() * 200
          const transform = [{ translateX: random() * 300 - 100 }, { scale: random() * 2 - 1 }]
          for (const item of [a, ref]) { item.scroll.scrollTo(0, offset); item.parent.setStyle({ width: 100, height: 100, overflow: 'hidden', transform }) }
        }
        a.ui.update(.04); ref.ui.update(.04)
        a.ui.renderIfNeeded(); ref.ui.render()
        expect(dumpBatch(a.ui)).toEqual(dumpBatch(ref.ui))
      }
      a.ui.dispose(); ref.ui.dispose()
    }
  })

  it('preserves arbitrary cross-node dependencies in custom painters', () => {
    const { ui, dot, parent } = clipped()
    class DependentPaint extends View {
      override paintSelf(...args: Parameters<View['paintSelf']>): void { super.paintSelf(...args) }
    }
    const custom = new DependentPaint({ style: { width: 10, height: 10 } })
    parent.append(custom)
    ui.render()
    dot.animate([{ opacity: 1 }, { opacity: .5 }], { duration: 1000 })
    ui.update(.1)
    expect(ui.renderIfNeeded()).toBe(true)
    parent.remove(custom)
    ui.render()
    ui.update(.1)
    expect(ui.renderIfNeeded()).toBe(false)
    ui.dispose()
    custom.dispose()
  })

  it('keeps visible transitions and animation-end mutations rendering', () => {
    const { ui, dot, parent } = clipped()
    dot.addEventListener('animationend', () => parent.setStyle({ width: 100, height: 100, backgroundColor: '#f00' }))
    dot.animate([{ opacity: 1 }, { opacity: .5 }], { duration: 100 })
    ui.update(.1)
    expect(ui.renderIfNeeded()).toBe(true)
    expect(parent.computedStyle.backgroundColor.r).toBe(1)
    ui.dispose()
  })
})
