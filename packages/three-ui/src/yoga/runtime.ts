import { createYogaAsm } from './generated/yoga-asm.js'
import type { Yoga, Node as YogaNode, Config as YogaConfig } from './generated/wrapAssembly'
import * as YGEnums from './generated/YGEnums.js'

export type { YogaNode, YogaConfig }
export { YGEnums }

/**
 * Internal Yoga binding contract. `@implicit-invocation/three-ui`'s public API is Yoga-specific, but the binary/runtime that
 * implements it is swappable: the default is a synchronous asm.js build derived from the same Yoga release
 * as `yoga-layout` (Hermes-safe, no `WebAssembly`). Any object with the shape of `yoga-layout`'s default
 * export also satisfies it, so a browser-only WASM backend can be plugged in with `setYogaRuntime`.
 */
export interface YogaRuntime {
  readonly Node: Yoga['Node']
  readonly Config: Yoga['Config']
}

let runtime: YogaRuntime | null = null
let sharedConfig: YogaConfig | null = null

/** Replace the Yoga runtime (must be called before any `UINode` is created). */
export function setYogaRuntime(next: YogaRuntime): void {
  if (runtime && runtime !== next && sharedConfig) {
    throw new Error('[three-ui] setYogaRuntime() must be called before any UI node is created')
  }
  runtime = next
}

/** Synchronously returns the active runtime, creating the default asm.js one on first use. */
export function getYogaRuntime(): YogaRuntime {
  if (!runtime) runtime = createYogaAsm()
  return runtime
}

/** One shared Yoga config for every node (point scale factor is set per layout pass). */
export function getYogaConfig(): YogaConfig {
  if (!sharedConfig) {
    sharedConfig = getYogaRuntime().Config.create()
    sharedConfig.setUseWebDefaults(false)
    sharedConfig.setPointScaleFactor(1)
  }
  return sharedConfig
}
