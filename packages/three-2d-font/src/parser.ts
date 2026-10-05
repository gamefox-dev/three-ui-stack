import * as opentypeNs from 'opentype.js'
import type { Font as OTFont } from 'opentype.js'
import type { FontParser, ParsedFont, ParsedGlyph, PathCommand } from './types'

type OpentypeApi = { parse(buffer: ArrayBuffer): OTFont }

// The UMD build (Node resolves `main`) exposes parse on `default`; bundlers expose it as a named export.
const api: OpentypeApi = (opentypeNs as unknown as OpentypeApi).parse
  ? (opentypeNs as unknown as OpentypeApi)
  : (opentypeNs as unknown as { default: OpentypeApi }).default

function readName(names: Record<string, any>, key: string): string {
  for (const table of [names, names.windows, names.macintosh, names.unicode]) {
    const entry = table?.[key]
    if (entry && typeof entry === 'object') {
      const v = entry.en ?? Object.values(entry)[0]
      if (typeof v === 'string') return v
    }
  }
  return ''
}

/** Default `FontParser` backed by opentype.js. Input is a plain `ArrayBuffer` (no fetch/DOM). */
export class OpenTypeFontParser implements FontParser {
  parse(data: ArrayBuffer): ParsedFont {
    let font: OTFont
    try {
      font = api.parse(data)
    } catch (error) {
      throw new Error(`[three-2d-font] could not parse the font (unsupported or corrupt TTF/OTF/WOFF): ${(error as Error).message}`)
    }
    if (font.numGlyphs === 0 || !font.glyphs) throw new Error('[three-2d-font] the font contains no glyphs')
    const os2 = font.tables.os2 as { usWeightClass?: number } | undefined
    const hhea = font.tables.hhea as { lineGap?: number } | undefined
    const cache = new Map<number, ParsedGlyph>()
    const cp2gid = new Map<number, number>()

    return {
      familyName: readName(font.names, 'preferredFamily') || readName(font.names, 'fontFamily') || 'Unknown',
      styleName: readName(font.names, 'preferredSubfamily') || readName(font.names, 'fontSubfamily') || 'Regular',
      weight: os2?.usWeightClass ?? 400,
      unitsPerEm: font.unitsPerEm,
      ascender: font.ascender,
      descender: font.descender,
      lineGap: hhea?.lineGap ?? 0,
      glyphCount: font.numGlyphs,
      glyphIdForCodePoint(cp: number): number {
        let id = cp2gid.get(cp)
        if (id === undefined) {
          id = font.charToGlyphIndex(String.fromCodePoint(cp))
          cp2gid.set(cp, id)
        }
        return id
      },
      glyph(id: number): ParsedGlyph {
        let g = cache.get(id)
        if (!g) {
          const src = font.glyphs.get(id)
          g = {
            id,
            advanceWidth: src.advanceWidth ?? 0,
            path: src.path.commands.map((c): PathCommand => {
              switch (c.type) {
                case 'Q':
                  return { type: 'Q', x1: c.x1!, y1: c.y1!, x: c.x!, y: c.y! }
                case 'C':
                  return { type: 'C', x1: c.x1!, y1: c.y1!, x2: c.x2!, y2: c.y2!, x: c.x!, y: c.y! }
                case 'Z':
                  return { type: 'Z' }
                default:
                  return { type: c.type, x: c.x!, y: c.y! }
              }
            }),
          }
          cache.set(id, g)
        }
        return g
      },
      kerning(l: number, r: number): number {
        try {
          return font.getKerningValue(font.glyphs.get(l), font.glyphs.get(r)) || 0
        } catch {
          return 0
        }
      },
    }
  }
}
