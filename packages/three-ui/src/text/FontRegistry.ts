import type { BitmapFont } from 'three-2d'
import { warnOnce } from '../dev'

const GENERIC_FAMILIES: ReadonlySet<string> = new Set(['system-ui', 'ui-sans-serif', 'sans-serif', 'serif', 'monospace', 'ui-monospace', 'ui-serif', '-apple-system', 'inherit', ''])

export interface FontDescriptor {
  family?: string
  weight?: number
  style?: 'normal' | 'italic'
}

/** All baked sizes of one (family, weight, style). Layout uses the largest size as the canonical metric source. */
export class FontFace {
  readonly sizes: BitmapFont[] = []
  constructor(
    readonly family: string,
    readonly weight: number,
    readonly style: 'normal' | 'italic',
  ) {}

  get key(): string {
    return `${this.family}|${this.weight}|${this.style}`
  }

  /** Largest baked size: the metrics reference, so layout is identical regardless of display DPR. */
  get canonical(): BitmapFont {
    return this.sizes[this.sizes.length - 1]!
  }

  /** Smallest baked size ≥ the physical pixel size (falls back to the largest). */
  pick(physicalSize: number): BitmapFont {
    for (const f of this.sizes) if (f.size >= physicalSize - 0.5) return f
    return this.canonical
  }
}

/**
 * Maps `fontFamily` / `fontWeight` / `fontStyle` to baked bitmap fonts. Register several sizes of a face
 * and the renderer picks the closest one for the current pixel ratio.
 */
export class FontRegistry {
  private readonly faces: FontFace[] = []
  private defaultFace: FontFace | null = null
  private readonly cache = new Map<string, FontFace | null>()

  /** Register a baked font. Family/weight/style default to the font's own metadata. */
  register(font: BitmapFont, descriptor: FontDescriptor = {}): this {
    const family = (descriptor.family ?? font.data.family).toLowerCase()
    const weight = descriptor.weight ?? font.data.weight
    const style = descriptor.style ?? (/italic|oblique/i.test(font.data.style) ? 'italic' : 'normal')
    let face = this.faces.find((f) => f.family === family && f.weight === weight && f.style === style)
    if (!face) {
      face = new FontFace(family, weight, style)
      this.faces.push(face)
    }
    face.sizes.push(font)
    face.sizes.sort((a, b) => a.size - b.size)
    this.defaultFace ??= face
    this.cache.clear()
    return this
  }

  /** Face used when nothing matches (defaults to the first registered). */
  setDefault(family: string, weight = 400): void {
    this.defaultFace = this.faces.find((f) => f.family === family.toLowerCase() && f.weight === weight) ?? this.defaultFace
    this.cache.clear()
  }

  get isEmpty(): boolean {
    return this.faces.length === 0
  }

  all(): readonly FontFace[] {
    return this.faces
  }

  private match(family: string, weight: number, style: 'normal' | 'italic'): FontFace | null {
    const candidates = this.faces.filter((f) => f.family === family)
    if (candidates.length === 0) return null
    const preferred = candidates.filter((f) => f.style === style)
    const pool = preferred.length ? preferred : candidates
    return pool.reduce((best, f) => (Math.abs(f.weight - weight) < Math.abs(best.weight - weight) ? f : best))
  }

  resolve(fontFamily: string, weight: number, style: 'normal' | 'italic'): FontFace | null {
    const key = `${fontFamily}|${weight}|${style}`
    const hit = this.cache.get(key)
    if (hit !== undefined) return hit
    let result: FontFace | null = null
    for (const raw of fontFamily.split(',')) {
      result = this.match(raw.trim().replace(/^["']|["']$/g, '').toLowerCase(), weight, style)
      if (result) break
    }
    if (!result && this.defaultFace) {
      // unknown / generic family: use the default family but still honor weight and style
      result = this.match(this.defaultFace.family, weight, style) ?? this.defaultFace
      const first = fontFamily.split(',')[0]!.trim().toLowerCase()
      if (!GENERIC_FAMILIES.has(first)) warnOnce(`font-${fontFamily}`, `fontFamily "${fontFamily}" is not registered; falling back to "${result.family}"`)
    }
    this.cache.set(key, result)
    return result
  }
}
