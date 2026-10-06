import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BitmapFontData } from '@implicit-invocation/three-2d'
import { bakeBitmapFont } from '../src'
import { encodeDistanceChannel } from '../src/distance'
import { main } from '../src/cli'

const fontPath = resolve(import.meta.dirname, '../../../test/fixtures/fonts/Inter_700Bold.ttf')
async function loadFont(): Promise<ArrayBuffer> {
  const b = await readFile(fontPath)
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer
}

/** Antialiased coverage of a disc, sampled on a pixel grid (analytic edge: 1px linear ramp). */
function disc(size: number, cx: number, cy: number, r: number): Uint8Array {
  const out = new Uint8Array(size * size)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - r
      out[y * size + x] = Math.round(Math.min(1, Math.max(0, 0.5 - d)) * 255)
    }
  return out
}

describe('distance channel', () => {
  it('encodes a signed distance (0.5 at the edge, ±range at the extremes) within sub-pixel accuracy', () => {
    const size = 64
    const range = 6
    const field = encodeDistanceChannel(disc(size, 32, 32, 14), size, size, range)
    // decode: dist = (0.5 − v) · 2 · range
    const dist = (x: number, y: number) => (0.5 - field[y * size + x]! / 255) * 2 * range
    // analytic distance for pixel centers along the x axis
    for (const x of [10, 14, 18, 22, 32, 45, 50]) {
      const expected = Math.hypot(x + 0.5 - 32, 32.5 - 32) - 14
      const clamped = Math.max(-range, Math.min(range, expected))
      // the exact transform seeds at pixel centres, so far from the edge it is off by up to ~half a pixel; near it, much better
      expect(Math.abs(dist(x, 32) - clamped)).toBeLessThan(Math.abs(expected) < 2 ? 0.3 : 0.65)
    }
    expect(field[0]).toBe(0) // far outside saturates to 0
    expect(field[32 * size + 32]).toBe(255) // deep inside saturates to 255
  })
})

describe('baking a stroke channel', () => {
  it('adds `stroke` to the JSON, widens the glyph padding and keeps coverage in alpha', async () => {
    const data = await loadFont()
    const plain = await bakeBitmapFont(data, { size: 32, characters: 'AO.' })
    const stroked = await bakeBitmapFont(data, { size: 32, characters: 'AO.', stroke: { maxWidth: 8 } })
    expect(plain.json.stroke).toBeUndefined()
    expect(stroked.json.stroke).toEqual({ maxWidth: 8 })
    expect(stroked.json.atlas.padding).toBeGreaterThanOrEqual(6) // ceil(8/2 + 1) + 1
    expect(BitmapFontData.parse(stroked.json).strokeMaxWidth).toBe(8)
    expect(BitmapFontData.parse(plain.json).strokeMaxWidth).toBe(0)
    // plain atlases keep white RGB
    expect(plain.atlas.rgba[0]).toBe(255)
    // alpha of the stroked atlas for glyph "O" (centre of the ring is empty, the ring itself is solid)
    const o = stroked.json.glyphs.find((g) => g.width > 0 && g.id === stroked.json.chars[String('O'.charCodeAt(0))])!
    const px = (x: number, y: number) => {
      const i = ((o.y + y) * stroked.atlas.width + o.x + x) * 4
      return { r: stroked.atlas.rgba[i]!, a: stroked.atlas.rgba[i + 3]! }
    }
    const mid = Math.floor(o.height / 2)
    // padding column: outside the glyph (alpha 0) but the field is already rising toward the edge (R < 128 outside, > 128 inside)
    expect(px(0, mid).a).toBe(0)
    expect(px(0, mid).r).toBeLessThan(128)
    // find an interior (alpha 255) texel of the ring and the empty counter
    const row = Array.from({ length: o.width }, (_, x) => px(x, mid))
    const solid = row.find((p) => p.a === 255)!
    expect(solid.r).toBeGreaterThan(128)
    const counter = row.slice(Math.floor(o.width / 2) - 1, Math.floor(o.width / 2) + 2)[1]!
    expect(counter.a).toBe(0)
  })

  it('CLI --stroke bakes the channel', async () => {
    const { mkdtemp, readFile: rf, rm } = await import('node:fs/promises')
    const { tmpdir } = await import('node:os')
    const { join } = await import('node:path')
    const dir = await mkdtemp(join(tmpdir(), 'stroke-'))
    try {
      const code = await main(['pack', fontPath, '--output', join(dir, 'f'), '--size', '24', '--chars', 'AB', '--stroke', '6'])
      expect(code).toBe(0)
      expect(JSON.parse(await rf(join(dir, 'f.json'), 'utf8')).stroke).toEqual({ maxWidth: 6 })
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
