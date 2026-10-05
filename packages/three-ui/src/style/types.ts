import type { ColorLike } from 'three-2d'

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
  | { translateX: number }
  | { translateY: number }
  | { scale: number }
  | { scaleX: number }
  | { scaleY: number }
  | { rotate: `${number}deg` | `${number}rad` | number }

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
  borderRadius?: number
  /** Multiplies image colors (and nine-patch). */
  tintColor?: ColorLike
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
] as const satisfies readonly (keyof Style)[]

export type InheritedKey = (typeof INHERITED_KEYS)[number]
