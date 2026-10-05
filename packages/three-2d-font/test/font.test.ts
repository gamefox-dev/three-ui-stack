import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BitmapFontData, BITMAP_FONT_FORMAT } from '@implicit-invocation/three-2d'
import { AtlasPacker, CpuGlyphRasterizer, OpenTypeFontParser, bakeBitmapFont, resolveCharacters } from '../src'
import { encodePng, packFontFile } from '../src/node'
import { main } from '../src/cli'

const fontPath = resolve(import.meta.dirname, '../../../test/fixtures/fonts/Inter_400Regular.ttf')

async function loadFont(): Promise<ArrayBuffer> {
  const b = await readFile(fontPath)
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer
}

describe('AtlasPacker', () => {
  it('packs rectangles without overlap inside the atlas', () => {
    const rects = Array.from({ length: 120 }, (_, i) => ({ id: i, width: 8 + (i % 17), height: 10 + ((i * 7) % 23) }))
    const { width, height, placements } = AtlasPacker.pack(rects, { spacing: 1 })
    const byId = new Map(rects.map((r) => [r.id, r]))
    for (const p of placements) {
      const r = byId.get(p.id)!
      expect(p.x + r.width).toBeLessThanOrEqual(width)
      expect(p.y + r.height).toBeLessThanOrEqual(height)
    }
    for (let i = 0; i < placements.length; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        const a = placements[i]!
        const b = placements[j]!
        const ra = byId.get(a.id)!
        const rb = byId.get(b.id)!
        const overlap = a.x < b.x + rb.width && b.x < a.x + ra.width && a.y < b.y + rb.height && b.y < a.y + ra.height
        expect(overlap).toBe(false)
      }
    }
    expect(Math.log2(width) % 1).toBe(0)
  })

  it('throws when nothing fits', () => {
    expect(() => AtlasPacker.pack([{ id: 1, width: 600, height: 600 }], { maxWidth: 512, maxHeight: 512 })).toThrow(/do not fit/)
  })
})

describe('charsets', () => {
  it('resolves presets, literals and iterables', () => {
    expect(resolveCharacters('abc')).toEqual([97, 98, 99])
    expect(resolveCharacters('ascii')).toHaveLength(95)
    expect(resolveCharacters([100, 99, 99])).toEqual([99, 100])
  })
})

describe('OpenTypeFontParser + CpuGlyphRasterizer', () => {
  it('parses metrics and rasterizes glyphs with holes and exact bounds', async () => {
    const font = new OpenTypeFontParser().parse(await loadFont())
    expect(font.unitsPerEm).toBe(2048)
    expect(font.familyName).toMatch(/Inter/)
    const gid = font.glyphIdForCodePoint('O'.codePointAt(0)!)
    expect(gid).toBeGreaterThan(0)
    const [o] = await new CpuGlyphRasterizer().rasterize(font, [{ glyphId: gid }], { size: 48, padding: 1 })
    expect(o!.width).toBeGreaterThan(20)
    // the center of an "O" is a hole, the left stroke is filled
    const cx = Math.floor(o!.width / 2)
    const cy = Math.floor(o!.height / 2)
    expect(o!.alpha[cy * o!.width + cx]).toBe(0)
    let maxLeft = 0
    for (let x = 0; x < o!.width / 3; x++) maxLeft = Math.max(maxLeft, o!.alpha[cy * o!.width + x]!)
    expect(maxLeft).toBe(255)
    // blank glyphs have no bitmap but keep their advance
    const [space] = await new CpuGlyphRasterizer().rasterize(font, [{ glyphId: font.glyphIdForCodePoint(32) }], { size: 48 })
    expect(space!.width).toBe(0)
    expect(space!.advance).toBeGreaterThan(5)
  })
})

describe('bakeBitmapFont', () => {
  it('produces versioned JSON that round-trips and indexes glyphs by glyph id', async () => {
    const baked = await bakeBitmapFont(await loadFont(), { size: 32, characters: 'ABC abc' })
    expect(baked.json.format).toBe(BITMAP_FONT_FORMAT)
    expect(baked.json.version).toBe(1)
    expect(baked.json.chars['65']).toBeGreaterThan(0)
    const roundTripped = JSON.parse(JSON.stringify(baked.json))
    const data = BitmapFontData.parse(roundTripped)
    for (const g of baked.json.glyphs) {
      const parsed = data.glyphs.get(g.id)!
      expect(parsed).toMatchObject({ id: g.id, x: g.x, y: g.y, width: g.width, height: g.height, xOffset: g.xOffset, yOffset: g.yOffset, xAdvance: g.xAdvance })
    }
    expect(data.glyphForCodePoint(65)!.xAdvance).toBeGreaterThan(15)
    // atlas pixels are white with coverage alpha
    expect(baked.atlas.rgba.length).toBe(baked.atlas.width * baked.atlas.height * 4)
    const a = data.glyphForCodePoint(65)!
    let covered = 0
    for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) if (baked.atlas.rgba[((a.y + y) * baked.atlas.width + a.x + x) * 4 + 3]! > 0) covered++
    expect(covered).toBeGreaterThan(50)
  })

  it('rejects unknown formats and versions', () => {
    expect(() => BitmapFontData.parse({ format: 'nope', version: 1 })).toThrow(/not a three-2d-bitmap-font/)
    expect(() => BitmapFontData.parse({ format: BITMAP_FONT_FORMAT, version: 99 })).toThrow(/unsupported/)
  })
})

describe('PNG + CLI', () => {
  it('encodes a valid PNG header', () => {
    const png = encodePng(2, 2, new Uint8Array(16).fill(255))
    expect(Array.from(png.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
    const view = new DataView(png.buffer, png.byteOffset)
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([2, 2])
  })

  it('packs a font file via the CLI entry and writes png + json', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'three-2d-font-'))
    try {
      const out = join(dir, 'inter-24')
      const code = await main(['pack', fontPath, '--size', '24', '--charset', 'ascii', '--output', out])
      expect(code).toBe(0)
      const json = JSON.parse(await readFile(`${out}.json`, 'utf8'))
      expect(json.format).toBe('three-2d-bitmap-font')
      expect(json.atlas.image).toBe('inter-24.png')
      const png = await readFile(`${out}.png`)
      expect(png.subarray(1, 4).toString()).toBe('PNG')
      const direct = await packFontFile(fontPath, join(dir, 'x'), { size: 16, characters: 'ab' })
      expect(direct.baked.json.glyphs.length).toBeGreaterThanOrEqual(3) // a, b, .notdef
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
