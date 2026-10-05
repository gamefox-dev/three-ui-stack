import {
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  NearestFilter,
  NearestMipmapNearestFilter,
  type Texture,
} from 'three'

export interface ConfigureTextureOptions {
  filter?: 'linear' | 'nearest'
  /** Generate mipmaps (better minification for text/icons scaled down a lot). */
  mipmaps?: boolean
}

/**
 * Apply the texture settings three-2d expects: no Y flip (v=0 is the top row), clamped edges,
 * and linear or nearest filtering. Returns the same texture for chaining.
 */
export function configureTexture<T extends Texture>(texture: T, options: ConfigureTextureOptions = {}): T {
  const { filter = 'linear', mipmaps = false } = options
  texture.flipY = false
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.magFilter = filter === 'nearest' ? NearestFilter : LinearFilter
  texture.generateMipmaps = mipmaps
  texture.minFilter = mipmaps
    ? filter === 'nearest'
      ? NearestMipmapNearestFilter
      : LinearMipmapLinearFilter
    : filter === 'nearest'
      ? NearestFilter
      : LinearFilter
  texture.premultiplyAlpha = false
  texture.needsUpdate = true
  return texture
}
