import { describe, expect, it, vi } from 'vitest'
import { View, Text, UIAnimationEvent, UITransitionEvent, parseEasingFn, type ThreeUI, type TransformOp } from '../src'
import { makeUI } from './helpers'

function setup(style: Record<string, unknown> = {}) {
  const ui = makeUI()
  const node = new View({ style: { width: 100, height: 50, ...style } })
  ui.setRoot(node)
  ui.update()
  return { ui, node }
}

/** Advance the UI by `ms` in 10 ms steps (the way a frame loop would). */
function run(ui: ThreeUI, ms: number): void {
  ui.update(0) // flush pending style changes so animations exist before time starts
  for (let t = 0; t < ms; t += 10) ui.update(0.01)
}

describe('easing', () => {
  it('matches the CSS keyword curves, cubic-bezier and steps', () => {
    const ease = parseEasingFn('ease')
    expect(ease(0)).toBe(0)
    expect(ease(1)).toBe(1)
    expect(ease(0.5)).toBeCloseTo(0.8024, 3) // CSS ease at t=.5
    expect(parseEasingFn('ease-in')(0.5)).toBeCloseTo(0.3153, 3)
    expect(parseEasingFn('ease-out')(0.5)).toBeCloseTo(0.6847, 3)
    expect(parseEasingFn('ease-in-out')(0.5)).toBeCloseTo(0.5, 3)
    expect(parseEasingFn('cubic-bezier(0.4,0,0.2,1)')(0.5)).toBeCloseTo(0.7756, 3)
    expect(parseEasingFn('cubic-bezier(0.34,1.56,0.64,1)')(0.5)).toBeGreaterThan(1) // overshoot
    expect(parseEasingFn('linear')(0.3)).toBe(0.3)
    const s = parseEasingFn('steps(4)')
    expect([0, 0.2, 0.25, 0.6, 0.99, 1].map(s)).toEqual([0, 0, 0.25, 0.5, 0.75, 1])
    expect(parseEasingFn('steps(2, jump-start)')(0.1)).toBe(0.5)
    expect(parseEasingFn('step-end')(0.99)).toBe(0)
    expect(parseEasingFn('nonsense')(0.4)).toBe(0.4)
  })
})

describe('node.animate()', () => {
  it('interpolates linearly, fires start/end events and resolves `finished`', async () => {
    const { ui, node } = setup()
    const events: string[] = []
    for (const t of ['animationstart', 'animationend', 'animationiteration'] as const) node.addEventListener(t, (e) => events.push(`${e.type}:${e.elapsedTime}`))
    const a = node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })
    ui.update(0)
    expect(node.computedStyle.opacity).toBe(0) // applied immediately at t = 0
    run(ui, 500)
    expect(node.computedStyle.opacity).toBeCloseTo(0.5, 1)
    run(ui, 600)
    expect(a.playState).toBe('finished')
    expect(node.computedStyle.opacity).toBe(1) // fill none: back to the underlying style (opacity 1)
    expect(events).toEqual(['animationstart:0', 'animationend:1'])
    await expect(a.finished).resolves.toBe(a)
  })

  it('is driven only by update(dt): dt = 0 freezes, scaled dt slows down', () => {
    const { ui, node } = setup()
    node.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 1000, fill: 'forwards' })
    run(ui, 400)
    const frozen = node.computedStyle.opacity
    for (let i = 0; i < 20; i++) ui.update(0)
    expect(node.computedStyle.opacity).toBe(frozen)
    // slow motion: 10 × 0.2 × 10ms = 20 ms of animation time
    for (let i = 0; i < 10; i++) ui.update(0.002)
    expect(node.computedStyle.opacity).toBeCloseTo(frozen + 0.8 * 0.02, 3)
  })

  it('honors delay, iterations, direction and fill modes', () => {
    const { ui, node } = setup()
    const a = node.animate([{ transform: [{ translateX: 0 }] }, { transform: [{ translateX: 100 }] }], { duration: 100, delay: 100, iterations: 2, direction: 'alternate', fill: 'both' })
    ui.update(0)
    expect((node.computedStyle.transform as TransformOp[])[0]).toEqual({ translateX: 0 }) // fill backwards during the delay
    run(ui, 150) // 50ms into iteration 0
    expect((node.computedStyle.transform as { translateX: number }[])[0]!.translateX).toBeCloseTo(50, 0)
    run(ui, 100) // 50ms into iteration 1 (reversed)
    expect((node.computedStyle.transform as { translateX: number }[])[0]!.translateX).toBeCloseTo(50, 0)
    run(ui, 40)
    expect((node.computedStyle.transform as { translateX: number }[])[0]!.translateX).toBeLessThan(20)
    run(ui, 200)
    expect(a.playState).toBe('finished')
    expect((node.computedStyle.transform as { translateX: number }[])[0]!.translateX).toBe(0) // fill forwards holds the final (reversed) end
  })

  it('infinite iterations never finish; cancel() rejects `finished`, fires animationcancel and restores the style', async () => {
    const { ui, node } = setup({ opacity: 0.9 })
    const cancel = vi.fn()
    node.addEventListener('animationcancel', cancel)
    const a = node.animate([{ opacity: 0 }, { opacity: 0.5 }], { duration: 100, iterations: Infinity })
    run(ui, 1234)
    expect(a.playState).toBe('running')
    expect(node.computedStyle.opacity).toBeLessThan(0.5)
    a.cancel()
    ui.update(0)
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(node.computedStyle.opacity).toBe(0.9)
    await expect(a.finished).rejects.toMatchObject({ name: 'AbortError' })
    expect(ui.engine.hasRunning).toBe(false)
  })

  it('pause / play / finish / currentTime / playbackRate', () => {
    const { ui, node } = setup()
    const a = node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: 'forwards', paused: true })
    run(ui, 500)
    expect(node.computedStyle.opacity).toBe(0)
    a.play()
    run(ui, 500)
    expect(node.computedStyle.opacity).toBeCloseTo(0.5, 1)
    a.pause()
    run(ui, 500)
    expect(node.computedStyle.opacity).toBeCloseTo(0.5, 1)
    a.currentTime = 900
    ui.update(0)
    expect(node.computedStyle.opacity).toBeCloseTo(0.9, 2)
    a.finish()
    ui.update(0)
    expect(a.playState).toBe('finished')
    expect(node.computedStyle.opacity).toBe(1)
  })

  it('applies per-keyframe easing to the interval and an iteration-level easing option', () => {
    const { ui, node } = setup()
    node.animate([{ offset: 0, opacity: 0, easing: 'steps(2, jump-end)' }, { offset: 0.5, opacity: 1 }, { offset: 1, opacity: 0 }], { duration: 1000, fill: 'forwards' })
    run(ui, 200) // 40% through the first (stepped) interval → step 0
    expect(node.computedStyle.opacity).toBe(0)
    run(ui, 200) // 80% → step 1 (0.5 of the way)
    expect(node.computedStyle.opacity).toBeCloseTo(0.5, 2)
    const n2 = new View({ style: { width: 10, height: 10 } })
    ui.root!.append(n2)
    ui.update()
    n2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, easing: 'ease-in', fill: 'forwards' })
    run(ui, 500)
    expect(n2.computedStyle.opacity).toBeCloseTo(0.3153, 2)
  })

  it('interpolates colors premultiplied, shadows, text stroke and gradients', () => {
    const { ui, node } = setup({ backgroundColor: '#ff0000', boxShadow: { offsetY: 2, blur: 4, color: '#000000' } })
    node.animate(
      [
        { backgroundColor: '#ff000000', boxShadow: { offsetY: 2, blur: 4, color: '#000000' } },
        { backgroundColor: '#0000ff', boxShadow: [{ offsetY: 10, blur: 20, color: '#000000' }, { offsetX: 4, color: '#ff0000', spread: 2 }] },
      ],
      { duration: 1000, fill: 'forwards' },
    )
    run(ui, 500)
    const bg = node.computedStyle.backgroundColor
    // transparent red → blue: premultiplied interpolation keeps the hue blue-ish, alpha .5
    expect(bg.a).toBeCloseTo(0.5, 2)
    expect(bg.b).toBeCloseTo(1, 2)
    expect(bg.r).toBeCloseTo(0, 2)
    const s = node.computedStyle.boxShadow
    expect(s).toHaveLength(2)
    expect(s[0]!.offsetY).toBeCloseTo(6, 0)
    expect(s[1]!.spread).toBeCloseTo(1, 0) // padded with a zero-spread transparent layer
    expect(s[1]!.color.a).toBeCloseTo(0.5, 2)
  })

  it('interpolates transforms: matching lists pairwise, none → ops via identity, percent translations', () => {
    const { ui, node } = setup()
    node.animate(
      [
        { transform: [{ translateY: '-25%' }] },
        { transform: [] }, // `transform: none`
      ],
      { duration: 1000, fill: 'forwards' },
    )
    run(ui, 500)
    expect((node.computedStyle.transform as { translateY: string }[])[0]!.translateY).toBe('-12.5%')
    const n2 = new View({ style: { width: 100, height: 40 } })
    ui.root!.append(n2)
    ui.update()
    n2.animate([{ transform: [{ scale: 1 }, { rotate: 0 }] }, { transform: [{ scale: 2 }, { rotate: Math.PI }] }], { duration: 1000, fill: 'forwards' })
    run(ui, 500)
    const t = n2.computedStyle.transform as { scale?: number; rotate?: number }[]
    expect(t[0]!.scale).toBeCloseTo(1.5, 1)
    expect(t[1]!.rotate).toBeCloseTo(Math.PI / 2, 1)
  })

  it('layout properties are ignored without { layout: true } and drive Yoga with it', () => {
    const { ui, node } = setup()
    node.animate([{ width: 100 }, { width: 300 }], { duration: 1000, fill: 'forwards' })
    run(ui, 1000)
    expect(node.layout.width).toBe(100)
    const n2 = new View({ style: { width: 100, height: 20 } })
    ui.root!.append(n2)
    ui.update()
    const a = n2.animate([{ width: 100 }, { width: 300 }], { duration: 1000, fill: 'forwards', layout: true })
    const passes = ui.stats.layoutPasses
    run(ui, 500)
    expect(n2.layout.width).toBeCloseTo(200, 0)
    expect(ui.stats.layoutPasses).toBeGreaterThan(passes)
    run(ui, 600)
    expect(a.playState).toBe('finished')
    expect(n2.layout.width).toBe(300)
  })

  it('transform / opacity animation never re-runs layout', () => {
    const { ui, node } = setup()
    node.animate([{ opacity: 0, transform: [{ scale: 0.5 }] }, { opacity: 1, transform: [{ scale: 1 }] }], { duration: 1000 })
    const passes = ui.stats.layoutPasses
    run(ui, 900)
    expect(ui.stats.layoutPasses).toBe(passes)
  })
})

describe('style animation', () => {
  it('runs registered keyframes by name, loops, alternates and does not restart on unrelated style changes', () => {
    const { ui, node } = setup()
    ui.registerKeyframes('pulse', { '0%': { opacity: 1 }, '50%': { opacity: 0.2 }, '100%': { opacity: 1 } })
    const iterations = vi.fn()
    node.addEventListener('animationiteration', iterations)
    node.setStyle({ width: 100, height: 50, animation: { name: 'pulse', duration: 1000, easing: 'linear', iterations: 'infinite' } })
    run(ui, 500)
    expect(node.computedStyle.opacity).toBeCloseTo(0.2, 1)
    node.setStyle({ width: 100, height: 50, backgroundColor: '#fff', animation: { name: 'pulse', duration: 1000, easing: 'linear', iterations: 'infinite' } })
    run(ui, 10)
    expect(node.computedStyle.opacity).toBeLessThan(0.3) // still at ~0.5s, not restarted
    run(ui, 1000)
    expect(iterations).toHaveBeenCalledTimes(1)
    node.setStyle({ width: 100, height: 50 })
    ui.update(0)
    expect(node.computedStyle.opacity).toBe(1) // removing the spec ends the effect
  })

  it('reads CSS-style defaults: missing 0% / 100% start from and end at the underlying style', () => {
    const { ui, node } = setup({ opacity: 0.8 })
    node.setStyle({ width: 100, height: 50, opacity: 0.8, animation: { keyframes: { '50%': { opacity: 0 } }, duration: 1000, easing: 'linear' } })
    run(ui, 250)
    expect(node.computedStyle.opacity).toBeCloseTo(0.4, 1)
    run(ui, 250)
    expect(node.computedStyle.opacity).toBeCloseTo(0, 1)
    run(ui, 250)
    expect(node.computedStyle.opacity).toBeCloseTo(0.4, 1)
    run(ui, 300)
    expect(node.computedStyle.opacity).toBe(0.8) // finished, no fill: back to the style
  })

  it('applies the animation-timing-function per keyframe interval (CSS semantics)', () => {
    const { ui, node } = setup()
    node.setStyle({ width: 100, height: 50, animation: { keyframes: { from: { opacity: 0 }, '50%': { opacity: 1 }, to: { opacity: 0 } }, duration: 1000, easing: 'ease-in', fill: 'forwards' } })
    run(ui, 250) // halfway through the first interval, eased in
    expect(node.computedStyle.opacity).toBeCloseTo(0.3153, 2)
  })

  it('fires animationend and keeps a finished animation from restarting', () => {
    const { ui, node } = setup()
    ui.registerKeyframes('fade', [{ opacity: 0 }, { opacity: 1 }])
    const end = vi.fn((e: UIAnimationEvent) => e.animationName)
    node.addEventListener('animationend', end)
    const spec = { name: 'fade', duration: 100 }
    node.setStyle({ width: 10, height: 10, animation: spec })
    run(ui, 300)
    expect(end).toHaveBeenCalledTimes(1)
    expect(end.mock.results[0]!.value).toBe('fade')
    node.setStyle({ width: 10, height: 10, animation: { ...spec }, backgroundColor: '#123' }) // unrelated change, same spec
    run(ui, 300)
    expect(end).toHaveBeenCalledTimes(1)
  })

  it('animationend bubbles to ancestors', () => {
    const ui = makeUI()
    const child = new View({ style: { width: 10, height: 10 } })
    const parent = new View({ style: { width: 50, height: 50 }, children: [child] })
    ui.setRoot(parent)
    ui.update()
    const heard = vi.fn()
    parent.addEventListener('animationend', heard)
    child.animate([{ opacity: 0 }, { opacity: 1 }], 50)
    run(ui, 100)
    expect(heard).toHaveBeenCalledTimes(1)
  })
})

describe('transitions', () => {
  it('eases between style values over the transition duration and fires transitionend', () => {
    const { ui, node } = setup({ backgroundColor: '#000000', opacity: 1, transitionProperty: ['backgroundColor', 'opacity'], transitionDuration: 200, transitionTimingFunction: 'linear' })
    const ended: string[] = []
    node.addEventListener('transitionend', (e: UITransitionEvent) => ended.push(e.propertyName))
    node.setStyle({ width: 100, height: 50, backgroundColor: '#ffffff', opacity: 0.5, transitionProperty: ['backgroundColor', 'opacity'], transitionDuration: 200, transitionTimingFunction: 'linear' })
    ui.update(0)
    expect(node.computedStyle.backgroundColor.r).toBe(0) // t = 0: nothing jumps
    run(ui, 100)
    expect(node.computedStyle.backgroundColor.r).toBeCloseTo(0.5, 1)
    expect(node.computedStyle.opacity).toBeCloseTo(0.75, 1)
    run(ui, 150)
    expect(node.computedStyle.backgroundColor.r).toBe(1)
    expect(ended.sort()).toEqual(['backgroundColor', 'opacity'])
  })

  it('retargets from the current value and honors delay; `all` covers paint properties only', () => {
    const { ui, node } = setup({ opacity: 1, transition: { property: 'all', duration: 100, delay: 50, easing: 'linear' } })
    node.setStyle({ width: 100, height: 50, opacity: 0, transition: { property: 'all', duration: 100, delay: 50, easing: 'linear' } })
    run(ui, 50)
    expect(node.computedStyle.opacity).toBe(1) // still in the delay
    run(ui, 50)
    expect(node.computedStyle.opacity).toBeCloseTo(0.5, 1)
    node.setStyle({ width: 100, height: 50, opacity: 1, transition: { property: 'all', duration: 100, delay: 0, easing: 'linear' } })
    ui.update(0)
    expect(node.computedStyle.opacity).toBeCloseTo(0.5, 1) // starts from where it was
    run(ui, 100)
    expect(node.computedStyle.opacity).toBe(1)
    // layout property changes jump unless named explicitly
    node.setStyle({ width: 300, height: 50, opacity: 1, transition: { property: 'all', duration: 100, easing: 'linear' } })
    ui.update(0)
    expect(node.layout.width).toBe(300)
  })

  it('transitions a layout property only when it is named explicitly', () => {
    const { ui, node } = setup({ width: 100, transition: { property: 'width', duration: 100, easing: 'linear' } })
    node.setStyle({ width: 300, height: 50, transition: { property: 'width', duration: 100, easing: 'linear' } })
    ui.update(0)
    expect(node.layout.width).toBe(100)
    run(ui, 50)
    expect(node.layout.width).toBeCloseTo(200, 0)
    run(ui, 100)
    expect(node.layout.width).toBe(300)
  })

  it('does not run on the first style computation and honors dt = 0', () => {
    const ui = makeUI()
    const node = new View({ style: { opacity: 0.2, transition: { property: 'all', duration: 1000 } } })
    ui.setRoot(node)
    ui.update()
    expect(node.computedStyle.opacity).toBe(0.2)
    node.setStyle({ opacity: 1, transition: { property: 'all', duration: 1000, easing: 'linear' } })
    ui.update(0)
    for (let i = 0; i < 30; i++) ui.update(0)
    expect(node.computedStyle.opacity).toBe(0.2)
    run(ui, 500)
    expect(node.computedStyle.opacity).toBeCloseTo(0.6, 1)
  })

  it('animated text color reaches descendants (inheritance)', () => {
    const ui = makeUI()
    const text = new Text({ text: 'hi' })
    const box = new View({ style: { color: '#000000', transition: { property: 'color', duration: 100, easing: 'linear' } }, children: [text] })
    ui.setRoot(box)
    ui.update()
    box.setStyle({ color: '#ffffff', transition: { property: 'color', duration: 100, easing: 'linear' } })
    run(ui, 50)
    expect(box.computedStyle.color.r).toBeCloseTo(0.5, 1)
    expect(text.computedStyle.color.r).toBeCloseTo(0.5, 1)
  })

  it('needsRender stays true only while something moves', () => {
    const { ui, node } = setup()
    ui.render()
    expect(ui.needsRender).toBe(false)
    node.animate([{ opacity: 0 }, { opacity: 1 }], 50)
    expect(ui.needsRender).toBe(true)
    run(ui, 100)
    ui.render()
    expect(ui.needsRender).toBe(false)
  })
})

describe('media flags', () => {
  it('setMediaFlags({ reducedMotion }) re-resolves class variants', () => {
    const ui = makeUI()
    const resolve = vi.fn(() => ({ style: {}, deps: 128 }))
    ui.classNameResolver = { resolve }
    const v = new View({ className: 'x' })
    ui.setRoot(v)
    ui.update()
    const calls = resolve.mock.calls.length
    ui.setMediaFlags({ reducedMotion: true })
    ui.update()
    expect(resolve.mock.calls.length).toBeGreaterThan(calls)
    expect(ui.environment.reducedMotion).toBe(true)
  })
})
