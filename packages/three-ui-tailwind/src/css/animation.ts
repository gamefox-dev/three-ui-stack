import type { AnimationDirection, AnimationFill, AnimationSpec } from '@implicit-invocation/three-ui'
import { splitTopLevel } from './values'

const EASING_KEYWORDS = new Set(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'])
const DIRECTIONS = new Set(['normal', 'reverse', 'alternate', 'alternate-reverse'])
const FILLS = new Set(['none', 'forwards', 'backwards', 'both'])

/** `1s` / `150ms` / `.5s` → milliseconds, or null. */
export function parseTime(token: string): number | null {
  const m = /^([-+]?(?:\d+\.?\d*|\.\d+))(ms|s)$/i.exec(token.trim())
  if (!m) return null
  return Math.round(Number(m[1]) * (m[2]!.toLowerCase() === 's' ? 1000 : 1) * 1000) / 1000
}

/** A CSS timing function, canonicalised (whitespace removed). Returns null for anything else. */
export function parseEasing(token: string): string | null {
  const t = token.trim().toLowerCase()
  if (EASING_KEYWORDS.has(t)) return t
  const bez = /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/.exec(t)
  if (bez) return `cubic-bezier(${bez[1]},${bez[2]},${bez[3]},${bez[4]})`
  const steps = /^steps\(\s*(\d+)\s*(?:,\s*(jump-start|jump-end|jump-none|jump-both|start|end)\s*)?\)$/.exec(t)
  if (steps) return steps[2] ? `steps(${steps[1]},${steps[2]})` : `steps(${steps[1]})`
  return null
}

/**
 * Parse one `animation` shorthand layer: `name duration easing delay iteration-count direction fill-mode play-state`
 * in any order (the first time is the duration, the second the delay).
 */
function parseLayer(layer: string): AnimationSpec | null {
  const tokens = splitTopLevel(layer, /\s/)
  const spec: AnimationSpec = {}
  let times = 0
  for (const t of tokens) {
    const lower = t.toLowerCase()
    const time = parseTime(lower)
    if (time !== null) {
      if (times === 0) spec.duration = time
      else if (times === 1) spec.delay = time
      else return null
      times++
      continue
    }
    const easing = parseEasing(lower)
    if (easing !== null && spec.easing === undefined) {
      spec.easing = easing
      continue
    }
    if (lower === 'infinite') {
      spec.iterations = 'infinite'
      continue
    }
    if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(lower)) {
      spec.iterations = Number(lower)
      continue
    }
    if (DIRECTIONS.has(lower) && spec.direction === undefined) {
      spec.direction = lower as AnimationDirection
      continue
    }
    if (FILLS.has(lower) && spec.fill === undefined && lower !== 'none') {
      spec.fill = lower as AnimationFill
      continue
    }
    if (lower === 'running') continue
    if (lower === 'paused') {
      spec.paused = true
      continue
    }
    if (spec.name === undefined && /^[a-z_-][\w-]*$/i.test(t)) {
      spec.name = t
      continue
    }
    return null
  }
  return spec
}

/** `animation: …` → specs, `'none'`, or null when unparseable. */
export function parseAnimation(value: string): AnimationSpec[] | 'none' | null {
  const text = value.trim()
  if (text === 'none' || text === '') return 'none'
  const specs: AnimationSpec[] = []
  for (const layer of splitTopLevel(text, ',')) {
    if (layer.trim().toLowerCase() === 'none') continue
    const spec = parseLayer(layer)
    if (!spec) return null
    specs.push(spec)
  }
  return specs.length ? specs : 'none'
}
