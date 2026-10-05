/**
 * Clean-room packaging test (spec §14.5): pack every public package with `bun pm pack`, inspect each tarball's
 * manifest and file list, install the tarballs into a fresh consumer project and import every public entry.
 *
 *   bun run build:packages && bun run pack:smoke
 */
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fail, finish, listPackages, ok, readJson, root, topoSort, walk } from './lib'

const keep = process.argv.includes('--keep')
const work = mkdtempSync(join(tmpdir(), 'three-pack-smoke-'))
const tarballs = join(work, 'tarballs')
mkdirSync(tarballs)

function run(cmd: string, args: string[], cwd: string, label: string): string {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } })
  if (r.status !== 0) {
    fail(`${label} failed\n${r.stdout}\n${r.stderr}`)
    return ''
  }
  return r.stdout
}

const ALLOWED_TOP = [/^package\/package\.json$/, /^package\/README\.md$/, /^package\/LICENSE$/, /^package\/THIRD_PARTY_NOTICES\.md$/, /^package\/theme\.css$/, /^package\/dist\//, /^package\/bin\//]
const packages = topoSort(listPackages())
const packed = new Map<string, string>()

for (const pkg of packages) {
  const out = run('bun', ['pm', 'pack', '--destination', tarballs], pkg.dir, `bun pm pack (${pkg.name})`)
  const file = join(tarballs, `${pkg.name.replace(/^@/, '').replace('/', '-')}-${pkg.version}.tgz`)
  if (!existsSync(file)) {
    fail(`${pkg.name}: tarball not produced`)
    continue
  }
  void out
  packed.set(pkg.name, file)

  // manifest as published
  const manifestText = run('tar', ['-xOzf', file, 'package/package.json'], work, `read manifest (${pkg.name})`)
  for (const token of ['workspace:', 'catalog:']) {
    if (manifestText.includes(token)) fail(`${pkg.name}: packed package.json still contains "${token}"`)
  }
  const manifest = JSON.parse(manifestText || '{}')
  if (manifest.type !== 'module') fail(`${pkg.name}: packed manifest lost "type": "module"`)
  if (manifest.private) fail(`${pkg.name}: private package was packed`)

  // file list
  const listing = run('tar', ['-tzf', file], work, `list tarball (${pkg.name})`).split('\n').filter((l) => l && !l.endsWith('/'))
  for (const entry of listing) {
    if (!ALLOWED_TOP.some((re) => re.test(entry))) fail(`${pkg.name}: unexpected file in tarball: ${entry}`)
    if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) fail(`${pkg.name}: source file shipped: ${entry}`)
  }

  // source maps must not embed absolute local paths
  const extractDir = join(work, 'extract', pkg.name)
  mkdirSync(extractDir, { recursive: true })
  run('tar', ['-xzf', file, '-C', extractDir], work, `extract (${pkg.name})`)
  for (const map of walk(extractDir, (f) => f.endsWith('.map'))) {
    const json = JSON.parse(readFileSync(map, 'utf8'))
    for (const src of json.sources ?? []) {
      if (/^(\/|[A-Za-z]:[\\/])/.test(src) || src.includes('/Users/') || src.includes(root)) fail(`${pkg.name}: source map embeds an absolute local path: ${src}`)
    }
  }
  ok(`${pkg.name}: ${listing.length} files, manifest clean`)
}

// install the tarballs into a clean consumer
const consumer = join(work, 'consumer')
cpSync(join(root, 'test/package-consumer'), consumer, { recursive: true })
cpSync(join(root, 'test/fixtures/fonts/Inter_400Regular.ttf'), join(consumer, 'Inter_400Regular.ttf'))
const rootManifest = readJson(join(root, 'package.json'))
const catalog = rootManifest.workspaces.catalog as Record<string, string>
const deps: Record<string, string> = {}
for (const [name, file] of packed) deps[name] = `file:${file}`
// peer dependencies the consumer must provide
for (const peer of ['three', 'react', 'tailwindcss', '@tailwindcss/node', '@tailwindcss/oxide', 'vite']) deps[peer] = catalog[peer]!
// transitive workspace dependencies (e.g. three-ui-react → three-ui) must also resolve to the tarballs, never the registry
writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'package-consumer', private: true, type: 'module', dependencies: deps, overrides: Object.fromEntries([...packed].map(([n, f]) => [n, `file:${f}`])) }, null, 2))

if (!process.exitCode) {
  const install = spawnSync('bun', ['install'], { cwd: consumer, encoding: 'utf8' })
  if (install.status !== 0) fail(`consumer bun install failed\n${install.stdout}\n${install.stderr}`)
  else {
    // the installed copies must be the tarballs, not workspace links
    for (const [name] of packed) {
      if (!existsSync(join(consumer, 'node_modules', name, 'package.json'))) fail(`consumer is missing ${name}`)
    }
    for (const runtime of [['bun', ['smoke.mjs']], ['node', ['smoke.mjs']]] as const) {
      const r = spawnSync(runtime[0], [...runtime[1]], { cwd: consumer, encoding: 'utf8' })
      if (r.status !== 0) fail(`consumer smoke test failed under ${runtime[0]}\n${r.stdout}\n${r.stderr}`)
      else ok(`consumer smoke test passed under ${runtime[0]}`)
    }
  }
}

if (keep) console.log(`kept ${work}`)
else rmSync(work, { recursive: true, force: true })
finish('pack:smoke')
