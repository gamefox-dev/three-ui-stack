declare const process: { env: Record<string, string | undefined> } | undefined

let cached: boolean | undefined

/**
 * Development diagnostics switch. Bundlers replace `process.env.NODE_ENV`; on platforms
 * without `process` we default to development. Fatal invariants are never gated on this.
 */
export function isDev(): boolean {
  if (cached !== undefined) return cached
  try {
    cached = process!.env.NODE_ENV !== 'production'
  } catch {
    cached = true
  }
  return cached
}

const warned = new Set<string>()

export function warnOnce(key: string, message: string): void {
  if (!isDev() || warned.has(key)) return
  warned.add(key)
  ;(globalThis as { console?: { warn(...args: unknown[]): void } }).console?.warn(`[three-2d] ${message}`)
}
