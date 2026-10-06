import { SRGBColorSpace, Texture } from 'three'
import { BitmapFont, BitmapFontData, configureTexture } from '@implicit-invocation/three-2d'
import type { FontRegistry } from '@implicit-invocation/three-ui'

/** Load an image as a three-2d texture (v = 0 is the top row, sRGB color data). */
export async function loadTexture(url: string, options: { mipmaps?: boolean; srgb?: boolean } = {}): Promise<Texture> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`failed to load ${url}: ${res.status}`)
  const bitmap = await createImageBitmap(await res.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' })
  const texture = new Texture(bitmap as unknown as HTMLImageElement)
  if (options.srgb !== false) texture.colorSpace = SRGBColorSpace
  return configureTexture(texture, { mipmaps: options.mipmaps ?? false })
}

/** Load a bitmap font baked by `@implicit-invocation/three-2d-font` (`<name>.json` + `<name>.png`) from `/fonts`. */
export async function loadBitmapFont(name: string): Promise<BitmapFont> {
  const [json, texture] = await Promise.all([
    fetch(`/fonts/${name}.json`).then((r) => r.json()),
    // glyph atlases are white + coverage alpha: no color management, mipmaps help when scaled down
    loadTexture(`/fonts/${name}.png`, { mipmaps: true, srgb: false }),
  ])
  return new BitmapFont(BitmapFontData.parse(json), texture)
}

/** Register the prebuilt Inter regular/bold fonts (two sizes each) in a UI font registry. */
export async function registerInterFonts(registry: FontRegistry): Promise<void> {
  const names = ['inter-regular-24', 'inter-regular-48', 'inter-bold-24', 'inter-bold-48']
  const fonts = await Promise.all(names.map(loadBitmapFont))
  for (const f of fonts) registry.register(f)
}

/** Register the stroke-capable "Inter Display" faces (weight 800): the only fonts baked with a distance channel for text outlines / shadows. */
export async function registerDisplayFonts(registry: FontRegistry): Promise<void> {
  const fonts = await Promise.all(['game-display-32', 'game-display-64'].map(loadBitmapFont))
  for (const f of fonts) registry.register(f)
}
