import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { threeUITailwind } from '../src/vite'

const app = resolve(import.meta.dirname, 'fixture-app')

interface Hooks {
  configResolved(config: unknown): void
  buildStart(this: unknown): Promise<void>
  resolveId(id: string): string | null
  load(id: string): Promise<string | null>
  handleHotUpdate(ctx: unknown): Promise<unknown>
}

describe('threeUITailwind (Vite plugin)', () => {
  it('compiles with Tailwind, serves the registry and register modules, and warns about unsupported utilities', async () => {
    const warn = vi.fn()
    const plugin = threeUITailwind({ css: './src/theme.css' }) as unknown as Hooks & { name: string }
    expect(plugin.name).toBe('three-ui-tailwind')
    plugin.configResolved({ root: app, command: 'build', logger: { warn } })
    const watched: string[] = []
    await plugin.buildStart.call({ addWatchFile: (f: string) => watched.push(f) })
    expect(watched.some((f) => f.endsWith('theme.css'))).toBe(true)

    expect(plugin.resolveId('virtual:three-ui-tailwind')).toBe('\0virtual:three-ui-tailwind')
    expect(plugin.resolveId('virtual:three-ui-tailwind/register')).toBe('\0virtual:three-ui-tailwind/register')
    expect(plugin.resolveId('some-other-module')).toBeNull()

    const registryModule = (await plugin.load('\0virtual:three-ui-tailwind'))!
    expect(registryModule.startsWith('export default {')).toBe(true)
    const registry = JSON.parse(registryModule.replace(/^export default /, ''))
    const tokens = registry.rules.map((r: { token: string }) => r.token)
    expect(tokens).toEqual(expect.arrayContaining(['flex-1', 'flex-row', 'items-center', 'gap-4', 'bg-primary', 'hover:bg-zinc-800', 'dark:bg-black', 'md:flex-col', 'text-lg', 'font-bold', 'text-white']))
    expect(registry.vars['--color-primary']).toBe('#6d5dfc')

    const register = (await plugin.load('\0virtual:three-ui-tailwind/register'))!
    expect(register).toContain("registerTailwind(registry)")

    // unsupported utilities in the scanned source warn at build/dev time instead of emitting nonsense
    const warnings = warn.mock.calls.map((c) => String(c[0]))
    expect(warnings.some((w) => /"grid"/.test(w))).toBe(true)
    expect(warnings.some((w) => /"shadow-md"/.test(w))).toBe(true)
    expect(tokens).not.toContain('grid')
    expect(tokens).not.toContain('shadow-md')
  })

  it('ignores warnings for configured tokens', async () => {
    const warn = vi.fn()
    const plugin = threeUITailwind({ css: './src/theme.css', ignoreWarningsFor: ['grid', 'shadow-md', 'transform'] }) as unknown as Hooks
    plugin.configResolved({ root: app, command: 'build', logger: { warn } })
    await plugin.buildStart.call({ addWatchFile() {} })
    expect(warn.mock.calls.map((c) => String(c[0])).filter((w) => /"(grid|shadow-md)"/.test(w))).toEqual([])
  })
})

const dist = resolve(import.meta.dirname, '../dist/metro.js')
describe.skipIf(!existsSync(dist))('withThreeUITailwind (Metro adapter, uses the built dist)', () => {
  it('compiles with the same core, writes the registry modules and maps the virtual module ids', async () => {
    const { withThreeUITailwind } = await import(dist)
    const cacheDir = mkdtempSync(join(tmpdir(), 'tw-metro-'))
    try {
      const previous = vi.fn(() => ({ type: 'empty' }))
      const config = withThreeUITailwind(
        { projectRoot: app, resolver: { resolveRequest: previous } },
        { css: './src/theme.css', cacheDir },
      )
      const registry = JSON.parse(readFileSync(join(cacheDir, 'registry.json'), 'utf8'))
      expect(registry.format).toBe('three-ui-tailwind-registry')
      expect(registry.rules.some((r: { token: string }) => r.token === 'bg-primary')).toBe(true)
      expect(readFileSync(join(cacheDir, 'registry.js'), 'utf8').startsWith('export default {')).toBe(true)
      expect(readFileSync(join(cacheDir, 'register.js'), 'utf8')).toContain('registerTailwind')

      const r = config.resolver.resolveRequest
      expect(r({}, 'virtual:three-ui-tailwind', null)).toEqual({ type: 'sourceFile', filePath: join(cacheDir, 'registry.js') })
      expect(r({}, 'virtual:three-ui-tailwind/register', null)).toEqual({ type: 'sourceFile', filePath: join(cacheDir, 'register.js') })
      expect(r({}, 'react-native', null)).toEqual({ type: 'empty' })
      expect(previous).toHaveBeenCalledTimes(1)
    } finally {
      rmSync(cacheDir, { recursive: true, force: true })
    }
  })
})
