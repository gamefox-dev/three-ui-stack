import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BitmapFont, BitmapFontData, GlyphLayout, SpriteBatch } from '../src'
import { makeTexture } from './helpers'

const json = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../../test/fixtures/public/fonts/inter-regular-24.json'), 'utf8'))
const font = new BitmapFont(BitmapFontData.parse(json), makeTexture(json.atlas.width, json.atlas.height))

describe('GlyphLayout', () => {
  it('measures a single line deterministically', () => {
    const a = new GlyphLayout().setText(font, 'Hello world')
    const b = new GlyphLayout().setText(font, 'Hello world')
    expect(a.width).toBeGreaterThan(80)
    expect(a.width).toBe(b.width)
    expect(a.lines).toHaveLength(1)
    expect(a.height).toBe(font.lineHeight)
    const half = new GlyphLayout().setText(font, 'Hello world', { scale: 0.5 })
    expect(half.width).toBeCloseTo(a.width / 2, 3)
  })

  it('wraps at word boundaries and trims trailing spaces', () => {
    const full = new GlyphLayout().setText(font, 'one two three four')
    const wrapped = new GlyphLayout().setText(font, 'one two three four', { width: full.width / 2 })
    expect(wrapped.lines.length).toBeGreaterThan(1)
    expect(wrapped.width).toBeLessThanOrEqual(full.width / 2 + 0.01)
    expect(wrapped.height).toBe(wrapped.lines.length * font.lineHeight)
    // nothing is lost except the spaces at wrap points
    expect(wrapped.glyphs.length).toBeGreaterThanOrEqual('onetwothreefour'.length)
  })

  it('breaks inside a word that is wider than the container', () => {
    const l = new GlyphLayout().setText(font, 'Supercalifragilistic', { width: 40 })
    expect(l.lines.length).toBeGreaterThan(1)
    for (const line of l.lines) expect(line.width).toBeLessThanOrEqual(40 + 0.01)
  })

  it('handles explicit newlines, empty lines and maxLines', () => {
    const l = new GlyphLayout().setText(font, 'a\n\nb')
    expect(l.lines).toHaveLength(3)
    expect(l.lines[1]!.end - l.lines[1]!.start).toBe(0)
    expect(new GlyphLayout().setText(font, 'a\nb\nc', { maxLines: 2 }).lines).toHaveLength(2)
  })

  it('aligns lines inside the wrap width', () => {
    const left = new GlyphLayout().setText(font, 'a\nbbbb', { width: 200, align: 'left' })
    const right = new GlyphLayout().setText(font, 'a\nbbbb', { width: 200, align: 'right' })
    const center = new GlyphLayout().setText(font, 'a\nbbbb', { width: 200, align: 'center' })
    expect(left.lines[0]!.x).toBe(0)
    expect(right.lines[0]!.x).toBeCloseTo(200 - right.lines[0]!.width)
    expect(center.lines[0]!.x).toBeCloseTo((200 - center.lines[0]!.width) / 2)
  })

  it('falls back for unmapped code points instead of throwing', () => {
    const l = new GlyphLayout().setText(font, '中')
    expect(l.glyphs).toHaveLength(1)
  })
})

describe('BitmapFont.draw', () => {
  it('emits one quad per visible glyph through the batch and counts glyphs', () => {
    const batch = new SpriteBatch()
    batch.begin()
    font.draw(batch, 'Hi there', 10, 10, { color: '#ff0000' })
    batch.end()
    expect(batch.stats.sprites).toBe('Hithere'.length)
    expect(batch.stats.glyphs).toBe('Hi there'.length)
    expect(batch.segments).toHaveLength(1)
    expect(batch.color.r).toBe(1) // tint restored (default white)
    expect(batch.color.g).toBe(1)
    batch.dispose()
  })

  it('disposes its texture once', () => {
    const f = new BitmapFont(BitmapFontData.parse(json), makeTexture())
    let n = 0
    f.texture.addEventListener('dispose', () => n++)
    f.dispose()
    f.dispose()
    expect(n).toBe(1)
  })
})
