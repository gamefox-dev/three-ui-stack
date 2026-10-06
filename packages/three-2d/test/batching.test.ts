import { describe, expect, it } from 'vitest'
import { NinePatch, PolygonSpriteBatch, SpriteBatch, TextureAtlas, VERTEX_STRIDE, createOrthographicCamera, parseAtlasText, type FlushReason } from '../src'
import {
  CLIP_RADIX,
  MODE_BOX,
  MODE_BOX_GRADIENT,
  MODE_BOX_GRADIENT_SMALL,
  MODE_GLYPH_SHAPED,
  MODE_RADIX,
  MODE_SHADOW_INSET_HARD,
  MODE_SHADOW_OUTER,
  MODE_SHADOW_OUTER_HARD,
  MODE_SPRITE,
  MODE_SPRITE_SHAPED,
  BatchNodeMaterial,
} from '../src/batch/BatchMaterial'
import { MockRenderer, makeTexture } from './helpers'

const verts = (b: SpriteBatch): Float32Array => (b as unknown as { vertices: Float32Array }).vertices
/** Packed `aMode` of a quad: mode, texture slot, clip entry. */
function packed(b: SpriteBatch, quad: number): { mode: number; slot: number; clip: number } {
  const v = Math.round(verts(b)[quad * 4 * VERTEX_STRIDE + 19]!)
  const clip = Math.floor(v / CLIP_RADIX)
  const rest = v - clip * CLIP_RADIX
  const slot = Math.floor(rest / MODE_RADIX)
  return { mode: rest - slot * MODE_RADIX, slot, clip }
}

describe('multi-texture batching', () => {
  it('keeps alternating textures in one draw call and writes the slot per quad', () => {
    const batch = new SpriteBatch({ maxTextures: 4 })
    const [a, b, c] = [makeTexture(), makeTexture(), makeTexture()]
    batch.begin()
    for (let i = 0; i < 3; i++) {
      batch.draw(a, i * 10, 0, 8, 8)
      batch.draw(b, i * 10, 10, 8, 8)
      batch.draw(c, i * 10, 20, 8, 8)
    }
    batch.end()
    expect(batch.maxTextures).toBe(4)
    expect(batch.segments).toHaveLength(1)
    expect(batch.segments[0]!.textures).toEqual([a, b, c])
    expect(batch.segments[0]!.texture).toBe(a)
    expect(batch.stats.textureSwitches).toBe(0)
    expect(batch.stats.texturesBound).toBe(3)
    expect([0, 1, 2, 3, 4, 5].map((q) => packed(batch, q).slot)).toEqual([0, 1, 2, 0, 1, 2])
    batch.dispose()
  })

  it('splits only when every slot is taken, blend or clip changes', () => {
    const batch = new SpriteBatch({ maxTextures: 2 })
    const reasons: FlushReason[] = []
    batch.onFlush = (r) => reasons.push(r)
    const [a, b, c] = [makeTexture(), makeTexture(), makeTexture()]
    batch.begin()
    batch.draw(a, 0, 0, 8, 8)
    batch.draw(b, 10, 0, 8, 8)
    batch.draw(a, 20, 0, 8, 8)
    batch.draw(c, 30, 0, 8, 8) // third texture, two slots: split
    batch.setBlendMode('additive')
    batch.draw(c, 40, 0, 8, 8) // blend
    batch.end()
    expect(reasons).toEqual(['texture', 'blend', 'end'])
    expect(batch.stats.textureSwitches).toBe(1)
    expect(batch.segments.map((s) => s.textures.length)).toEqual([2, 1, 1])
    batch.dispose()
  })

  it('boxes and solids ride along in any segment (slot 0, no texture)', () => {
    const batch = new PolygonSpriteBatch({ maxTextures: 2 })
    const [a, b] = [makeTexture(), makeTexture()]
    batch.begin()
    batch.fillBox({ x: 0, y: 0, width: 10, height: 10, background: '#f00' })
    batch.draw(a, 0, 0, 8, 8)
    batch.fillBox({ x: 0, y: 0, width: 10, height: 10, background: '#0f0' })
    batch.draw(b, 0, 0, 8, 8)
    batch.end()
    expect(batch.segments).toHaveLength(1)
    expect(batch.segments[0]!.textures).toEqual([a, b]) // the leading box did not take a slot
    expect(packed(batch, 1).slot).toBe(0)
    expect(packed(batch, 3).slot).toBe(1)
    batch.dispose()
  })

  it('maxTextures: 1 keeps the one-texture-per-draw behaviour; auto resolves from the renderer', () => {
    const one = new SpriteBatch({ maxTextures: 1 })
    const [a, b] = [makeTexture(), makeTexture()]
    one.begin()
    one.draw(a, 0, 0, 8, 8)
    one.draw(b, 0, 0, 8, 8)
    one.end()
    expect(one.segments).toHaveLength(2)
    one.dispose()

    // a renderer without capability info: 1; a classic-WebGLRenderer-like one: its unit budget minus the reserved ones (capped at 8)
    const plain = new SpriteBatch({ renderer: new MockRenderer() })
    plain.begin(createOrthographicCamera(10, 10))
    plain.end()
    expect(plain.maxTextures).toBe(1)
    const gl = Object.assign(new MockRenderer(), { capabilities: { maxTextures: 16 } })
    const auto = new SpriteBatch({ renderer: gl })
    auto.begin(createOrthographicCamera(10, 10))
    auto.end()
    expect(auto.maxTextures).toBe(8)
    const small = Object.assign(new MockRenderer(), { capabilities: { maxTextures: 5 } })
    const limited = new SpriteBatch({ renderer: small })
    limited.begin(createOrthographicCamera(10, 10))
    limited.end()
    expect(limited.maxTextures).toBe(3)
    for (const x of [plain, auto, limited]) x.dispose()
  })

  it('binds the slot table to the draw call material; unused slots keep distinct placeholders', () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer, maxTextures: 4 })
    const [a, b] = [makeTexture(), makeTexture()]
    batch.begin(createOrthographicCamera(100, 100))
    batch.draw(a, 0, 0, 8, 8)
    batch.draw(b, 10, 0, 8, 8)
    batch.end()
    const mesh = batch.scene.children[0] as unknown as { material: BatchNodeMaterial }
    const values = mesh.material.slots.map((s) => s.value)
    expect(values.slice(0, 2)).toEqual([a, b])
    expect(new Set(values).size).toBe(4) // two placeholders, never the same texture twice
    batch.dispose()
  })

  it('writes shaped / plain sprite modes and the cheap shader modes', () => {
    const batch = new PolygonSpriteBatch()
    const t = makeTexture()
    batch.begin(createOrthographicCamera(200, 200))
    batch.draw(t, 0, 0, 8, 8)
    batch.drawEx(t, { x: 0, y: 0, width: 8, height: 8, radius: 2 })
    batch.drawEx(t, { x: 0, y: 0, width: 8, height: 8, radius: 2, silhouette: true })
    const stops = (n: number) => Array.from({ length: n }, (_, i) => ({ position: i / (n - 1), color: '#fff' }))
    batch.fillBox({ x: 0, y: 0, width: 20, height: 20, background: '#f00' })
    batch.fillBox({ x: 0, y: 0, width: 20, height: 20, gradient: { type: 'linear', dx: 1, dy: 0, length: 20, stops: stops(3) } })
    batch.fillBox({ x: 0, y: 0, width: 20, height: 20, gradient: { type: 'linear', dx: 1, dy: 0, length: 20, stops: stops(5) } })
    batch.fillShadow({ x: 0, y: 0, width: 20, height: 20, color: '#000', blur: 6 })
    batch.fillShadow({ x: 0, y: 0, width: 20, height: 20, color: '#000', blur: 0 })
    batch.fillShadow({ x: 0, y: 0, width: 20, height: 20, color: '#000', blur: 0, inset: true })
    batch.end()
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8].map((q) => packed(batch, q).mode)).toEqual([
      MODE_SPRITE,
      MODE_SPRITE_SHAPED,
      MODE_GLYPH_SHAPED,
      MODE_BOX,
      MODE_BOX_GRADIENT_SMALL,
      MODE_BOX_GRADIENT,
      MODE_SHADOW_OUTER,
      MODE_SHADOW_OUTER_HARD,
      MODE_SHADOW_INSET_HARD,
    ])
    batch.dispose()
  })

  it('maxGradientStops caps the stops and puts every gradient on the cheap path when ≤ 3', () => {
    const batch = new PolygonSpriteBatch({ maxGradientStops: 3 })
    batch.begin(createOrthographicCamera(200, 200))
    const stops = Array.from({ length: 6 }, (_, i) => ({ position: i / 5, color: '#fff' }))
    batch.fillBox({ x: 0, y: 0, width: 20, height: 20, gradient: { type: 'linear', dx: 1, dy: 0, length: 20, stops } })
    batch.end()
    expect(batch.maxGradientStops).toBe(3)
    expect(packed(batch, 0).mode).toBe(MODE_BOX_GRADIENT_SMALL)
    expect(batch.table.data[3]).toBe(3) // 3 stops stored
    batch.dispose()
  })
})

describe('NinePatch scale, split and pad', () => {
  const quadRects = (batch: SpriteBatch): { x: number; w: number }[] => {
    const v = verts(batch)
    const out = []
    for (let q = 0; q < batch.stats.sprites; q++) out.push({ x: v[q * 4 * VERTEX_STRIDE]!, w: v[(q * 4 + 1) * VERTEX_STRIDE]! - v[q * 4 * VERTEX_STRIDE]! })
    return out
  }

  it('multiplies borders, minWidth and minHeight by the scale (logical units per source pixel)', () => {
    const patch = new NinePatch(makeTexture(60, 60), 12, 12, 12, 12, 0.5)
    expect(patch.scale).toBe(0.5)
    expect(patch.minWidth).toBe(12)
    const batch = new SpriteBatch()
    batch.begin()
    patch.draw(batch, 0, 0, 100, 50)
    batch.end()
    const r = quadRects(batch)
    expect(r[0]!.w).toBe(6) // left border: 12 source px at 0.5
    expect(r[1]!.w).toBe(88)
    expect(r[2]!.w).toBe(6)
    patch.setScale(1)
    expect(patch.minWidth).toBe(24)
    batch.dispose()
  })

  it('draw(scale) overrides for one draw; options object and numeric scale agree', () => {
    const a = new NinePatch(makeTexture(30, 30), 10, 10, 10, 10, { scale: 2 })
    const b = new NinePatch(makeTexture(30, 30), 10, 10, 10, 10, 2)
    expect(a.minWidth).toBe(b.minWidth)
    const batch = new SpriteBatch()
    batch.begin()
    a.draw(batch, 0, 0, 100, 100, 0.5)
    batch.end()
    expect(quadRects(batch)[0]!.w).toBe(5)
    expect(a.scale).toBe(2)
    batch.dispose()
  })

  it('insets UVs by half a texel when scaled (no seams), not at 1:1', () => {
    const tex = makeTexture(32, 32)
    const batch = new SpriteBatch()
    const uvOfFirstCell = (scale: number): [number, number, number, number] => {
      const patch = new NinePatch(tex, 8, 8, 8, 8, scale)
      batch.begin()
      patch.draw(batch, 0, 0, 100, 100)
      batch.end()
      const v = verts(batch)
      return [v[3]!, v[4]!, v[VERTEX_STRIDE + 3]!, v[2 * VERTEX_STRIDE + 4]!] // u, v, u2, v2 of the top-left cell
    }
    const flat = uvOfFirstCell(1)
    expect(flat[0]).toBe(0)
    expect(flat[2]).toBeCloseTo(8 / 32)
    const scaled = uvOfFirstCell(0.5)
    expect(scaled[0]).toBeCloseTo(0.5 / 32)
    expect(scaled[1]).toBeCloseTo(0.5 / 32)
    expect(scaled[2]).toBeCloseTo(7.5 / 32)
    expect(scaled[3]).toBeCloseTo(7.5 / 32)
    batch.dispose()
  })

  it('reads libGDX split / pad from atlas text and builds scaled patches with content padding', () => {
    const text = ['page.png', 'size: 64, 64', 'panel', '  bounds: 0, 0, 32, 32', '  split: 8, 6, 4, 10', '  pad: 5, 5, 3, 3', 'plain', '  bounds: 32, 0, 16, 16', ''].join('\n')
    const data = parseAtlasText(text)
    expect(data.pages[0]!.regions[0]!.splits).toEqual([8, 6, 4, 10])
    expect(data.pages[0]!.regions[0]!.pads).toEqual([5, 5, 3, 3])
    const atlas = TextureAtlas.fromText(text, () => makeTexture(64, 64))
    const patch = atlas.createPatch('panel', 0.5)
    expect([patch.left, patch.right, patch.top, patch.bottom]).toEqual([8, 6, 4, 10])
    expect(patch.minWidth).toBe(7)
    expect(patch.padding).toEqual([1.5, 2.5, 1.5, 2.5]) // [top, right, bottom, left] scaled
    expect(() => atlas.createPatch('plain')).toThrow(/no split/)
    expect(() => atlas.createPatch('missing')).toThrow(/no region/)
    expect(new NinePatch(makeTexture(), 1, 1, 1, 1).padding).toBeNull()
  })
})

describe("clip: 'shader'", () => {
  it('never splits a draw call, culls quads outside, and only straddling quads get a clip entry', () => {
    const batch = new SpriteBatch({ clip: 'shader', maxTextures: 1 })
    const reasons: FlushReason[] = []
    batch.onFlush = (r) => reasons.push(r)
    const t = makeTexture()
    batch.begin()
    batch.draw(t, 0, 0, 10, 10) // unclipped
    batch.pushClip(20, 20, 50, 50)
    batch.draw(t, 30, 30, 10, 10) // inside: no entry
    batch.draw(t, 60, 30, 20, 10) // straddles the right edge
    batch.draw(t, 100, 100, 10, 10) // outside: skipped
    batch.popClip()
    batch.draw(t, 0, 20, 10, 10)
    batch.end()
    expect(reasons).toEqual(['end'])
    expect(batch.segments).toHaveLength(1)
    expect(batch.stats.sprites).toBe(4)
    expect([0, 1, 2, 3].map((q) => packed(batch, q).clip)).toEqual([0, 0, 1, 0])
    const d = batch.clipTable!.data
    expect(Array.from(d.slice(0, 4))).toEqual([20, 20, 70, 70]) // the intersected rect
    batch.dispose()
  })

  it('needs no extra render pass: one render() for clipped content', () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer, clip: 'shader', maxTextures: 1 })
    const t = makeTexture()
    batch.begin(createOrthographicCamera(200, 200))
    batch.pushClip(10, 10, 50, 50)
    batch.draw(t, 0, 0, 100, 100)
    batch.popClip()
    batch.pushClip(100, 100, 50, 50)
    batch.draw(t, 90, 90, 100, 100)
    batch.popClip()
    batch.end()
    expect(batch.stats.renderPasses).toBe(1)
    expect(renderer.calls[0]!.scissor).toBeNull()
    const scissor = new SpriteBatch({ renderer: new MockRenderer(), maxTextures: 1 })
    scissor.begin(createOrthographicCamera(200, 200))
    scissor.pushClip(10, 10, 50, 50)
    scissor.draw(t, 0, 0, 100, 100)
    scissor.popClip()
    scissor.pushClip(100, 100, 50, 50)
    scissor.draw(t, 90, 90, 100, 100)
    scissor.popClip()
    scissor.end()
    expect(scissor.stats.renderPasses).toBe(2)
    batch.dispose()
    scissor.dispose()
  })

  it('a rounded clip also marks quads near its corners, and stores the radii', () => {
    const batch = new SpriteBatch({ clip: 'shader', maxTextures: 1 })
    const t = makeTexture()
    batch.begin()
    batch.pushClip(0, 0, 100, 100, [20, 20, 20, 20])
    batch.draw(t, 40, 40, 20, 20) // inside, clear of the corners
    batch.draw(t, 2, 2, 10, 10) // inside the rect but in the top-left corner square
    batch.popClip()
    batch.end()
    expect(packed(batch, 0).clip).toBe(0)
    expect(packed(batch, 1).clip).toBe(1)
    const d = batch.clipTable!.data
    expect(Array.from(d.slice(4, 12))).toEqual([50, 50, 50, 50, 20, 20, 20, 20])
    batch.dispose()
  })

  it('scissor mode ignores radii and still splits on clip changes', () => {
    const batch = new SpriteBatch()
    expect(batch.clipTable).toBeNull()
    const t = makeTexture()
    batch.begin()
    batch.pushClip(0, 0, 10, 10, [4, 4, 4, 4])
    batch.draw(t, 0, 0, 5, 5)
    batch.popClip()
    batch.draw(t, 0, 0, 5, 5)
    batch.end()
    expect(batch.segments).toHaveLength(2)
    batch.dispose()
  })
})

describe('materials and warmup', () => {
  it('shares two materials per blend mode however many draw calls a frame has, and binds slots per draw', () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer, maxTextures: 1 })
    const textures = Array.from({ length: 9 }, () => makeTexture())
    batch.begin(createOrthographicCamera(100, 100))
    for (const [i, t] of textures.entries()) batch.draw(t, i * 10, 0, 8, 8) // nine draw calls
    batch.setBlendMode('additive')
    batch.draw(textures[0]!, 0, 20, 8, 8)
    batch.end()
    const materials = (batch as unknown as { materials: { size: number } }).materials
    expect(materials.size).toBe(3) // nine normal draw calls share 2 materials; the single additive one adds 1
    expect(batch.meshCount).toBe(10)
    const used = new Set(batch.scene.children.map((m) => (m as unknown as { material: unknown }).material))
    expect(used.size).toBe(3)
    // each mesh binds its own textures right before drawing, even though a material is shared
    const bound: unknown[] = []
    const first = batch.scene.children[0] as unknown as { material: BatchNodeMaterial; userData: { slots: unknown[] }; onBeforeRender(...a: unknown[]): void }
    first.onBeforeRender()
    bound.push(first.material.slots[0]!.value)
    const third = batch.scene.children[2] as unknown as typeof first
    third.onBeforeRender()
    expect(bound[0]).toBe(textures[0])
    expect(third.material.slots[0]!.value).toBe(textures[2])
    batch.dispose()
  })

  it('warmup builds the shaders into a 1 × 1 scissor without touching the frame buffers', async () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer, maxTextures: 2 })
    await batch.warmup(createOrthographicCamera(100, 100), ['normal', 'additive'])
    expect(renderer.calls).toHaveLength(1)
    expect(renderer.calls[0]!.scissor).toEqual([0, 0, 1, 1])
    expect(renderer.calls[0]!.meshes).toHaveLength(4) // two materials per blend
    expect((batch as unknown as { materials: { size: number } }).materials.size).toBe(4)
    expect(batch.meshCount).toBe(0) // the real draw-call pool is untouched
    expect(batch.canReplay).toBe(false)
    // and a headless batch simply does nothing
    await new SpriteBatch().warmup(createOrthographicCamera(10, 10))
    batch.dispose()
  })
})

describe('replay', () => {
  it('draws the previous frame again without rebuilding or re-uploading it', () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer, maxTextures: 2 })
    const [a, b] = [makeTexture(), makeTexture()]
    expect(batch.canReplay).toBe(false)
    batch.begin(createOrthographicCamera(100, 100))
    batch.draw(a, 0, 0, 8, 8)
    batch.draw(b, 10, 0, 8, 8)
    batch.end()
    expect(batch.canReplay).toBe(true)
    expect(renderer.calls).toHaveLength(1)
    const sprites = batch.stats.sprites
    batch.replay()
    expect(renderer.calls).toHaveLength(2)
    expect(renderer.calls[1]!.meshes).toEqual(renderer.calls[0]!.meshes)
    expect(batch.stats.sprites).toBe(sprites) // build counters survive
    expect(batch.stats.drawCalls).toBe(1) // render counters describe the replay
    expect(batch.stats.texturesBound).toBe(2)
    batch.begin()
    expect(batch.canReplay).toBe(false) // a frame in progress
    batch.end()
    batch.dispose()
  })

  it('is refused after a mid-frame flush, without a renderer, or after the renderer changes', () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer, maxSprites: 4 })
    const t = makeTexture()
    batch.begin(createOrthographicCamera(100, 100))
    for (let i = 0; i < 6; i++) batch.draw(t, i, 0, 1, 1) // capacity flush
    batch.end()
    expect(batch.canReplay).toBe(false)
    expect(() => batch.replay()).toThrow(/finished frame/)
    batch.begin()
    batch.draw(t, 0, 0, 1, 1)
    batch.end()
    expect(batch.canReplay).toBe(true)
    batch.setRenderer(null)
    expect(batch.canReplay).toBe(false)
    batch.dispose()
  })
})
