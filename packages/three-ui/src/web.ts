import type { ThreeUI } from './core/ThreeUI'

/** Structural subset of an `HTMLElement`/`HTMLCanvasElement` (kept DOM-free so core typings stay platform-neutral). */
export interface DOMElementLike {
  addEventListener(type: string, listener: (event: any) => void, options?: unknown): void
  removeEventListener(type: string, listener: (event: any) => void, options?: unknown): void
  getBoundingClientRect(): { left: number; top: number; width: number; height: number }
  setPointerCapture?(pointerId: number): void
  releasePointerCapture?(pointerId: number): void
  style?: { touchAction?: string; outline?: string }
  tabIndex?: number
  focus?(): void
}

export interface AttachDOMInputOptions {
  /** Where keyboard events are listened for (default: the element, which becomes focusable). */
  keyTarget?: Pick<DOMElementLike, 'addEventListener' | 'removeEventListener'>
}

/**
 * Feed DOM pointer / wheel / keyboard events into a `ThreeUI`. Web-only convenience: this file is the
 * only place in `@implicit-invocation/three-ui` that knows about DOM event shapes (via structural types, no DOM lib needed).
 * Returns a function that removes every listener it added.
 */
export function attachDOMInput(ui: ThreeUI, element: DOMElementLike, options: AttachDOMInputOptions = {}): () => void {
  const removers: (() => void)[] = []
  const on = (target: Pick<DOMElementLike, 'addEventListener' | 'removeEventListener'>, type: string, fn: (e: any) => void, opts?: unknown) => {
    target.addEventListener(type, fn, opts)
    removers.push(() => target.removeEventListener(type, fn, opts))
  }
  const point = (e: { clientX: number; clientY: number }) => {
    const r = element.getBoundingClientRect()
    const v = ui.environment.viewport
    return { x: (e.clientX - r.left) * (v.width / (r.width || v.width)), y: (e.clientY - r.top) * (v.height / (r.height || v.height)) }
  }
  const init = (e: any) => ({
    pointerId: e.pointerId,
    pointerType: (e.pointerType === 'touch' || e.pointerType === 'pen' ? e.pointerType : 'mouse') as 'mouse' | 'touch' | 'pen',
    button: e.button,
    buttons: e.buttons,
    altKey: e.altKey,
    ctrlKey: e.ctrlKey,
    metaKey: e.metaKey,
    shiftKey: e.shiftKey,
    timeStamp: e.timeStamp,
  })

  if (element.style) element.style.touchAction = 'none'
  if (options.keyTarget === undefined && element.tabIndex !== undefined && element.tabIndex < 0) element.tabIndex = 0
  if (element.style && options.keyTarget === undefined) element.style.outline = 'none'

  on(element, 'pointerdown', (e) => {
    const p = point(e)
    const ev = ui.input.pointerDown(p.x, p.y, init(e))
    if (ev) element.setPointerCapture?.(e.pointerId)
    if (options.keyTarget === undefined) element.focus?.()
  })
  on(element, 'pointermove', (e) => {
    const p = point(e)
    ui.input.pointerMove(p.x, p.y, init(e))
  })
  on(element, 'pointerup', (e) => {
    const p = point(e)
    ui.input.pointerUp(p.x, p.y, init(e))
    element.releasePointerCapture?.(e.pointerId)
  })
  on(element, 'pointercancel', (e) => {
    const p = point(e)
    ui.input.pointerCancel({ ...init(e), x: p.x, y: p.y })
  })
  on(element, 'pointerleave', (e) => {
    if (e.pointerType === 'mouse' || e.pointerType === undefined) {
      const p = point(e)
      ui.input.pointerLeave(p.x, p.y)
    }
  })
  on(
    element,
    'wheel',
    (e) => {
      const p = point(e)
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? ui.environment.viewport.height : 1
      const ev = ui.input.wheel(p.x, p.y, e.deltaX * scale, e.deltaY * scale, init(e))
      if (ev?.defaultPrevented) e.preventDefault()
    },
    { passive: false },
  )
  const keyTarget = options.keyTarget ?? element
  on(keyTarget, 'keydown', (e) => {
    const ev = ui.input.keyDown(e.key, e.code, { repeat: e.repeat, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, timeStamp: e.timeStamp })
    if (ev.defaultPrevented) e.preventDefault()
  })
  on(keyTarget, 'keyup', (e) => {
    ui.input.keyUp(e.key, e.code, { altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, timeStamp: e.timeStamp })
  })
  return () => {
    for (const r of removers.splice(0)) r()
  }
}

export interface MediaQueryListLike {
  matches: boolean
  addEventListener(type: 'change', listener: (e: { matches: boolean }) => void): void
  removeEventListener(type: 'change', listener: (e: { matches: boolean }) => void): void
}

/** Keep `ui.environment.colorScheme` in sync with `matchMedia('(prefers-color-scheme: dark)')`. */
export function bindPrefersColorScheme(ui: ThreeUI, query: MediaQueryListLike): () => void {
  const apply = (dark: boolean) => ui.setColorScheme(dark ? 'dark' : 'light')
  apply(query.matches)
  const listener = (e: { matches: boolean }) => apply(e.matches)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
