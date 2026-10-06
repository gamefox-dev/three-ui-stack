import type { BoxShadow, DropShadow, Style, TextShadow } from '@implicit-invocation/three-ui'

/** One parsed shadow layer (see `css/shadow.ts`). */
export interface ShadowLayerData {
  x: number
  y: number
  blur: number
  spread: number
  /** `#rrggbb[aa]` or `currentColor`. */
  color: string
  /** The color came from `var(--tw-…-color, <default>)`: a color utility (`shadow-red-500`) overrides it. */
  colorVar?: true
  inset?: true
  /** Spread is `spread + --tw-ring-offset-width` (Tailwind's `ring-*`). */
  ringOffsetSpread?: true
}

/**
 * Tailwind v4 builds shadows from custom properties set by *different* utilities and composes them in CSS
 * (`box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
 * var(--tw-shadow)`). The compiler keeps each property as a slot; the resolver merges slots of all matching rules
 * (later wins per slot) and `composeSlots` turns them into real shadow data. Plain JSON, so Vite and Metro share it.
 */
export interface TailwindSlots {
  shadow?: ShadowLayerData[]
  shadowColor?: string
  insetShadow?: ShadowLayerData[]
  insetShadowColor?: string
  ring?: ShadowLayerData[]
  ringColor?: string
  ringInset?: boolean
  /** `ring-offset-*` was used: paint the offset layer (`--tw-ring-offset-shadow`). */
  ringOffset?: boolean
  ringOffsetWidth?: number
  ringOffsetColor?: string
  insetRing?: ShadowLayerData[]
  insetRingColor?: string
  textShadow?: ShadowLayerData[]
  textShadowColor?: string
  /** `--tw-drop-shadow-size`: the sized layers `drop-shadow-<color>` re-uses. */
  dropSize?: ShadowLayerData[]
  /** `--tw-drop-shadow` pointed at `--tw-drop-shadow-size` (a `drop-shadow-<color>` utility). */
  dropUseSize?: boolean
  /** `--tw-drop-shadow` as an explicit `drop-shadow(…)`. */
  dropLayers?: ShadowLayerData[]
  dropColor?: string
}

export type StyleWithSlots = Style & { __tw?: TailwindSlots }

const isInvisible = (color: string) => /^#[0-9a-f]{6}00$/i.test(color) || color === '#0000'

function color(layer: ShadowLayerData, override: string | undefined): string {
  return layer.colorVar && override !== undefined ? override : layer.color
}

function toBox(layers: readonly ShadowLayerData[] | undefined, override: string | undefined, ringOffsetWidth: number, forceInset: boolean): BoxShadow[] {
  const out: BoxShadow[] = []
  for (const l of layers ?? []) {
    const c = color(l, override)
    if (isInvisible(c)) continue
    out.push({
      offsetX: l.x,
      offsetY: l.y,
      blur: l.blur,
      spread: l.spread + (l.ringOffsetSpread ? ringOffsetWidth : 0),
      color: c,
      inset: forceInset || l.inset === true,
    })
  }
  return out
}

function toText(layers: readonly ShadowLayerData[] | undefined, override: string | undefined): (TextShadow & DropShadow)[] {
  const out: (TextShadow & DropShadow)[] = []
  for (const l of layers ?? []) {
    const c = color(l, override)
    if (isInvisible(c)) continue
    out.push({ offsetX: l.x, offsetY: l.y, blur: l.blur, color: c })
  }
  return out
}

/** Merge `incoming` slots over `into` (a later rule wins per slot). */
export function mergeSlots(into: TailwindSlots | undefined, incoming: TailwindSlots): TailwindSlots {
  return { ...(into ?? {}), ...incoming }
}

/**
 * Compose merged slots into the real style keys. Layer order matches CSS:
 * `inset-shadow`, `inset-ring`, `ring-offset`, `ring`, `shadow` (first is painted on top).
 */
export function composeSlots(slots: TailwindSlots): Pick<Style, 'boxShadow' | 'textShadow' | 'dropShadow'> {
  const out: Pick<Style, 'boxShadow' | 'textShadow' | 'dropShadow'> = {}
  const offsetWidth = slots.ringOffsetWidth ?? 0
  const touchesBox =
    slots.shadow !== undefined ||
    slots.insetShadow !== undefined ||
    slots.ring !== undefined ||
    slots.insetRing !== undefined ||
    slots.ringOffset !== undefined
  if (touchesBox) {
    const box: BoxShadow[] = [
      ...toBox(slots.insetShadow, slots.insetShadowColor, offsetWidth, true),
      ...toBox(slots.insetRing, slots.insetRingColor, offsetWidth, true),
    ]
    if (slots.ringOffset) {
      const c = slots.ringOffsetColor ?? '#ffffff'
      if (!isInvisible(c)) box.push({ offsetX: 0, offsetY: 0, blur: 0, spread: offsetWidth, color: c, inset: slots.ringInset === true })
    }
    box.push(...toBox(slots.ring, slots.ringColor, offsetWidth, slots.ringInset === true), ...toBox(slots.shadow, slots.shadowColor, offsetWidth, false))
    out.boxShadow = box.length ? box : 'none'
  }
  if (slots.textShadow !== undefined) {
    const t = toText(slots.textShadow, slots.textShadowColor)
    out.textShadow = t.length ? t : 'none'
  }
  if (slots.dropSize !== undefined || slots.dropLayers !== undefined || slots.dropUseSize !== undefined) {
    const layers = slots.dropUseSize ? slots.dropSize : slots.dropLayers
    const d = toText(layers, slots.dropColor)
    out.dropShadow = d.length ? d : 'none'
  }
  return out
}
