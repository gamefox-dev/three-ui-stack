import { describe, expect, it } from 'vitest'
import { PolygonSpriteBatch, SpriteBatch, TextureRegion, VERTEX_STRIDE, createOrthographicCamera, type FlushReason } from '../src'
import { MockRenderer, makeTexture } from './helpers'

describe('SpriteBatch', () => {
  it('renders 1000+ sprites of one texture as a single draw call', () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer })
    const tex = makeTexture()
    batch.begin(createOrthographicCamera(800, 600))
    for (let i = 0; i < 2000; i++) batch.draw(tex, (i % 50) * 10, Math.floor(i / 50) * 10, 8, 8)
    batch.end()
    expect(batch.stats.sprites).toBe(2000)
    expect(batch.stats.drawCalls).toBe(1)
    expect(batch.segments).toHaveLength(1)
    expect(batch.segments[0]!.indexCount).toBe(2000 * 6)
    expect(renderer.calls).toHaveLength(1)
    // no per-sprite Three objects: a single mesh serves every sprite
    expect(batch.meshCount).toBe(1)
    batch.dispose()
  })

  it('writes correct vertex positions, UVs and color', () => {
    const batch = new SpriteBatch()
    const tex = makeTexture(100, 100)
    const region = new TextureRegion(tex, 10, 20, 30, 40)
    batch.begin()
    batch.setColor('#ff000080')
    batch.draw(region, 5, 6, 30, 40)
    batch.end()
    const v = (batch as unknown as { vertices: Float32Array }).vertices
    // TL
    expect([v[0], v[1]]).toEqual([5, 6])
    expect(v[3]).toBeCloseTo(0.1)
    expect(v[4]).toBeCloseTo(0.2)
    // BR (third vertex)
    const br = 2 * VERTEX_STRIDE
    expect([v[br], v[br + 1]]).toEqual([35, 46])
    expect(v[br + 3]).toBeCloseTo(0.4)
    expect(v[br + 4]).toBeCloseTo(0.6)
    expect(v[5]).toBeCloseTo(1)
    expect(v[8]).toBeCloseTo(128 / 255, 2)
    batch.dispose()
  })

  it('flushes on texture, blend and clip changes in draw order', () => {
    const batch = new SpriteBatch()
    const reasons: FlushReason[] = []
    batch.onFlush = (r) => reasons.push(r)
    const a = makeTexture()
    const b = makeTexture()
    batch.begin()
    batch.draw(a, 0, 0, 1, 1)
    batch.draw(a, 1, 0, 1, 1)
    batch.draw(b, 2, 0, 1, 1) // texture
    batch.setBlendMode('additive')
    batch.draw(b, 3, 0, 1, 1) // blend
    batch.pushClip(0, 0, 10, 10)
    batch.draw(b, 4, 0, 1, 1) // clip
    batch.popClip()
    batch.draw(b, 5, 0, 1, 1) // clip back
    batch.end()
    expect(reasons).toEqual(['texture', 'blend', 'clip', 'clip', 'end'])
    expect(batch.segments.map((s) => s.indexCount / 6)).toEqual([2, 1, 1, 1, 1].slice(0, 5).map((n, i) => [2, 1, 1, 1, 1][i]))
    expect(batch.segments[0]!.texture).toBe(a)
    batch.dispose()
  })

  it('lets solid fills join the current segment instead of switching texture', () => {
    const batch = new SpriteBatch()
    const font = makeTexture()
    batch.begin()
    batch.draw(font, 0, 0, 8, 8)
    batch.fillRect(10, 0, 8, 8, { color: '#f00', radius: 2 }) // solid: no texture switch
    batch.draw(font, 20, 0, 8, 8)
    batch.fillRect(30, 0, 8, 8)
    batch.end()
    expect(batch.segments).toHaveLength(1)
    expect(batch.stats.flushReasons.texture).toBe(0)
    const v = (batch as unknown as { vertices: Float32Array }).vertices
    expect(v[19]).toBe(0) // textured quad
    expect(v[4 * VERTEX_STRIDE + 19]).toBe(1) // solid quad
    batch.dispose()
  })

  it('flushes for capacity and keeps drawing', () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer, maxSprites: 10 })
    const tex = makeTexture()
    batch.begin(createOrthographicCamera(100, 100))
    for (let i = 0; i < 25; i++) batch.draw(tex, i, 0, 1, 1)
    batch.end()
    expect(batch.stats.flushReasons.capacity).toBe(2)
    expect(renderer.calls).toHaveLength(3)
    expect(batch.stats.sprites).toBe(25)
    batch.dispose()
  })

  it('throws outside begin/end and when capacity is exceeded without a renderer', () => {
    const batch = new SpriteBatch({ maxSprites: 2 })
    const tex = makeTexture()
    expect(() => batch.draw(tex, 0, 0, 1, 1)).toThrow(/outside begin/)
    batch.begin()
    batch.draw(tex, 0, 0, 1, 1)
    batch.draw(tex, 0, 0, 1, 1)
    expect(() => batch.draw(tex, 0, 0, 1, 1)).toThrow(/capacity/)
    expect(() => batch.begin()).toThrow(/twice/)
    batch.dispose()
  })

  it('intersects nested clips and tracks the clip stack', () => {
    const batch = new SpriteBatch()
    batch.begin()
    batch.pushClip(0, 0, 100, 100)
    batch.pushClip(50, 50, 100, 100)
    expect(batch.clip).toMatchObject({ x: 50, y: 50, width: 50, height: 50 })
    expect(batch.clipDepth).toBe(2)
    batch.popClip()
    expect(batch.clip).toMatchObject({ x: 0, y: 0, width: 100, height: 100 })
    batch.popClip()
    expect(batch.clip).toBeNull()
    expect(() => batch.popClip()).toThrow()
    batch.end()
    batch.dispose()
  })

  it('applies the transform stack to geometry and clips', () => {
    const batch = new SpriteBatch()
    const tex = makeTexture()
    batch.begin()
    batch.pushTransform()
    ;(batch.currentTransform as { translate(x: number, y: number): unknown }).translate(10, 20)
    batch.draw(tex, 1, 2, 3, 4)
    batch.popTransform()
    batch.end()
    const v = (batch as unknown as { vertices: Float32Array }).vertices
    expect([v[0], v[1]]).toEqual([11, 22])
    batch.dispose()
  })

  it('converts clips to scissor rects through the camera and viewport', () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer })
    const tex = makeTexture()
    batch.begin(createOrthographicCamera(800, 600))
    batch.draw(tex, 0, 0, 10, 10)
    batch.pushClip(100, 50, 200, 100)
    batch.draw(tex, 120, 60, 10, 10)
    batch.popClip()
    batch.end()
    expect(renderer.calls[0]!.scissor).toBeNull()
    expect(renderer.calls[1]!.scissor).toEqual([100, 50, 200, 100])
    expect(batch.stats.renderPasses).toBe(2)
    // scissor state is restored
    expect(renderer.getScissorTest()).toBe(false)
    expect(renderer.autoClear).toBe(true)
    batch.dispose()
  })

  it('draws rotated sprites around their origin', () => {
    const batch = new SpriteBatch()
    const tex = makeTexture()
    batch.begin()
    batch.drawEx(tex, { x: 0, y: 0, width: 10, height: 10, originX: 5, originY: 5, rotation: Math.PI / 2 })
    batch.end()
    const v = (batch as unknown as { vertices: Float32Array }).vertices
    // TL (0,0) rotated 90° about (5,5) → (10,0)
    expect(v[0]).toBeCloseTo(10)
    expect(v[1]).toBeCloseTo(0)
    batch.dispose()
  })

  it('encodes rounded-rect shape data for the SDF path', () => {
    const batch = new SpriteBatch()
    batch.begin()
    batch.fillRect(0, 0, 100, 40, { color: '#fff', radius: 8, borderWidth: 2, borderColor: '#f00' })
    batch.end()
    const v = (batch as unknown as { vertices: Float32Array }).vertices
    expect([v[11], v[12], v[13], v[14]]).toEqual([50, 20, 8, 2])
    expect([v[9], v[10]]).toEqual([-50, -20])
    expect(v[15]).toBe(1)
    batch.dispose()
  })

  it('disposal is idempotent', () => {
    const batch = new SpriteBatch({ renderer: new MockRenderer() })
    batch.begin(createOrthographicCamera(10, 10))
    batch.fillRect(0, 0, 1, 1)
    batch.end()
    batch.dispose()
    expect(() => batch.dispose()).not.toThrow()
    expect(batch.isDisposed).toBe(true)
  })
})

describe('PolygonSpriteBatch', () => {
  it('draws fan-triangulated polygons and fills', () => {
    const batch = new PolygonSpriteBatch()
    batch.begin()
    batch.fillPolygon([0, 0, 10, 0, 10, 10, 0, 10], { color: '#0f0' })
    batch.end()
    expect(batch.segments[0]!.indexCount).toBe(6)
    expect(batch.bufferedVertices).toBe(4)
    batch.dispose()
  })
})
