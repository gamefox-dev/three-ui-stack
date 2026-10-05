/**
 * Verifies every public package's export map against its built output:
 * explicit exports, ESM only, files exist (JS + .d.ts + source map), nothing bundles three / react,
 * `bin` targets exist, and `type: module`. Run after `bun run build:packages`.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fail, finish, listPackages, ok, walk } from './lib'

const BUNDLED_MARKERS: [string, RegExp][] = [
  ['three.js core', /class Object3D\b|const REVISION\s*=\s*['"]\d+/],
  ['three.js WebGPU renderer', /class WebGPURenderer\b/],
  ['react', /ReactCurrentOwner|react\.transitional\.element/],
  ['react-reconciler', /createFiberRoot|scheduleUpdateOnFiber/],
  ['tailwindcss compiler', /function compile\(css|__unstable__loadDesignSystem/],
]

for (const pkg of listPackages()) {
  const m = pkg.manifest
  const label = pkg.name
  const need = (cond: boolean, msg: string) => (cond ? undefined : fail(`${label}: ${msg}`))

  need(m.type === 'module', 'must have "type": "module" (ESM only)')
  need(typeof m.exports === 'object' && m.exports !== null, 'must declare an explicit "exports" map')
  need(!JSON.stringify(m.exports ?? {}).includes('require'), 'must not expose a CommonJS "require" condition')
  need(Array.isArray(m.files) && m.files.includes('dist'), '"files" must include dist')
  need(existsSync(join(pkg.dir, 'README.md')), 'README.md missing')
  need(existsSync(join(pkg.dir, 'LICENSE')) || existsSync(join(pkg.dir, '..', '..', 'LICENSE')), 'LICENSE missing')

  const referenced = new Set<string>()
  const collect = (value: unknown) => {
    if (typeof value === 'string') referenced.add(value)
    else if (value && typeof value === 'object') for (const v of Object.values(value)) collect(v)
  }
  collect(m.exports)
  for (const k of ['main', 'module', 'types']) if (m[k]) referenced.add(m[k])
  if (m.bin) collect(m.bin)

  for (const rel of referenced) {
    if (rel.endsWith('package.json')) continue
    need(existsSync(join(pkg.dir, rel)), `export target ${rel} does not exist (run bun run build:packages)`)
  }

  const dist = join(pkg.dir, 'dist')
  if (!existsSync(dist)) {
    fail(`${label}: dist/ missing`)
    continue
  }
  const jsFiles = walk(dist, (f) => f.endsWith('.js'))
  for (const js of jsFiles) {
    const code = readFileSync(js, 'utf8')
    const isReexportStub = code.length < 600 && code.split('\n').filter((l) => l.trim() && !l.startsWith('//')).every((l) => /^(import|export)\b/.test(l))
    need(isReexportStub || existsSync(`${js}.map`), `${js.slice(pkg.dir.length + 1)} has no source map`)
    if (/\btypeof WebAssembly\b|\bWebAssembly\.(instantiate|Module|Memory|Table|compile)/.test(code)) fail(`${label}: ${js.slice(pkg.dir.length + 1)} references the WebAssembly global (Hermes has none)`)
    // yoga's generated asm.js legitimately contains the word "compile"; scan only for our forbidden bundles
    for (const [what, re] of BUNDLED_MARKERS) if (re.test(code)) fail(`${label}: ${js.slice(pkg.dir.length + 1)} appears to bundle ${what}`)
  }
  // every JS entry referenced via exports has a sibling .d.ts
  for (const rel of referenced) {
    if (rel.endsWith('.js') && rel.startsWith('./dist/')) need(existsSync(join(pkg.dir, rel.replace(/\.js$/, '.d.ts'))), `${rel} has no .d.ts declaration`)
  }
  ok(`${label}: ${referenced.size} export targets, ${jsFiles.length} JS files`)
}
finish('check:exports')
