import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { compile } from '@tailwindcss/node'
import { convertDeclarations } from './css/convert'
import { parseCss, unescapeCssIdent, type AtRuleNode, type CssNode, type Decl } from './css/parse'
import { parseCssColor, parseQuantity, resolveVars, rgbaToHex } from './css/values'
import { parseEasing } from './css/animation'
import { REGISTRY_FORMAT, REGISTRY_VERSION, type Condition, type RegistryKeyframe, type RegistryRule, type TailwindRegistry } from './registry'

export interface CompileTailwindOptions {
  /** Tailwind entry stylesheet source (`@import "tailwindcss"; @theme {…}`). */
  css: string
  /** Directory `@import`/`@source` paths in `css` resolve against (usually the stylesheet's directory). */
  base: string
  /** Project directory scanned for class candidates. Defaults to `base`. */
  scanRoot?: string
  /** Provide candidates directly (skips source scanning). */
  candidates?: Iterable<string>
}

export interface CompileTailwindResult {
  registry: TailwindRegistry
  /** Build-time warnings: unsupported utilities, properties, variants. */
  warnings: string[]
  /** Files the compilation depends on (stylesheet imports) — watch these. */
  dependencies: string[]
  /** Source files the scanner read (watch these for new class names). */
  files: string[]
  /** Number of candidates handed to Tailwind. */
  candidateCount: number
}

interface Ctx {
  layer: string | null
  conds: Condition[]
}

const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.html', '.vue', '.svelte', '.md', '.mdx'])
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.vite', '.expo', 'coverage'])

/**
 * Compile Tailwind v4 with its own compiler (`@tailwindcss/node`), then convert the generated utilities
 * into a serializable three-ui style registry. No CSS is parsed at runtime.
 */
export async function compileTailwind(options: CompileTailwindOptions): Promise<CompileTailwindResult> {
  const dependencies = new Set<string>()
  const compiler = await compile(options.css, {
    base: options.base,
    onDependency: (path: string) => dependencies.add(path),
  })

  let candidates: string[]
  let files: string[] = []
  if (options.candidates) {
    candidates = [...options.candidates]
  } else {
    const scanned = await scanCandidates(compiler, options.scanRoot ?? options.base)
    candidates = scanned.candidates
    files = scanned.files
  }
  candidates = [...new Set(candidates)].sort()
  const css = compiler.build(candidates)
  const { registry, warnings } = cssToRegistry(css)
  return { registry, warnings, dependencies: [...dependencies], files, candidateCount: candidates.length }
}

// ───────────────────────────── scanning ─────────────────────────────

async function scanCandidates(
  compiler: { root: 'none' | { base: string; pattern: string } | null; sources: { base: string; pattern: string; negated: boolean }[] },
  root: string,
): Promise<{ candidates: string[]; files: string[] }> {
  try {
    // Tailwind's own scanner (what the official Vite plugin uses): honors .gitignore, @source and @source not.
    const { Scanner } = await import('@tailwindcss/oxide')
    const sources = compiler.root === 'none' ? [] : compiler.root === null ? [{ base: root, pattern: '**/*', negated: false }] : [{ ...compiler.root, negated: false }]
    sources.push(...compiler.sources)
    const scanner = new Scanner({ sources })
    return { candidates: scanner.scan(), files: scanner.files }
  } catch {
    return scanWithRegex(root)
  }
}

/** Fallback scanner when `@tailwindcss/oxide` is unavailable: a deliberately generous token extractor. */
async function scanWithRegex(root: string): Promise<{ candidates: string[]; files: string[] }> {
  const candidates = new Set<string>()
  const files: string[] = []
  const walk = async (dir: string): Promise<void> => {
    for (const name of await readdir(dir)) {
      if (SKIP_DIRS.has(name) || name.startsWith('.')) continue
      const full = join(dir, name)
      const s = await stat(full)
      if (s.isDirectory()) await walk(full)
      else if (SCAN_EXTENSIONS.has(extname(name))) {
        files.push(full)
        for (const m of (await readFile(full, 'utf8')).matchAll(/[A-Za-z0-9_\-:/.[\]%#!@&*+,()]+/g)) candidates.add(m[0])
      }
    }
  }
  await walk(root)
  return { candidates: [...candidates], files }
}

// ───────────────────────────── CSS → registry ─────────────────────────────

/** Convert Tailwind's generated CSS into the registry. Exported for tests and custom pipelines. */
export function cssToRegistry(css: string): { registry: TailwindRegistry; warnings: string[] } {
  const ast = parseCss(css)
  const warnings: string[] = []
  const globals = new Map<string, string>()
  collectGlobals(ast, null, globals)

  const rules: RegistryRule[] = []
  const keyframes: Record<string, RegistryKeyframe[]> = {}
  let order = 0
  const seenWarnings = new Set<string>()
  const warn = (m: string) => {
    if (!seenWarnings.has(m)) {
      seenWarnings.add(m)
      warnings.push(m)
    }
  }

  const visit = (nodes: CssNode[], ctx: Ctx): void => {
    for (const node of nodes) {
      if (node.type === 'at') {
        if (node.name === 'layer') {
          const layer = node.params.split(',')[0]!.trim()
          if (node.nodes) {
            if (layer === 'theme' || layer === 'base' || layer === 'properties') continue
            visit(node.nodes, { ...ctx, layer })
          }
        } else if (node.name === 'media') {
          const cond = parseMedia(node.params)
          if (cond === 'always') visit(node.nodes ?? [], ctx)
          else if (cond === null) warn(`unsupported media query "@media ${node.params}" (rules inside were ignored)`)
          else visit(node.nodes ?? [], { ...ctx, conds: [...ctx.conds, ...cond] })
        } else if (node.name === 'supports' || node.name === 'container') {
          visit(node.nodes ?? [], ctx) // assume modern feature support
        } else if (node.name === 'keyframes' && node.nodes) {
          const frames = convertKeyframes(node.params.trim(), node.nodes, globals, warn)
          if (frames.length) keyframes[node.params.trim()] = frames
        }
      } else if (node.type === 'rule') {
        if (ctx.layer === null && isThemeRoot(node.selector)) continue
        const parsed = parseUtilitySelector(node.selector)
        if ('error' in parsed) {
          warn(`${parsed.token ? `"${parsed.token}": ` : ''}unsupported selector "${node.selector}" (${parsed.error}; ignored)`)
          continue
        }
        const entries: { conds: Condition[]; decls: Decl[] }[] = []
        gatherDecls(node.nodes, [...ctx.conds, ...parsed.conds], entries, (m) => warn(`"${parsed.token}": ${m}`))
        for (const entry of entries) {
          if (entry.decls.length === 0) continue
          const converted = convertDeclarations(entry.decls, globals, parsed.token)
          for (const w of converted.warnings) warn(w)
          if (Object.keys(converted.style).length === 0) continue
          const hasDefaults = Object.keys(converted.defaults).length > 0
          const important = entry.decls.some((d) => d.important)
          rules.push({
            token: parsed.token,
            order: order++ + (important ? 1_000_000 : 0),
            style: converted.style,
            ...(hasDefaults ? { defaults: converted.defaults } : {}),
            ...(entry.conds.length ? { when: dedupeConditions(entry.conds) } : {}),
          })
        }
      }
    }
  }
  visit(ast, { layer: null, conds: [] })

  const vars: Record<string, string> = {}
  for (const [name, raw] of globals) {
    if (name.startsWith('--tw-')) continue
    const resolved = resolveVars(raw, new Map(), globals)
    if (resolved === null) continue
    vars[name] = normalizeVar(resolved)
  }
  return { registry: { format: REGISTRY_FORMAT, version: REGISTRY_VERSION, vars, rules, ...(Object.keys(keyframes).length ? { keyframes } : {}) }, warnings }
}

/** `@keyframes name { from {…} 50%, 75% {…} to {…} }` → sorted steps (a step listing several offsets is repeated). */
function convertKeyframes(name: string, nodes: CssNode[], globals: Map<string, string>, warn: (m: string) => void): RegistryKeyframe[] {
  const frames: RegistryKeyframe[] = []
  for (const node of nodes) {
    if (node.type !== 'rule') continue
    const offsets = node.selector
      .split(',')
      .map((sel) => sel.trim().toLowerCase())
      .map((sel) => (sel === 'from' ? 0 : sel === 'to' ? 1 : /^[\d.]+%$/.test(sel) ? parseFloat(sel) / 100 : NaN))
    if (offsets.some((o) => Number.isNaN(o))) {
      warn(`@keyframes ${name}: unsupported selector "${node.selector}" (ignored)`)
      continue
    }
    const decls = node.nodes.filter((n): n is Decl => n.type === 'decl')
    const easingDecl = decls.find((d) => d.prop === 'animation-timing-function')
    const easing = easingDecl ? parseEasing(resolveVars(easingDecl.value, new Map(), globals) ?? easingDecl.value) : null
    const converted = convertDeclarations(
      decls.filter((d) => d.prop !== 'animation-timing-function'),
      globals,
      `@keyframes ${name}`,
    )
    for (const w of converted.warnings) warn(w)
    for (const offset of offsets) frames.push({ offset, ...(easing ? { easing } : {}), style: converted.style })
  }
  return frames.sort((a, b) => a.offset - b.offset)
}

function isThemeRoot(selector: string): boolean {
  return /^:root\s*,\s*:host$/.test(selector.trim()) || selector.trim() === ':root'
}

function collectGlobals(nodes: CssNode[], layer: string | null, out: Map<string, string>): void {
  for (const node of nodes) {
    if (node.type === 'at') {
      if (node.name === 'layer' && node.nodes) collectGlobals(node.nodes, node.params.split(',')[0]!.trim(), out)
      else if (node.name === 'property' && node.nodes) {
        const initial = node.nodes.find((n): n is Decl => n.type === 'decl' && n.prop === 'initial-value')
        const name = node.params.trim()
        if (initial && !out.has(name)) out.set(name, initial.value)
      }
    } else if (node.type === 'rule' && isThemeRoot(node.selector)) {
      for (const d of node.nodes) if (d.type === 'decl' && d.prop.startsWith('--')) out.set(d.prop, d.value)
    }
  }
}

function normalizeVar(value: string): string {
  const c = parseCssColor(value)
  if (c && /^(#|rgb|hsl|oklch|oklab|color-mix|transparent)/i.test(value.trim())) return rgbaToHex(c)
  const q = parseQuantity(value)
  if (q && q.unit === 'px') return `${q.value}px`
  return value.trim()
}

type ParsedSelector = { token: string; conds: Condition[] } | { error: string; token?: string }

function parseUtilitySelector(selector: string): ParsedSelector {
  const sel = selector.trim()
  const m = /^\.((?:\\.|[A-Za-z0-9_-])+)((?::[a-z-]+)*)$/.exec(sel)
  if (!m) {
    const first = /^\.((?:\\.|[A-Za-z0-9_-])+)/.exec(sel)
    return { error: 'only a single class with simple pseudo-classes is supported', ...(first ? { token: unescapeCssIdent(first[1]!) } : {}) }
  }
  const token = unescapeCssIdent(m[1]!)
  const conds: Condition[] = []
  for (const p of m[2]!.split(':').filter(Boolean)) {
    switch (p) {
      case 'hover':
      case 'active':
      case 'focus':
      case 'disabled':
        conds.push({ state: p })
        break
      case 'focus-visible':
        conds.push({ state: 'focus' })
        break
      default:
        return { error: `pseudo-class :${p} is not supported`, token }
    }
  }
  return { token, conds }
}

/** Returns conditions, 'always' for queries that are irrelevant on UI surfaces, or null for unsupported ones. */
function parseMedia(params: string): Condition[] | 'always' | null {
  const p = params.trim().toLowerCase()
  if (p === '(hover: hover)' || p === '(hover:hover)' || p === 'screen') return 'always'
  if (p === '(prefers-reduced-motion: reduce)' || p === '(prefers-reduced-motion:reduce)') return [{ reducedMotion: true }]
  if (p === '(prefers-reduced-motion: no-preference)' || p === '(prefers-reduced-motion:no-preference)') return [{ reducedMotion: false }]
  let m = /^\(prefers-color-scheme:\s*(dark|light)\)$/.exec(p)
  if (m) return [{ scheme: m[1] as 'dark' | 'light' }]
  m = /^\(width\s*>=\s*([\d.]+)(px|rem|em)\)$/.exec(p) ?? /^\(min-width:\s*([\d.]+)(px|rem|em)\)$/.exec(p)
  if (m) return [{ minWidth: toPx(m[1]!, m[2]!) }]
  m = /^\(width\s*<\s*([\d.]+)(px|rem|em)\)$/.exec(p) ?? /^\(max-width:\s*([\d.]+)(px|rem|em)\)$/.exec(p)
  if (m) return [{ maxWidth: toPx(m[1]!, m[2]!) }]
  return null
}

const toPx = (n: string, unit: string) => (unit === 'px' ? Number(n) : Number(n) * 16)

function gatherDecls(nodes: CssNode[], conds: Condition[], out: { conds: Condition[]; decls: Decl[] }[], warn: (m: string) => void): void {
  const entry = { conds, decls: [] as Decl[] }
  out.push(entry)
  const walk = (list: CssNode[], into: Decl[]): void => {
    for (const n of list) {
      if (n.type === 'decl') into.push(n)
      else if (n.type === 'at') {
        const at = n as AtRuleNode
        if (at.name === 'supports') {
          // assume modern feature support; later declarations override earlier ones (CSS cascade)
          walk(at.nodes ?? [], into)
        } else if (at.name === 'media') {
          const c = parseMedia(at.params)
          if (c === 'always') walk(at.nodes ?? [], into)
          else if (c === null) warn(`unsupported media query "@media ${at.params}" (ignored)`)
          else gatherDecls(at.nodes ?? [], [...conds, ...c], out, warn)
        }
      } else if (n.type === 'rule') {
        warn(`unsupported nested selector "${n.selector}" (ignored)`)
      }
    }
  }
  walk(nodes, entry.decls)
}

function dedupeConditions(conds: Condition[]): Condition[] {
  const seen = new Set<string>()
  return conds.filter((c) => {
    const k = JSON.stringify(c)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Read a stylesheet from disk and compile it (the stylesheet's directory is the Tailwind base). */
export async function compileTailwindFile(cssPath: string, options: { scanRoot?: string; candidates?: Iterable<string> } = {}): Promise<CompileTailwindResult> {
  const file = resolve(cssPath)
  const css = await readFile(file, 'utf8')
  const result = await compileTailwind({
    css,
    base: dirname(file),
    ...(options.scanRoot ? { scanRoot: options.scanRoot } : {}),
    ...(options.candidates ? { candidates: options.candidates } : {}),
  })
  return { ...result, dependencies: [file, ...result.dependencies] }
}
