import { describe, expect, it } from 'vitest'
import { Color4, PolygonSpriteBatch, VERTEX_STRIDE, createOrthographicCamera, normalizeRadii, srgbToOklab } from '../src'
import { MockBackdropRenderer, MockRenderer, makeTexture } from './helpers'

/** Round a slice of the box table for stable golden comparison. */
function entry(batch: PolygonSpriteBatch, start: number, texels: number): number[] {
  const d = batch.table.data
  return Array.from(d.slice(start * 4, (start + texels) * 4), (n) => Math.round(n * 10000) / 10000)
}

const modeOf = (batch: PolygonSpriteBatch, quad: number): number => (batch as unknown as { vertices: Float32Array }).vertices[quad * 4 * VERTEX_STRIDE + 19]!

describe('normalizeRadii (CSS corner overlap rule)', () => {
  it('scales all radii by one factor when adjacent corners overflow a side', () => {
    expect(normalizeRadii([9999, 9999, 9999, 9999], 100, 40)).toEqual([20, 20, 20, 20].map((n) => expect.closeTo(n, 3)))
    const r = normalizeRadii([30, 30, 0, 0], 40, 100)
    expect(r[0]).toBeCloseTo(20) // 40px side, 30+30 → factor 2/3
    expect(r[1]).toBeCloseTo(20)
    expect(normalizeRadii([4, 8, 12, 16], 200, 200)).toEqual([4, 8, 12, 16])
    expect(normalizeRadii(undefined, 10, 10)).toEqual([0, 0, 0, 0])
  })
})

describe('box shader data (golden table entries)', () => {
  it('fillBox: per-corner radii, per-side border, solid background', () => {
    const batch = new PolygonSpriteBatch()
    batch.begin(createOrthographicCamera(400, 300))
    batch.fillBox({ x: 10, y: 20, width: 100, height: 60, radii: [12, 4, 12, 4], borderWidths: [2, 0, 2, 0], borderColor: '#ff0000', background: '#00000080' })
    batch.end()
    expect(batch.stats.boxes).toBe(1)
    expect(entry(batch, 0, 6)).toEqual([
      50, 30, 0, 0, // half size, no gradient
      12, 4, 12, 4, // radii TL TR BR BL
      2, 0, 2, 0, // border T R B L
      1, 0, 0, 1, // border color
      0, 0, 0, 0.502, // background (straight sRGB, alpha 128/255)
      0, 0, 0, 0, // gradient params (unused)
    ])
    expect(modeOf(batch, 0)).toBe(2)
  })

  it('fillBox: linear gradient stores 1/length direction, premultiplied stops and packed positions', () => {
    const batch = new PolygonSpriteBatch()
    batch.begin(createOrthographicCamera(400, 300))
    batch.fillBox({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      gradient: { type: 'linear', dx: 1, dy: 0, length: 200, stops: [{ color: '#ff0000', position: 0 }, { color: '#0000ff80', position: 0.25 }, { color: '#00ff00', position: 1 }] },
    })
    batch.end()
    const e = entry(batch, 0, 6 + 3 + 1)
    expect(e.slice(0, 4)).toEqual([100, 50, 1, 3]) // kind 1 = linear, 3 stops
    expect(e.slice(20, 24)).toEqual([0.005, 0, 0, 0]) // direction / length
    expect(e.slice(24, 28)).toEqual([1, 0, 0, 1]) // red
    expect(e.slice(28, 32)).toEqual([0, 0, 0.502 * 1, 0.502]) // blue @ 50% alpha, premultiplied
    expect(e.slice(32, 36)).toEqual([0, 1, 0, 1])
    expect(e.slice(36, 40)).toEqual([0, 0.25, 1, 1]) // positions padded with the last value
  })

  it('fillBox: oklab gradients store premultiplied OKLab stops (kind +2)', () => {
    const batch = new PolygonSpriteBatch()
    batch.begin(createOrthographicCamera(400, 300))
    batch.fillBox({ x: 0, y: 0, width: 50, height: 50, gradient: { type: 'radial', colorSpace: 'oklab', cx: 5, cy: -5, rx: 20, ry: 10, stops: [{ color: '#ffffff', position: 0 }, { color: '#000000', position: 1 }] } })
    batch.end()
    const e = entry(batch, 0, 6 + 2 + 1)
    expect(e[2]).toBe(4) // radial + oklab
    expect(e.slice(20, 24)).toEqual([5, -5, 0.05, 0.1]) // center, 1/rx, 1/ry
    expect(e.slice(24, 28)).toEqual([1, 0, 0, 1]) // white = L 1
    const lab = srgbToOklab(1, 1, 1)
    expect(lab[0]).toBeCloseTo(1, 3)
  })

  it('fillShadow: outer shadow = casting box (mask) + spread-expanded shape + offset; inset uses the padding box', () => {
    const batch = new PolygonSpriteBatch()
    batch.begin(createOrthographicCamera(400, 300))
    batch.fillShadow({ x: 0, y: 0, width: 100, height: 50, radii: [10, 10, 10, 10], offsetX: 3, offsetY: 6, blur: 12, spread: 4, color: '#000000' })
    batch.fillShadow({ x: 0, y: 0, width: 100, height: 50, radii: [10, 10, 10, 10], borderWidths: [2, 2, 2, 2], offsetY: 2, blur: 8, spread: 1, color: '#ffffff', inset: true })
    batch.end()
    expect(batch.stats.shadows).toBe(2)
    expect(entry(batch, 0, 6)).toEqual([
      50, 25, 0, 0, // mask box
      10, 10, 10, 10,
      54, 29, 6, 0, // shape half + spread, sigma = blur / 2
      14, 14, 14, 14, // radii + spread
      0, 0, 0, 1,
      3, 6, 0, 0, // shape center = offset
    ])
    expect(entry(batch, 6, 6)).toEqual([
      48, 23, 0, 0, // padding box (border 2) as the mask
      8, 8, 8, 8,
      47, 22, 4, 0, // hole shrinks by the spread
      7, 7, 7, 7,
      1, 1, 1, 1,
      0, 2, 0, 0,
    ])
    expect([modeOf(batch, 0), modeOf(batch, 1)]).toEqual([3, 4])
  })

  it('warns once and keeps the first 8 stops', () => {
    const batch = new PolygonSpriteBatch()
    batch.begin(createOrthographicCamera(100, 100))
    const stops = Array.from({ length: 12 }, (_, i) => ({ color: '#ffffff', position: i / 11 }))
    batch.fillBox({ x: 0, y: 0, width: 10, height: 10, gradient: { type: 'linear', dx: 0, dy: 1, length: 10, stops } })
    batch.end()
    expect(entry(batch, 0, 1)[3]).toBe(8)
  })
})

describe('batching with boxes, shadows and glyph effects', () => {
  it('hundreds of boxes + shadows + gradient panels join text in one draw call', () => {
    const renderer = new MockRenderer()
    const batch = new PolygonSpriteBatch({ renderer, maxSprites: 8000 })
    const atlas = makeTexture()
    batch.begin(createOrthographicCamera(800, 600))
    for (let i = 0; i < 400; i++) {
      const x = (i % 20) * 38
      const y = Math.floor(i / 20) * 28
      batch.fillShadow({ x, y, width: 34, height: 24, radii: [6, 6, 6, 6], offsetY: 3, blur: 6, color: '#00000080' })
      batch.fillBox({ x, y, width: 34, height: 24, radii: [6, 6, 6, 6], gradient: { type: 'linear', dx: 0, dy: 1, length: 24, stops: [{ color: '#fff', position: 0 }, { color: '#888', position: 1 }] } })
      batch.drawGlyph(atlas, x + 4, y + 4, 8, 12, 0, 0, 1, 1) // a "label"
    }
    batch.end()
    expect(batch.stats.boxes).toBe(400)
    expect(batch.stats.shadows).toBe(400)
    expect(batch.stats.sprites).toBe(1200)
    // boxes / shadows ignore the atlas, so the whole screen is a single draw call
    expect(batch.stats.drawCalls).toBe(1)
    expect(renderer.calls).toHaveLength(1)
    batch.dispose()
  })

  it('draws glyph effects with threshold / softness / inner threshold in the shape attribute', () => {
    const batch = new PolygonSpriteBatch()
    const tex = makeTexture()
    batch.begin(createOrthographicCamera(100, 100))
    batch.setColor('#ff0000')
    batch.drawGlyphEffect(tex, 0, 0, 10, 10, 0, 0, 1, 1, 0.4, 0.05, 0.6)
    batch.drawGlyph(tex, 20, 0, 10, 10, 0, 0, 1, 1)
    batch.end()
    const v = (batch as unknown as { vertices: Float32Array }).vertices
    expect([v[11], v[12], v[13]]).toEqual([expect.closeTo(0.4, 5), expect.closeTo(0.05, 5), expect.closeTo(0.6, 5)])
    expect(modeOf(batch, 0)).toBe(5)
    expect(modeOf(batch, 1)).toBe(6)
  })

  it('table grows beyond its initial size and keeps earlier entries', () => {
    const batch = new PolygonSpriteBatch({ maxSprites: 8000 })
    batch.begin(createOrthographicCamera(100, 100))
    for (let i = 0; i < 2000; i++) batch.fillBox({ x: 0, y: 0, width: 4 + (i % 7), height: 4, background: '#fff' })
    batch.end()
    expect(batch.table.rowCount).toBeGreaterThan(8)
    expect(entry(batch, 0, 1)).toEqual([2, 2, 0, 0])
    expect(entry(batch, 6 * 1999, 1)[0]).toBe((4 + (1999 % 7)) / 2)
  })
})

describe('backdrop capture epochs', () => {
  const setup = () => {
    const renderer = new MockBackdropRenderer()
    const batch = new PolygonSpriteBatch({ renderer, backdrop: 'full' })
    return { renderer, batch }
  }

  it('is off without the option or without copyFramebufferToTexture', () => {
    const batch = new PolygonSpriteBatch({ renderer: new MockRenderer() })
    batch.begin(createOrthographicCamera(100, 100))
    expect(batch.fillBackdrop({ x: 0, y: 0, width: 10, height: 10, blur: 8 })).toBe(false)
    batch.end()
    expect(batch.backdrop).toBeNull()
  })

  it('blurred panels over the scene share ONE framebuffer copy and one blur chain per strength', () => {
    const { renderer, batch } = setup()
    batch.begin(createOrthographicCamera(800, 600))
    batch.fillBox({ x: 0, y: 0, width: 800, height: 600, background: '#223' }) // "scene"
    for (let i = 0; i < 5; i++) batch.fillBackdrop({ x: 20 + i * 150, y: 20, width: 120, height: 80, radii: [12, 12, 12, 12], blur: 12 }) // small
    for (let i = 0; i < 5; i++) batch.fillBackdrop({ x: 20 + i * 150, y: 300, width: 120, height: 80, radii: [12, 12, 12, 12], blur: 40 }) // large
    batch.end()
    expect(batch.stats.backdropCopies).toBe(1)
    // 2 shared downsamples + 1 small upsample + 4 for the large chain
    expect(batch.stats.backdropPasses).toBe(7)
    // everything painted before the first blurred panel is rendered BEFORE the copy
    expect(renderer.events.indexOf('copy')).toBeGreaterThan(renderer.events.indexOf('render:1'))
    expect(renderer.events.filter((e) => e === 'copy')).toHaveLength(1)
    batch.dispose()
  })

  it('takes a new copy only when a blurred element overlaps UI painted after the previous copy', () => {
    const { renderer, batch } = setup()
    batch.begin(createOrthographicCamera(800, 600))
    batch.fillBackdrop({ x: 0, y: 0, width: 100, height: 60, blur: 12 }) // epoch 1
    batch.fillBox({ x: 300, y: 300, width: 100, height: 100, background: '#f00' }) // painted after the copy
    batch.fillBackdrop({ x: 600, y: 0, width: 100, height: 60, blur: 12 }) // elsewhere: still epoch 1
    expect(batch.stats.backdropCopies).toBe(0) // (stats are published at end())
    batch.fillBackdrop({ x: 280, y: 280, width: 200, height: 200, blur: 12 }) // overlaps the red box → epoch 2
    batch.end()
    expect(batch.stats.backdropCopies).toBe(2)
    expect(renderer.events.filter((e) => e === 'copy')).toHaveLength(2)
    batch.dispose()
  })

  it('skips all work when no backdrop element is painted', () => {
    const { renderer, batch } = setup()
    batch.begin(createOrthographicCamera(800, 600))
    batch.fillBox({ x: 0, y: 0, width: 100, height: 100, background: '#fff' })
    batch.end()
    expect(batch.stats.backdropCopies).toBe(0)
    expect(batch.stats.backdropPasses).toBe(0)
    expect(renderer.events).not.toContain('copy')
    batch.dispose()
  })

  it('low quality has a single small blur level; blur 0 reads the raw copy', () => {
    const renderer = new MockBackdropRenderer()
    const batch = new PolygonSpriteBatch({ renderer, backdrop: 'low' })
    batch.begin(createOrthographicCamera(800, 600))
    batch.fillBackdrop({ x: 0, y: 0, width: 100, height: 100, blur: 64 })
    batch.fillBackdrop({ x: 200, y: 0, width: 100, height: 100, blur: 0, brightness: 0.5 })
    batch.end()
    expect(batch.stats.backdropPasses).toBe(3)
    expect(batch.backdrop!.levelFor(64)).toBe(1)
    expect(batch.backdrop!.levelFor(0)).toBe(0)
    batch.dispose()
  })

  it('premultiplied colour helper sanity', () => {
    expect(new Color4(1, 0, 0, 0.5).a).toBe(0.5)
  })
})
