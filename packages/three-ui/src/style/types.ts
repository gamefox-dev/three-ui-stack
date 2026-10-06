import type { ColorLike } from '@implicit-invocation/three-2d'

export type Length = number | `${number}%` | 'auto'
/** Length that cannot be `auto` (padding, max sizes, gaps). */
export type NonAutoLength = number | `${number}%`

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
export type AlignValue = 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' | 'space-between' | 'space-around' | 'space-evenly'
export type JustifyValue = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
export type Overflow = 'visible' | 'hidden' | 'scroll'
export type FontWeight = number | 'normal' | 'bold' | `${number}`
export type TextAlign = 'auto' | 'left' | 'center' | 'right'

export type TransformOp =
  /** px, or a percentage of the node's own width. */
  | { translateX: number | `${number}%` }
  /** px, or a percentage of the node's own height. */
  | { translateY: number | `${number}%` }
  | { scale: number }
  | { scaleX: number }
  | { scaleY: number }
  | { rotate: `${number}deg` | `${number}rad` | number }

/** Gradient angle. A bare number is **degrees** (CSS `45deg`); `rotate` transforms use radians. */
export type Angle = number | `${number}deg` | `${number}rad` | `${number}turn`

/** Position along a gradient line / radius: a number is px, a `%` string a fraction of the line. */
export type GradientLength = number | `${number}%`

export interface GradientStop {
  color: ColorLike
  /** Omitted positions are spread evenly between their neighbours (first 0%, last 100%), like CSS. */
  position?: GradientLength | undefined
}

export type GradientCorner = 'to top' | 'to right' | 'to bottom' | 'to left' | 'to top right' | 'to top left' | 'to bottom right' | 'to bottom left'

/** `linear-gradient(<angle>, stops…)`. Without `stops` the Tailwind `from-*` / `via-*` / `to-*` keys supply them. */
export interface LinearGradient {
  type: 'linear'
  /** Interpolation space (default `srgb`, the CSS default; Tailwind v4 emits `oklab`). */
  colorSpace?: 'srgb' | 'oklab' | undefined
  /** Default 180 (`to bottom`). */
  angle?: Angle | GradientCorner | undefined
  stops?: readonly GradientStop[] | undefined
}

export type RadialSize = 'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner'

/** `radial-gradient(<shape> <size> at <position>, stops…)`. */
export interface RadialGradient {
  type: 'radial'
  colorSpace?: 'srgb' | 'oklab' | undefined
  /** Default `ellipse`. */
  shape?: 'circle' | 'ellipse' | undefined
  /** Default `farthest-corner`; a number is a circle radius in px, a pair the ellipse radii. */
  size?: RadialSize | number | readonly [GradientLength, GradientLength] | undefined
  /** Center, default `[ '50%', '50%' ]`. Keywords `left|center|right` / `top|center|bottom` are accepted. */
  at?: readonly [GradientLength | 'left' | 'center' | 'right', GradientLength | 'top' | 'center' | 'bottom'] | undefined
  stops?: readonly GradientStop[] | undefined
}

export type BackgroundGradient = LinearGradient | RadialGradient

/** One CSS `box-shadow` layer. Layers are painted first-on-top, like CSS. */
export interface BoxShadow {
  offsetX?: number | undefined
  offsetY?: number | undefined
  /** CSS blur radius in px (σ = blur / 2). */
  blur?: number | undefined
  spread?: number | undefined
  /** `'currentColor'` follows the node's text `color` (Tailwind's default ring color). */
  color?: ColorLike | 'currentColor' | undefined
  inset?: boolean | undefined
}

/** One CSS `text-shadow` layer (no spread / inset). */
export interface TextShadow {
  offsetX?: number | undefined
  offsetY?: number | undefined
  blur?: number | undefined
  color?: ColorLike | undefined
}

/** `drop-shadow()` of an Image: a tinted, offset copy painted underneath (the blur is ignored — see the README). */
export interface DropShadow {
  offsetX?: number | undefined
  offsetY?: number | undefined
  blur?: number | undefined
  color?: ColorLike | undefined
}

/** CSS timing function: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier(a,b,c,d)`, `steps(n[, jump])`, `step-start`, `step-end`. */
export type Easing = string

/**
 * One keyframe. `offset` is 0..1 (or use the object form with `'0%'` / `'from'` / `'to'` keys). Any animatable style
 * property may appear; a property missing from the first / last keyframe starts from / ends at the underlying style.
 */
export type KeyframeStyle = Style & { offset?: number | undefined; easing?: Easing | undefined }
/** Keyframes as an ordered list or as CSS-like `{ '0%': {…}, '50%': {…}, to: {…} }`. */
export type Keyframes = readonly KeyframeStyle[] | Readonly<Record<string, Style & { easing?: Easing | undefined }>>

export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
export type AnimationFill = 'none' | 'forwards' | 'backwards' | 'both'

/** Options shared by `node.animate()` and the `animation` style key. Times are milliseconds, like CSS / WAAPI. */
export interface AnimationOptions {
  duration?: number | undefined
  delay?: number | undefined
  /** Default `linear` for `node.animate()` and CSS `ease` for the style key. Per-keyframe `easing` overrides it. */
  easing?: Easing | undefined
  /** Default 1; `Infinity` / `'infinite'` loops forever. */
  iterations?: number | 'infinite' | undefined
  direction?: AnimationDirection | undefined
  fill?: AnimationFill | undefined
  /** Start paused (resume with `handle.play()`). */
  paused?: boolean | undefined
  /**
   * Allow layout properties (width, height, margin, padding, flex…) in the keyframes. Every frame then re-runs Yoga for
   * the tree — leave it off unless you need it (transform and opacity never touch layout).
   */
  layout?: boolean | undefined
}

/** `animation` style key: named keyframes (registered with `ui.registerKeyframes` / Tailwind `@keyframes`) or inline ones. */
export interface AnimationSpec extends AnimationOptions {
  /** Keyframes name; resolved against `ui.registerKeyframes()` / the Tailwind registry. */
  name?: string | undefined
  keyframes?: Keyframes | undefined
}

/** One `transition` entry. `property` is a style key, `'all'` (every non-layout property) or a layout key (explicit opt-in). */
export interface TransitionSpec {
  property: string
  duration?: number | undefined
  delay?: number | undefined
  easing?: Easing | undefined
}

/**
 * React-Native-like style object. All numbers are logical pixels. Layout properties map 1:1 onto Yoga,
 * but `ComputedStyle` (not Yoga) is the source of truth.
 */
interface StyleDefinition {
  // layout
  display?: 'flex' | 'none'
  position?: 'relative' | 'absolute'
  width?: Length
  height?: Length
  minWidth?: NonAutoLength
  minHeight?: NonAutoLength
  maxWidth?: NonAutoLength
  maxHeight?: NonAutoLength
  /** Shorthand: number → Yoga `flex`, `"g s b"` string → grow / shrink / basis. */
  flex?: number | string
  flexGrow?: number
  flexShrink?: number
  flexBasis?: Length
  flexDirection?: FlexDirection
  flexWrap?: FlexWrap
  alignItems?: AlignValue
  alignSelf?: AlignValue
  alignContent?: AlignValue
  justifyContent?: JustifyValue
  gap?: NonAutoLength
  rowGap?: NonAutoLength
  columnGap?: NonAutoLength
  margin?: Length
  marginHorizontal?: Length
  marginVertical?: Length
  marginTop?: Length
  marginRight?: Length
  marginBottom?: Length
  marginLeft?: Length
  padding?: NonAutoLength
  paddingHorizontal?: NonAutoLength
  paddingVertical?: NonAutoLength
  paddingTop?: NonAutoLength
  paddingRight?: NonAutoLength
  paddingBottom?: NonAutoLength
  paddingLeft?: NonAutoLength
  top?: Length
  right?: Length
  bottom?: Length
  left?: Length
  aspectRatio?: number
  overflow?: Overflow
  borderWidth?: number
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number

  // paint
  backgroundColor?: ColorLike
  opacity?: number
  borderColor?: ColorLike
  /** Radius of all four corners; the per-corner keys below override it. */
  borderRadius?: number
  borderTopLeftRadius?: number
  borderTopRightRadius?: number
  borderBottomRightRadius?: number
  borderBottomLeftRadius?: number
  /** Linear or radial gradient painted over `backgroundColor`. */
  backgroundGradient?: BackgroundGradient | 'none'
  /** Tailwind `from-*` / `via-*` / `to-*` colors for a `backgroundGradient` that has no explicit stops. */
  gradientFrom?: ColorLike
  gradientVia?: ColorLike
  gradientTo?: ColorLike
  gradientFromPosition?: GradientLength
  gradientViaPosition?: GradientLength
  gradientToPosition?: GradientLength
  /** One or more (first = top-most) outer / inset shadows. `'none'` clears. */
  boxShadow?: BoxShadow | readonly BoxShadow[] | 'none'
  /** Multiplies image colors (and nine-patch). */
  tintColor?: ColorLike
  /** `object-fit` for Image: `fill` = stretch, `none` = center at intrinsic size, `scale-down` = `contain` but never upscaled. */
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  /** `drop-shadow()` for Image. */
  dropShadow?: DropShadow | readonly DropShadow[] | 'none'
  /** Blur radius in px of what is behind the node, clipped to its rounded rect (needs `createThreeUI({ backdropBlur })`). */
  backdropBlur?: number
  /** `backdrop-brightness`: 1 = unchanged. Applied together with `backdropBlur`. */
  backdropBrightness?: number
  /** `backdrop-saturate`: 1 = unchanged, 0 = grayscale. */
  backdropSaturate?: number
  zIndex?: number
  /** Paint-only transform around the node center (does not affect layout). */
  transform?: readonly TransformOp[]
  pointerEvents?: 'auto' | 'none'

  // inherited text properties
  color?: ColorLike
  fontFamily?: string
  fontSize?: number
  fontWeight?: FontWeight
  fontStyle?: 'normal' | 'italic'
  /** px, or `"1.5em"` multiples of the font size. */
  lineHeight?: number | `${number}em`
  /** px, or `"0.05em"`. */
  letterSpacing?: number | `${number}em`
  textAlign?: TextAlign
  /** `-webkit-text-stroke-width` in px (needs a font baked with a stroke channel). */
  textStrokeWidth?: number
  /** `-webkit-text-stroke-color` (default: the text `color`). */
  textStrokeColor?: ColorLike
  /** `paint-order`: `stroke` paints the stroke under the fill (a true outline); `normal` centers it over the fill. */
  paintOrder?: 'normal' | 'stroke'
  textShadow?: TextShadow | readonly TextShadow[] | 'none'
  /** `nowrap` keeps each paragraph on one line. */
  whiteSpace?: 'normal' | 'nowrap'
  /** `ellipsis` replaces what does not fit (needs `nowrap` or `numberOfLines`) with `…`. */
  textOverflow?: 'clip' | 'ellipsis'
  /** Maximum number of lines (`line-clamp-*`); combine with `textOverflow: 'ellipsis'`. Not inherited. */
  numberOfLines?: number

  // animation (times in ms)
  animation?: AnimationSpec | readonly AnimationSpec[] | 'none'
  /** Allow layout properties inside this node's `animation` keyframes (re-runs Yoga every frame). */
  animationLayout?: boolean
  /** Shorthand for the four `transition*` longhands below. */
  transition?: TransitionSpec | readonly TransitionSpec[] | 'none'
  /** Lists repeat to cover `transitionProperty`, like CSS. */
  transitionProperty?: string | readonly string[]
  transitionDuration?: number | readonly number[]
  transitionDelay?: number | readonly number[]
  transitionTimingFunction?: Easing | readonly Easing[]
}

/**
 * React-Native-like style object. Every property may be `undefined` (handy for conditional styles under
 * `exactOptionalPropertyTypes`). All numbers are logical pixels.
 */
export type Style = { [K in keyof StyleDefinition]?: StyleDefinition[K] | undefined }

/** A style, a list of styles (later wins), or nothing. */
export type StyleProp = Style | readonly (Style | null | undefined | false)[] | null | undefined | false

/** Style keys that cascade from parent to child. Layout spacing/sizing never inherits. */
export const INHERITED_KEYS = [
  'color',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'textStrokeWidth',
  'textStrokeColor',
  'paintOrder',
  'textShadow',
  'whiteSpace',
  'textOverflow',
] as const satisfies readonly (keyof Style)[]

export type InheritedKey = (typeof INHERITED_KEYS)[number]
