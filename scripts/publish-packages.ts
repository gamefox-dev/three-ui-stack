/**
 * Bun-aware publication (spec §15.4). Changesets only decides versions/changelogs; this script publishes.
 *
 *   bun run release              # check + pack:smoke + publish (latest)
 *   bun run release:next         # same, `--tag next`
 *   bun scripts/publish-packages.ts --dry-run [--tag next] [--skip-existing] [--otp <code>]
 *
 * NEVER run without explicit maintainer approval: it publishes to the npm registry.
 *
 * For every public workspace package, in dependency order:
 *   1. `bun pm pack` (rewrites `workspace:` / `catalog:` ranges to real semver),
 *   2. validate the tarball manifest (no workspace-only protocols),
 *   3. `bun publish <tarball>` (forwarding --tag / --access / --dry-run).
 * A real publish error stops the run; there is no blanket `|| true`.
 * With --skip-existing a version is skipped only after explicitly checking that exact name@version on the registry.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { listPackages, root, topoSort } from './lib'

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(name)
const option = (name: string): string | undefined => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const tag = option('--tag')
const otp = option('--otp') ?? process.env.NPM_CONFIG_OTP
const dryRun = flag('--dry-run')
const skipExisting = flag('--skip-existing')
const registry = (process.env.npm_config_registry ?? 'https://registry.npmjs.org').replace(/\/$/, '')

function die(message: string): never {
  console.error(`✗ ${message}`)
  process.exit(1)
}

function sh(cmd: string, argv: string[], cwd: string): string {
  const r = spawnSync(cmd, argv, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
  if (r.status !== 0) die(`${cmd} ${argv.join(' ')} failed (exit ${r.status})`)
  return r.stdout
}

async function versionExists(name: string, version: string): Promise<boolean> {
  const res = await fetch(`${registry}/${encodeURIComponent(name).replace('%40', '@')}/${version}`)
  if (res.status === 200) return true
  if (res.status === 404) return false
  die(`registry check for ${name}@${version} returned HTTP ${res.status}`)
}

const packages = topoSort(listPackages()) // public only, dependency order
if (packages.length === 0) die('no public packages found under packages/*')

const work = mkdtempSync(join(tmpdir(), 'three-publish-'))
const tarballs = join(work, 'tarballs')
mkdirSync(tarballs)

try {
  // 1–2: pack + validate everything before publishing anything
  const staged: { name: string; version: string; file: string }[] = []
  for (const pkg of packages) {
    if (!existsSync(join(pkg.dir, 'dist'))) die(`${pkg.name}: dist/ is missing — run \`bun run build:packages\` first`)
    sh('bun', ['pm', 'pack', '--destination', tarballs], pkg.dir)
    const file = join(tarballs, `${pkg.name.replace(/^@/, '').replace('/', '-')}-${pkg.version}.tgz`)
    if (!existsSync(file)) die(`${pkg.name}: expected tarball ${file}`)
    const manifest = sh('tar', ['-xOzf', file, 'package/package.json'], work)
    for (const token of ['workspace:', 'catalog:']) {
      if (manifest.includes(token)) die(`${pkg.name}: packed manifest still contains "${token}" — refusing to publish`)
    }
    staged.push({ name: pkg.name, version: pkg.version, file })
  }

  // 3: publish in dependency order
  for (const p of staged) {
    if (skipExisting && (await versionExists(p.name, p.version))) {
      console.log(`↷ ${p.name}@${p.version} already on the registry — skipped`)
      continue
    }
    const publishArgs = ['publish', p.file, '--access', 'public', ...(tag ? ['--tag', tag] : []), ...(otp ? ['--otp', otp] : []), ...(dryRun ? ['--dry-run'] : [])]
    console.log(`→ bun ${publishArgs.join(' ')}`)
    sh('bun', publishArgs, root) // bun needs a package.json in cwd even when publishing a tarball
    console.log(`✓ ${dryRun ? 'dry-run ' : ''}${p.name}@${p.version}`)
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
