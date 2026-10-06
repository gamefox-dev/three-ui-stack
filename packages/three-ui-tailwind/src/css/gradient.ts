import type { BackgroundGradient, GradientCorner, GradientLength, GradientStop, RadialGradient, RadialSize } from '@implicit-invocation/three-ui'
import { evalCalc, parseCssColor, parseQuantity, resolveVars, rgbaToHex, splitTopLevel, type VarMap } from './values'

type Space = 'srgb' | 'oklab'

export interface ParsedBackgroundImage {
  /** `'none'` clears an earlier gradient. */
  gradient: BackgroundGradient | 'none'
  /** Colors came from `var(--tw-gradient-stops)`: they are supplied by `from-*` / `via-*` / `to-*`. */
  fromSlots: boolean
  warnings: string[]
}

const POSITION_START = /^(to\s|in\s|at\s|circle\b|ellipse\b|closest-|farthest-|[-+]?[\d.]+(deg|rad|turn|grad)\b)/i
const KNOWN_SPACES: Record<string, Space> = { srgb: 'srgb', oklab: 'oklab' }

function toLength(token: string): GradientLength | null {
  const t = token.trim()
  const q = t.startsWith('calc(') ? evalCalc(t) : parseQuantity(t)
  if (!q) return null
  if (q.unit === '%') return `${Math.round(q.value * 1000) / 1000}%`
  if (q.unit === 'px' || q.unit === '') return Math.round(q.value * 1000) / 1000
  return null
}

function parseSpace(words: string[], i: number, warnings: string[]): { space: Space; next: number } | null {
  if (words[i]?.toLowerCase() !== 'in') return null
  const name = (words[i + 1] ?? '').toLowerCase()
  let space: Space | undefined = KNOWN_SPACES[name]
  if (!space) {
    warnings.push(`gradient interpolation "in ${name}" is not supported (using oklab)`)
    space = 'oklab'
  }
  // optional hue method ("shorter hue"…) is only meaningful for polar spaces
  return { space, next: i + 2 }
}

/** `<angle> | to <side-or-corner>` plus an optional `in <space>`. */
function parseLinearPosition(text: string, warnings: string[]): { angle: number | `${number}deg` | GradientCorner | undefined; space: Space | undefined } {
  const words = splitTopLevel(text, /\s/)
  let angle: number | `${number}deg` | GradientCorner | undefined
  let space: Space | undefined
  for (let i = 0; i < words.length; ) {
    const w = words[i]!.toLowerCase()
    if (w === 'to') {
      const sides: string[] = []
      i++
      while (i < words.length && /^(top|right|bottom|left)$/i.test(words[i]!)) sides.push(words[i++]!.toLowerCase())
      angle = `to ${sides.join(' ')}` as GradientCorner
    } else if (w === 'in') {
      const s = parseSpace(words, i, warnings)
      if (!s) break
      space = s.space
      i = s.next
    } else {
      const m = /^([-+]?[\d.]+)(deg|rad|turn|grad)$/.exec(w)
      if (m) {
        const n = Number(m[1])
        angle = m[2] === 'deg' ? n : m[2] === 'rad' ? (n * 180) / Math.PI : m[2] === 'turn' ? n * 360 : n * 0.9
      }
      i++
    }
  }
  return { angle, space }
}

function parseRadialPosition(text: string, warnings: string[]): Omit<RadialGradient, 'type' | 'stops'> & { space: Space | undefined } {
  const words = splitTopLevel(text, /\s/)
  let shape: RadialGradient['shape']
  let size: RadialGradient['size']
  let at: RadialGradient['at']
  let space: Space | undefined
  const lengths: GradientLength[] = []
  for (let i = 0; i < words.length; ) {
    const w = words[i]!.toLowerCase()
    if (w === 'circle' || w === 'ellipse') {
      shape = w
      i++
    } else if (/^(closest|farthest)-(side|corner)$/.test(w)) {
      size = w as RadialSize
      i++
    } else if (w === 'in') {
      const s = parseSpace(words, i, warnings)
      if (!s) break
      space = s.space
      i = s.next
    } else if (w === 'at') {
      const x = words[i + 1] ?? 'center'
      const y = words[i + 2]
      const hx = /^(left|center|right)$/i.test(x) ? (x.toLowerCase() as 'left' | 'center' | 'right') : (toLength(x) ?? '50%')
      let hy: GradientLength | 'top' | 'center' | 'bottom' = '50%'
      if (y !== undefined) hy = /^(top|center|bottom)$/i.test(y) ? (y.toLowerCase() as 'top' | 'center' | 'bottom') : (toLength(y) ?? '50%')
      else if (/^(top|bottom)$/i.test(x)) {
        // `at top` → x = center
        at = ['center', x.toLowerCase() as 'top' | 'bottom']
        i += 2
        continue
      }
      at = [hx, hy]
      i += y !== undefined ? 3 : 2
    } else {
      const l = toLength(w)
      if (l !== null) lengths.push(l)
      i++
    }
  }
  if (lengths.length === 1 && typeof lengths[0] === 'number') size = lengths[0]
  else if (lengths.length >= 2) size = [lengths[0]!, lengths[1]!]
  return { ...(shape ? { shape } : {}), ...(size !== undefined ? { size } : {}), ...(at ? { at } : {}), space }
}

function parseStops(args: string[], locals: VarMap, globals: VarMap, warnings: string[]): GradientStop[] | null {
  const stops: GradientStop[] = []
  for (const arg of args) {
    const tokens = splitTopLevel(arg, /\s/)
    const colorText = tokens[0]
    if (!colorText) return null
    const resolved = resolveVars(colorText, locals, globals)
    const rgba = resolved === null ? null : parseCssColor(resolved)
    if (!rgba) {
      // a lone length is a color hint (midpoint) — not supported
      if (toLength(colorText) !== null && tokens.length === 1) {
        warnings.push('gradient color hints are not supported (ignored)')
        continue
      }
      return null
    }
    const color = rgbaToHex(rgba)
    const positions = tokens.slice(1).map(toLength)
    if (positions.some((p) => p === null)) return null
    if (positions.length === 0) stops.push({ color })
    else for (const p of positions) stops.push({ color, position: p! })
  }
  return stops
}

/**
 * Parse a `background-image` value into gradient data. Handles Tailwind's `linear-gradient(var(--tw-gradient-stops))`
 * (stops supplied by `from-*` / `via-*` / `to-*`) and complete arbitrary gradients.
 * Returns `null` for anything else (url(), multiple layers, repeating gradients…).
 */
export function parseBackgroundImage(value: string, locals: VarMap, globals: VarMap): ParsedBackgroundImage | null {
  const text = value.trim()
  if (text === 'none') return { gradient: 'none', fromSlots: false, warnings: [] }
  const m = /^(linear|radial)-gradient\(([\s\S]*)\)$/.exec(text)
  if (!m) return null
  const type = m[1] as 'linear' | 'radial'
  const warnings: string[] = []
  const inner = m[2]!.trim()

  // Tailwind: var(--tw-gradient-stops[, fallback-position]) with the position in a sibling custom property
  const slot = /^var\(\s*--tw-gradient-stops\s*(?:,([\s\S]*))?\)$/.exec(inner)
  let positionText: string
  let stopArgs: string[] | null = null
  if (slot) {
    positionText = (locals.get('--tw-gradient-position') ?? slot[1] ?? '').trim()
    if (positionText.startsWith('var(')) positionText = ''
  } else {
    const resolved = resolveVars(inner, locals, globals)
    if (resolved === null) return null
    const args = splitTopLevel(resolved, ',')
    if (args.length === 0) return null
    if (POSITION_START.test(args[0]!) || (type === 'radial' && toLength(args[0]!.split(/\s+/)[0]!) !== null)) {
      positionText = args[0]!
      stopArgs = args.slice(1)
    } else {
      positionText = ''
      stopArgs = args
    }
  }

  let stops: GradientStop[] | undefined
  if (stopArgs) {
    const parsed = parseStops(stopArgs, locals, globals, warnings)
    if (!parsed || parsed.length < 2) return null
    stops = parsed
  }

  let gradient: BackgroundGradient
  if (type === 'linear') {
    const pos = parseLinearPosition(positionText, warnings)
    gradient = { type: 'linear', ...(pos.angle !== undefined ? { angle: pos.angle } : {}), ...(pos.space ? { colorSpace: pos.space } : {}), ...(stops ? { stops } : {}) }
  } else {
    const pos = parseRadialPosition(positionText, warnings)
    const { space, ...rest } = pos
    gradient = { type: 'radial', ...rest, ...(space ? { colorSpace: space } : {}), ...(stops ? { stops } : {}) }
  }
  return { gradient, fromSlots: !stops, warnings }
}
