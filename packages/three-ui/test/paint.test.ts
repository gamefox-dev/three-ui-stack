import { afterEach, describe, expect, it, vi } from 'vitest'
import { GlyphLayout } from '@implicit-invocation/three-2d'
import { Image, Text, View, createThreeUI, resolveGradientForBox, linearGeometry, radialGeometry, resolveStopPositions, type ResolvedGradient } from '../src'
import { resetWarnings } from '../src/dev'
import { Color4 } from '@implicit-invocation/three-2d'
import { dumpBatch, loadFixtureFonts, loadFixtureFontsWithDisplay, makeTexture, makeUI } from './helpers'

const stop = (hex: string, position?: number | `${number}%`) => ({ color: new Color4().set(0, 0, 0, 1).copy(Object.assign(new Color4(), { r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255, a: 1 })), position })

afterEach(() => {
  vi.restoreAllMocks()
  resetWarnings()
})

describe('gradient geometry (CSS rules)', () => {
  it('angles: 0deg points up, 90deg right; the gradient line spans the box corner to corner', () => {
    const up = linearGeometry(0, 200, 100)
    expect([up.dx, up.dy, up.length]).toEqual([0, -1, 100].map((n) => expect.closeTo(n, 5)))
    const right = linearGeometry('90deg', 200, 100)
    expect([right.dx, right.dy, right.length]).toEqual([1, 0, 200].map((n) => expect.closeTo(n, 5)))
    const diag = linearGeometry(135, 200, 100)
    expect(diag.length).toBeCloseTo((200 + 100) * Math.SQRT1_2, 4)
    expect(linearGeometry('0.5turn', 10, 10).dy).toBeCloseTo(1, 5)
    expect(linearGeometry(Math.PI * 0.5 * (180 / Math.PI) + 0, 10, 10).dx).toBeCloseTo(1, 5)
  })

  it('corner keywords aim the 50% line through the other two corners', () => {
    const g = linearGeometry('to top right', 200, 100)
    // perpendicular to the TL→BR diagonal (200,100): direction ∝ (100,-200)
    expect(g.dx / g.dy).toBeCloseTo(-0.5, 5)
    expect(g.dx).toBeGreaterThan(0)
    expect(g.dy).toBeLessThan(0)
    const bl = linearGeometry('to bottom left', 100, 100)
    expect(bl.dx).toBeCloseTo(-Math.SQRT1_2, 5)
    expect(bl.dy).toBeCloseTo(Math.SQRT1_2, 5)
    expect(linearGeometry('to right', 100, 40)).toMatchObject({ dx: 1, dy: 0, length: 100 })
  })

  it('stop fix-up: defaults, monotonic clamp, even spreading of unpositioned runs, px and %', () => {
    const out: never[] = []
    const stops = [stop('#000000'), stop('#111111'), stop('#222222'), stop('#333333', '25%'), stop('#444444', 10), stop('#555555')]
    const r = resolveStopPositions(stops, 200, out as never) as { position: number }[]
    expect(r.map((s) => s.position)).toEqual([0, 0.0833, 0.1667, 0.25, 0.25 /* 10px = 5% clamped up to 25% */, 1].map((n) => expect.closeTo(n, 3)))
    const single = resolveStopPositions([stop('#000000', '10%'), stop('#ffffff', 50)], 100, []) as { position: number }[]
    expect(single.map((s) => s.position)).toEqual([0.1, 0.5])
  })

  it('radial sizes: farthest-corner circle / ellipse, closest-side, explicit radii, positions', () => {
    const g = (over: Partial<Extract<ResolvedGradient, { type: 'radial' }>>): ResolvedGradient & { type: 'radial' } => ({ type: 'radial', colorSpace: 'srgb', shape: 'ellipse', size: 'farthest-corner', at: ['50%', '50%'], stops: [], ...over })
    const e = radialGeometry(g({}), 200, 100)
    expect([e.cx, e.cy, e.rx, e.ry]).toEqual([0, 0, 100 * Math.SQRT2, 50 * Math.SQRT2].map((n, i) => (i < 2 ? n : expect.closeTo(n, 3))))
    const c = radialGeometry(g({ shape: 'circle' }), 200, 100)
    expect(c.rx).toBeCloseTo(Math.hypot(100, 50), 3)
    expect(c.ry).toBe(c.rx)
    const side = radialGeometry(g({ size: 'closest-side', at: ['25%', '50%'] }), 200, 100)
    expect([side.cx, side.cy, side.rx, side.ry]).toEqual([-50, 0, 50, 50])
    const explicit = radialGeometry(g({ size: [40, '10%'], at: ['left', 'bottom'] }), 100, 100)
    expect([explicit.cx, explicit.cy, explicit.rx, explicit.ry]).toEqual([-50, 50, 40, 10])
  })

  it('resolveGradientForBox returns null for fewer than two stops', () => {
    expect(resolveGradientForBox({ type: 'linear', colorSpace: 'srgb', angle: 180, stops: [stop('#000000')] }, 10, 10)).toBeNull()
  })
})

describe('box painting from style objects', () => {
  const panelStyle = {
    width: 220,
    height: 120,
    padding: 10,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 3,
    borderColor: '#f59e0b',
    backgroundColor: '#1e293b',
    backgroundGradient: { type: 'linear', angle: 'to bottom', stops: [{ color: '#334155' }, { color: '#0f172a' }] },
    boxShadow: [
      { inset: true, offsetY: 2, blur: 4, color: '#ffffff40' },
      { spread: 2, color: '#f59e0b' },
      { offsetY: 12, blur: 24, color: '#000000aa' },
    ],
  } as const

  it('golden: shadows (last first), one SDF box, inset shadow, then glyphs', () => {
    const ui = makeUI()
    ui.setRoot(new View({ style: { padding: 10 }, children: [new View({ style: panelStyle, children: [new Text({ text: 'Hello', style: { fontSize: 24, color: '#ffffff', fontWeight: 700 } })] })] }))
    ui.render()
    expect(ui.stats.boxes).toBe(1)
    expect(ui.stats.shadows).toBe(3)
    expect(ui.batch.segments).toHaveLength(1) // draw calls (headless: no renderer, so count segments)
    expect(dumpBatch(ui)).toMatchSnapshot()
  })

  it('per-side borders paint through the same SDF quad (no strips) and honor per-corner radii', () => {
    const ui = makeUI()
    ui.setRoot(new View({ style: { width: 100, height: 50, borderBottomWidth: 4, borderColor: '#00ff00', borderRadius: 12, borderBottomRightRadius: 0, backgroundColor: '#000000' } }))
    ui.render()
    expect(ui.stats.paintOps).toBe(1)
    const line = dumpBatch(ui)[0]!
    expect(line).toContain('box')
    expect(line).toContain('data=[50,25,0,0,12,12,0,12,0,0,4,0') // half size (the quad itself has a 1px AA margin); radii TL TR BR BL; border T R B L
  })

  it('300 gradient + shadow panels with labels are one draw call and no Three objects per panel', () => {
    const ui = makeUI({ width: 800, height: 600 })
    const root = new View({ style: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, padding: 4 } })
    for (let i = 0; i < 300; i++) {
      root.append(
        new View({
          style: { width: 40, height: 30, borderRadius: 6, backgroundGradient: { type: 'linear', stops: [{ color: '#fff' }, { color: '#888' }] }, boxShadow: { offsetY: 3, blur: 6, color: '#0008' } },
          children: [new Text({ text: String(i % 10), style: { fontSize: 14 } })],
        }),
      )
    }
    ui.setRoot(root)
    ui.render()
    expect(ui.stats.boxes).toBe(300)
    expect(ui.stats.shadows).toBe(300)
    expect(ui.batch.segments).toHaveLength(1)
    expect(ui.stats.glyphs).toBe(300)
    expect(ui.batch.meshCount).toBe(1)
  })

  it('outer shadows keep a node alive for culling when only the shadow reaches into view', () => {
    const ui = makeUI({ width: 200, height: 200 })
    const clip = new View({ style: { width: 100, height: 100, overflow: 'hidden' }, children: [new View({ style: { position: 'absolute', left: 105, top: 10, width: 40, height: 40, backgroundColor: '#fff', boxShadow: { blur: 40, offsetX: -60, color: '#000' } } })] })
    ui.setRoot(clip)
    ui.render()
    expect(dumpBatch(ui).some((l) => l.startsWith('shadow'))).toBe(true)
  })

  it('opacity multiplies down the tree (group opacity is per-primitive, not offscreen)', () => {
    const ui = makeUI()
    ui.setRoot(new View({ style: { opacity: 0.5, width: 100, height: 100, backgroundColor: '#fff' }, children: [new View({ style: { opacity: 0.5, width: 50, height: 50, backgroundColor: '#f00' } })] }))
    ui.render()
    const alphas = dumpBatch(ui).map((l) => /a=([\d.]+)/.exec(l)![1])
    expect(alphas).toEqual(['0.5', '0.25'])
  })
})

describe('pointer-events', () => {
  it('a decorative overlay with pointer-events: none lets pointers reach what is under it', () => {
    const ui = makeUI()
    const button = new View({ name: 'button', style: { width: 100, height: 50 } })
    const overlay = new View({ name: 'glow', style: { position: 'absolute', left: 0, top: 0, width: 100, height: 50, pointerEvents: 'none', backgroundColor: '#fff4' } })
    ui.setRoot(new View({ children: [button, overlay] }))
    ui.update()
    expect(ui.hitTest(10, 10)).toBe(button)
    overlay.setStyle({ position: 'absolute', left: 0, top: 0, width: 100, height: 50, backgroundColor: '#fff4' })
    ui.update()
    expect(ui.hitTest(10, 10)).toBe(overlay)
  })
})

describe('text: ellipsis, line clamp, nowrap', () => {
  const font = () => loadFixtureFonts().resolve('Inter', 400, 'normal')!.canonical
  const text = 'The quick brown fox jumps over the lazy dog and keeps running far away'

  it('nowrap + ellipsis fits one line within the width and ends with …', () => {
    const f = font()
    const layout = new GlyphLayout().setText(f, text, { scale: 16 / f.size, width: 150, wrap: false, ellipsis: true })
    expect(layout.lines).toHaveLength(1)
    expect(layout.width).toBeLessThanOrEqual(150.01)
    const ell = f.data.glyphForCodePoint(0x2026)!
    expect(layout.glyphs[layout.glyphs.length - 1]).toBe(ell)
    const plain = new GlyphLayout().setText(f, text, { scale: 16 / f.size, width: 150, wrap: false })
    expect(plain.lines).toHaveLength(1)
    expect(plain.width).toBeGreaterThan(150) // overflows without ellipsis
  })

  it('maxLines clamps to N lines and puts the ellipsis on the last one', () => {
    const f = font()
    const free = new GlyphLayout().setText(f, text, { scale: 16 / f.size, width: 150 })
    expect(free.lines.length).toBeGreaterThan(2)
    const clamped = new GlyphLayout().setText(f, text, { scale: 16 / f.size, width: 150, maxLines: 2, ellipsis: true })
    expect(clamped.lines).toHaveLength(2)
    expect(clamped.truncated).toBe(true)
    expect(clamped.lines[1]!.width).toBeLessThanOrEqual(150.01)
    expect(clamped.glyphs[clamped.glyphs.length - 1]).toBe(f.data.glyphForCodePoint(0x2026))
    const noEllipsis = new GlyphLayout().setText(f, text, { scale: 16 / f.size, width: 150, maxLines: 2 })
    expect(noEllipsis.lines).toHaveLength(2)
    expect(noEllipsis.glyphs[noEllipsis.glyphs.length - 1]).not.toBe(f.data.glyphForCodePoint(0x2026))
    // text that fits is not touched
    const fits = new GlyphLayout().setText(f, 'short', { scale: 1, width: 500, maxLines: 2, ellipsis: true })
    expect(fits.truncated).toBe(false)
    expect(fits.glyphs).toHaveLength(5)
  })

  it('Text nodes honor numberOfLines / whiteSpace / textOverflow, including their layout height', () => {
    const ui = makeUI({ width: 300, height: 300 })
    const clamp = new Text({ text, style: { width: 150, fontSize: 16, numberOfLines: 2, textOverflow: 'ellipsis' } })
    const free = new Text({ text, style: { width: 150, fontSize: 16 } })
    const one = new Text({ text, style: { width: 150, fontSize: 16, whiteSpace: 'nowrap', textOverflow: 'ellipsis' } })
    ui.setRoot(new View({ children: [clamp, free, one] }))
    ui.update()
    expect(one.layout.height).toBeLessThan(clamp.layout.height)
    expect(Math.abs(clamp.layout.height - one.layout.height * 2)).toBeLessThanOrEqual(1)
    expect(free.layout.height).toBeGreaterThan(clamp.layout.height)
  })

  it('letter-spacing, line-height and text-align change the layout as documented', () => {
    const f = font()
    const base = new GlyphLayout().setText(f, 'AAA', { scale: 1 })
    const spaced = new GlyphLayout().setText(f, 'AAA', { scale: 1, letterSpacing: 4 })
    expect(spaced.width).toBeCloseTo(base.width + 12, 3)
    const lh = new GlyphLayout().setText(f, 'a\nb', { scale: 1, lineHeight: 40 })
    expect(lh.height).toBe(80)
    const centered = new GlyphLayout().setText(f, 'AA', { scale: 1, width: 300, align: 'center' })
    expect(centered.quads[0]).toBeGreaterThan(100)
    const right = new GlyphLayout().setText(f, 'AA', { scale: 1, width: 300, align: 'right' })
    expect(right.quads[0]).toBeGreaterThan(centered.quads[0]!)
  })
})

describe('text stroke and shadow', () => {
  const modes = (ui: ReturnType<typeof makeUI>) => dumpBatch(ui).map((l) => l.split(' ')[0]!)
  const count = (m: string[], k: string) => m.filter((x) => x === k).length

  const make = (style: object) => {
    const ui = makeUI({ fonts: loadFixtureFontsWithDisplay(), width: 300, height: 100 })
    ui.setRoot(new View({ children: [new Text({ text: 'Hi', style: { fontFamily: 'Inter Display', fontWeight: 800, fontSize: 30, color: '#fff', ...style } })] }))
    ui.render()
    return modes(ui)
  }

  it('paint-order: stroke → stroke quads under the fill; normal → ring over the fill', () => {
    const under = make({ textStrokeWidth: 6, textStrokeColor: '#000', paintOrder: 'stroke' })
    expect(under).toEqual(['glyphfx', 'glyphfx', 'glyph', 'glyph'])
    const over = make({ textStrokeWidth: 6, textStrokeColor: '#000' })
    expect(over).toEqual(['glyph', 'glyph', 'glyphfx', 'glyphfx'])
    expect(make({})).toEqual(['glyph', 'glyph'])
  })

  it('text-shadow draws a second copy beneath (blur through the distance channel)', () => {
    const m = make({ textShadow: [{ offsetY: 2, blur: 4, color: '#0008' }, { offsetY: 5, blur: 8, color: '#0004' }] })
    expect(m).toEqual(['glyphfx', 'glyphfx', 'glyphfx', 'glyphfx', 'glyph', 'glyph'])
  })

  it('stroke thresholds: width → distance threshold, clamped (with one warning) beyond what the font was baked for', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ui = makeUI({ fonts: loadFixtureFontsWithDisplay(), width: 300, height: 100 })
    ui.setRoot(new View({ children: [new Text({ text: 'H', style: { fontFamily: 'Inter Display', fontWeight: 800, fontSize: 32, color: '#fff', textStrokeWidth: 40, paintOrder: 'stroke' } })] }))
    ui.render()
    ui.render()
    const stroke = (ui.batch as unknown as { vertices: Float32Array }).vertices
    // game-display-32 was baked for strokes up to 8px: R = 5 texels, threshold = 0.5 − (8/2)/(2·R)... clamped, not 40/2
    const thr = stroke[11]!
    expect(thr).toBeCloseTo(0.5 - 4 / (2 * 5), 3)
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('exceeds')).length).toBe(1)
  })

  it('no stroke channel in the font → stroke is a no-op with one warning, shadows fall back to hard copies', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ui = makeUI({ width: 300, height: 100 })
    ui.setRoot(new View({ children: [new Text({ text: 'Hi', style: { fontSize: 24, color: '#fff', textStrokeWidth: 4, textShadow: { offsetX: 2, offsetY: 2, color: '#000' } } })] }))
    ui.render()
    ui.render()
    expect(modes(ui)).toEqual(['glyph', 'glyph', 'glyph', 'glyph'])
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('no stroke channel')).length).toBe(1)
  })
})

describe('Image: object-fit, rounding, tint, drop-shadow', () => {
  const quad = (ui: ReturnType<typeof makeUI>, i = 0) => {
    const f = (ui.batch as unknown as { vertices: Float32Array }).vertices
    const o = i * 4 * 21
    const br = o + 2 * 21
    return { x: f[o]!, y: f[o + 1]!, x2: f[br]!, y2: f[br + 1]!, u: f[o + 3]!, v: f[o + 4]!, u2: f[br + 3]!, v2: f[br + 4]!, mode: f[o + 19]!, radius: f[o + 13]!, r: f[o + 5]!, a: f[o + 8]! }
  }
  const imageUI = (style: object, node: Partial<ConstructorParameters<typeof Image>[0]> = {}) => {
    const ui = makeUI({ width: 300, height: 200 })
    ui.setRoot(new View({ children: [new Image({ source: makeTexture(16, 16), style: { width: 100, height: 50, ...style }, ...node })] }))
    ui.render()
    return ui
  }

  it('cover crops, contain letterboxes, scale-down never upscales, none centers at intrinsic size', () => {
    const cover = quad(imageUI({ objectFit: 'cover' }))
    expect([cover.x, cover.x2, cover.y, cover.y2]).toEqual([0, 100, 0, 50])
    expect([cover.v, cover.v2]).toEqual([0.25, 0.75])
    const contain = quad(imageUI({ objectFit: 'contain' }))
    expect([contain.x, contain.x2]).toEqual([25, 75])
    const down = quad(imageUI({ objectFit: 'scale-down' }))
    expect([down.x2 - down.x, down.y2 - down.y]).toEqual([16, 16])
    const none = quad(imageUI({ objectFit: 'none' }))
    expect([none.x2 - none.x, none.y2 - none.y]).toEqual([16, 16])
    const fill = quad(imageUI({ objectFit: 'fill' }))
    expect([fill.x, fill.x2, fill.u, fill.u2]).toEqual([0, 100, 0, 1])
    // `object-fit` wins over the `resizeMode` prop
    const prop = quad(imageUI({ objectFit: 'contain' }, { resizeMode: 'cover' }))
    expect([prop.x, prop.x2]).toEqual([25, 75])
  })

  it('rounded images carry the SDF radius (circle avatar inside a ring)', () => {
    const ui = makeUI({ width: 300, height: 200 })
    ui.setRoot(new View({ children: [new Image({ source: makeTexture(16, 16), style: { width: 60, height: 60, borderRadius: 9999, borderWidth: 3, borderColor: '#fbbf24', objectFit: 'cover' } })] }))
    ui.render()
    const lines = dumpBatch(ui)
    expect(lines[0]).toContain('box') // the ring + background
    const img = quad(ui, 1)
    expect(img.radius).toBeCloseTo(27, 3) // clamped to half the 54px content box → a circle
  })

  it('tintColor multiplies image colors', () => {
    const q = quad(imageUI({ tintColor: '#ff0000' }))
    expect(q.r).toBeCloseTo(1, 3)
    const g = (imageUI({ tintColor: '#ff0000' }).batch as unknown as { vertices: Float32Array }).vertices[6]!
    expect(g).toBe(0)
  })

  it('drop-shadow is a tinted, offset alpha-silhouette copy underneath', () => {
    const ui = imageUI({ dropShadow: [{ offsetX: 4, offsetY: 6, color: '#000000cc' }] })
    const lines = dumpBatch(ui)
    expect(lines).toHaveLength(2)
    const shadow = quad(ui, 0)
    const image = quad(ui, 1)
    expect(shadow.mode).toBe(6) // silhouette: the texture's alpha only
    expect([shadow.x - image.x, shadow.y - image.y]).toEqual([4, 6])
    expect(image.mode).toBe(0)
    expect(shadow.a).toBeCloseTo(0.8, 2)
  })
})

describe('createThreeUI options', () => {
  it('backdropBlur defaults to full only when the renderer can copy the framebuffer', () => {
    const ui = createThreeUI({ width: 100, height: 100 })
    expect(ui.batch.backdrop).toBeNull()
  })
})
