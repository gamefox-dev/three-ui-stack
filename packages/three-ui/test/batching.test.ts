import { describe, expect, it } from 'vitest'
import { Color4, NinePatch, TextureAtlas } from '@implicit-invocation/three-2d'
import { Image, NinePatchView, View, createThreeUI, type ThreeUIRenderer } from '../src'
import { loadFixtureFonts, makeTexture, makeUI } from './helpers'

/** Minimal caller-owned renderer: counts `render()` submissions. */
function mockRenderer(maxTextures?: number): ThreeUIRenderer & { renders: number; scissors: number } {
  let test = false
  const r = {
    renders: 0,
    scissors: 0,
    autoClear: true,
    ...(maxTextures ? { capabilities: { maxTextures } } : {}),
    setClearColor() {},
    render() {
      r.renders++
      if (test) r.scissors++
    },
    getViewport: (t: { set(...n: number[]): unknown }) => t.set(0, 0, 400, 300),
    getScissor: (t: { set(...n: number[]): unknown }) => t.set(0, 0, 400, 300),
    setScissor() {},
    getScissorTest: () => test,
    setScissorTest(v: boolean) {
      test = v
    },
  }
  return r as never
}

describe('NinePatchView with scaled patches', () => {
  const atlasText = ['page.png', 'size: 64, 64', 'frame', '  bounds: 0, 0, 48, 48', '  split: 12, 12, 12, 12', '  pad: 8, 8, 6, 6', ''].join('\n')

  it('derives min size and default padding from the patch scale and atlas pad', () => {
    const atlas = TextureAtlas.fromText(atlasText, () => makeTexture(64, 64))
    const ui = makeUI()
    const view = new NinePatchView({ patch: atlas.createPatch('frame', 0.5) })
    const custom = new NinePatchView({ patch: atlas.createPatch('frame', 0.5), style: { padding: 10 } })
    ui.setRoot(new View({ children: [view, custom] }))
    ui.update(0)
    expect(view.computedStyle.minWidth).toBe(12)
    expect(view.computedStyle.paddingLeft).toBe(4)
    expect(view.computedStyle.paddingTop).toBe(3)
    expect(view.layout.width).toBeGreaterThanOrEqual(12)
    // an explicit padding wins over the patch's
    expect(custom.computedStyle.padding).toBe(10)
    expect(custom.computedStyle.paddingLeft).toBeUndefined() // the patch's own edge default stepped aside
  })

  it('patchScale overrides the patch scale per view without touching the shared patch', () => {
    const patch = new NinePatch(makeTexture(30, 30), 10, 10, 10, 10, 1)
    const ui = makeUI()
    const a = new NinePatchView({ patch })
    const b = new NinePatchView({ patch, patchScale: 0.5 })
    ui.setRoot(new View({ children: [a, b] }))
    ui.update(0)
    expect(a.computedStyle.minWidth).toBe(20)
    expect(b.computedStyle.minWidth).toBe(10)
    expect(patch.scale).toBe(1)
    b.setPatchScale(2)
    ui.update(0)
    expect(b.computedStyle.minWidth).toBe(40)
    ui.render()
    expect(patch.scale).toBe(1)
  })
})

describe('createThreeUI batching options', () => {
  it('passes maxTextures / maxGradientStops to the batch and exposes the texture counters', () => {
    const ui = createThreeUI({ width: 100, height: 100, maxTextures: 1, maxGradientStops: 3, fonts: loadFixtureFonts() })
    expect(ui.batch.maxGradientStops).toBe(3)
    ui.render()
    expect(ui.stats.texturesBound).toBe(0)
    expect(ui.stats.textureSwitches).toBe(0)
  })

  it("clip: 'shader' draws overflow-hidden content in one pass, 'scissor' needs one pass per clip", () => {
    const build = (clip: 'scissor' | 'shader') => {
      const renderer = mockRenderer(16)
      const ui = createThreeUI({ renderer, width: 400, height: 300, fonts: loadFixtureFonts(), clip })
      const t = makeTexture()
      ui.setRoot(
        new View({
          style: { width: 400, height: 300, flexDirection: 'row', gap: 10 },
          children: [0, 1, 2].map((i) => new View({ style: { width: 100, height: 100, overflow: 'hidden', borderRadius: 12 }, children: [new Image({ source: t, style: { width: 160, height: 160 } })] })),
        }),
      )
      ui.render()
      return { ui, renderer }
    }
    const scissor = build('scissor')
    expect(scissor.ui.stats.renderPasses).toBeGreaterThanOrEqual(3)
    const shader = build('shader')
    expect(shader.ui.stats.renderPasses).toBe(1)
    expect(shader.renderer.scissors).toBe(0)
    expect(shader.ui.batch.clipMode).toBe('shader')
    // the three clipped images straddle their clips: three entries, with the box's corner radii
    const table = shader.ui.batch.clipTable!
    expect(table.data[8]).toBe(12)
  })
})

describe('static frame replay', () => {
  it('replays the previous frame when nothing changed, repaints when something did', () => {
    const renderer = mockRenderer(16)
    const ui = createThreeUI({ renderer, width: 200, height: 100, fonts: loadFixtureFonts() })
    const box = new View({ style: { width: 80, height: 40, backgroundColor: '#336699' } })
    ui.setRoot(new View({ children: [box] }))
    ui.render()
    expect(ui.stats.replayed).toBe(false)
    const quads = ui.stats.sprites
    const before = renderer.renders
    ui.render()
    expect(ui.stats.replayed).toBe(true)
    expect(ui.stats.sprites).toBe(quads)
    expect(renderer.renders).toBeGreaterThan(before) // it still draws
    box.setStyle({ width: 80, height: 40, backgroundColor: '#aa3333' })
    ui.render()
    expect(ui.stats.replayed).toBe(false)
    ui.render()
    expect(ui.stats.replayed).toBe(true)
    ui.resize(300, 100)
    ui.render()
    expect(ui.stats.replayed).toBe(false)
  })

  it('replayStaticFrames: false always repaints; a headless UI never replays', () => {
    const renderer = mockRenderer(16)
    const ui = createThreeUI({ renderer, width: 100, height: 100, fonts: loadFixtureFonts(), replayStaticFrames: false })
    ui.render()
    ui.render()
    expect(ui.stats.replayed).toBe(false)
    const headless = makeUI()
    headless.render()
    headless.render()
    expect(headless.stats.replayed).toBe(false)
    void Color4
  })
})
