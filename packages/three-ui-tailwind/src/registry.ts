import type { StyleWithSlots } from './slots'

/** Interaction / environment conditions a rule applies under. All conditions of a rule must hold. */
export type Condition =
  | { state: 'hover' | 'active' | 'focus' | 'disabled' }
  | { scheme: 'light' | 'dark' }
  /** `motion-reduce:` (`true`) / `motion-safe:` (`false`), set with `ui.setMediaFlags({ reducedMotion })`. */
  | { reducedMotion: boolean }
  | { minWidth: number }
  | { maxWidth: number }

export interface RegistryRule {
  /** Complete utility token as written in `className` (e.g. `hover:bg-zinc-800`). */
  token: string
  /** Position in Tailwind's generated output. Deterministic; later wins (important rules sort last). */
  order: number
  style: StyleWithSlots
  /**
   * CSS *initial values* that differ from Yoga's defaults (e.g. `display: flex` implies `flex-direction: row`).
   * They apply only when no rule of the same element sets the property explicitly, so `flex flex-col` and
   * `hidden md:flex flex-col` both keep their column direction.
   */
  defaults?: StyleWithSlots
  when?: Condition[]
}

/** One compiled `@keyframes` step. `style` holds animatable style keys (colors as hex, transforms as ops). */
export interface RegistryKeyframe {
  offset: number
  /** Per-step `animation-timing-function`. */
  easing?: string
  style: StyleWithSlots
}

/**
 * Serialized output of the build step. The runtime consumes this data — never CSS.
 * Format is versioned so Vite and Metro (and future tools) can share it.
 */
export interface TailwindRegistry {
  format: 'three-ui-tailwind-registry'
  version: 1
  /** Resolved theme variables (`--color-primary` → `#6d5dfc`, `--spacing` → `4px`, …). */
  vars: Record<string, string>
  rules: RegistryRule[]
  /** Compiled `@keyframes` (Tailwind's `animate-*` built-ins and your own `@theme` animations). */
  keyframes?: Record<string, RegistryKeyframe[]>
}

export const REGISTRY_FORMAT = 'three-ui-tailwind-registry'
export const REGISTRY_VERSION = 1
