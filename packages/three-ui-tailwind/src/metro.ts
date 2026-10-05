import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface WithThreeUITailwindOptions {
  /** Tailwind v4 entry stylesheet, relative to the Metro project root. */
  css: string
  /** Directory scanned for class names. Defaults to the project root. */
  scanRoot?: string
  /** Where the generated registry modules are written (default `<root>/node_modules/.cache/three-ui-tailwind`). */
  cacheDir?: string
}

/** The subset of a Metro config this adapter touches. */
export interface MetroConfigLike {
  projectRoot?: string
  resolver?: {
    resolveRequest?: ((context: any, moduleName: string, platform: string | null) => any) | null
    [key: string]: unknown
  }
  [key: string]: unknown
}

const REGISTRY_ID = 'virtual:three-ui-tailwind'
const REGISTER_ID = 'virtual:three-ui-tailwind/register'

/**
 * Metro adapter: compiles Tailwind with the **same compiler core and registry format as the Vite plugin**
 * (it runs `three-ui-tailwind compile` synchronously at config time) and maps the same virtual module ids
 * to the generated files. Restart Metro after adding new class names (config-time compile).
 */
export function withThreeUITailwind<C extends MetroConfigLike>(config: C, options: WithThreeUITailwindOptions): C {
  const root = resolve(config.projectRoot ?? process.cwd())
  const cacheDir = resolve(options.cacheDir ?? join(root, 'node_modules/.cache/three-ui-tailwind'))
  const registryFile = join(cacheDir, 'registry.js')
  const registerFile = join(cacheDir, 'register.js')
  mkdirSync(cacheDir, { recursive: true })

  const cli = join(dirname(fileURLToPath(import.meta.url)), 'compile-cli.js')
  const run = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import { main } from ${JSON.stringify(cli)}; process.exit(await main(process.argv.slice(1)))`,
      'compile',
      '--css',
      resolve(root, options.css),
      '--out',
      join(cacheDir, 'registry.json'),
      '--js',
      registryFile,
      '--root',
      resolve(root, options.scanRoot ?? '.'),
    ],
    { stdio: 'inherit', cwd: root },
  )
  if (run.status !== 0) throw new Error('[three-ui-tailwind] Tailwind compilation failed (see output above)')

  writeFileSync(registerFile, `import registry from './registry.js'\nimport { registerTailwind } from '@implicit-invocation/three-ui-tailwind'\nexport const resolver = registerTailwind(registry)\nexport default resolver\n`)

  const previous = config.resolver?.resolveRequest ?? null
  return {
    ...config,
    resolver: {
      ...config.resolver,
      resolveRequest(context: any, moduleName: string, platform: string | null) {
        if (moduleName === REGISTRY_ID) return { type: 'sourceFile', filePath: registryFile }
        if (moduleName === REGISTER_ID) return { type: 'sourceFile', filePath: registerFile }
        return previous ? previous(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform)
      },
    },
  }
}
