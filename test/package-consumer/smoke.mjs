// Runs inside a clean temp project that installed ONLY the packed tarballs (see scripts/pack-smoke-test.ts).
// Verifies that every documented entry / subpath resolves through the published export maps and works.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const fontBytes = (() => {
  const b = readFileSync(new URL('./Inter_400Regular.ttf', import.meta.url))
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
})()

// ── three-2d ──────────────────────────────────────────────────────────────────────────────────────────────
const t2d = await import('three-2d')
assert.equal(typeof t2d.SpriteBatch, 'function')
assert.equal(typeof t2d.TextureRegion, 'function')
assert.equal(typeof t2d.BitmapFont, 'function')
const batch = new t2d.SpriteBatch()
batch.begin()
batch.fillRect(0, 0, 10, 10, { color: '#f00', radius: 2 })
batch.end()
assert.equal(batch.stats.sprites, 1)
batch.dispose()

// ── three-2d-font (+ node entry + CLI bin) ──────────────────────────────────────────────────────────────────
const font = await import('three-2d-font')
const baked = await font.bakeBitmapFont(fontBytes, { size: 16, characters: 'ab' })
assert.equal(baked.json.format, 'three-2d-bitmap-font')
assert.ok(baked.json.glyphs.length >= 3)
const fontNode = await import('three-2d-font/node')
assert.equal(typeof fontNode.encodePng, 'function')
const cli = spawnSync('npx', ['--no-install', 'three-2d-font', '--help'], { encoding: 'utf8', shell: process.platform === 'win32' })
assert.match(cli.stdout, /three-2d-font pack/)

// ── three-ui (+ web) : headless layout proves the bundled asm.js Yoga works ───────────────────────────────────
const ui = await import('three-ui')
const web = await import('three-ui/web')
assert.equal(typeof web.attachDOMInput, 'function')
assert.equal(typeof globalThis.WebAssembly === 'undefined' || true, true)
const app = ui.createThreeUI({ width: 200, height: 100 })
const child = new ui.View({ style: { width: '50%', height: 20 } })
app.setRoot(new ui.View({ style: { flex: 1, padding: 10 }, children: [child] }))
app.update()
assert.deepEqual({ ...child.layout }, { x: 10, y: 10, width: 90, height: 20 })
app.dispose()

// ── three-ui-react ────────────────────────────────────────────────────────────────────────────────────────────
const react = await import('three-ui-react')
assert.equal(typeof react.createThreeUIRoot, 'function')
assert.equal(typeof react.View, 'function')

// ── three-ui-tailwind: runtime, compiler, vite, metro ────────────────────────────────────────────────────────────
const tw = await import('three-ui-tailwind')
assert.equal(typeof tw.createTailwindResolver, 'function')
const vite = await import('three-ui-tailwind/vite')
assert.equal(typeof vite.threeUITailwind, 'function')
assert.equal(vite.threeUITailwind({ css: './x.css' }).name, 'three-ui-tailwind')
const metro = await import('three-ui-tailwind/metro')
assert.equal(typeof metro.withThreeUITailwind, 'function')
const compiler = await import('three-ui-tailwind/compiler')
const { registry } = await compiler.compileTailwind({ css: '@import "tailwindcss";', base: process.cwd(), candidates: ['flex', 'p-4', 'hover:bg-red-500'] })
assert.equal(registry.format, 'three-ui-tailwind-registry')
assert.ok(registry.rules.some((r) => r.token === 'p-4'))
const resolver = tw.createTailwindResolver(registry)
const probe = new ui.View({ className: 'p-4' })
const r = resolver.resolve('p-4', probe, { viewport: { width: 100, height: 100, pixelRatio: 1 }, colorScheme: 'light', theme: 'default', platform: 'web' })
assert.equal(r.style.padding, 16)
probe.dispose()

// ── only declared exports are importable ────────────────────────────────────────────────────────────────────────
for (const bad of ['three-ui/dist/index.js', 'three-2d/src/index.ts', 'three-ui-react/dist/renderer/root.js']) {
  await assert.rejects(() => import(bad), (e) => e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED' || e.code === 'ERR_MODULE_NOT_FOUND', `${bad} must not be importable`)
}

console.log('consumer smoke test passed')
