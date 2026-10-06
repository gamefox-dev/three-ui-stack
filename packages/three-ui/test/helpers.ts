import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DataTexture, RGBAFormat, UnsignedByteType } from 'three'
import { BitmapFont, BitmapFontData, configureTexture } from '@implicit-invocation/three-2d'
import { FontRegistry, createThreeUI, type ThreeUI, type ThreeUIOptions } from '../src'

const fontDir = resolve(import.meta.dirname, '../../../test/fixtures/public/fonts')

export function loadFixtureFonts(names: string[] = ['inter-regular-24', 'inter-regular-48', 'inter-bold-24', 'inter-bold-48']): FontRegistry {
  const fonts = new FontRegistry()
  for (const name of names) {
    const json = JSON.parse(readFileSync(resolve(fontDir, `${name}.json`), 'utf8'))
    const tex = configureTexture(new DataTexture(new Uint8Array(4).fill(255), 1, 1, RGBAFormat, UnsignedByteType))
    // the real atlas pixels are irrelevant headless, but region UVs come from the JSON metrics
    fonts.register(new BitmapFont(BitmapFontData.parse(json), tex))
  }
  return fonts
}

export function makeUI(options: Partial<ThreeUIOptions> = {}): ThreeUI {
  return createThreeUI({ width: 400, height: 300, fonts: loadFixtureFonts(), ...options })
}

export function makeTexture(w = 16, h = 16): DataTexture {
  return configureTexture(new DataTexture(new Uint8Array(w * h * 4).fill(255), w, h, RGBAFormat, UnsignedByteType))
}

/** Inter regular/bold plus the stroke-capable "Inter Display" faces (distance channel) used for text outlines / shadows. */
export function loadFixtureFontsWithDisplay(): FontRegistry {
  return loadFixtureFonts(['inter-regular-24', 'inter-regular-48', 'inter-bold-24', 'inter-bold-48', 'game-display-32', 'game-display-64'])
}

const MODE_NAMES = ['sprite', 'solid', 'box', 'shadow', 'inset', 'glyphfx', 'glyph', 'backdrop']
/** Shader mode ids ≥ 8 are cost variants of a base mode (gradient size, shaped sprite, hard shadow): dumps show the base name. */
const BASE_MODE = [0, 1, 2, 3, 4, 5, 6, 7, 2, 2, 0, 1, 6, 3, 4]

/** Human-readable dump of what the last frame wrote into the batch: one line per quad (+ table entry for box-like quads). */
export function dumpBatch(ui: ThreeUI): string[] {
  const b = ui.batch as unknown as { vertices: Float32Array; vertexCount: number; table: { data: Float32Array } }
  const f = b.vertices
  const stride = 21
  const r = (n: number) => String(Math.round(n * 1000) / 1000)
  const lines: string[] = []
  for (let q = 0; q < b.vertexCount / 4; q++) {
    const v0 = q * 4 * stride
    const v2 = (q * 4 + 2) * stride
    const mode = BASE_MODE[f[v0 + 19]! % 16]!
    const name = MODE_NAMES[mode] ?? `mode${mode}`
    let line = `${name} (${r(f[v0]!)},${r(f[v0 + 1]!)})-(${r(f[v2]!)},${r(f[v2 + 1]!)}) a=${r(f[v0 + 8]!)}`
    if (mode >= 2 && mode <= 4) {
      const texels = mode === 2 ? 6 : 6
      const start = f[v0 + 20]! * 4
      line += ` data=[${Array.from(b.table.data.slice(start, start + texels * 4), r).join(',')}]`
    }
    lines.push(line)
  }
  return lines
}
