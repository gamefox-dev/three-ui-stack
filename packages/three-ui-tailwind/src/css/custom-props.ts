import type { BackgroundGradient, GradientLength } from '@implicit-invocation/three-ui'
import type { TailwindSlots } from '../slots'
import { parseShadowList, parseDropShadowFunctions } from './shadow'
import { evalCalc, parseCssColor, parseQuantity, resolveVars, rgbaToHex, splitTopLevel, type VarMap } from './values'

export type Draft = Record<string, unknown> & {
  __translate?: [number | `${number}%`, number | `${number}%`]
  __scale?: [number, number]
  __rotate?: number
  __defaults?: Record<string, unknown>
  __tw?: TailwindSlots
}

/** Custom properties that carry meaning for three-ui. Everything else starting with `--` is dropped silently. */
const SLOT_PROPS = new Set([
  '--tw-shadow',
  '--tw-shadow-color',
  '--tw-inset-shadow',
  '--tw-inset-shadow-color',
  '--tw-ring-shadow',
  '--tw-ring-color',
  '--tw-ring-inset',
  '--tw-ring-offset-width',
  '--tw-ring-offset-color',
  '--tw-ring-offset-shadow',
  '--tw-inset-ring-shadow',
  '--tw-inset-ring-color',
  '--tw-text-shadow-color',
  '--tw-drop-shadow-size',
  '--tw-drop-shadow',
  '--tw-drop-shadow-color',
  '--tw-gradient-from',
  '--tw-gradient-via',
  '--tw-gradient-to',
  '--tw-gradient-from-position',
  '--tw-gradient-via-position',
  '--tw-gradient-to-position',
  '--tw-backdrop-blur',
  '--tw-backdrop-brightness',
  '--tw-backdrop-saturate',
  '--ui-animate-layout',
])

/** CSS filters three-ui cannot paint: warn instead of silently dropping the utility. */
const UNSUPPORTED_FILTERS = /^--tw-(blur|brightness|contrast|grayscale|hue-rotate|invert|saturate|sepia|backdrop-(contrast|grayscale|hue-rotate|invert|opacity|sepia))$/

export function isHandledCustomProp(prop: string): boolean {
  return SLOT_PROPS.has(prop) || UNSUPPORTED_FILTERS.test(prop)
}

function slots(style: Draft): TailwindSlots {
  return (style.__tw ??= {})
}

function color(value: string, locals: VarMap, globals: VarMap): string | null {
  const resolved = resolveVars(value, locals, globals)
  if (resolved === null) return null
  if (resolved.trim().toLowerCase() === 'currentcolor') return 'currentColor'
  const c = parseCssColor(resolved)
  return c ? rgbaToHex(c) : null
}

function position(value: string, locals: VarMap, globals: VarMap): GradientLength | null {
  const resolved = resolveVars(value, locals, globals)
  if (resolved === null) return null
  const t = resolved.trim()
  const q = t.startsWith('calc(') ? evalCalc(t) : parseQuantity(t)
  if (!q) return null
  if (q.unit === '%') return `${Math.round(q.value * 1000) / 1000}%` as GradientLength
  if (q.unit === 'px' || q.unit === '') return Math.round(q.value * 1000) / 1000
  return null
}

/** `blur(12px)` / `brightness(50%)` / `saturate(1.5)` → number; blank = reset. */
function filterArg(value: string, fn: string): number | null | 'reset' {
  const v = value.trim()
  if (v === '') return 'reset'
  const m = new RegExp(`^${fn}\\(\\s*([^)]*)\\)$`, 'i').exec(v)
  if (!m) return null
  const q = parseQuantity(m[1]!.trim())
  if (!q) return null
  return q.unit === '%' ? q.value / 100 : q.value
}

/**
 * Handle one `--tw-*` custom property declaration. Returns `false` when the value could not be understood
 * (the caller warns); `true` when it was consumed or is irrelevant.
 */
export function convertCustomProp(prop: string, rawValue: string, locals: VarMap, globals: VarMap, style: Draft, warn: (m: string) => void): boolean {
  const slot = (key: keyof TailwindSlots, layers: ReturnType<typeof parseShadowList>): boolean => {
    if (!layers) return false
    ;(slots(style) as Record<string, unknown>)[key] = layers
    return true
  }
  const value = rawValue.trim()
  if (UNSUPPORTED_FILTERS.test(prop)) {
    if (value !== '' && value !== 'initial') warn(`CSS filter "${value}" is not supported (ignored)`)
    return true
  }
  switch (prop) {
    case '--tw-shadow':
      return slot('shadow', parseShadowList(value, locals, globals))
    case '--tw-inset-shadow':
      return slot('insetShadow', parseShadowList(value, locals, globals))
    case '--tw-ring-shadow':
      return slot('ring', parseShadowList(value, locals, globals))
    case '--tw-inset-ring-shadow':
      return slot('insetRing', parseShadowList(value, locals, globals))
    case '--tw-drop-shadow-size': {
      return slot('dropSize', parseDropShadowFunctions(value, locals, globals))
    }
    case '--tw-drop-shadow': {
      if (/^var\(\s*--tw-drop-shadow-size\s*\)$/.test(value)) {
        slots(style).dropUseSize = true
        return true
      }
      slots(style).dropUseSize = false
      const resolved = resolveVars(value, locals, globals)
      if (resolved === null) return false
      return slot('dropLayers', resolved.trim() === '' ? [] : parseDropShadowFunctions(resolved, locals, globals))
    }
    case '--tw-shadow-color':
    case '--tw-inset-shadow-color':
    case '--tw-ring-color':
    case '--tw-ring-offset-color':
    case '--tw-inset-ring-color':
    case '--tw-text-shadow-color':
    case '--tw-drop-shadow-color': {
      const c = color(value, locals, globals)
      if (!c) return false
      const key = {
        '--tw-shadow-color': 'shadowColor',
        '--tw-inset-shadow-color': 'insetShadowColor',
        '--tw-ring-color': 'ringColor',
        '--tw-ring-offset-color': 'ringOffsetColor',
        '--tw-inset-ring-color': 'insetRingColor',
        '--tw-text-shadow-color': 'textShadowColor',
        '--tw-drop-shadow-color': 'dropColor',
      }[prop] as keyof TailwindSlots
      ;(slots(style) as Record<string, unknown>)[key] = c
      return true
    }
    case '--tw-ring-inset':
      slots(style).ringInset = value === 'inset'
      return true
    case '--tw-ring-offset-width': {
      const w = position(value, locals, globals)
      if (typeof w !== 'number') return false
      slots(style).ringOffsetWidth = w
      return true
    }
    case '--tw-ring-offset-shadow':
      slots(style).ringOffset = true
      return true
    case '--tw-gradient-from':
    case '--tw-gradient-via':
    case '--tw-gradient-to': {
      const c = color(value, locals, globals)
      if (!c) return false
      style[prop === '--tw-gradient-from' ? 'gradientFrom' : prop === '--tw-gradient-via' ? 'gradientVia' : 'gradientTo'] = c
      return true
    }
    case '--tw-gradient-from-position':
    case '--tw-gradient-via-position':
    case '--tw-gradient-to-position': {
      const p = position(value, locals, globals)
      if (p === null) return false
      style[prop === '--tw-gradient-from-position' ? 'gradientFromPosition' : prop === '--tw-gradient-via-position' ? 'gradientViaPosition' : 'gradientToPosition'] = p
      return true
    }
    case '--tw-backdrop-blur': {
      const resolved = resolveVars(value, locals, globals) ?? ''
      const v = filterArg(resolved, 'blur')
      if (v === null) return false
      style.backdropBlur = v === 'reset' ? 0 : v
      return true
    }
    case '--tw-backdrop-brightness':
    case '--tw-backdrop-saturate': {
      const resolved = resolveVars(value, locals, globals) ?? ''
      const v = filterArg(resolved, prop === '--tw-backdrop-brightness' ? 'brightness' : 'saturate')
      if (v === null) return false
      style[prop === '--tw-backdrop-brightness' ? 'backdropBrightness' : 'backdropSaturate'] = v === 'reset' ? 1 : v
      return true
    }
    case '--ui-animate-layout':
      style.animationLayout = value !== '0' && value !== 'false' && value !== 'none'
      return true
  }
  return true
}

/** Convert a parsed gradient into the draft (explicit stops win over `from-*` helpers at runtime). */
export function setGradient(style: Draft, gradient: BackgroundGradient | 'none'): void {
  style.backgroundGradient = gradient
}

export { splitTopLevel }
