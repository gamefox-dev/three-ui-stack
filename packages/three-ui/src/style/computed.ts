import { Color4, parseColor } from '@implicit-invocation/three-2d'
import {
  INHERITED_KEYS,
  type AlignValue,
  type Angle,
  type AnimationSpec,
  type BackgroundGradient,
  type BoxShadow,
  type DropShadow,
  type Easing,
  type FlexDirection,
  type FlexWrap,
  type GradientCorner,
  type GradientLength,
  type JustifyValue,
  type Length,
  type NonAutoLength,
  type Overflow,
  type RadialSize,
  type Style,
  type StyleProp,
  type TextAlign,
  type TextShadow,
  type TransformOp,
  type TransitionSpec,
} from './types'

export interface ResolvedGradientStop {
  color: Color4
  position: GradientLength | undefined
}

/** A gradient with parsed colors and every `from/via/to` helper folded in. */
export type ResolvedGradient =
  | { type: 'linear'; colorSpace: 'srgb' | 'oklab'; angle: Angle | GradientCorner; stops: readonly ResolvedGradientStop[] }
  | {
      type: 'radial'
      colorSpace: 'srgb' | 'oklab'
      shape: 'circle' | 'ellipse'
      size: RadialSize | number | readonly [GradientLength, GradientLength]
      at: readonly [GradientLength | 'left' | 'center' | 'right', GradientLength | 'top' | 'center' | 'bottom']
      stops: readonly ResolvedGradientStop[]
    }

export interface ResolvedBoxShadow {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: Color4
  /** True when the color follows the node's text color (`currentColor`). */
  currentColor: boolean
  inset: boolean
}

export interface ResolvedTextShadow {
  offsetX: number
  offsetY: number
  blur: number
  color: Color4
}

export interface ResolvedTransition {
  property: string
  duration: number
  delay: number
  easing: Easing
}

/** Fully resolved style. This — not Yoga — is the source of truth for layout, paint and text. */
export interface ComputedStyle {
  // layout (maps 1:1 onto Yoga)
  display: 'flex' | 'none'
  position: 'relative' | 'absolute'
  width: Length | undefined
  height: Length | undefined
  minWidth: NonAutoLength | undefined
  minHeight: NonAutoLength | undefined
  maxWidth: NonAutoLength | undefined
  maxHeight: NonAutoLength | undefined
  flexGrow: number | undefined
  flexShrink: number | undefined
  flexBasis: Length | undefined
  flexDirection: FlexDirection
  flexWrap: FlexWrap
  alignItems: AlignValue
  alignSelf: AlignValue
  alignContent: AlignValue
  justifyContent: JustifyValue
  gap: NonAutoLength | undefined
  rowGap: NonAutoLength | undefined
  columnGap: NonAutoLength | undefined
  margin: Length | undefined
  marginHorizontal: Length | undefined
  marginVertical: Length | undefined
  marginTop: Length | undefined
  marginRight: Length | undefined
  marginBottom: Length | undefined
  marginLeft: Length | undefined
  padding: NonAutoLength | undefined
  paddingHorizontal: NonAutoLength | undefined
  paddingVertical: NonAutoLength | undefined
  paddingTop: NonAutoLength | undefined
  paddingRight: NonAutoLength | undefined
  paddingBottom: NonAutoLength | undefined
  paddingLeft: NonAutoLength | undefined
  top: Length | undefined
  right: Length | undefined
  bottom: Length | undefined
  left: Length | undefined
  aspectRatio: number | undefined
  overflow: Overflow
  borderWidth: number | undefined
  borderTopWidth: number | undefined
  borderRightWidth: number | undefined
  borderBottomWidth: number | undefined
  borderLeftWidth: number | undefined

  // paint
  backgroundColor: Color4
  opacity: number
  borderColor: Color4
  borderRadius: number
  borderTopLeftRadius: number | undefined
  borderTopRightRadius: number | undefined
  borderBottomRightRadius: number | undefined
  borderBottomLeftRadius: number | undefined
  backgroundGradient: ResolvedGradient | undefined
  /** Outer and inset shadows, first = top-most. */
  boxShadow: readonly ResolvedBoxShadow[]
  tintColor: Color4
  objectFit: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' | undefined
  dropShadow: readonly ResolvedTextShadow[]
  backdropBlur: number
  backdropBrightness: number
  backdropSaturate: number
  zIndex: number
  transform: readonly TransformOp[] | undefined
  pointerEvents: 'auto' | 'none'

  // inherited text
  color: Color4
  fontFamily: string
  fontSize: number
  fontWeight: number
  fontStyle: 'normal' | 'italic'
  /** px, or an `em` multiple of this node's own font size. */
  lineHeight: number | `${number}em` | undefined
  letterSpacing: number | `${number}em`
  textAlign: TextAlign
  textStrokeWidth: number
  /** `undefined` follows `color`. */
  textStrokeColor: Color4 | undefined
  paintOrder: 'normal' | 'stroke'
  textShadow: readonly ResolvedTextShadow[]
  whiteSpace: 'normal' | 'nowrap'
  textOverflow: 'clip' | 'ellipsis'
  numberOfLines: number | undefined

  animation: readonly AnimationSpec[]
  animationLayout: boolean
  transition: readonly ResolvedTransition[]
}

type Key = keyof ComputedStyle

/** Keys applied to Yoga. Paint-only / text-only changes never trigger relayout. */
export const LAYOUT_KEYS = [
  'display',
  'position',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'flexDirection',
  'flexWrap',
  'alignItems',
  'alignSelf',
  'alignContent',
  'justifyContent',
  'gap',
  'rowGap',
  'columnGap',
  'margin',
  'marginHorizontal',
  'marginVertical',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'padding',
  'paddingHorizontal',
  'paddingVertical',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'top',
  'right',
  'bottom',
  'left',
  'aspectRatio',
  'overflow',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
] as const satisfies readonly Key[]

export const PAINT_KEYS = [
  'backgroundColor',
  'opacity',
  'borderColor',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'backgroundGradient',
  'boxShadow',
  'tintColor',
  'objectFit',
  'dropShadow',
  'backdropBlur',
  'backdropBrightness',
  'backdropSaturate',
  'zIndex',
  'transform',
  'pointerEvents',
] as const satisfies readonly Key[]

/** Text keys that change measurement (font identity/size/spacing/alignment). `color` is paint-only. */
export const TEXT_METRIC_KEYS = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textAlign', 'whiteSpace', 'textOverflow', 'numberOfLines'] as const satisfies readonly Key[]

const NO_SHADOWS: readonly ResolvedBoxShadow[] = Object.freeze([])
const NO_TEXT_SHADOWS: readonly ResolvedTextShadow[] = Object.freeze([])
const NO_ANIMATIONS: readonly AnimationSpec[] = Object.freeze([])
const NO_TRANSITIONS: readonly ResolvedTransition[] = Object.freeze([])
const TRANSPARENT = new Color4(0, 0, 0, 0)
const BLACK = new Color4(0, 0, 0, 1)
const WHITE = new Color4(1, 1, 1, 1)

/** Global defaults (lowest layer). */
export function createDefaultComputedStyle(): ComputedStyle {
  return {
    display: 'flex',
    position: 'relative',
    width: undefined,
    height: undefined,
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,
    flexGrow: undefined,
    flexShrink: undefined,
    flexBasis: undefined,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    alignSelf: 'auto',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    gap: undefined,
    rowGap: undefined,
    columnGap: undefined,
    margin: undefined,
    marginHorizontal: undefined,
    marginVertical: undefined,
    marginTop: undefined,
    marginRight: undefined,
    marginBottom: undefined,
    marginLeft: undefined,
    padding: undefined,
    paddingHorizontal: undefined,
    paddingVertical: undefined,
    paddingTop: undefined,
    paddingRight: undefined,
    paddingBottom: undefined,
    paddingLeft: undefined,
    top: undefined,
    right: undefined,
    bottom: undefined,
    left: undefined,
    aspectRatio: undefined,
    overflow: 'visible',
    borderWidth: undefined,
    borderTopWidth: undefined,
    borderRightWidth: undefined,
    borderBottomWidth: undefined,
    borderLeftWidth: undefined,
    backgroundColor: TRANSPARENT,
    opacity: 1,
    borderColor: BLACK,
    borderRadius: 0,
    borderTopLeftRadius: undefined,
    borderTopRightRadius: undefined,
    borderBottomRightRadius: undefined,
    borderBottomLeftRadius: undefined,
    backgroundGradient: undefined,
    boxShadow: NO_SHADOWS,
    tintColor: WHITE,
    objectFit: undefined,
    dropShadow: NO_TEXT_SHADOWS,
    backdropBlur: 0,
    backdropBrightness: 1,
    backdropSaturate: 1,
    zIndex: 0,
    transform: undefined,
    pointerEvents: 'auto',
    color: BLACK,
    fontFamily: 'system-ui',
    fontSize: 14,
    fontWeight: 400,
    fontStyle: 'normal',
    lineHeight: undefined,
    letterSpacing: 0,
    textAlign: 'auto',
    textStrokeWidth: 0,
    textStrokeColor: undefined,
    paintOrder: 'normal',
    textShadow: NO_TEXT_SHADOWS,
    whiteSpace: 'normal',
    textOverflow: 'clip',
    numberOfLines: undefined,
    animation: NO_ANIMATIONS,
    animationLayout: false,
    transition: NO_TRANSITIONS,
  }
}

const DEFAULTS = createDefaultComputedStyle()

/** Flatten a `StyleProp` into an ordered list of plain style objects (later wins). */
export function flattenStyleProp(style: StyleProp, out: Style[] = []): Style[] {
  if (!style) return out
  if (Array.isArray(style)) {
    for (const s of style as readonly StyleProp[]) flattenStyleProp(s, out)
  } else {
    out.push(style as Style)
  }
  return out
}

/**
 * Expand shorthands so every layer speaks the same longhand vocabulary.
 * `flex: n` → `n 1 0` (n > 0), `0 0 auto` (0), `0 -n auto` (n < 0); `"g s b"` strings follow CSS.
 */
export function normalizeStyle(style: Style): Style {
  if (style.flex === undefined && style.transition === undefined) return style
  const { flex, transition, ...rest } = style
  const out: Style = { ...rest }
  if (flex !== undefined) normalizeFlex(flex, out)
  if (transition !== undefined) expandTransition(transition, out)
  return out
}

/** `transition: …` → the four longhands (as lists), so layers override each longhand independently like CSS. */
function expandTransition(transition: NonNullable<Style['transition']>, out: Style): void {
  if (transition === 'none') {
    out.transitionProperty = 'none'
    return
  }
  const specs = (Array.isArray(transition) ? transition : [transition]) as readonly TransitionSpec[]
  out.transitionProperty = specs.map((t) => t.property)
  out.transitionDuration = specs.map((t) => t.duration ?? 0)
  out.transitionDelay = specs.map((t) => t.delay ?? 0)
  out.transitionTimingFunction = specs.map((t) => t.easing ?? 'ease')
}

function normalizeFlex(flex: NonNullable<Style['flex']>, out: Style): void {
  if (typeof flex === 'number') {
    if (flex > 0) Object.assign(out, { flexGrow: flex, flexShrink: 1, flexBasis: 0 })
    else if (flex === 0) Object.assign(out, { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' })
    else Object.assign(out, { flexGrow: 0, flexShrink: -flex, flexBasis: 'auto' })
  } else {
    const parts = flex.trim().split(/\s+/)
    if (flex === 'auto') Object.assign(out, { flexGrow: 1, flexShrink: 1, flexBasis: 'auto' })
    else if (flex === 'none') Object.assign(out, { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' })
    else if (flex === 'initial') Object.assign(out, { flexGrow: 0, flexShrink: 1, flexBasis: 'auto' })
    else {
      const num = (s: string | undefined) => (s === undefined || Number.isNaN(parseFloat(s)) ? undefined : parseFloat(s))
      const isBasis = (s: string) => s.endsWith('%') || s.endsWith('px') || s === 'auto'
      const nums = parts.filter((p) => !isBasis(p))
      const basisStr = parts.find(isBasis)
      out.flexGrow = num(nums[0]) ?? 0
      out.flexShrink = num(nums[1]) ?? 1
      out.flexBasis = basisStr === undefined ? 0 : basisStr === 'auto' ? 'auto' : basisStr.endsWith('px') ? parseFloat(basisStr) : (basisStr as `${number}%`)
    }
  }
}

function toColor(value: unknown): Color4 {
  return parseColor(value as never, new Color4())
}

function toWeight(w: unknown): number {
  if (w === 'normal') return 400
  if (w === 'bold') return 700
  const n = typeof w === 'number' ? w : parseFloat(String(w))
  return Number.isFinite(n) ? n : 400
}

const COLOR_KEYS: ReadonlySet<string> = new Set(['backgroundColor', 'borderColor', 'tintColor', 'color', 'textStrokeColor'])
const INHERITED: ReadonlySet<string> = new Set(INHERITED_KEYS)

const ALL_KEYS = Object.keys(DEFAULTS) as Key[]

const resolvedCache = new WeakMap<object, unknown>()

/** Resolve-once-per-source-object: stable identity keeps inherited-value comparisons cheap. */
function cached<T>(raw: object, make: () => T): T {
  let hit = resolvedCache.get(raw) as T | undefined
  if (hit === undefined) {
    hit = make()
    resolvedCache.set(raw, hit)
  }
  return hit
}

function asList<T>(v: T | readonly T[] | undefined): readonly T[] {
  return v === undefined ? [] : Array.isArray(v) ? (v as readonly T[]) : [v as T]
}

function resolveBoxShadows(raw: BoxShadow | readonly BoxShadow[]): readonly ResolvedBoxShadow[] {
  return asList(raw).map((s) => {
    const currentColor = s.color === undefined || (typeof s.color === 'string' && s.color.toLowerCase() === 'currentcolor')
    return {
      offsetX: s.offsetX ?? 0,
      offsetY: s.offsetY ?? 0,
      blur: Math.max(0, s.blur ?? 0),
      spread: s.spread ?? 0,
      color: currentColor ? BLACK : toColor(s.color),
      currentColor,
      inset: s.inset === true,
    }
  })
}

function resolveTextShadows(raw: TextShadow | DropShadow | readonly (TextShadow | DropShadow)[]): readonly ResolvedTextShadow[] {
  return asList(raw).map((s) => ({ offsetX: s.offsetX ?? 0, offsetY: s.offsetY ?? 0, blur: Math.max(0, s.blur ?? 0), color: s.color === undefined ? BLACK : toColor(s.color) }))
}

/** Convert one authored style value to its computed representation (colors → `Color4`, shadows → resolved lists…). */
export function resolveStyleValue(key: string, value: unknown): unknown {
  return normalizeValue(key as Key, value)
}

function normalizeValue(key: Key, value: unknown): unknown {
  if (COLOR_KEYS.has(key)) return toColor(value)
  switch (key) {
    case 'fontWeight':
      return toWeight(value)
    case 'opacity':
      return Math.min(1, Math.max(0, value as number))
    case 'boxShadow':
      return value === 'none' ? NO_SHADOWS : cached(value as object, () => resolveBoxShadows(value as BoxShadow))
    case 'textShadow':
    case 'dropShadow':
      return value === 'none' ? NO_TEXT_SHADOWS : cached(value as object, () => resolveTextShadows(value as TextShadow))
    case 'animation':
      return value === 'none' ? NO_ANIMATIONS : cached(value as object, () => asList(value as AnimationSpec))
    default:
      return value
  }
}

/** Resolve an authored gradient (explicit stops) outside of a cascade, e.g. inside keyframes. */
export function resolveGradientValue(g: BackgroundGradient | 'none' | undefined): ResolvedGradient | undefined {
  return g && g !== 'none' ? resolveGradient(g, () => undefined) : undefined
}

function resolveGradient(g: BackgroundGradient, pick: (k: string) => unknown): ResolvedGradient | undefined {
  let stops: ResolvedGradientStop[]
  if (g.stops && g.stops.length > 0) {
    stops = g.stops.map((s) => ({ color: toColor(s.color), position: s.position }))
  } else {
    const from = pick('gradientFrom')
    const via = pick('gradientVia')
    const to = pick('gradientTo')
    if (from === undefined && via === undefined && to === undefined) return undefined
    stops = [{ color: toColor(from ?? TRANSPARENT), position: pick('gradientFromPosition') as GradientLength | undefined }]
    if (via !== undefined) stops.push({ color: toColor(via), position: pick('gradientViaPosition') as GradientLength | undefined })
    stops.push({ color: toColor(to ?? TRANSPARENT), position: pick('gradientToPosition') as GradientLength | undefined })
  }
  if (g.type === 'linear') return { type: 'linear', colorSpace: g.colorSpace ?? 'srgb', angle: g.angle ?? 180, stops }
  return { type: 'radial', colorSpace: g.colorSpace ?? 'srgb', shape: g.shape ?? 'ellipse', size: g.size ?? 'farthest-corner', at: g.at ?? ['50%', '50%'], stops }
}

function resolveTransitions(pick: (k: string) => unknown): readonly ResolvedTransition[] {
  const props = asList(pick('transitionProperty') as string | readonly string[] | undefined)
  if (props.length === 0 || (props.length === 1 && props[0] === 'none')) return NO_TRANSITIONS
  const durations = asList(pick('transitionDuration') as number | readonly number[] | undefined)
  const delays = asList(pick('transitionDelay') as number | readonly number[] | undefined)
  const easings = asList(pick('transitionTimingFunction') as Easing | readonly Easing[] | undefined)
  const out: ResolvedTransition[] = []
  for (let i = 0; i < props.length; i++) {
    const duration = durations.length ? durations[i % durations.length]! : 0
    if (!(duration > 0)) continue
    out.push({ property: props[i]!, duration, delay: delays.length ? delays[i % delays.length]! : 0, easing: easings.length ? easings[i % easings.length]! : 'ease' })
  }
  return out.length ? out : NO_TRANSITIONS
}

/**
 * Cascade: component defaults < parent (inherited keys only) < theme < className < direct style.
 * `layers` is ordered lowest → highest priority and must already be `normalizeStyle`d.
 */
export function computeStyle(layers: readonly Style[], parent: ComputedStyle | null, componentDefaults: Style | undefined): ComputedStyle {
  const explicit: Record<string, unknown> = {}
  for (const layer of layers) {
    for (const k in layer) {
      const v = (layer as Record<string, unknown>)[k]
      if (v !== undefined) explicit[k] = v
    }
  }
  const out = createDefaultComputedStyle() as unknown as Record<string, unknown>
  const defaults = componentDefaults as Record<string, unknown> | undefined
  const p = parent as unknown as Record<string, unknown> | null
  for (const key of ALL_KEYS) {
    const e = explicit[key]
    if (e !== undefined) {
      out[key] = normalizeValue(key, e)
    } else if (INHERITED.has(key) && p) {
      out[key] = p[key]
    } else if (defaults && defaults[key] !== undefined) {
      out[key] = normalizeValue(key, defaults[key])
    }
  }
  const pick = (k: string): unknown => explicit[k] ?? defaults?.[k]
  const gradient = pick('backgroundGradient') as BackgroundGradient | 'none' | undefined
  out.backgroundGradient = gradient && gradient !== 'none' ? resolveGradient(gradient, pick) : undefined
  out.transition = resolveTransitions(pick)
  return out as unknown as ComputedStyle
}

/** Resolve an `em`-or-px typographic value against a font size. */
export function resolveEm(value: number | `${number}em` | undefined, fontSize: number): number | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'number') return value
  return parseFloat(value) * fontSize
}

export function stylesEqual<K extends Key>(a: ComputedStyle, b: ComputedStyle, keys: readonly K[]): boolean {
  for (const k of keys) if (a[k] !== b[k]) return false
  return true
}

/** Color4 values are compared structurally for paint diffing. */
export function colorsEqual(a: Color4, b: Color4): boolean {
  return a === b || (a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a)
}

/** Structural equality for computed values (colors, shadow lists, plain objects). */
export function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (a instanceof Color4) return b instanceof Color4 && colorsEqual(a, b)
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!valuesEqual(a[i], b[i])) return false
    return true
  }
  const ka = Object.keys(a)
  if (ka.length !== Object.keys(b).length) return false
  for (const k of ka) if (!valuesEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false
  return true
}
