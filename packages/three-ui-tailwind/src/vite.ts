import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { compileTailwindFile, type CompileTailwindResult } from './compiler'

export interface ThreeUITailwindOptions {
  /** Tailwind v4 entry stylesheet (`@import "tailwindcss"; @theme { … }`), relative to the Vite root. */
  css: string
  /** Directory scanned for class names. Defaults to the Vite root. */
  scanRoot?: string
  /** Log unsupported utilities (default: true). */
  warnUnsupported?: boolean
  /**
   * Tokens to never warn about. The scanner reads every word in your sources, so identifiers such as
   * `transform` or `filter` can look like (unsupported) Tailwind utilities.
   */
  ignoreWarningsFor?: readonly string[]
}

const REGISTRY_ID = 'virtual:three-ui-tailwind'
const REGISTER_ID = 'virtual:three-ui-tailwind/register'
const resolved = (id: string) => `\0${id}`

/**
 * Vite plugin: runs the Tailwind v4 compiler at build/dev time and serves the converted style registry as
 * virtual modules.
 *
 * - `virtual:three-ui-tailwind` — default export: the registry data.
 * - `virtual:three-ui-tailwind/register` — side effect: installs the resolver for every `ThreeUI`.
 */
export function threeUITailwind(options: ThreeUITailwindOptions): Plugin {
  let root = process.cwd()
  let cssPath = ''
  let scanRoot = ''
  let isBuild = false
  let current: CompileTailwindResult | null = null
  let pending: Promise<CompileTailwindResult> | null = null
  let lastJson = ''
  let warnedKey = ''
  let logger: { warn(msg: string): void } = console

  const compileNow = async (): Promise<CompileTailwindResult> => {
    const result = await compileTailwindFile(cssPath, { scanRoot })
    current = result
    if (options.warnUnsupported !== false) {
      const ignored = options.ignoreWarningsFor ?? []
      const warnings = result.warnings.filter((w) => !ignored.some((t) => w.startsWith(`"${t}":`)))
      const key = warnings.join('\n')
      if (key && key !== warnedKey) for (const w of warnings) logger.warn(`[three-ui-tailwind] ${w}`)
      warnedKey = key
    }
    return result
  }

  const ensure = (): Promise<CompileTailwindResult> => (pending ??= compileNow().finally(() => void (pending = null)))

  return {
    name: 'three-ui-tailwind',
    enforce: 'pre',

    configResolved(config) {
      root = config.root
      isBuild = config.command === 'build'
      cssPath = resolve(root, options.css)
      scanRoot = options.scanRoot ? resolve(root, options.scanRoot) : root
      logger = config.logger
    },

    async buildStart() {
      const result = await compileNow()
      lastJson = JSON.stringify(result.registry)
      for (const dep of result.dependencies) this.addWatchFile(dep)
    },

    resolveId(id) {
      if (id === REGISTRY_ID || id === REGISTER_ID) return resolved(id)
      return null
    },

    async load(id) {
      if (id === resolved(REGISTRY_ID)) {
        const result = current ?? (await ensure())
        return `export default ${JSON.stringify(result.registry)}\n`
      }
      if (id === resolved(REGISTER_ID)) {
        return `import registry from '${REGISTRY_ID}'\nimport { registerTailwind } from '@implicit-invocation/three-ui-tailwind'\nexport const resolver = registerTailwind(registry)\nexport default resolver\n`
      }
      return null
    },

    /** New class names or a changed stylesheet → recompile; if the registry changed, reload the app. */
    async handleHotUpdate({ file, server: s }) {
      if (isBuild) return
      const inScope = file === cssPath || file.startsWith(scanRoot + '/') || current?.dependencies.includes(file)
      if (!inScope || file.includes('/node_modules/')) return
      const result = await ensure()
      const json = JSON.stringify(result.registry)
      if (json === lastJson) return
      lastJson = json
      const mod = s.moduleGraph.getModuleById(resolved(REGISTRY_ID))
      if (mod) s.moduleGraph.invalidateModule(mod)
      const reg = s.moduleGraph.getModuleById(resolved(REGISTER_ID))
      if (reg) s.moduleGraph.invalidateModule(reg)
      s.ws.send({ type: 'full-reload' })
      return []
    },
  }
}
