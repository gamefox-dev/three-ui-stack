import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { compileTailwindFile } from './compiler'

const USAGE = `three-ui-tailwind — compile Tailwind v4 to a three-ui style registry

Usage: three-ui-tailwind compile --css <theme.css> --out <registry.json> [--root <scanDir>] [--js <registry.js>]
`

export async function main(argv: string[]): Promise<number> {
  const flags = new Map<string, string>()
  const [command, ...rest] = argv
  for (let i = 0; i < rest.length; i++) if (rest[i]!.startsWith('--')) flags.set(rest[i]!.slice(2), rest[++i] ?? '')
  const log = (m: string) => (globalThis as { console?: { log(m: string): void; error(m: string): void } }).console?.log(m)
  if (command !== 'compile' || !flags.get('css') || !flags.get('out')) {
    log(USAGE)
    return command === undefined || command === '--help' ? 0 : 1
  }
  const result = await compileTailwindFile(flags.get('css')!, flags.has('root') ? { scanRoot: resolve(flags.get('root')!) } : {})
  const out = resolve(flags.get('out')!)
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, `${JSON.stringify(result.registry)}\n`)
  if (flags.has('js')) {
    const js = resolve(flags.get('js')!)
    await mkdir(dirname(js), { recursive: true })
    await writeFile(js, `export default ${JSON.stringify(result.registry)}\n`)
  }
  for (const w of result.warnings) (globalThis as { console?: { warn(m: string): void } }).console?.warn(`[three-ui-tailwind] ${w}`)
  log(`wrote ${out}: ${result.registry.rules.length} rules from ${result.candidateCount} candidates`)
  return 0
}
