import { describe, expect, it } from 'vitest'
import {
  Animation,
  Color4,
  ExtendViewport,
  FillViewport,
  FitViewport,
  NinePatch,
  ParticleEffect,
  ParticleEmitter,
  ScreenViewport,
  SpriteBatch,
  TextureAtlas,
  TextureRegion,
  packColor,
  parseColor,
  unpackColor,
  createOrthographicCamera,
} from '../src'
import { makeTexture } from './helpers'

describe('color', () => {
  it('parses css-like strings and packs/unpacks', () => {
    expect(Color4.from('#f00').toHex()).toBe('#ff0000')
    expect(Color4.from('#11223344').a).toBeCloseTo(0x44 / 255)
    expect(Color4.from('rgb(255 128 0 / 50%)').a).toBeCloseTo(0.5)
    expect(Color4.from('hsl(120, 100%, 50%)').g).toBeCloseTo(1)
    expect(Color4.from('transparent').a).toBe(0)
    expect(Color4.from(0x336699).b).toBeCloseTo(0x99 / 255)
    expect(() => Color4.from('nope')).toThrow(/invalid color/)
    const packed = packColor(1, 0.5, 0.25, 1)
    const c = unpackColor(packed, new Color4())
    expect(c.r).toBeCloseTo(1)
    expect(c.g).toBeCloseTo(0.5, 1)
    expect(parseColor([0.1, 0.2, 0.3], new Color4()).a).toBe(1)
  })
})

describe('TextureRegion', () => {
  it('computes UVs from pixel rects and splits grids', () => {
    const tex = makeTexture(128, 64)
    const r = new TextureRegion(tex, 32, 16, 32, 16)
    expect([r.u, r.v, r.u2, r.v2]).toEqual([0.25, 0.25, 0.5, 0.5])
    const grid = new TextureRegion(tex).split(32, 32)
    expect(grid).toHaveLength(2)
    expect(grid[0]).toHaveLength(4)
    expect(grid[1]![3]!.regionX).toBe(96)
    const f = r.clone().flip(true, false)
    expect(f.isFlipX()).toBe(true)
    expect(f.u).toBe(0.5)
  })
})

describe('TextureAtlas', () => {
  const text = `page.png
size: 128,64
format: RGBA8888
filter: Linear,Linear
repeat: none
hero
  rotate: false
  xy: 0, 0
  size: 32, 32
  orig: 32, 32
  offset: 0, 0
  index: 1
hero
  rotate: false
  xy: 32, 0
  size: 32, 32
  orig: 32, 32
  offset: 0, 0
  index: 0
coin
  bounds: 64,0,16,16
`
  it('parses the libGDX text format and resolves regions by name/index', () => {
    const tex = makeTexture(128, 64)
    const atlas = TextureAtlas.fromText(text, () => tex)
    expect(atlas.regions).toHaveLength(3)
    expect(atlas.findRegions('hero').map((r) => r.index)).toEqual([0, 1])
    expect(atlas.findRegion('hero', 1)!.regionX).toBe(0)
    expect(atlas.findRegion('coin')!.u).toBe(0.5)
    expect(atlas.findRegion('missing')).toBeUndefined()
  })

  it('disposes textures once', () => {
    const tex = makeTexture()
    let disposed = 0
    tex.addEventListener('dispose', () => disposed++)
    const atlas = TextureAtlas.fromData({ pages: [{ name: 'a', regions: [{ name: 'x', x: 0, y: 0, width: 4, height: 4 }] }] }, () => tex)
    atlas.dispose()
    atlas.dispose()
    expect(disposed).toBe(1)
  })
})

describe('Animation', () => {
  const frames = ['a', 'b', 'c', 'd']
  it('selects frames for each play mode', () => {
    expect(new Animation(0.1, frames).getKeyFrame(0.25)).toBe('c')
    expect(new Animation(0.1, frames).getKeyFrame(99)).toBe('d')
    expect(new Animation(0.1, frames, 'loop').getKeyFrame(0.45)).toBe('a')
    expect(new Animation(0.1, frames, 'reversed').getKeyFrame(0)).toBe('d')
    expect(new Animation(0.1, frames, 'loopReversed').getKeyFrame(0.1)).toBe('c')
    const pp = new Animation(1, frames, 'loopPingPong')
    expect([0, 1, 2, 3, 4, 5, 6].map((t) => pp.getKeyFrame(t))).toEqual(['a', 'b', 'c', 'd', 'c', 'b', 'a'])
    expect(new Animation(0.1, frames).isAnimationFinished(0.4)).toBe(true)
    expect(new Animation(0.1, frames, 'loop').isAnimationFinished(100)).toBe(false)
    expect(() => new Animation(1, [])).toThrow()
  })
})

describe('viewports', () => {
  it('Fit letterboxes, Fill crops, Extend grows, Screen follows', () => {
    const fit = new FitViewport(100, 100)
    fit.update(200, 100)
    expect([fit.screenX, fit.screenWidth, fit.screenHeight]).toEqual([50, 100, 100])
    const fill = new FillViewport(100, 100)
    fill.update(200, 100)
    expect([fill.screenWidth, fill.screenHeight, fill.screenY]).toEqual([200, 200, -50])
    const ext = new ExtendViewport(100, 100)
    ext.update(200, 100)
    expect([ext.worldWidth, ext.worldHeight]).toEqual([200, 100])
    const screen = new ScreenViewport()
    screen.update(321, 123, true)
    expect([screen.worldWidth, screen.worldHeight]).toEqual([321, 123])
  })

  it('projects and unprojects consistently (y-down, centered camera)', () => {
    const vp = new FitViewport(100, 100, createOrthographicCamera(100, 100))
    vp.update(400, 200, true)
    const w = vp.unproject(150, 0)
    expect(w).toEqual({ x: 25, y: 0 })
    const s = vp.project(100, 100)
    expect(s).toEqual({ x: 300, y: 200 })
  })
})

describe('NinePatch', () => {
  it('emits nine quads and scales corners down below the minimum size', () => {
    const batch = new SpriteBatch()
    const patch = new NinePatch(makeTexture(30, 30), 10, 10, 10, 10)
    batch.begin()
    patch.draw(batch, 0, 0, 100, 50)
    expect(batch.stats.sprites).toBe(9)
    patch.draw(batch, 0, 0, 10, 10)
    batch.end()
    expect(batch.stats.sprites).toBe(13) // zero-sized center/edge patches are skipped
    expect(patch.minWidth).toBe(20)
    batch.dispose()
  })
})

describe('particles', () => {
  it('spawns, ages and recycles particles deterministically', () => {
    const make = () =>
      new ParticleEmitter({ region: new TextureRegion(makeTexture()), emissionRate: 100, lifetime: 0.5, maxParticles: 20, seed: 7 })
    const a = make()
    const b = make()
    for (let i = 0; i < 30; i++) {
      a.update(0.05)
      b.update(0.05)
    }
    expect(a.activeCount).toBeLessThanOrEqual(20)
    expect(a.activeCount).toBe(b.activeCount)
    a.allowCompletion()
    for (let i = 0; i < 20; i++) a.update(0.1)
    expect(a.isComplete()).toBe(true)
    const effect = new ParticleEffect([b])
    const batch = new SpriteBatch()
    batch.begin()
    effect.draw(batch)
    batch.end()
    expect(batch.stats.sprites).toBe(b.activeCount)
    effect.dispose()
    batch.dispose()
  })
})
