// Minimal ambient typing for the subset of opentype.js 2.x we use. Never exposed in the public API.
declare module 'opentype.js' {
  export interface PathCommand {
    type: 'M' | 'L' | 'Q' | 'C' | 'Z'
    x?: number
    y?: number
    x1?: number
    y1?: number
    x2?: number
    y2?: number
  }
  export interface Glyph {
    index: number
    advanceWidth?: number
    path: { commands: PathCommand[] }
  }
  export interface Font {
    unitsPerEm: number
    ascender: number
    descender: number
    numGlyphs: number
    names: Record<string, unknown>
    tables: Record<string, any>
    glyphs: { get(index: number): Glyph }
    charToGlyphIndex(char: string): number
    getKerningValue(left: Glyph | number, right: Glyph | number): number
  }
  export function parse(buffer: ArrayBuffer, options?: Record<string, unknown>): Font
  const _default: { parse: typeof parse }
  export default _default
}
