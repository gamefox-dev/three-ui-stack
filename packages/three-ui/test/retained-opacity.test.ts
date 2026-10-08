import { describe, expect, it } from 'vitest'
import { Image, View } from '../src'
import { makeUI, makeTexture, dumpBatch } from './helpers'
import { MockRenderer } from '../../three-2d/test/helpers'

function setup(options: { retain?: boolean; replay?: boolean; sprites?: number; style?: Record<string, unknown> } = {}) {
  const ui = makeUI({ renderer: Object.assign(new MockRenderer(), { setClearColor() {} }), retainImageOpacity: options.retain ?? true, replayStaticFrames: options.replay ?? true, ...(options.sprites ? { maxSprites: options.sprites } : {}) })
  const image = new Image({ source: makeTexture(), style: { width: 20, height: 20, tintColor: '#ffffffbf', ...options.style } })
  const parent = new View({ style: { opacity: .6 }, children: [image] })
  ui.setRoot(new View({ style: { flex: 1, backgroundColor: '#123' }, children: [parent] }))
  ui.render()
  return { ui, image, parent }
}

function pulse(image: Image) {
  return image.animate([{ opacity: 1 }, { opacity: .5 }], { duration: 1000, easing: 'linear', fill: 'forwards' })
}

describe('retained bitmap opacity', () => {
  it('replays the static UI and edits only the bitmap alpha, matching full repaint at every phase', () => {
    const a = setup(), ref = setup({ retain: false })
    pulse(a.image); pulse(ref.image)
    const vertices = a.ui.batch as unknown as { vertices: Float32Array; vertexCount: number; interleaved: { updateRanges: { start: number; count: number }[] } }
    for (let i = 0; i < 10; i++) {
      a.ui.update(.1); ref.ui.update(.1)
      a.ui.render(); ref.ui.render()
      expect(a.ui.stats.replayed).toBe(true)
      expect(a.ui.stats.retainedOpacityUpdates).toBe(1)
      expect(dumpBatch(a.ui)).toEqual(dumpBatch(ref.ui))
      const reference = ref.ui.batch as unknown as { vertices: Float32Array; vertexCount: number }
      expect(vertices.vertices.slice(0, vertices.vertexCount * 21)).toEqual(reference.vertices.slice(0, reference.vertexCount * 21))
      expect(vertices.interleaved.updateRanges).toEqual([{ start: 4 * 21, count: 4 * 21 }])
    }
    expect(a.ui.needsRender).toBe(false)
    a.ui.dispose(); ref.ui.dispose()
  })

  it('retains visible opacity transitions and restores alpha on cancellation', () => {
    const a = setup(), ref = setup({ retain: false })
    for (const item of [a, ref]) {
      item.image.setStyle({ width: 20, height: 20, opacity: 1, transition: { property: 'opacity', duration: 1000, easing: 'linear' } })
      item.ui.render()
      item.image.setStyle({ width: 20, height: 20, opacity: .5, transition: { property: 'opacity', duration: 1000, easing: 'linear' } })
      item.ui.render() // ordinary style mutation establishes a fresh retained base
      item.ui.update(.5)
      item.ui.render()
    }
    expect(a.ui.stats.replayed).toBe(true)
    expect(a.ui.stats.retainedOpacityUpdates).toBe(1)
    expect(dumpBatch(a.ui)).toEqual(dumpBatch(ref.ui))
    a.ui.dispose(); ref.ui.dispose()
    const { ui, image } = setup()
    const animation = pulse(image)
    ui.update(.5); ui.render()
    animation.cancel(); ui.update(0); ui.render()
    expect(ui.stats.replayed).toBe(true)
    expect(image.computedStyle.opacity).toBe(1)
    expect(ui.stats.retainedOpacityUpdates).toBe(1)
    ui.dispose()
  })

  it('renders the final pending alpha even when the animation has finished', () => {
    const { ui, image } = setup()
    pulse(image)
    ui.update(1)
    expect(ui.engine.hasRunning).toBe(false)
    expect(ui.needsRender).toBe(true)
    expect(ui.renderIfNeeded()).toBe(true)
    expect(ui.stats.retainedOpacityUpdates).toBe(1)
    expect(ui.renderIfNeeded()).toBe(false)
    ui.dispose()
  })

  it('falls back when opacity reaches zero, then rebuilds when the bitmap becomes visible again', () => {
    const { ui, image } = setup()
    const a = image.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'linear', fill: 'forwards' })
    ui.update(1); ui.render()
    expect(ui.stats.replayed).toBe(false)
    expect(ui.stats.retainedOpacityUpdates).toBe(0)
    a.cancel()
    ui.update(0); ui.render()
    expect(ui.stats.replayed).toBe(false)
    expect(ui.stats.sprites).toBe(2)
    ui.dispose()
  })

  it('does not retain geometry after source, style, parent opacity, or layout mutations', () => {
    for (const change of [
      (image: Image, _parent: View) => image.setSource(makeTexture()),
      (image: Image, _parent: View) => image.setStyle({ width: 40, height: 20 }),
      (_image: Image, parent: View) => parent.setStyle({ opacity: .3 }),
    ]) {
      const { ui, image, parent } = setup()
      pulse(image)
      ui.update(.1)
      change(image, parent)
      ui.update(0); ui.render()
      expect(ui.stats.replayed).toBe(false)
      expect(ui.stats.retainedOpacityUpdates).toBe(0)
      ui.update(.1); ui.render()
      expect(ui.stats.replayed).toBe(true)
      ui.dispose()
    }
  })

  it('uses ordinary painting for images with box effects, mixed animations, or replay disabled', () => {
    for (const options of [{ style: { backgroundColor: '#f00' } }, { style: { borderWidth: 1 } }, { style: { dropShadow: [{ offsetX: 1, offsetY: 1, blur: 0, color: '#000' }] } }, { retain: false }, { replay: false }]) {
      const { ui, image } = setup(options)
      pulse(image); ui.update(.1); ui.render()
      expect(ui.stats.replayed).toBe(false)
      expect(ui.stats.retainedOpacityUpdates).toBe(0)
      ui.dispose()
    }
    const { ui, image } = setup()
    image.animate([{ opacity: 1, transform: [{ translateX: 0 }] }, { opacity: .5, transform: [{ translateX: 20 }] }], { duration: 1000 })
    ui.update(.1); ui.render()
    expect(ui.stats.replayed).toBe(false)
    ui.dispose()
  })

  it('does not reuse ranges from a capacity-flushed frame', () => {
    const { ui, image } = setup({ sprites: 1 })
    expect(ui.batch.canReplay).toBe(false)
    pulse(image); ui.update(.1); ui.render()
    expect(ui.stats.replayed).toBe(false)
    expect(ui.stats.retainedOpacityUpdates).toBe(0)
    // Auto-growth now makes a complete frame available for retention.
    ui.update(.1); ui.render()
    expect(ui.stats.replayed).toBe(true)
    ui.dispose()
  })

  it('preserves sibling geometry while updating several bitmap fades', () => {
    const { ui, image, parent } = setup()
    const other = new Image({ source: makeTexture(), style: { width: 20, height: 20 } })
    parent.append(other); ui.render()
    pulse(image); pulse(other)
    ui.update(.5); ui.render()
    expect(ui.stats.replayed).toBe(true)
    expect(ui.stats.retainedOpacityUpdates).toBe(2)
    ui.dispose()
  })
})
