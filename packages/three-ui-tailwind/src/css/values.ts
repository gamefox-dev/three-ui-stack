/** Value-level helpers for the CSS → three-ui converter: var(), calc(), lengths and colors. */

export const REM = 16

export type VarMap = ReadonlyMap<string, string>

/** Find the index of the `)` matching the `(` at `open`. */
function matchParen(s: string, open: number): number {
  let depth = 0
  for (let i = open; i < s.length; i++) {
    if (s[i] === '(') depth++
    else if (s[i] === ')' && --depth === 0) return i
  }
  return -1
}

/** Split on top-level commas. */
export function splitTopLevel(s: string, sep: string | RegExp = ','): string[] {
  const out: string[] = []
  let depth = 0
  let start = 0
  const isSep = (c: string, i: number) => (typeof sep === 'string' ? c === sep : sep.test(c) && i >= 0)
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!
    if (c === '(') depth++
    else if (c === ')') depth--
    else if (depth === 0 && isSep(c, i)) {
      out.push(s.slice(start, i))
      start = i + 1
    }
  }
  out.push(s.slice(start))
  return out.map((p) => p.trim()).filter((p) => p.length > 0)
}

/**
 * Substitute `var(--name, fallback)` using `locals` (rule-scoped custom props) then `globals`.
 * Returns `null` when a variable is unresolved and has no fallback.
 */
export function resolveVars(value: string, locals: VarMap, globals: VarMap, depth = 0): string | null {
  if (depth > 16) return null
  let out = ''
  let i = 0
  while (i < value.length) {
    const at = value.indexOf('var(', i)
    if (at < 0 || (at > 0 && /[a-zA-Z0-9_-]/.test(value[at - 1]!))) {
      if (at < 0) {
        out += value.slice(i)
        break
      }
      out += value.slice(i, at + 4)
      i = at + 4
      continue
    }
    const close = matchParen(value, at + 3)
    if (close < 0) return null
    out += value.slice(i, at)
    const inner = value.slice(at + 4, close)
    const comma = splitFirstComma(inner)
    const name = comma[0].trim()
    const fallback = comma[1]
    const raw = locals.get(name) ?? globals.get(name)
    let resolved: string | null
    if (raw !== undefined) resolved = resolveVars(raw, locals, globals, depth + 1)
    else if (fallback !== undefined) resolved = resolveVars(fallback.trim(), locals, globals, depth + 1)
    else resolved = null
    if (resolved === null) return null
    out += resolved
    i = close + 1
  }
  return out
}

function splitFirstComma(s: string): [string, string | undefined] {
  let depth = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++
    else if (s[i] === ')') depth--
    else if (s[i] === ',' && depth === 0) return [s.slice(0, i), s.slice(i + 1)]
  }
  return [s, undefined]
}

// ───────────────────────────── calc() ─────────────────────────────

export interface Quantity {
  value: number
  /** '' (unitless), 'px', '%', 'em' */
  unit: '' | 'px' | '%' | 'em'
}

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i

/** Parse a single dimension like `12px`, `1.5rem`, `50%`, `0.025em`, `3` into a quantity (rem → px). */
export function parseQuantity(token: string): Quantity | null {
  const t = token.trim()
  if (t === 'infinity') return { value: 1e9, unit: '' }
  const m = NUMBER.exec(t)
  if (!m) return null
  const value = parseFloat(m[0])
  const unit = t.slice(m[0].length).toLowerCase()
  switch (unit) {
    case '':
      return { value, unit: '' }
    case 'px':
      return { value, unit: 'px' }
    case 'rem':
      return { value: value * REM, unit: 'px' }
    case '%':
      return { value, unit: '%' }
    case 'em':
      return { value, unit: 'em' }
    case 'deg':
      return { value, unit: '' } // angles are handled by the caller
    default:
      return null
  }
}

/** Evaluate `calc(...)` / bare arithmetic over px, %, em and unitless numbers. Returns null if unsupported. */
export function evalCalc(expr: string): Quantity | null {
  const src = expr.trim()
  let pos = 0

  const skip = () => {
    while (pos < src.length && /\s/.test(src[pos]!)) pos++
  }

  function parseExpr(): Quantity | null {
    let left = parseTerm()
    if (!left) return null
    for (;;) {
      skip()
      const op = src[pos]
      if (op !== '+' && op !== '-') return left
      pos++
      const right = parseTerm()
      if (!right) return null
      if (left.unit !== right.unit) {
        // unitless 0 is compatible with anything
        if (right.value === 0 && right.unit === '') {
          // keep left
        } else if (left.value === 0 && left.unit === '') left = right
        else return null
      } else {
        left = { value: op === '+' ? left.value + right.value : left.value - right.value, unit: left.unit }
      }
    }
  }

  function parseTerm(): Quantity | null {
    let left = parseFactor()
    if (!left) return null
    for (;;) {
      skip()
      const op = src[pos]
      if (op !== '*' && op !== '/') return left
      pos++
      const right = parseFactor()
      if (!right) return null
      if (op === '*') {
        if (left.unit !== '' && right.unit !== '') return null
        left = { value: left.value * right.value, unit: left.unit || right.unit }
      } else {
        if (right.unit !== '' || right.value === 0) return null
        left = { value: left.value / right.value, unit: left.unit }
      }
    }
  }

  function parseFactor(): Quantity | null {
    skip()
    if (src[pos] === '(') {
      pos++
      const v = parseExpr()
      skip()
      if (src[pos] !== ')') return null
      pos++
      return v
    }
    if (src.startsWith('calc(', pos)) {
      pos += 4
      return parseFactor()
    }
    const m = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(?:px|rem|em|%|deg)?|^infinity/i.exec(src.slice(pos))
    if (!m) return null
    pos += m[0].length
    return parseQuantity(m[0])
  }

  const result = parseExpr()
  skip()
  return pos === src.length ? result : null
}

/** Resolve a CSS length-ish value to three-ui terms: number (px), `"N%"`, `"auto"`, or `"Nem"`. */
export function toLength(value: string): number | `${number}%` | `${number}em` | 'auto' | null {
  const v = value.trim().toLowerCase()
  if (v === 'auto') return 'auto'
  const q = v.startsWith('calc(') || /[+*/]|\s-\s/.test(v) ? evalCalc(v) : parseQuantity(v)
  if (!q) return null
  switch (q.unit) {
    case 'px':
    case '':
      return Math.round(q.value * 1000) / 1000
    case '%':
      return `${round(q.value)}%`
    case 'em':
      return `${round(q.value)}em`
  }
}

const round = (n: number) => Math.round(n * 1000) / 1000

// ───────────────────────────── colors ─────────────────────────────

export interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const toSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055)

export function oklabToRgba(L: number, a: number, b: number, alpha: number): RGBA {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  return {
    r: clamp01(toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    g: clamp01(toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    b: clamp01(toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
    a: alpha,
  }
}

function parseComponent(token: string, percentScale: number): number {
  const t = token.trim()
  if (t === 'none') return 0
  if (t.endsWith('%')) return (parseFloat(t) / 100) * percentScale
  return parseFloat(t)
}

/** Hue angle in degrees; `none` (a missing component, e.g. `oklch(98.5% 0 none)`) is 0. */
function hueDegrees(token: string | undefined): number {
  if (token === undefined || token === 'none') return 0
  const n = parseFloat(token)
  return Number.isFinite(n) ? n : 0
}

function parseAlpha(token: string | undefined): number {
  if (token === undefined) return 1
  const t = token.trim()
  return clamp01(t.endsWith('%') ? parseFloat(t) / 100 : parseFloat(t))
}

const NAMED: Record<string, string> = { transparent: '#00000000', black: '#000000', white: '#ffffff', red: '#ff0000', blue: '#0000ff', green: '#008000' }

/** Parse a CSS color (after var() resolution) to sRGB. Returns null for unsupported syntax (e.g. currentcolor). */
export function parseCssColor(input: string): RGBA | null {
  const s = input.trim().toLowerCase()
  const named = NAMED[s]
  if (named) return parseCssColor(named)
  if (s.startsWith('#')) {
    let hex = s.slice(1)
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join('')
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(hex)) return null
    const n = parseInt(hex.slice(0, 6), 16)
    return { r: (n >> 16) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1 }
  }
  const fn = /^([a-z-]+)\((.*)\)$/s.exec(s)
  if (!fn) return null
  const name = fn[1]!
  const args = fn[2]!
  if (/^from\s/.test(args)) return parseRelativeColor(args.slice(5))
  const slash = args.split('/')
  const main = slash[0]!.trim().split(/[\s,]+/).filter(Boolean)
  const alphaTok = slash[1] ?? (name.endsWith('a') && main.length === 4 ? main.pop() : undefined)
  const alpha = parseAlpha(alphaTok)
  switch (name) {
    case 'rgb':
    case 'rgba': {
      const ch = (t: string | undefined) => clamp01(t === undefined ? 0 : t.endsWith('%') ? parseFloat(t) / 100 : parseFloat(t) / 255)
      return { r: ch(main[0]), g: ch(main[1]), b: ch(main[2]), a: alpha }
    }
    case 'hsl':
    case 'hsla': {
      const h = (((hueDegrees(main[0]) % 360) + 360) % 360) / 360
      const sat = clamp01(parseComponent(main[1] ?? '0', 1) / (main[1]?.endsWith('%') ? 1 : 100))
      const lig = clamp01(parseComponent(main[2] ?? '0', 1) / (main[2]?.endsWith('%') ? 1 : 100))
      const q = lig < 0.5 ? lig * (1 + sat) : lig + sat - lig * sat
      const p = 2 * lig - q
      const hue = (t: number) => {
        t = (t + 1) % 1
        return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p
      }
      return { r: hue(h + 1 / 3), g: hue(h), b: hue(h - 1 / 3), a: alpha }
    }
    case 'oklch': {
      const L = clamp01(parseComponent(main[0] ?? '0', 1))
      const C = parseComponent(main[1] ?? '0', 0.4)
      const H = (hueDegrees(main[2]) * Math.PI) / 180
      return oklabToRgba(L, C * Math.cos(H), C * Math.sin(H), alpha)
    }
    case 'oklab':
      return oklabToRgba(clamp01(parseComponent(main[0] ?? '0', 1)), parseComponent(main[1] ?? '0', 0.4), parseComponent(main[2] ?? '0', 0.4), alpha)
    case 'color-mix':
      return parseColorMix(args)
    default:
      return null
  }
}

/**
 * `oklab(from <color> l a b / <alpha>)` — the identity-channel relative color Tailwind v4 emits to re-alpha theme
 * shadow colors. Other channel expressions are not supported.
 */
function parseRelativeColor(args: string): RGBA | null {
  const tokens = splitTopLevel(args, /\s/)
  const base = tokens[0] ? parseCssColor(tokens[0]) : null
  if (!base) return null
  const channels = tokens.slice(1, 4).join(' ')
  if (!/^(l a b|l c h|r g b|h s l)$/.test(channels)) return null
  if (tokens.length === 4) return base
  if (tokens[4] !== '/' || tokens.length !== 6) return null
  const a = tokens[5] === 'alpha' ? base.a : parseAlpha(tokens[5])
  return { ...base, a }
}

/** `color-mix(in <space>, <color> N%, transparent)` — the form Tailwind emits for opacity modifiers. */
function parseColorMix(args: string): RGBA | null {
  const parts = splitTopLevel(args)
  if (parts.length !== 3 || !/^in\s/.test(parts[0]!)) return null
  const first = /^(.*?)(?:\s+([\d.]+)%)?$/s.exec(parts[1]!)
  const second = /^(.*?)(?:\s+([\d.]+)%)?$/s.exec(parts[2]!)
  if (!first || !second) return null
  const c1 = parseCssColor(first[1]!)
  const c2 = parseCssColor(second[1]!)
  if (!c1 || !c2) return null
  let p1 = first[2] !== undefined ? parseFloat(first[2]) / 100 : second[2] !== undefined ? 1 - parseFloat(second[2]) / 100 : 0.5
  let p2 = second[2] !== undefined ? parseFloat(second[2]) / 100 : 1 - p1
  const total = p1 + p2
  if (total <= 0) return null
  p1 /= total
  p2 /= total
  // premultiplied interpolation
  const a = c1.a * p1 + c2.a * p2
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
  const mix = (x1: number, x2: number) => (x1 * c1.a * p1 + x2 * c2.a * p2) / a
  return { r: mix(c1.r, c2.r), g: mix(c1.g, c2.g), b: mix(c1.b, c2.b), a: total < 1 ? a * total : a }
}

export function rgbaToHex(c: RGBA): string {
  const h = (v: number) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')
  return `#${h(c.r)}${h(c.g)}${h(c.b)}${c.a < 1 ? h(c.a) : ''}`
}
