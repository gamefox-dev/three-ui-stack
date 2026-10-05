declare const process: { env: Record<string, string | undefined> } | undefined

let cached: boolean | undefined

/** Development diagnostics switch (bundlers replace `process.env.NODE_ENV`; defaults to on without `process`). */
export function isDevMode(): boolean {
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
  if (!isDevMode() || warned.has(key)) return
  warned.add(key)
  ;(globalThis as { console?: { warn(...args: unknown[]): void } }).console?.warn(`[three-ui] ${message}`)
}

/** Test hook. */
export function resetWarnings(): void {
  warned.clear()
}
