import type { Affine2, BitmapFont, Color4, ColorLike, GlyphLayout, NinePatch, Rect, TextureRegion } from '@implicit-invocation/three-2d'

export interface RectPaint {
  color?: Color4
  radius?: number
  borderWidth?: number
  borderColor?: Color4
}

export interface ImagePaint {
  /** Multiplied with the region's texels. */
  tint?: Color4
  flipX?: boolean
  flipY?: boolean
  radius?: number
  /** Sub-rectangle of the region in UV fractions (0..1) — used by `cover`/`contain`. */
  crop?: { u: number; v: number; u2: number; v2: number }
}

export interface NinePatchPaint {
  tint?: Color4
}

export interface TextPaint {
  color: Color4
  /** Font used to compute the layout (stable metrics). */
  layoutFont: BitmapFont
  /** Font whose bitmap is drawn (closest baked size for the display DPR). */
  drawFont: BitmapFont
  fontSize: number
}

/** Logical painter used by every node. The concrete implementation translates these to `@implicit-invocation/three-2d` batches. */
export interface UIDrawContext {
  rect(rect: Rect, paint: RectPaint): void
  image(region: TextureRegion, rect: Rect, paint?: ImagePaint): void
  ninePatch(patch: NinePatch, rect: Rect, paint?: NinePatchPaint): void
  text(layout: GlyphLayout, x: number, y: number, paint: TextPaint): void

  pushClip(rect: Rect): void
  popClip(): void

  pushTransform(transform: Affine2): void
  popTransform(): void

  /** Multiplies alpha of everything drawn until the matching `popOpacity()`. */
  pushOpacity(opacity: number): void
  popOpacity(): void
}

export type { ColorLike }
