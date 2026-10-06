import type { Style, TransformOp } from '@implicit-invocation/three-ui'
import { parseAnimation, parseEasing, parseTime } from './animation'
import { convertCustomProp, isHandledCustomProp, type Draft } from './custom-props'
import { parseBackgroundImage } from './gradient'
import { parseDropShadowFunctions, parseShadowList } from './shadow'
import { evalCalc, parseCssColor, parseQuantity, resolveVars, rgbaToHex, splitTopLevel, toLength, type VarMap } from './values'

export interface ConvertResult {
  style: Style
  /** CSS initial values implied by the declarations (see `RegistryRule.defaults`). */
  defaults: Style
  warnings: string[]
}

interface Decl {
  prop: string
  value: string
}


/** Properties that have no visual meaning in three-ui and are dropped without a warning. */
const IGNORED = /^(box-sizing|cursor|user-select|-webkit-(?!text-stroke|line-clamp).*|-moz-.*|will-change|appearance|touch-action|outline.*|border-style|border-.*-style|scroll-.*|content|forced-color-adjust|text-rendering|font-smoothing|fill|stroke.*|accent-color|caret-color|resize|isolation|contain.*|list-style.*|backdrop-filter|transition-behavior)$/

const ALIGN: Record<string, string> = {
  auto: 'auto',
  normal: 'stretch',
  stretch: 'stretch',
  center: 'center',
  start: 'flex-start',
  'flex-start': 'flex-start',
  'self-start': 'flex-start',
  end: 'flex-end',
  'flex-end': 'flex-end',
  'self-end': 'flex-end',
  baseline: 'baseline',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
}

const RAW_VALUE_PROPS: ReadonlySet<string> = new Set(['background-image', 'box-shadow', 'text-shadow', 'filter'])

const LENGTH_PROPS: Record<string, { key: keyof Style; auto: boolean }> = {
  width: { key: 'width', auto: true },
  height: { key: 'height', auto: true },
  'min-width': { key: 'minWidth', auto: false },
  'min-height': { key: 'minHeight', auto: false },
  'max-width': { key: 'maxWidth', auto: false },
  'max-height': { key: 'maxHeight', auto: false },
  'flex-basis': { key: 'flexBasis', auto: true },
  top: { key: 'top', auto: true },
  right: { key: 'right', auto: true },
  bottom: { key: 'bottom', auto: true },
  left: { key: 'left', auto: true },
  'margin-top': { key: 'marginTop', auto: true },
  'margin-right': { key: 'marginRight', auto: true },
  'margin-bottom': { key: 'marginBottom', auto: true },
  'margin-left': { key: 'marginLeft', auto: true },
  'padding-top': { key: 'paddingTop', auto: false },
  'padding-right': { key: 'paddingRight', auto: false },
  'padding-bottom': { key: 'paddingBottom', auto: false },
  'padding-left': { key: 'paddingLeft', auto: false },
  'row-gap': { key: 'rowGap', auto: false },
  'column-gap': { key: 'columnGap', auto: false },
}

const SIDE_SHORTHANDS: Record<string, { all: keyof Style; horizontal: keyof Style; vertical: keyof Style; sides: [keyof Style, keyof Style, keyof Style, keyof Style]; auto: boolean }> = {
  margin: { all: 'margin', horizontal: 'marginHorizontal', vertical: 'marginVertical', sides: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'], auto: true },
  padding: { all: 'padding', horizontal: 'paddingHorizontal', vertical: 'paddingVertical', sides: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'], auto: false },
}

function num(value: string): number | null {
  const q = value.trim().startsWith('calc(') ? evalCalc(value) : parseQuantity(value)
  if (!q) return null
  if (q.unit === '%') return q.value / 100
  return q.value
}

function color(value: string): string | null {
  const c = parseCssColor(value)
  return c ? rgbaToHex(c) : null
}

function words(value: string): string[] {
  return splitTopLevel(value, /\s/)
}

/**
 * Convert the declarations of one Tailwind rule into a `@implicit-invocation/three-ui` `Style`.
 * Unsupported properties/values produce warnings (never silent nonsense).
 */
export function convertDeclarations(decls: readonly Decl[], globals: VarMap, token: string): ConvertResult {
  const warnings: string[] = []
  const style: Draft = {}
  const locals = new Map<string, string>()
  for (const d of decls) if (d.prop.startsWith('--')) locals.set(d.prop, d.value)
  const warn = (msg: string) => warnings.push(`"${token}": ${msg}`)

  for (const d of decls) {
    const prop = d.prop.toLowerCase()
    if (prop.startsWith('--')) {
      if (isHandledCustomProp(prop) && !convertCustomProp(prop, d.value, locals, globals, style, warn)) warn(`could not understand "${prop}: ${d.value.trim()}" (ignored)`)
      continue
    }
    if (IGNORED.test(prop)) continue
    const handled = SUPPORTED.has(prop) || prop in LENGTH_PROPS || prop in SIDE_SHORTHANDS
    if (!handled) {
      warn(`unsupported CSS property "${prop}" (ignored)`)
      continue
    }
    // these parse their own var() references (Tailwind composes them from several custom properties)
    const value = RAW_VALUE_PROPS.has(prop) ? d.value : resolveVars(d.value, locals, globals)
    if (value === null) {
      warn(`could not resolve variables in "${prop}: ${d.value}" (ignored)`)
      continue
    }
    pendingWarnings = []
    const ok = apply(prop, value.trim(), style, { raw: d.value, locals, globals })
    for (const w of pendingWarnings) warn(w)
    if (!ok) warn(`unsupported value "${value.trim()}" for "${prop}" (ignored)`)
  }

  // individual transform properties compose in CSS order: translate → rotate → scale
  const ops: TransformOp[] = []
  if (style.__translate) {
    if (style.__translate[0]) ops.push({ translateX: style.__translate[0] })
    if (style.__translate[1]) ops.push({ translateY: style.__translate[1] })
  }
  if (style.__rotate) ops.push({ rotate: style.__rotate })
  if (style.__scale) {
    const [sx, sy] = style.__scale
    if (sx === sy) ops.push({ scale: sx })
    else ops.push({ scaleX: sx }, { scaleY: sy })
  }
  const hasTransformProp = Array.isArray(style.__tf)
  if (hasTransformProp) ops.push(...(style.__tf as TransformOp[]))
  const defaults = (style.__defaults ?? {}) as Style
  delete style.__tf
  delete style.__translate
  delete style.__scale
  delete style.__rotate
  delete style.__defaults
  if (ops.length || hasTransformProp) style.transform = ops
  return { style: style as Style, defaults, warnings }
}

const SUPPORTED = new Set([
  'display', 'position', 'overflow', 'overflow-x', 'overflow-y', 'flex', 'flex-grow', 'flex-shrink', 'flex-direction', 'flex-wrap',
  'align-items', 'align-self', 'align-content', 'justify-content', 'gap', 'aspect-ratio', 'inset', 'inset-inline', 'inset-block',
  'inset-inline-start', 'inset-inline-end', 'inset-block-start', 'inset-block-end',
  'margin-inline', 'margin-block', 'margin-inline-start', 'margin-inline-end', 'margin-block-start', 'margin-block-end',
  'padding-inline', 'padding-block', 'padding-inline-start', 'padding-inline-end', 'padding-block-start', 'padding-block-end',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'size',
  'background-color', 'color', 'border-color', 'tint-color', 'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-inline-width', 'border-block-width', 'border-inline-start-width', 'border-inline-end-width', 'border-block-start-width', 'border-block-end-width',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-inline-color', 'border-block-color',
  'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'border-start-start-radius', 'border-start-end-radius', 'border-end-end-radius', 'border-end-start-radius',
  'opacity', 'z-index', 'pointer-events', 'translate', 'scale', 'rotate', 'transform',
  'background-image', 'box-shadow', 'text-shadow', 'filter', 'object-fit', 'text-overflow', 'white-space', '-webkit-line-clamp', 'paint-order',
  '-webkit-text-stroke', '-webkit-text-stroke-width', '-webkit-text-stroke-color',
  'animation', 'transition-property', 'transition-duration', 'transition-delay', 'transition-timing-function',
  'font-size', 'font-weight', 'font-style', 'font-family', 'line-height', 'letter-spacing', 'text-align',
])

interface ApplyContext {
  raw: string
  locals: VarMap
  globals: VarMap
}

/** Warnings produced while applying a value (not failures): drained by `convertDeclarations`. */
let pendingWarnings: string[] = []

const TRANSITION_PROPERTY: Record<string, string | string[] | null> = {
  color: 'color',
  'background-color': 'backgroundColor',
  'border-color': 'borderColor',
  'outline-color': null,
  'text-decoration-color': null,
  fill: null,
  stroke: null,
  '--tw-gradient-from': 'backgroundGradient',
  '--tw-gradient-via': 'backgroundGradient',
  '--tw-gradient-to': 'backgroundGradient',
  opacity: 'opacity',
  'box-shadow': 'boxShadow',
  'text-shadow': 'textShadow',
  transform: 'transform',
  translate: 'transform',
  scale: 'transform',
  rotate: 'transform',
  filter: 'dropShadow',
  'backdrop-filter': ['backdropBlur', 'backdropBrightness', 'backdropSaturate'],
  '-webkit-backdrop-filter': null,
  // discrete / non-visual properties Tailwind's `transition` lists: nothing to interpolate
  display: null,
  'content-visibility': null,
  overlay: null,
  'pointer-events': null,
  visibility: null,
  'outline-offset': null,
  'caret-color': null,
  'accent-color': null,
  '-webkit-text-stroke-color': 'textStrokeColor',
  '-webkit-text-stroke-width': 'textStrokeWidth',
  'background-image': 'backgroundGradient',
}

const camel = (p: string) => p.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())

/** `translateX(10px) rotate(5deg) scale(1.1)` → transform ops. */
function parseTransformList(value: string): TransformOp[] | null {
  const ops: TransformOp[] = []
  const re = /([a-zA-Z0-9]+)\(([^)]*)\)/g
  let m: RegExpExecArray | null
  let consumed = 0
  while ((m = re.exec(value))) {
    consumed += m[0].length
    const fn = m[1]!.toLowerCase()
    const args = m[2]!.split(',').map((a) => a.trim())
    const len = (a: string | undefined): number | `${number}%` | null => {
      if (a === undefined) return null
      const v = toLength(a)
      return typeof v === 'number' || (typeof v === 'string' && v.endsWith('%')) ? (v as number | `${number}%`) : null
    }
    const n = (a: string | undefined): number | null => {
      if (a === undefined) return null
      const q = a.startsWith('calc(') ? evalCalc(a) : parseQuantity(a)
      return q && q.unit === '' ? q.value : q && q.unit === '%' ? q.value / 100 : null
    }
    const angle = (a: string | undefined): number | null => {
      const t = /^(-?[\d.]+)(deg|rad|turn)$/.exec(a ?? '')
      if (!t) return a === '0' ? 0 : null
      const v = Number(t[1])
      return t[2] === 'deg' ? (v * Math.PI) / 180 : t[2] === 'turn' ? v * Math.PI * 2 : v
    }
    switch (fn) {
      case 'translatex':
      case 'translatey': {
        const v = len(args[0])
        if (v === null) return null
        ops.push(fn === 'translatex' ? { translateX: v } : { translateY: v })
        break
      }
      case 'translate': {
        const x = len(args[0])
        const y = args[1] === undefined ? 0 : len(args[1])
        if (x === null || y === null) return null
        ops.push({ translateX: x })
        if (y !== 0) ops.push({ translateY: y })
        break
      }
      case 'scale': {
        const x = n(args[0])
        const y = args[1] === undefined ? x : n(args[1])
        if (x === null || y === null) return null
        if (x === y) ops.push({ scale: x })
        else ops.push({ scaleX: x }, { scaleY: y })
        break
      }
      case 'scalex':
      case 'scaley': {
        const v = n(args[0])
        if (v === null) return null
        ops.push(fn === 'scalex' ? { scaleX: v } : { scaleY: v })
        break
      }
      case 'rotate':
      case 'rotatez': {
        const a = angle(args[0])
        if (a === null) return null
        ops.push({ rotate: a })
        break
      }
      default:
        return null
    }
  }
  return consumed > 0 && value.replace(re, '').trim() === '' ? ops : null
}

function apply(prop: string, value: string, s: Draft, ctx: ApplyContext): boolean {
  const { raw, locals, globals } = ctx
  const lp = LENGTH_PROPS[prop]
  if (lp) {
    const v = toLength(value)
    if (v === null || typeof v === 'string' && v.endsWith('em') || (v === 'auto' && !lp.auto)) return false
    s[lp.key] = v
    return true
  }
  const side = SIDE_SHORTHANDS[prop]
  if (side) {
    const parts = words(value).map(toLength)
    if (parts.length === 0 || parts.length > 4 || parts.some((p) => p === null || (typeof p === 'string' && p.endsWith('em')) || (p === 'auto' && !side.auto))) return false
    const [a, b, c, d] = parts as (number | string)[]
    if (parts.length === 1) s[side.all] = a
    else if (parts.length === 2) {
      s[side.vertical] = a
      s[side.horizontal] = b
    } else {
      s[side.sides[0]] = a
      s[side.sides[1]] = b
      s[side.sides[2]] = c
      s[side.sides[3]] = parts.length === 4 ? d : b
    }
    return true
  }

  switch (prop) {
    case 'display': {
      if (value === 'none') s.display = 'none'
      else if (value === '-webkit-box') return true // line-clamp-*: handled by -webkit-line-clamp
      else if (value === 'flex' || value === 'inline-flex') {
        s.display = 'flex'
        // CSS: a flex container's initial direction is row, Yoga's is column
        ;(s.__defaults ??= {}).flexDirection = 'row'
      } else if (value === 'block' || value === 'inline' || value === 'inline-block' || value === 'flow-root') {
        s.display = 'flex'
        ;(s.__defaults ??= {}).flexDirection = 'column'
      } else return false
      return true
    }
    case 'position':
      if (value === 'relative' || value === 'absolute') s.position = value
      else if (value === 'static') s.position = 'relative'
      else return false
      return true
    case 'overflow':
    case 'overflow-x':
    case 'overflow-y': {
      const m: Record<string, string> = { visible: 'visible', hidden: 'hidden', clip: 'hidden', scroll: 'scroll', auto: 'scroll' }
      const v = m[value]
      if (!v) return false
      s.overflow = v
      return true
    }
    case 'flex': {
      const n = Number(value)
      s.flex = Number.isFinite(n) && value.trim() !== '' ? n : value
      return true
    }
    case 'flex-grow':
    case 'flex-shrink': {
      const n = num(value)
      if (n === null) return false
      s[prop === 'flex-grow' ? 'flexGrow' : 'flexShrink'] = n
      return true
    }
    case 'flex-direction':
      if (!['row', 'column', 'row-reverse', 'column-reverse'].includes(value)) return false
      s.flexDirection = value
      return true
    case 'flex-wrap':
      if (!['wrap', 'nowrap', 'wrap-reverse'].includes(value)) return false
      s.flexWrap = value
      return true
    case 'align-items':
    case 'align-self':
    case 'align-content': {
      const v = ALIGN[value]
      if (!v || (prop === 'align-items' && v === 'auto')) return false
      s[prop === 'align-items' ? 'alignItems' : prop === 'align-self' ? 'alignSelf' : 'alignContent'] = v
      return true
    }
    case 'justify-content': {
      const m: Record<string, string> = { normal: 'flex-start', start: 'flex-start', 'flex-start': 'flex-start', end: 'flex-end', 'flex-end': 'flex-end', center: 'center', 'space-between': 'space-between', 'space-around': 'space-around', 'space-evenly': 'space-evenly' }
      const v = m[value]
      if (!v) return false
      s.justifyContent = v
      return true
    }
    case 'gap': {
      const parts = words(value).map(toLength)
      if (parts.length === 0 || parts.length > 2 || parts.some((p) => typeof p !== 'number' && !(typeof p === 'string' && p.endsWith('%')))) return false
      if (parts.length === 1) s.gap = parts[0]
      else {
        s.rowGap = parts[0]
        s.columnGap = parts[1]
      }
      return true
    }
    case 'aspect-ratio': {
      if (value === 'auto') return true
      const m = /^([\d.]+)\s*(?:\/\s*([\d.]+))?$/.exec(value)
      if (!m) return false
      s.aspectRatio = Number(m[1]) / (m[2] ? Number(m[2]) : 1)
      return true
    }
    case 'size': {
      const v = toLength(value)
      if (v === null) return false
      s.width = v
      s.height = v
      return true
    }
    case 'inset':
    case 'inset-inline':
    case 'inset-block': {
      const parts = words(value).map(toLength)
      if (parts.length === 0 || parts.length > 4 || parts.some((p) => p === null || (typeof p === 'string' && p.endsWith('em')))) return false
      const [a, b, c, d] = parts as (number | string)[]
      if (prop === 'inset') {
        s.top = a
        s.right = parts.length > 1 ? b : a
        s.bottom = parts.length > 2 ? c : a
        s.left = parts.length > 3 ? d : parts.length > 1 ? b : a
      } else if (prop === 'inset-inline') {
        s.left = a
        s.right = parts.length > 1 ? b : a
      } else {
        s.top = a
        s.bottom = parts.length > 1 ? b : a
      }
      return true
    }
    case 'inset-inline-start':
    case 'inset-inline-end':
    case 'inset-block-start':
    case 'inset-block-end': {
      const v = toLength(value)
      if (v === null) return false
      const key = prop.endsWith('inline-start') ? 'left' : prop.endsWith('inline-end') ? 'right' : prop.endsWith('block-start') ? 'top' : 'bottom'
      s[key] = v
      return true
    }
    case 'margin-inline':
    case 'margin-block':
    case 'padding-inline':
    case 'padding-block': {
      const base = prop.startsWith('margin') ? 'margin' : 'padding'
      const inline = prop.endsWith('inline')
      const parts = words(value).map(toLength)
      if (parts.length === 0 || parts.length > 2 || parts.some((p) => p === null)) return false
      const sides = inline ? ['Left', 'Right'] : ['Top', 'Bottom']
      s[`${base}${sides[0]}`] = parts[0]
      s[`${base}${sides[1]}`] = parts.length > 1 ? parts[1] : parts[0]
      return true
    }
    case 'margin-inline-start':
    case 'margin-inline-end':
    case 'margin-block-start':
    case 'margin-block-end':
    case 'padding-inline-start':
    case 'padding-inline-end':
    case 'padding-block-start':
    case 'padding-block-end': {
      const v = toLength(value)
      if (v === null) return false
      const base = prop.startsWith('margin') ? 'margin' : 'padding'
      const side = prop.endsWith('inline-start') ? 'Left' : prop.endsWith('inline-end') ? 'Right' : prop.endsWith('block-start') ? 'Top' : 'Bottom'
      s[`${base}${side}`] = v
      return true
    }
    case 'background-color':
    case 'color':
    case 'tint-color':
    case 'border-color': {
      const c = color(value)
      if (!c) return false
      s[prop === 'background-color' ? 'backgroundColor' : prop === 'color' ? 'color' : prop === 'tint-color' ? 'tintColor' : 'borderColor'] = c
      return true
    }
    case 'border-top-color':
    case 'border-right-color':
    case 'border-bottom-color':
    case 'border-left-color':
    case 'border-inline-color':
    case 'border-block-color':
      return false // per-side border colors need a per-side painter (not in v0.1)
    case 'border-width':
    case 'border-top-width':
    case 'border-right-width':
    case 'border-bottom-width':
    case 'border-left-width': {
      const parts = words(value).map(toLength)
      if (parts.length === 0 || parts.some((p) => typeof p !== 'number')) return false
      if (prop === 'border-width') {
        if (parts.length === 1) s.borderWidth = parts[0]
        else {
          const [t, r, b, l] = parts as number[]
          s.borderTopWidth = t
          s.borderRightWidth = r
          s.borderBottomWidth = parts.length > 2 ? b : t
          s.borderLeftWidth = parts.length > 3 ? l : r
        }
      } else s[`border${prop.slice(7, 8).toUpperCase()}${prop.slice(8, -6)}Width`] = parts[0]
      return true
    }
    case 'border-inline-width':
    case 'border-block-width':
    case 'border-inline-start-width':
    case 'border-inline-end-width':
    case 'border-block-start-width':
    case 'border-block-end-width': {
      const v = toLength(value)
      if (typeof v !== 'number') return false
      if (prop === 'border-inline-width') s.borderLeftWidth = s.borderRightWidth = v
      else if (prop === 'border-block-width') s.borderTopWidth = s.borderBottomWidth = v
      else if (prop === 'border-inline-start-width') s.borderLeftWidth = v
      else if (prop === 'border-inline-end-width') s.borderRightWidth = v
      else if (prop === 'border-block-start-width') s.borderTopWidth = v
      else s.borderBottomWidth = v
      return true
    }
    case 'border-radius': {
      // `a b c d / e f g h`: elliptical radii are approximated by their horizontal component
      const parts = words(value.split('/')[0]!).map(toLength)
      if (parts.length === 0 || parts.length > 4 || parts.some((p) => typeof p !== 'number')) return false
      const [tl, tr = tl, br = tl, bl = tr] = parts as number[]
      const cap = (v: number | undefined) => Math.min(v ?? 0, 9999)
      if (parts.length === 1) s.borderRadius = cap(tl)
      else {
        s.borderTopLeftRadius = cap(tl)
        s.borderTopRightRadius = cap(tr)
        s.borderBottomRightRadius = cap(br)
        s.borderBottomLeftRadius = cap(bl)
      }
      return true
    }
    case 'border-top-left-radius':
    case 'border-top-right-radius':
    case 'border-bottom-right-radius':
    case 'border-bottom-left-radius':
    case 'border-start-start-radius':
    case 'border-start-end-radius':
    case 'border-end-end-radius':
    case 'border-end-start-radius': {
      const v = toLength(words(value)[0] ?? '')
      if (typeof v !== 'number') return false
      const key = {
        'border-top-left-radius': 'borderTopLeftRadius',
        'border-top-right-radius': 'borderTopRightRadius',
        'border-bottom-right-radius': 'borderBottomRightRadius',
        'border-bottom-left-radius': 'borderBottomLeftRadius',
        // logical corners, left-to-right
        'border-start-start-radius': 'borderTopLeftRadius',
        'border-start-end-radius': 'borderTopRightRadius',
        'border-end-end-radius': 'borderBottomRightRadius',
        'border-end-start-radius': 'borderBottomLeftRadius',
      }[prop]!
      s[key] = Math.min(v, 9999)
      return true
    }
    case 'opacity': {
      const n = num(value)
      if (n === null) return false
      s.opacity = Math.min(1, Math.max(0, n))
      return true
    }
    case 'z-index': {
      const n = Number(value)
      if (!Number.isFinite(n)) return false
      s.zIndex = n
      return true
    }
    case 'pointer-events':
      if (value !== 'none' && value !== 'auto') return false
      s.pointerEvents = value
      return true
    case 'translate': {
      if (value === 'none') return true
      const parts = words(value).map(toLength)
      // px, or a percentage of the node's own size (`-translate-x-1/2`)
      const ok = (p: unknown) => typeof p === 'number' || (typeof p === 'string' && p.endsWith('%'))
      if (parts.length === 0 || parts.length > 3 || parts.some((p) => !ok(p))) return false
      s.__translate = [parts[0] as number | `${number}%`, (parts[1] as number | `${number}%` | undefined) ?? 0]
      return true
    }
    case 'scale': {
      if (value === 'none') return true
      const parts = words(value).map(num)
      if (parts.length === 0 || parts.length > 3 || parts.some((p) => p === null)) return false
      s.__scale = [parts[0]!, parts[1] ?? parts[0]!]
      return true
    }
    case 'rotate': {
      if (value === 'none') return true
      const m = /^(-?[\d.]+)(deg|rad|turn)$/.exec(value)
      if (!m) return false
      const n = Number(m[1])
      s.__rotate = m[2] === 'deg' ? (n * Math.PI) / 180 : m[2] === 'turn' ? n * Math.PI * 2 : n
      return true
    }
    case 'font-size': {
      const v = toLength(value)
      if (typeof v !== 'number') return false
      s.fontSize = v
      return true
    }
    case 'font-weight': {
      const m: Record<string, number> = { normal: 400, bold: 700, bolder: 700, lighter: 300 }
      const n = m[value] ?? Number(value)
      if (!Number.isFinite(n)) return false
      s.fontWeight = n
      return true
    }
    case 'font-style':
      if (value === 'italic' || value === 'oblique') s.fontStyle = 'italic'
      else if (value === 'normal') s.fontStyle = 'normal'
      else return false
      return true
    case 'font-family':
      s.fontFamily = value
      return true
    case 'line-height': {
      if (value === 'normal') return true
      const q = value.startsWith('calc(') ? evalCalc(value) : parseQuantity(value)
      if (!q) return false
      s.lineHeight = q.unit === '' ? `${Math.round(q.value * 10000) / 10000}em` : q.unit === 'em' ? `${q.value}em` : q.unit === 'px' ? q.value : undefined
      return s.lineHeight !== undefined
    }
    case 'letter-spacing': {
      if (value === 'normal') {
        s.letterSpacing = 0
        return true
      }
      const q = parseQuantity(value)
      if (!q || q.unit === '%') return false
      s.letterSpacing = q.unit === 'em' ? `${Math.round(q.value * 10000) / 10000}em` : q.value
      return true
    }
    case 'background-image': {
      const parsed = parseBackgroundImage(value, locals, globals)
      if (!parsed) return false
      s.backgroundGradient = parsed.gradient
      for (const w of parsed.warnings) pendingWarnings.push(w)
      return true
    }
    case 'box-shadow':
    case 'text-shadow': {
      // Tailwind's own composition (`var(--tw-inset-shadow), var(--tw-shadow), …`) is rebuilt from the shadow slots
      if (prop === 'box-shadow' && /^var\(\s*--tw-inset-shadow\s*\)/.test(raw.trim())) return true
      const layers = parseShadowList(value, locals, globals)
      if (!layers) return false
      ;((s.__tw ??= {}) as Record<string, unknown>)[prop === 'box-shadow' ? 'shadow' : 'textShadow'] = layers
      return true
    }
    case 'filter': {
      if (/var\(--tw-(blur|drop-shadow)/.test(raw) || value === 'none') return true // Tailwind's filter composition
      const layers = parseDropShadowFunctions(value, locals, globals)
      if (!layers || layers.length === 0) return false
      const tw = (s.__tw ??= {})
      tw.dropLayers = layers
      tw.dropUseSize = false
      return true
    }
    case 'object-fit':
      if (!['fill', 'contain', 'cover', 'none', 'scale-down'].includes(value)) return false
      s.objectFit = value
      return true
    case 'text-overflow':
      if (value !== 'ellipsis' && value !== 'clip') return false
      s.textOverflow = value
      return true
    case 'white-space':
      if (value === 'nowrap') s.whiteSpace = 'nowrap'
      else if (value === 'normal' || value === 'pre-wrap' || value === 'break-spaces' || value === 'pre-line') s.whiteSpace = 'normal'
      else return false
      return true
    case '-webkit-line-clamp': {
      if (value === 'none') {
        s.numberOfLines = 0
        return true
      }
      const n = Number(value)
      if (!Number.isInteger(n) || n < 0) return false
      s.numberOfLines = n
      s.textOverflow = 'ellipsis' // browsers draw `…` for -webkit-line-clamp
      return true
    }
    case 'paint-order':
      s.paintOrder = /^stroke\b/.test(value) ? 'stroke' : 'normal'
      return true
    case '-webkit-text-stroke': {
      const parts = words(value)
      let width: number | null = null
      let col: string | null = null
      for (const p of parts) {
        if (width === null) {
          const l = toLength(p)
          if (typeof l === 'number') {
            width = l
            continue
          }
        }
        const c = color(p)
        if (c && !col) col = c
        else return false
      }
      if (width === null && col === null) return false
      if (width !== null) s.textStrokeWidth = width
      if (col !== null) s.textStrokeColor = col
      return true
    }
    case '-webkit-text-stroke-width': {
      const l = toLength(value)
      if (typeof l !== 'number') return false
      s.textStrokeWidth = l
      return true
    }
    case '-webkit-text-stroke-color': {
      const c = color(value)
      if (!c) return false
      s.textStrokeColor = c
      return true
    }
    case 'transform': {
      if (value === 'none') {
        s.__tf = []
        return true
      }
      const ops = parseTransformList(value)
      if (!ops) return false
      s.__tf = ops
      return true
    }
    case 'animation': {
      const a = parseAnimation(value)
      if (!a) return false
      s.animation = a
      return true
    }
    case 'transition-property': {
      const parts = splitTopLevel(value, ',').map((p) => p.trim().toLowerCase())
      const mapped: string[] = []
      for (const p of parts) {
        const name = p in TRANSITION_PROPERTY ? TRANSITION_PROPERTY[p] : p === 'all' || p === 'none' ? p : camel(p)
        if (name === null || name === undefined) continue
        mapped.push(...(Array.isArray(name) ? name : [name]))
      }
      s.transitionProperty = [...new Set(mapped)]
      if (mapped.length === 0) s.transitionProperty = 'none'
      return true
    }
    case 'transition-duration':
    case 'transition-delay': {
      const times = splitTopLevel(value, ',').map(parseTime)
      if (times.length === 0 || times.some((t) => t === null)) return false
      s[prop === 'transition-duration' ? 'transitionDuration' : 'transitionDelay'] = times as number[]
      return true
    }
    case 'transition-timing-function': {
      const fns = splitTopLevel(value, ',').map(parseEasing)
      if (fns.length === 0 || fns.some((f) => f === null)) return false
      s.transitionTimingFunction = fns as string[]
      return true
    }
    case 'text-align': {
      const m: Record<string, string> = { left: 'left', start: 'left', center: 'center', right: 'right', end: 'right', justify: 'left' }
      const v = m[value]
      if (!v) return false
      s.textAlign = v
      return true
    }
  }
  return false
}
