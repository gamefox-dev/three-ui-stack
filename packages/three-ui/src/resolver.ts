import type { UINode } from './core/UINode'
import type { UIEnvironment } from './env'
import type { Style } from './style/types'

export interface ResolvedClassStyle {
  style: Style
  /**
   * Bitmask of `DEP_*` flags describing what the result depends on. The UI only re-resolves a node
   * when one of these inputs changes (hover/active/focus/disabled state, color scheme, viewport, theme).
   */
  deps: number
}

/**
 * Pluggable `className` → style resolution. `@implicit-invocation/three-ui` has no Tailwind dependency; `@implicit-invocation/three-ui-tailwind`
 * (or any other tool) provides an implementation.
 */
export interface ClassNameResolver {
  resolve(className: string, node: UINode, env: UIEnvironment): ResolvedClassStyle
}

let defaultResolver: ClassNameResolver | null = null

/** Global default resolver (used when a `ThreeUI` instance has none of its own). */
export function setDefaultClassNameResolver(resolver: ClassNameResolver | null): void {
  defaultResolver = resolver
}

export function getDefaultClassNameResolver(): ClassNameResolver | null {
  return defaultResolver
}
