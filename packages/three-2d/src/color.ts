import type { ColorLike } from './types'

/** Mutable RGBA color, float channels in 0..1 (sRGB). */
export class Color4 {
  constructor(
    public r = 1,
    public g = 1,
    public b = 1,
    public a = 1,
  ) {}

  set(r: number, g: number, b: number, a = 1): this {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
    return this
  }

  copy(o: Color4): this {
    return this.set(o.r, o.g, o.b, o.a)
  }

  clone(): Color4 {
    return new Color4(this.r, this.g, this.b, this.a)
  }

  /** Parse any `ColorLike` into this color. */
  setFrom(value: ColorLike): this {
    parseColor(value, this)
    return this
  }

  toHex(): string {
    const h = (v: number) => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')
    return `#${h(this.r)}${h(this.g)}${h(this.b)}${this.a < 1 ? h(this.a) : ''}`
  }

  static from(value: ColorLike): Color4 {
    return parseColor(value, new Color4())
  }
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

const NAMED: Record<string, number> = {
  white: 0xffffff,
  black: 0x000000,
  red: 0xff0000,
  green: 0x008000,
  lime: 0x00ff00,
  blue: 0x0000ff,
  yellow: 0xffff00,
  cyan: 0x00ffff,
  magenta: 0xff00ff,
  orange: 0xffa500,
  purple: 0x800080,
  pink: 0xffc0cb,
  gray: 0x808080,
  grey: 0x808080,
  silver: 0xc0c0c0,
  navy: 0x000080,
  teal: 0x008080,
  maroon: 0x800000,
  olive: 0x808000,
  gold: 0xffd700,
  coral: 0xff7f50,
  tomato: 0xff6347,
  crimson: 0xdc143c,
  indigo: 0x4b0082,
  violet: 0xee82ee,
  skyblue: 0x87ceeb,
  rebeccapurple: 0x663399,
}

const stringCache = new Map<string, readonly [number, number, number, number]>()

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return [r + m, g + m, b + m]
}

function parseChannel(token: string, scale: number): number {
  token = token.trim()
  if (token.endsWith('%')) return clamp01(parseFloat(token) / 100)
  return clamp01(parseFloat(token) / scale)
}

function parseAlpha(token: string | undefined): number {
  if (token === undefined) return 1
  token = token.trim()
  return token.endsWith('%') ? clamp01(parseFloat(token) / 100) : clamp01(parseFloat(token))
}

function parseColorString(input: string): readonly [number, number, number, number] {
  const s = input.trim().toLowerCase()
  if (s === 'transparent') return [0, 0, 0, 0]
  if (s[0] === '#') {
    let hex = s.slice(1)
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join('')
    if (hex.length !== 6 && hex.length !== 8) throw new Error(`[three-2d] invalid color "${input}"`)
    const n = parseInt(hex, 16)
    if (Number.isNaN(n)) throw new Error(`[three-2d] invalid color "${input}"`)
    if (hex.length === 6) return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1]
    return [
      ((n >>> 24) & 255) / 255,
      ((n >>> 16) & 255) / 255,
      ((n >>> 8) & 255) / 255,
      (n & 255) / 255,
    ]
  }
  const fn = /^(rgba?|hsla?)\(([^)]*)\)$/.exec(s)
  if (fn) {
    const parts = fn[2]!.split(/[\s,/]+/).filter(Boolean)
    if (fn[1]!.startsWith('rgb')) {
      return [
        parseChannel(parts[0] ?? '0', 255),
        parseChannel(parts[1] ?? '0', 255),
        parseChannel(parts[2] ?? '0', 255),
        parseAlpha(parts[3]),
      ]
    }
    const [r, g, b] = hslToRgb(parseFloat(parts[0] ?? '0'), parseChannel(parts[1] ?? '0', 100), parseChannel(parts[2] ?? '0', 100))
    return [r, g, b, parseAlpha(parts[3])]
  }
  const named = NAMED[s]
  if (named !== undefined) return [(named >> 16) / 255, ((named >> 8) & 255) / 255, (named & 255) / 255, 1]
  throw new Error(`[three-2d] invalid color "${input}"`)
}

/** Parse a `ColorLike` into `out` without allocating (string results are cached). */
export function parseColor(value: ColorLike, out: Color4): Color4 {
  if (typeof value === 'number') {
    return out.set(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255, 1)
  }
  if (typeof value === 'string') {
    let c = stringCache.get(value)
    if (c === undefined) {
      c = parseColorString(value)
      if (stringCache.size > 4096) stringCache.clear()
      stringCache.set(value, c)
    }
    return out.set(c[0], c[1], c[2], c[3])
  }
  if (Array.isArray(value)) {
    const t = value as readonly number[]
    return out.set(t[0] ?? 0, t[1] ?? 0, t[2] ?? 0, t[3] ?? 1)
  }
  const o = value as { r: number; g: number; b: number; a?: number }
  return out.set(o.r, o.g, o.b, o.a ?? 1)
}

/** Pack to 0xAABBGGRR-ordered little-endian uint32 (RGBA bytes in memory order). */
export function packColor(r: number, g: number, b: number, a: number): number {
  return (
    (((Math.round(clamp01(a) * 255) << 24) |
      (Math.round(clamp01(b) * 255) << 16) |
      (Math.round(clamp01(g) * 255) << 8) |
      Math.round(clamp01(r) * 255)) >>>
      0)
  )
}

export function unpackColor(packed: number, out: Color4): Color4 {
  return out.set((packed & 255) / 255, ((packed >>> 8) & 255) / 255, ((packed >>> 16) & 255) / 255, ((packed >>> 24) & 255) / 255)
}
