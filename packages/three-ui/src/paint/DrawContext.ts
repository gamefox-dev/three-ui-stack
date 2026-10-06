import type { Affine2, BitmapFont, BoxGradient, Color4, ColorLike, GlyphLayout, NinePatch, Radii4, Rect, Sides4, TextureRegion } from '@implicit-invocation/three-2d'

export interface RectPaint {
  color?: Color4
  radius?: number
  borderWidth?: number
  borderColor?: Color4
}

/** A box: per-corner radii, per-side border, background color and gradient — one quad, one SDF. */
export interface BoxPaint {
  radii: Radii4
  borderWidths?: Sides4
  borderColor?: Color4
  background?: Color4
  /** Resolved against the box; consumed immediately (may be a shared scratch object). */
  gradient?: BoxGradient
}

/** `backdrop-filter` of a box: blur radius (px) plus brightness / saturation, clipped to the rounded rect. */
export interface BackdropPaint {
  radii: Radii4
  blur: number
  brightness: number
  saturate: number
}

/** One analytic `box-shadow` layer of a box. */
export interface ShadowPaint {
  radii: Radii4
  borderWidths?: Sides4
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: Color4
  inset: boolean
}

export interface ImagePaint {
  /** Multiplied with the region's texels. */
  tint?: Color4
  flipX?: boolean
  flipY?: boolean
  radius?: number
  /** Paint only the image's alpha silhouette in `tint` (drop shadows); the image's own colors are ignored. */
  silhouette?: boolean
  /** Sub-rectangle of the region in UV fractions (0..1) — used by `cover`/`contain`. */
  crop?: { u: number; v: number; u2: number; v2: number }
}

export interface NinePatchPaint {
  tint?: Color4
  /** Logical units per source pixel for this draw (default: the patch's own scale). */
  scale?: number
}

/** Outline and shadow of a text run. Both need a font baked with a stroke (distance) channel; see `three-2d-font --stroke`. */
export interface TextEffects {
  /** `-webkit-text-stroke-width` in px. */
  strokeWidth: number
  strokeColor: Color4
  /** `paint-order: stroke`: the stroke is painted under the fill (a pure outline); otherwise it is centered over the fill edge. */
  strokeUnder: boolean
  /** First = top-most, like CSS. */
  shadows: readonly { offsetX: number; offsetY: number; blur: number; color: Color4 }[]
}

export interface TextPaint {
  color: Color4
  /** Font used to compute the layout (stable metrics). */
  layoutFont: BitmapFont
  /** Font whose bitmap is drawn (closest baked size for the display DPR). */
  drawFont: BitmapFont
  fontSize: number
  effects?: TextEffects
}

/** Logical painter used by every node. The concrete implementation translates these to `@implicit-invocation/three-2d` batches. */
export interface UIDrawContext {
  rect(rect: Rect, paint: RectPaint): void
  box(rect: Rect, paint: BoxPaint): void
  shadow(rect: Rect, paint: ShadowPaint): void
  /** Paint the blurred backdrop of `rect` (no-op when backdrop blur is off). */
  backdrop(rect: Rect, paint: BackdropPaint): void
  image(region: TextureRegion, rect: Rect, paint?: ImagePaint): void
  ninePatch(patch: NinePatch, rect: Rect, paint?: NinePatchPaint): void
  text(layout: GlyphLayout, x: number, y: number, paint: TextPaint): void

  /** Clip to `rect`. `radii` (TL, TR, BR, BL) round its corners; only a batch with `clip: 'shader'` can honour them. */
  pushClip(rect: Rect, radii?: Radii4): void
  popClip(): void

  pushTransform(transform: Affine2): void
  popTransform(): void

  /** Multiplies alpha of everything drawn until the matching `popOpacity()`. */
  pushOpacity(opacity: number): void
  popOpacity(): void
}

export type { ColorLike }
