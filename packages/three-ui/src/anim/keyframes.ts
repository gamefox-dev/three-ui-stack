import { Color4 } from '@implicit-invocation/three-2d'
import { warnOnce } from '../dev'
import { resolveGradientValue, resolveStyleValue, type ComputedStyle } from '../style/computed'
import type { Keyframes, Style } from '../style/types'
import { parseEasingFn, type EasingFn } from './easing'
import { ANIMATABLE, interpolateValue, isLayoutProperty, type InterpolationContext } from './interpolate'

/** Marks "the node's underlying value" for a property missing from the first / last keyframe. */
const BASE = Symbol('base')

export interface Track {
  key: string
  /** Ascending, first = 0 and last = 1 (implicit endpoints use {@link BASE}). */
  offsets: number[]
  values: unknown[]
  /** Easing of the interval that starts at index i. */
  easings: EasingFn[]
  scratch: { color: Color4 }
}

export interface CompiledKeyframes {
  tracks: Track[]
  /** Layout properties present in the keyframes (they run Yoga every frame). */
  hasLayout: boolean
}

interface Frame {
  offset: number | undefined
  easing: string | undefined
  style: Record<string, unknown>
}

function parseOffsetKey(key: string): number[] | null {
  const out: number[] = []
  for (const part of key.split(',')) {
    const k = part.trim().toLowerCase()
    if (k === 'from') out.push(0)
    else if (k === 'to') out.push(1)
    else if (/^[\d.]+%$/.test(k)) out.push(parseFloat(k) / 100)
    else return null
  }
  return out
}

function toFrames(keyframes: Keyframes): Frame[] {
  const frames: Frame[] = []
  if (Array.isArray(keyframes)) {
    for (const raw of keyframes as readonly Record<string, unknown>[]) {
      const { offset, easing, ...style } = raw
      frames.push({ offset: offset as number | undefined, easing: easing as string | undefined, style })
    }
  } else {
    for (const [key, raw] of Object.entries(keyframes as Record<string, Record<string, unknown>>)) {
      const offsets = parseOffsetKey(key)
      if (!offsets) {
        warnOnce(`kf-key-${key}`, `keyframe selector "${key}" is not understood (use from, to or N%)`)
        continue
      }
      const { easing, ...style } = raw
      for (const offset of offsets) frames.push({ offset, easing: easing as string | undefined, style })
    }
  }
  return frames
}

/** Spread missing offsets evenly between their neighbours (first 0, last 1), like WAAPI. */
function fillOffsets(frames: Frame[]): void {
  const n = frames.length
  if (n === 0) return
  if (frames[0]!.offset === undefined) frames[0]!.offset = 0
  if (frames[n - 1]!.offset === undefined) frames[n - 1]!.offset = 1
  for (let i = 1; i < n - 1; ) {
    if (frames[i]!.offset !== undefined) {
      i++
      continue
    }
    let j = i
    while (frames[j]!.offset === undefined) j++
    const a = frames[i - 1]!.offset!
    const b = frames[j]!.offset!
    for (let k = i; k < j; k++) frames[k]!.offset = a + ((b - a) * (k - i + 1)) / (j - i + 1)
    i = j
  }
}

function resolveValue(key: string, raw: unknown): unknown {
  if (key === 'backgroundGradient') return resolveGradientValue(raw as never)
  if (key === 'transform') return (raw as readonly unknown[] | undefined) ?? []
  return resolveStyleValue(key, raw)
}

/**
 * Compile authored keyframes (list or CSS-like object) into per-property tracks.
 * `defaultEasing` applies to every interval whose keyframe has no `easing` (CSS `animation-timing-function`).
 */
export function compileKeyframes(keyframes: Keyframes, allowLayout: boolean, defaultEasing: string | undefined, label: string): CompiledKeyframes {
  const frames = toFrames(keyframes)
  fillOffsets(frames)
  frames.sort((a, b) => a.offset! - b.offset!)
  const keys = new Set<string>()
  for (const f of frames) for (const k of Object.keys(f.style)) if (f.style[k] !== undefined) keys.add(k)
  const tracks: Track[] = []
  let hasLayout = false
  for (const key of keys) {
    if (!(key in ANIMATABLE)) {
      warnOnce(`kf-prop-${key}`, `"${key}" in keyframes "${label}" is not animatable (ignored)`)
      continue
    }
    if (isLayoutProperty(key)) {
      if (!allowLayout) {
        warnOnce(`kf-layout-${key}-${label}`, `keyframes "${label}" animate layout property "${key}"; this re-runs Yoga every frame, so it needs { layout: true } (or animationLayout). Ignored.`)
        continue
      }
      hasLayout = true
    }
    const offsets: number[] = []
    const values: unknown[] = []
    const easings: EasingFn[] = []
    for (const f of frames) {
      if (f.style[key] === undefined) continue
      offsets.push(Math.min(1, Math.max(0, f.offset!)))
      values.push(resolveValue(key, f.style[key]))
      easings.push(parseEasingFn(f.easing ?? defaultEasing))
    }
    if (offsets.length === 0) continue
    if (offsets[0]! > 0) {
      offsets.unshift(0)
      values.unshift(BASE)
      easings.unshift(parseEasingFn(defaultEasing))
    }
    if (offsets[offsets.length - 1]! < 1) {
      offsets.push(1)
      values.push(BASE)
      easings.push(parseEasingFn(defaultEasing))
    }
    tracks.push({ key, offsets, values, easings, scratch: { color: new Color4() } })
  }
  return { tracks, hasLayout }
}

/** Value of a track at overall progress `p` (0..1), resolving implicit endpoints from `base`. */
export function sampleTrack(track: Track, p: number, base: ComputedStyle, ctx: InterpolationContext): unknown {
  const { offsets, values, easings, key } = track
  const n = offsets.length
  const baseValue = (base as unknown as Record<string, unknown>)[key]
  const val = (i: number) => (values[i] === BASE ? baseValue : values[i])
  if (n === 1) return val(0)
  if (p <= offsets[0]!) return val(0)
  if (p >= offsets[n - 1]!) return val(n - 1)
  let i = 0
  while (i < n - 2 && p >= offsets[i + 1]!) i++
  const span = offsets[i + 1]! - offsets[i]!
  const local = span <= 0 ? 1 : (p - offsets[i]!) / span
  return interpolateValue(key, val(i), val(i + 1), easings[i]!(local), ctx, track.scratch)
}

export type { Style }
