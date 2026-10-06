export type { Disposable, Rect, ColorLike, BlendMode, FlushReason } from './types'
export { RenderStats } from './types'
export { Color4, parseColor, packColor, unpackColor } from './color'
export { Affine2 } from './math'

export { TextureRegion, fullRegion, textureSize } from './texture/TextureRegion'
export { configureTexture, type ConfigureTextureOptions } from './texture/configureTexture'
export {
  TextureAtlas,
  AtlasRegion,
  parseAtlasText,
  type AtlasData,
  type AtlasPageData,
  type AtlasRegionData,
  type TextureResolver,
} from './texture/TextureAtlas'
export { NinePatch, type NinePatchOptions } from './texture/NinePatch'

export { Animation, type PlayMode } from './animation/Animation'
export { Sprite } from './sprite/Sprite'

export { createOrthographicCamera, updateOrthographicCamera } from './camera/OrthographicCamera'
export {
  Viewport,
  StretchViewport,
  FitViewport,
  FillViewport,
  ExtendViewport,
  ScreenViewport,
  type Vec2Like,
  type ViewportRenderer,
} from './camera/Viewport'

export {
  SpriteBatch,
  type BatchOptions,
  type BatchRenderer,
  type BatchDrawOptions,
  type BatchSegment,
  type ClipRect,
  type ShapeOptions,
  type BoxOptions,
  type BoxShadowOptions,
  type BackdropOptions,
} from './batch/SpriteBatch'
export { BackdropBlur, LARGE_BLUR_RADIUS, type BackdropQuality, type BackdropRenderer } from './batch/BackdropBlur'
export { normalizeRadii, srgbToOklab, type BoxGradient, type BoxGradientStop, type Radii4, type Sides4 } from './batch/boxGeometry'
export { BoxTable } from './batch/BoxTable'
export { MAX_GRADIENT_STOPS } from './batch/BatchMaterial'
export { PolygonSpriteBatch, type PolygonOptions } from './batch/PolygonSpriteBatch'
export { VERTEX_STRIDE } from './batch/BatchMaterial'

export {
  BitmapFontData,
  BITMAP_FONT_FORMAT,
  BITMAP_FONT_VERSION,
  type BitmapFontJSON,
  type BitmapGlyphJSON,
  type BitmapFontMode,
  type Glyph,
} from './font/BitmapFontData'
export { BitmapFont, type FontDrawOptions } from './font/BitmapFont'
export { GlyphLayout, type GlyphLayoutOptions, type LayoutLine, type TextAlign } from './font/GlyphLayout'

export { ParticleEmitter, type ParticleEmitterConfig, type Range } from './particles/ParticleEmitter'
export { ParticleEffect } from './particles/ParticleEffect'

export { Three2D, type Three2DOptions, type Three2DRenderer } from './Three2D'
