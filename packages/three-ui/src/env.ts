export interface UIViewport {
  /** Logical width/height in UI pixels (independent of framebuffer DPR). */
  width: number
  height: number
  pixelRatio: number
}

/** Root environment. Changes selectively invalidate variant/style resolution. */
export interface UIEnvironment {
  viewport: UIViewport
  colorScheme: 'light' | 'dark'
  theme: string
  /** `prefers-reduced-motion: reduce` — drives `motion-reduce:` / `motion-safe:` (set with `ui.setMediaFlags`). */
  reducedMotion: boolean
  platform: 'web' | 'native' | (string & {})
}

export function createEnvironment(init: Partial<UIEnvironment> & { viewport?: Partial<UIViewport> } = {}): UIEnvironment {
  return {
    viewport: { width: 0, height: 0, pixelRatio: 1, ...init.viewport },
    colorScheme: init.colorScheme ?? 'light',
    theme: init.theme ?? 'default',
    reducedMotion: init.reducedMotion ?? false,
    platform: init.platform ?? 'web',
  }
}
