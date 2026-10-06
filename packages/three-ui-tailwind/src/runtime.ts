import {
  DEP_ACTIVE,
  DEP_COLOR_SCHEME,
  DEP_DISABLED,
  DEP_FOCUS,
  DEP_HOVER,
  DEP_MOTION,
  DEP_VIEWPORT,
  StateFlags,
  setDefaultClassNameResolver,
  type ClassNameResolver,
  type KeyframeStyle,
  type Keyframes,
  type ResolvedClassStyle,
  type Style,
  type UIEnvironment,
  type UINode,
} from '@implicit-invocation/three-ui'
import type { Condition, RegistryRule, TailwindRegistry } from './registry'
import { composeSlots, mergeSlots, type TailwindSlots } from './slots'

interface Plan {
  rules: RegistryRule[]
  deps: number
}

const STATE_DEP = { hover: DEP_HOVER, active: DEP_ACTIVE, focus: DEP_FOCUS, disabled: DEP_DISABLED } as const
const STATE_FLAG = { hover: StateFlags.HOVER, active: StateFlags.ACTIVE, focus: StateFlags.FOCUS, disabled: StateFlags.DISABLED } as const

export interface TailwindResolver extends ClassNameResolver {
  readonly registry: TailwindRegistry
  /** Resolved theme variable (e.g. `--color-primary` → `#6d5dfc`). */
  themeVar(name: string): string | undefined
  /** Compiled `@keyframes` by name (used by `animation: name …` / `animate-*`). */
  keyframes(name: string): Keyframes | undefined
  /** Cache statistics (test/debug hook). */
  readonly stats: { planHits: number; planMisses: number; resolveHits: number; resolveMisses: number }
}

/**
 * Runtime half of three-ui-tailwind: looks complete utility tokens up in the precompiled registry,
 * filters rules by state / color scheme / viewport width, merges them in Tailwind's order and caches the
 * result by (className, interaction state, environment). No CSS is parsed here.
 */
export function createTailwindResolver(registry: TailwindRegistry): TailwindResolver {
  const byToken = new Map<string, RegistryRule[]>()
  const thresholds = new Set<number>()
  for (const rule of registry.rules) {
    let list = byToken.get(rule.token)
    if (!list) byToken.set(rule.token, (list = []))
    list.push(rule)
    for (const c of rule.when ?? []) {
      if ('minWidth' in c) thresholds.add(c.minWidth)
      if ('maxWidth' in c) thresholds.add(c.maxWidth)
    }
  }
  const bpList = [...thresholds].sort((a, b) => a - b)
  const plans = new Map<string, Plan>()
  const results = new Map<string, ResolvedClassStyle>()
  const stats = { planHits: 0, planMisses: 0, resolveHits: 0, resolveMisses: 0 }
  const keyframeCache = new Map<string, Keyframes | null>()

  const plan = (className: string): Plan => {
    let p = plans.get(className)
    if (p) {
      stats.planHits++
      return p
    }
    stats.planMisses++
    const rules: RegistryRule[] = []
    let deps = 0
    for (const token of new Set(className.split(/\s+/).filter(Boolean))) {
      const list = byToken.get(token)
      if (!list) continue
      for (const r of list) {
        rules.push(r)
        for (const c of r.when ?? []) deps |= conditionDeps(c)
      }
    }
    rules.sort((a, b) => a.order - b.order)
    p = { rules, deps }
    if (plans.size > 5000) plans.clear()
    plans.set(className, p)
    return p
  }

  const resolver: TailwindResolver = {
    registry,
    stats,
    themeVar: (name) => registry.vars[name],
    keyframes(name) {
      let k = keyframeCache.get(name)
      if (k === undefined) {
        const frames = registry.keyframes?.[name]
        k = frames
          ? frames.map((f): KeyframeStyle => {
              // shadow slots inside keyframes (`box-shadow: …`) compose exactly like class rules
              const { __tw, ...style } = f.style as Style & { __tw?: TailwindSlots }
              return { ...style, ...(__tw ? composeSlots(__tw) : {}), offset: f.offset, ...(f.easing ? { easing: f.easing } : {}) }
            })
          : null
        keyframeCache.set(name, k)
      }
      return k ?? undefined
    },
    resolve(className: string, node: UINode, env: UIEnvironment): ResolvedClassStyle {
      const p = plan(className)
      if (p.rules.length === 0) return { style: EMPTY, deps: 0 }
      const width = env.viewport.width
      let bp = 0
      for (let i = 0; i < bpList.length; i++) if (width >= bpList[i]!) bp |= 1 << i
      const key = `${className}\u0000${node.state & 15}\u0000${env.colorScheme}\u0000${bp}\u0000${env.reducedMotion ? 1 : 0}`
      const hit = results.get(key)
      if (hit) {
        stats.resolveHits++
        return hit
      }
      stats.resolveMisses++
      const style: Record<string, unknown> = {}
      let defaults: Record<string, unknown> | null = null
      for (const rule of p.rules) {
        if (rule.when && !rule.when.every((c) => holds(c, node.state, env))) continue
        if (rule.defaults) defaults = { ...(defaults ?? {}), ...rule.defaults }
        for (const k in rule.style) {
          const v = (rule.style as Record<string, unknown>)[k]
          if (k === '__tw') {
            // shadow pieces from different utilities (`shadow-lg ring-2 ring-blue-500`) merge per slot
            style[k] = mergeSlots(style[k] as TailwindSlots | undefined, v as TailwindSlots)
            continue
          }
          // individual transforms (scale-95 + rotate-12) compose instead of replacing each other
          style[k] = k === 'transform' && Array.isArray(style[k]) ? [...(style[k] as unknown[]), ...(v as unknown[])] : v
        }
      }
      // CSS initial values only fill properties no active rule set explicitly
      if (defaults) for (const k in defaults) if (style[k] === undefined) style[k] = defaults[k]
      if (style.__tw) {
        Object.assign(style, composeSlots(style.__tw as TailwindSlots))
        delete style.__tw
      }
      const result: ResolvedClassStyle = { style: style as Style, deps: p.deps }
      if (results.size > 10000) results.clear()
      results.set(key, result)
      return result
    },
  }
  return resolver
}

const EMPTY: Style = Object.freeze({}) as Style

function conditionDeps(c: Condition): number {
  if ('state' in c) return STATE_DEP[c.state]
  if ('scheme' in c) return DEP_COLOR_SCHEME
  if ('reducedMotion' in c) return DEP_MOTION
  return DEP_VIEWPORT
}

function holds(c: Condition, state: number, env: UIEnvironment): boolean {
  if ('state' in c) return (state & STATE_FLAG[c.state]) !== 0
  if ('scheme' in c) return env.colorScheme === c.scheme
  if ('reducedMotion' in c) return env.reducedMotion === c.reducedMotion
  if ('minWidth' in c) return env.viewport.width >= c.minWidth
  return env.viewport.width < c.maxWidth
}

/** Install the registry as the process-wide default `className` resolver for three-ui. */
export function registerTailwind(registry: TailwindRegistry): TailwindResolver {
  const resolver = createTailwindResolver(registry)
  setDefaultClassNameResolver(resolver)
  return resolver
}
