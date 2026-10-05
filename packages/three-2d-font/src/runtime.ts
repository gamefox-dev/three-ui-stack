import { DataTexture, RGBAFormat, UnsignedByteType } from 'three'
import { BitmapFont, BitmapFontData, configureTexture } from 'three-2d'
import { bakeBitmapFont, type BakeOptions, type BakedBitmapFont } from './bake'
import { CpuGlyphRasterizer } from './rasterizer/CpuGlyphRasterizer'
import { ThreeGlyphRasterizer, type GlyphRasterizerRenderer } from './rasterizer/ThreeGlyphRasterizer'

export interface PackBitmapFontOptions extends Omit<BakeOptions, 'rasterizer' | 'imageName'> {
  /**
   * Caller-owned Three renderer: glyphs are rasterized into a render target on the GPU. Without it the
   * pure-JS CPU rasterizer is used (identical output format, slower for large charsets).
   */
  renderer?: GlyphRasterizerRenderer
  /** Mipmaps help when text is drawn much smaller than the baked size (default true). */
  mipmaps?: boolean
}

/** Bake and upload a bitmap font at runtime. Prefer the CLI for production assets. */
export async function packBitmapFont(fontBytes: ArrayBuffer, options: PackBitmapFontOptions): Promise<BitmapFont> {
  const { renderer, mipmaps = true, ...bake } = options
  const rasterizer = renderer ? new ThreeGlyphRasterizer({ renderer }) : new CpuGlyphRasterizer()
  const baked = await bakeBitmapFont(fontBytes, { ...bake, rasterizer })
  return createBitmapFont(baked, mipmaps)
}

/** Turn baked pixels + metrics into a drawable `BitmapFont` (creates the texture). */
export function createBitmapFont(baked: BakedBitmapFont, mipmaps = true): BitmapFont {
  const { width, height, rgba } = baked.atlas
  const texture = configureTexture(new DataTexture(rgba, width, height, RGBAFormat, UnsignedByteType), { mipmaps })
  return new BitmapFont(new BitmapFontData(baked.json), texture)
}
