/**
 * Generates the synchronous, WebAssembly-free Yoga runtime used by `@implicit-invocation/three-ui`.
 *
 * Why: `yoga-layout@3.x` only ships a WASM build (loaded with top-level await). Hermes (React Native)
 * has no browser-style `WebAssembly` global, and `@implicit-invocation/three-ui`'s public API must not need async init just
 * for layout. Instead of depending on an old third-party asm.js fork, we derive an asm.js build from the
 * *same* Yoga release as the web binding:
 *
 *   yoga-layout wasm (embedded base64) ──binaryen wasm2js──▶ asm.js module
 *   yoga-layout Emscripten/embind glue ──patched (no WebAssembly refs, sync init)──▶ glue
 *   yoga-layout wrapAssembly.js / YGEnums.js ──copied verbatim──▶ JS API
 *
 * Run `bun run build:yoga-asm` (rewrite) or `bun scripts/build-yoga-asm.ts --check` (verify committed output).
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const pkgDir = join(root, 'packages/three-ui')
const outDir = join(pkgDir, 'src/yoga/generated')
const check = process.argv.includes('--check')

function findPackage(name: string): string {
  let dir = pkgDir
  for (;;) {
    const candidate = join(dir, 'node_modules', name)
    if (existsSync(join(candidate, 'package.json'))) return candidate
    const parent = dirname(dir)
    if (parent === dir) throw new Error(`cannot find ${name}; run bun install`)
    dir = parent
  }
}

const yogaDir = findPackage('yoga-layout')
const yogaVersion = JSON.parse(readFileSync(join(yogaDir, 'package.json'), 'utf8')).version as string
const binaryenDir = findPackage('binaryen')
const binaryenVersion = JSON.parse(readFileSync(join(binaryenDir, 'package.json'), 'utf8')).version as string

function replaceOnce(source: string, search: string | RegExp, replacement: string, label: string): string {
  const matches = typeof search === 'string' ? source.split(search).length - 1 : [...source.matchAll(new RegExp(search.source, 'g'))].length
  if (matches !== 1) throw new Error(`yoga glue patch "${label}" matched ${matches} times (expected 1) — yoga-layout changed, review scripts/build-yoga-asm.ts`)
  return source.replace(search, replacement)
}

// 1. split the embedded wasm out of the glue
const glueSource = readFileSync(join(yogaDir, 'dist/binaries/yoga-wasm-base64-esm.js'), 'utf8')
const b64 = /data:application\/octet-stream;base64,([A-Za-z0-9+/=]+)/.exec(glueSource)
if (!b64) throw new Error('embedded wasm not found in yoga-layout glue')
const wasm = Buffer.from(b64[1]!, 'base64')

// 2. wasm → asm.js with binaryen's wasm2js (emscripten-style module: `instantiate(info) → exports`)
const tmp = mkdtempSync(join(tmpdir(), 'yoga-asm-'))
let asm: string
try {
  writeFileSync(join(tmp, 'yoga.wasm'), wasm)
  const r = spawnSync(join(binaryenDir, 'bin/wasm2js'), [join(tmp, 'yoga.wasm'), '--emscripten', '-O', '-o', join(tmp, 'yoga.asm.js')], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error('wasm2js failed')
  asm = readFileSync(join(tmp, 'yoga.asm.js'), 'utf8')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

// 3. patch the Emscripten glue: drop import.meta, WebAssembly checks and the base64 payload
let glue = glueSource
glue = replaceOnce(glue, /data:application\/octet-stream;base64,[A-Za-z0-9+/=]+/, 'data:application/octet-stream;base64,', 'strip wasm payload')
glue = replaceOnce(glue, 'var _scriptDir = import.meta.url;', "var _scriptDir = '';", 'import.meta')
glue = replaceOnce(glue, '"object"!=typeof WebAssembly&&x("no native wasm support detected");', '', 'WebAssembly check')
glue = replaceOnce(glue, 'new WebAssembly.RuntimeError(', 'new Error(', 'RuntimeError')
// Dead fallback paths (only reached when `instantiateWasm` is absent): remove the remaining WebAssembly references.
glue = replaceOnce(glue, 'return WebAssembly.instantiate(f,d)', 'throw new Error("WebAssembly is not available (asm.js build)")', 'WebAssembly.instantiate')
{
  const start = glue.indexOf('(function(){return w||"function"!=typeof WebAssembly.instantiateStreaming')
  const endMarker = '})().catch(ca);'
  const end = glue.indexOf(endMarker, start)
  if (start < 0 || end < 0) throw new Error('yoga glue patch "instantiateStreaming" did not match — yoga-layout changed, review scripts/build-yoga-asm.ts')
  glue = `${glue.slice(0, start)}(function(){return Promise.reject(new Error("WebAssembly is not available (asm.js build)"))${glue.slice(end)}`
}
if (glue.includes('WebAssembly.') || /typeof WebAssembly/.test(glue)) {
  const stray = glue.split('WebAssembly').length - 1
  if (stray !== 2) throw new Error(`unexpected WebAssembly references left in patched glue (${stray})`)
}
glue = replaceOnce(glue, 'export default loadYoga;', '', 'export default')
glue = glue.replace(/\n?\/\/# sourceMappingURL=.*$/m, '')

const enums = readFileSync(join(yogaDir, 'dist/src/generated/YGEnums.js'), 'utf8').replace(/\n?\/\/# sourceMappingURL=.*$/m, '')
const wrapSource = readFileSync(join(yogaDir, 'dist/src/wrapAssembly.js'), 'utf8')
const enumImports = wrapSource.split('from "./generated/YGEnums.js"').length - 1
if (enumImports !== 2) throw new Error(`expected 2 YGEnums imports in wrapAssembly.js, found ${enumImports}`)
const wrapFixed = wrapSource.replaceAll('from "./generated/YGEnums.js"', 'from "./YGEnums.js"').replace(/\n?\/\/# sourceMappingURL=.*$/m, '')

const wasmHash = createHash('sha256').update(wasm).digest('hex').slice(0, 16)
const banner = `/**
 * GENERATED FILE — do not edit. Rebuild with \`bun run build:yoga-asm\`.
 *
 * Synchronous asm.js build of Yoga ${yogaVersion} (no WebAssembly required, Hermes-safe).
 * Source wasm sha256: ${wasmHash}…  Converted with binaryen ${binaryenVersion} wasm2js.
 *
 * Yoga is Copyright (c) Meta Platforms, Inc. and affiliates and is licensed under the MIT license
 * (see THIRD_PARTY_NOTICES.md in the three-ui package).
 */
`

const yogaAsm = `${banner}import wrapAssembly from './wrapAssembly.js'

// wasm2js output: \`instantiate(info) → exports\`
const instantiateAsm = (function () {
${asm.trim()}
  return instantiate
})()

// Patched Emscripten + embind glue (WebAssembly references removed).
${glue.trim()}

/**
 * Create a fully initialized Yoga instance synchronously. The Emscripten glue still returns a promise,
 * but with \`instantiateWasm\` supplied synchronously the module is complete before the factory returns.
 */
export function createYogaAsm() {
  const module = {
    print() {},
    printErr() {},
    instantiateWasm(imports, receiveInstance) {
      receiveInstance({ exports: instantiateAsm(imports) })
      return {}
    },
  }
  const ready = loadYoga(module)
  if (!module.calledRun) throw new Error('[three-ui] asm.js Yoga did not initialize synchronously')
  ready.catch(() => {})
  return wrapAssembly(module)
}
`

const files: Record<string, string> = {
  'yoga-asm.js': yogaAsm,
  'wrapAssembly.js': `${wrapFixed.trim()}\n`,
  'YGEnums.js': `${enums.trim()}\n`,
  'YGEnums.d.ts': readFileSync(join(yogaDir, 'dist/src/generated/YGEnums.d.ts'), 'utf8'),
  'wrapAssembly.d.ts': readFileSync(join(yogaDir, 'dist/src/wrapAssembly.d.ts'), 'utf8').replace(/\.\/(generated\/)?YGEnums(\.ts|\.js)?(?=['"])/g, './YGEnums'),
  'yoga-asm.d.ts': `import type { Yoga } from './wrapAssembly'\n\n/** Synchronously create a Yoga instance backed by the generated asm.js build. */\nexport function createYogaAsm(): Yoga\n`,
}

mkdirSync(outDir, { recursive: true })
let stale = false
for (const [name, content] of Object.entries(files)) {
  const path = join(outDir, name)
  if (check) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) {
      console.error(`stale: ${path}`)
      stale = true
    }
  } else {
    writeFileSync(path, content)
    console.log(`wrote ${path} (${(content.length / 1024).toFixed(0)} kB)`)
  }
}
if (check) {
  if (stale) process.exit(1)
  console.log(`yoga asm artifact is up to date (yoga-layout ${yogaVersion}, binaryen ${binaryenVersion})`)
}
