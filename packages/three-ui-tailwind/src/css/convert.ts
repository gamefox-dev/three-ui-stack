import type { Style, TransformOp } from 'three-ui'
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

type Draft = Record<string, unknown> & { __translate?: [number, number]; __scale?: [number, number]; __rotate?: number; __defaults?: Record<string, unknown> }

/** Properties that have no visual meaning in three-ui and are dropped without a warning. */
const IGNORED = /^(box-sizing|cursor|user-select|-webkit-.*|-moz-.*|transition.*|will-change|appearance|touch-action|outline.*|border-style|border-.*-style|scroll-.*|content|forced-color-adjust|text-rendering|font-smoothing|fill|stroke.*|accent-color|caret-color|resize|isolation|contain.*|list-style.*|--.*)$/

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
 * Convert the declarations of one Tailwind rule into a `three-ui` `Style`.
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
    if (IGNORED.test(prop)) continue
    const handled = SUPPORTED.has(prop) || prop in LENGTH_PROPS || prop in SIDE_SHORTHANDS
    if (!handled) {
      warn(`unsupported CSS property "${prop}" (ignored)`)
      continue
    }
    const value = resolveVars(d.value, locals, globals)
    if (value === null) {
      warn(`could not resolve variables in "${prop}: ${d.value}" (ignored)`)
      continue
    }
    const ok = apply(prop, value.trim(), style)
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
  const defaults = (style.__defaults ?? {}) as Style
  delete style.__translate
  delete style.__scale
  delete style.__rotate
  delete style.__defaults
  if (ops.length) style.transform = ops
  return { style: style as Style, defaults, warnings }
}

const SUPPORTED = new Set([
  'display', 'position', 'overflow', 'overflow-x', 'overflow-y', 'flex', 'flex-grow', 'flex-shrink', 'flex-direction', 'flex-wrap',
  'align-items', 'align-self', 'align-content', 'justify-content', 'gap', 'aspect-ratio', 'inset', 'inset-inline', 'inset-block',
  'inset-inline-start', 'inset-inline-end', 'inset-block-start', 'inset-block-end',
  'margin-inline', 'margin-block', 'margin-inline-start', 'margin-inline-end', 'margin-block-start', 'margin-block-end',
  'padding-inline', 'padding-block', 'padding-inline-start', 'padding-inline-end', 'padding-block-start', 'padding-block-end',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'size',
  'background-color', 'color', 'border-color', 'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-inline-width', 'border-block-width', 'border-inline-start-width', 'border-inline-end-width', 'border-block-start-width', 'border-block-end-width',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-inline-color', 'border-block-color',
  'border-radius', 'opacity', 'z-index', 'pointer-events', 'translate', 'scale', 'rotate',
  'font-size', 'font-weight', 'font-style', 'font-family', 'line-height', 'letter-spacing', 'text-align',
])

function apply(prop: string, value: string, s: Draft): boolean {
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
    case 'border-color': {
      const c = color(value)
      if (!c) return false
      s[prop === 'background-color' ? 'backgroundColor' : prop === 'color' ? 'color' : 'borderColor'] = c
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
      const first = words(value.split('/')[0]!)[0]
      const v = first ? toLength(first) : null
      if (typeof v !== 'number') return false
      s.borderRadius = Math.min(v, 9999)
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
      if (parts.length === 0 || parts.length > 3 || parts.some((p) => typeof p !== 'number')) return false
      s.__translate = [parts[0] as number, (parts[1] as number | undefined) ?? 0]
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
