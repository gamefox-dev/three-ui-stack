/**
 * Build the GitHub Pages site into `.pages/`: `site/` (navigation shell) + every web example under `examples/<name>/`.
 * Examples are built with a relative base, so the result works under any sub-path (`/<repo>/`).
 *
 *   bun scripts/build-pages.ts
 */
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './lib'

const out = join(root, '.pages')
const examplesDir = join(root, 'examples')

// Web examples = examples with a vite config (the React Native one is Metro-only; `shared` is a helper package).
const examples = readdirSync(examplesDir).filter((d) => existsSync(join(examplesDir, d, 'vite.config.ts')))

rmSync(out, { recursive: true, force: true })

for (const name of examples) {
  const dir = join(examplesDir, name)
  console.log(`\n▸ building ${name}`)
  const proc = spawnSync('bun', ['x', 'vite', 'build', '--base', './', '--outDir', join(out, 'examples', name), '--emptyOutDir'], {
    cwd: dir,
    stdio: 'inherit',
  })
  if (proc.status !== 0) throw new Error(`vite build failed for ${name}`)
}

cpSync(join(root, 'site'), out, { recursive: true })
// Pages runs Jekyll unless told otherwise; it would skip underscore-prefixed files.
writeFileSync(join(out, '.nojekyll'), '')

// Guard against drift between the site's nav and the examples that were actually built.
const html = readFileSync(join(out, 'index.html'), 'utf8')
const missing = examples.filter((n) => !html.includes(`'${n}'`))
if (missing.length) throw new Error(`site/index.html has no entry for: ${missing.join(', ')}`)

console.log(`\n✓ site written to ${out} (${examples.length} examples)`)
