import { Color4, parseColor } from '@implicit-invocation/three-2d'
import { INHERITED_KEYS, type AlignValue, type FlexDirection, type FlexWrap, type JustifyValue, type Length, type NonAutoLength, type Overflow, type Style, type StyleProp, type TextAlign, type TransformOp } from './types'

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
  tintColor: Color4
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

export const PAINT_KEYS = ['backgroundColor', 'opacity', 'borderColor', 'borderRadius', 'tintColor', 'zIndex', 'transform', 'pointerEvents'] as const satisfies readonly Key[]

/** Text keys that change measurement (font identity/size/spacing/alignment). `color` is paint-only. */
export const TEXT_METRIC_KEYS = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textAlign'] as const satisfies readonly Key[]

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
    tintColor: WHITE,
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
  if (style.flex === undefined) return style
  const { flex, ...rest } = style
  const out: Style = { ...rest }
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
  return out
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

const COLOR_KEYS: ReadonlySet<string> = new Set(['backgroundColor', 'borderColor', 'tintColor', 'color'])
const INHERITED: ReadonlySet<string> = new Set(INHERITED_KEYS)

const ALL_KEYS = Object.keys(DEFAULTS) as Key[]

function normalizeValue(key: Key, value: unknown): unknown {
  if (COLOR_KEYS.has(key)) return toColor(value)
  if (key === 'fontWeight') return toWeight(value)
  if (key === 'opacity') return Math.min(1, Math.max(0, value as number))
  return value
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
