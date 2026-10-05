import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DataTexture, RGBAFormat, UnsignedByteType } from 'three'
import { BitmapFont, BitmapFontData, configureTexture } from 'three-2d'
import { FontRegistry, createThreeUI, type ThreeUI, type ThreeUIOptions } from '../src'

const fontDir = resolve(import.meta.dirname, '../../../test/fixtures/public/fonts')

export function loadFixtureFonts(): FontRegistry {
  const fonts = new FontRegistry()
  for (const name of ['inter-regular-24', 'inter-regular-48', 'inter-bold-24', 'inter-bold-48']) {
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
