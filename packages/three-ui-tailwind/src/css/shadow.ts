import { parseCssColor, parseQuantity, evalCalc, resolveVars, rgbaToHex, splitTopLevel, type VarMap } from './values'

import type { ShadowLayerData } from '../slots'

export type { ShadowLayerData }

const COLOR_VAR = /^var\(\s*(--tw-[a-z-]*color)\s*,([\s\S]*)\)$/

function parseColorToken(token: string, locals: VarMap, globals: VarMap): { color: string; colorVar: boolean } | null {
  const m = COLOR_VAR.exec(token)
  let colorVar = false
  let text = token
  if (m) {
    colorVar = true
    text = m[2]!.trim()
  }
  if (text.toLowerCase() === 'currentcolor') return { color: 'currentColor', colorVar }
  const resolved = resolveVars(text, locals, globals)
  if (resolved === null) return null
  if (resolved.trim().toLowerCase() === 'currentcolor') return { color: 'currentColor', colorVar }
  const c = parseCssColor(resolved)
  return c ? { color: rgbaToHex(c), colorVar } : null
}

const isColorToken = (t: string) => /^(#|var\(|rgb|hsl|oklch|oklab|color-mix|currentcolor$|transparent$|[a-z]+$)/i.test(t)

function parseLength(token: string, locals: VarMap, globals: VarMap): number | null {
  const resolved = resolveVars(token, locals, globals)
  if (resolved === null) return null
  const q = resolved.startsWith('calc(') ? evalCalc(resolved) : parseQuantity(resolved)
  if (!q || (q.unit !== 'px' && q.unit !== '')) return null
  return Math.round(q.value * 1000) / 1000
}

/**
 * Parse a CSS `box-shadow` / `text-shadow` / `drop-shadow()` value. Returns `null` when a layer cannot be understood
 * (the caller warns); `none` yields an empty list.
 */
export function parseShadowList(value: string, locals: VarMap, globals: VarMap): ShadowLayerData[] | null {
  const text = value.trim()
  if (text === '' || text === 'none') return []
  const out: ShadowLayerData[] = []
  for (const layer of splitTopLevel(text, ',')) {
    const tokens = splitTopLevel(layer, /\s/)
    let inset = false
    let ringOffset = false
    const lengths: number[] = []
    let color: { color: string; colorVar: boolean } | null = null
    for (const t of tokens) {
      const lower = t.toLowerCase()
      if (lower === 'inset') {
        inset = true
        continue
      }
      // `var(--tw-ring-inset,)` resolves to nothing / `inset`
      if (/^var\(\s*--tw-ring-inset\s*,?\s*\)$/.test(t)) continue
      if (/^var\(\s*--tw-ring-offset-width\s*\)$/.test(t)) {
        ringOffset = true
        lengths.push(0)
        continue
      }
      const ring = /^calc\(\s*(-?[\d.]+)px\s*\+\s*var\(\s*--tw-ring-offset-width\s*\)\s*\)$/.exec(t)
      if (ring) {
        ringOffset = true
        lengths.push(Number(ring[1]))
        continue
      }
      const asLength = /^[+-]?(\d|\.\d)|^calc\(|^var\(--(spacing|text)/i.test(t) && !/^var\(--tw-.*color/.test(t) ? parseLength(t, locals, globals) : null
      if (asLength !== null) {
        lengths.push(asLength)
        continue
      }
      if (isColorToken(t) && !color) {
        color = parseColorToken(t, locals, globals)
        if (color) continue
      }
      return null
    }
    if (lengths.length < 2 || lengths.length > 4) return null
    const [x, y, blur = 0, spread = 0] = lengths as [number, number, number?, number?]
    out.push({
      x,
      y,
      blur,
      spread,
      color: color?.color ?? 'currentColor',
      ...(color?.colorVar ? { colorVar: true as const } : {}),
      ...(inset ? { inset: true as const } : {}),
      ...(ringOffset ? { ringOffsetSpread: true as const } : {}),
    })
  }
  return out
}

/** Pull the argument list out of `drop-shadow( … )` (possibly several functions in a `filter` value). */
export function parseDropShadowFunctions(value: string, locals: VarMap, globals: VarMap): ShadowLayerData[] | null {
  const out: ShadowLayerData[] = []
  const re = /drop-shadow\(/g
  let m: RegExpExecArray | null
  while ((m = re.exec(value))) {
    let depth = 0
    let end = -1
    for (let i = m.index + 'drop-shadow'.length; i < value.length; i++) {
      if (value[i] === '(') depth++
      else if (value[i] === ')' && --depth === 0) {
        end = i
        break
      }
    }
    if (end < 0) return null
    const inner = value.slice(m.index + m[0].length, end)
    const layers = parseShadowList(inner, locals, globals)
    if (!layers) return null
    out.push(...layers)
    re.lastIndex = end
  }
  return out
}
