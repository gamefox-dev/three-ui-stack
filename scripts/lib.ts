import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const root = resolve(import.meta.dirname, '..')

export interface WorkspacePackage {
  dir: string
  name: string
  version: string
  manifest: Record<string, any>
  isPrivate: boolean
}

export function readJson<T = any>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

/** Packages under `packages/*` (public ones unless `includePrivate`). */
export function listPackages(includePrivate = false): WorkspacePackage[] {
  const base = join(root, 'packages')
  return readdirSync(base)
    .map((d) => join(base, d))
    .filter((d) => statSync(d).isDirectory() && existsSync(join(d, 'package.json')))
    .map((dir) => {
      const manifest = readJson(join(dir, 'package.json'))
      return { dir, name: manifest.name as string, version: manifest.version as string, manifest, isPrivate: manifest.private === true }
    })
    .filter((p) => includePrivate || !p.isPrivate)
}

/** Dependency order: a package comes after every workspace package it depends on. */
export function topoSort(packages: WorkspacePackage[]): WorkspacePackage[] {
  const byName = new Map(packages.map((p) => [p.name, p]))
  const out: WorkspacePackage[] = []
  const state = new Map<string, 'visiting' | 'done'>()
  const visit = (p: WorkspacePackage) => {
    const s = state.get(p.name)
    if (s === 'done') return
    if (s === 'visiting') throw new Error(`workspace dependency cycle through ${p.name}`)
    state.set(p.name, 'visiting')
    const deps = { ...p.manifest.dependencies, ...p.manifest.peerDependencies, ...p.manifest.optionalDependencies }
    for (const dep of Object.keys(deps).sort()) {
      const d = byName.get(dep)
      if (d) visit(d)
    }
    state.set(p.name, 'done')
    out.push(p)
  }
  for (const p of [...packages].sort((a, b) => a.name.localeCompare(b.name))) visit(p)
  return out
}

export function walk(dir: string, filter: (path: string) => boolean = () => true): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const s = statSync(full)
    if (s.isDirectory()) out.push(...walk(full, filter))
    else if (filter(full)) out.push(full)
  }
  return out
}

let failures = 0
export function fail(message: string): void {
  failures++
  console.error(`✗ ${message}`)
}
export function ok(message: string): void {
  console.log(`✓ ${message}`)
}
export function finish(label: string): never {
  if (failures > 0) {
    console.error(`\n${label}: ${failures} problem(s)`)
    process.exit(1)
  }
  console.log(`\n${label}: all checks passed`)
  process.exit(0)
}
