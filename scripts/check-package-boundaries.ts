/**
 * Static import scan enforcing the architecture invariants (spec §5 / §25):
 * dependency direction, no React in three-ui, no Tailwind in three-ui, no DOM / Canvas2D in core,
 * no browser WebAssembly for Yoga, reconciler code confined to three-ui-react/src/renderer.
 */
import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fail, finish, listPackages, ok, root, walk } from './lib'

interface Rule {
  /** Import specifiers this package must never use (prefix match). */
  forbidImports: string[]
  /** Regexes that must not appear in source (outside `allowIn`). */
  forbidSource?: { re: RegExp; why: string; allowIn?: RegExp }[]
}

const DOM = /\b(window\.|document\.|HTMLElement|HTMLCanvasElement|CanvasRenderingContext2D|OffscreenCanvas|navigator\.|requestAnimationFrame|new Image\(\)|getContext\()/
const rules: Record<string, Rule> = {
  '@implicit-invocation/three-2d': {
    forbidImports: ['@implicit-invocation/three-ui', '@implicit-invocation/three-2d-font', 'react', 'tailwindcss', 'yoga-layout', 'node:'],
    forbidSource: [
      { re: DOM, why: 'DOM / Canvas2D / rAF in core runtime' },
      { re: /new ShaderMaterial\(/, why: 'ShaderMaterial (portable shaders must be TSL/NodeMaterial)' },
      { re: /\bWebGLRenderer\b|\bnew WebGPURenderer\b/, why: 'creating a renderer (caller owns the renderer)' },
    ],
  },
  '@implicit-invocation/three-2d-font': {
    forbidImports: ['@implicit-invocation/three-ui', 'react', 'tailwindcss'],
    forbidSource: [
      { re: DOM, why: 'DOM / Canvas2D in the portable font path' },
      { re: /\bnode:/, why: 'node: imports outside the node entry', allowIn: /src\/(node|cli)\.ts$/ },
    ],
  },
  '@implicit-invocation/three-ui': {
    forbidImports: ['react', 'react-reconciler', '@implicit-invocation/three-ui-react', '@implicit-invocation/three-ui-tailwind', 'tailwindcss', '@tailwindcss', 'node:'],
    forbidSource: [
      { re: DOM, why: 'DOM in core runtime (web adapters live in src/web.ts)', allowIn: /src\/web\.ts$/ },
      { re: /\bWebAssembly\b/, why: 'browser WebAssembly (Yoga must run under Hermes via asm.js)' },
      { re: /\brequire\(['"]yoga-layout/, why: 'importing the WASM yoga-layout at runtime' },
      { re: /from ['"]yoga-layout['"]/, why: 'importing the WASM yoga-layout at runtime' },
    ],
  },
  '@implicit-invocation/three-ui-react': {
    forbidImports: ['react-dom', '@implicit-invocation/three-ui-tailwind', 'tailwindcss'],
    forbidSource: [
      { re: DOM, why: 'DOM in React adapter' },
      { re: /from ['"]react-reconciler/, why: 'react-reconciler outside src/renderer', allowIn: /src\/renderer\// },
    ],
  },
  '@implicit-invocation/three-ui-tailwind': {
    forbidImports: ['react-dom'],
    forbidSource: [
      { re: /(tailwindcss|@tailwindcss\/[a-z-]+)\/(dist|src|lib)\//, why: 'deep import of Tailwind internals' },
      { re: /node\.state\s*=|\._setState|\._yoga/, why: 'mutating core node internals' },
      { re: DOM, why: 'DOM in Tailwind integration', allowIn: /src\/vite\.ts$/ },
    ],
  },
}

// allowed workspace dependency direction
const allowedWorkspaceDeps: Record<string, string[]> = {
  '@implicit-invocation/three-2d': [],
  '@implicit-invocation/three-2d-font': ['@implicit-invocation/three-2d'],
  '@implicit-invocation/three-ui': ['@implicit-invocation/three-2d'],
  '@implicit-invocation/three-ui-react': ['@implicit-invocation/three-ui', '@implicit-invocation/three-2d'],
  '@implicit-invocation/three-ui-tailwind': ['@implicit-invocation/three-ui', '@implicit-invocation/three-ui-react'],
}

const importRe = /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

for (const pkg of listPackages()) {
  const rule = rules[pkg.name]
  if (!rule) continue
  const srcDir = join(pkg.dir, 'src')
  const files = walk(srcDir, (f) => /\.(ts|tsx|js)$/.test(f) && !f.includes('/generated/') && !f.endsWith('.d.ts'))
  let count = 0
  for (const file of files) {
    const rel = relative(root, file)
    const code = readFileSync(file, 'utf8')
    const stripped = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    for (const m of stripped.matchAll(importRe)) {
      const spec = (m[1] ?? m[2])!
      for (const bad of rule.forbidImports) {
        if (spec === bad || spec.startsWith(`${bad}/`) || (bad.endsWith(':') && spec.startsWith(bad))) {
          if (bad === 'node:' && /src\/(node|cli|compiler|vite|metro|compile-cli)\.ts$/.test(rel)) continue
          fail(`${rel}: forbidden import "${spec}" (${pkg.name} must not depend on ${bad})`)
        }
      }
      const ws = Object.keys(allowedWorkspaceDeps).find((n) => spec === n || spec.startsWith(`${n}/`))
      if (ws && ws !== pkg.name && !allowedWorkspaceDeps[pkg.name]!.includes(ws)) fail(`${rel}: ${pkg.name} may not import workspace package ${ws}`)
    }
    for (const f of rule.forbidSource ?? []) {
      if (f.allowIn?.test(rel)) continue
      const hit = f.re.exec(stripped)
      if (hit) fail(`${rel}: ${f.why} — found "${hit[0]}"`)
    }
    count++
  }
  ok(`${pkg.name}: scanned ${count} source files`)
}

// manifests: dependency direction & peers
for (const pkg of listPackages()) {
  const allowed = allowedWorkspaceDeps[pkg.name]
  if (!allowed) continue
  for (const dep of Object.keys({ ...pkg.manifest.dependencies, ...pkg.manifest.peerDependencies })) {
    if (dep.startsWith('@implicit-invocation/') && !allowed.includes(dep)) fail(`${pkg.name}/package.json depends on ${dep}, violating the dependency graph`)
  }
  if (pkg.name === '@implicit-invocation/three-ui') for (const bad of ['react', 'react-reconciler', 'tailwindcss']) if (pkg.manifest.dependencies?.[bad] || pkg.manifest.peerDependencies?.[bad]) fail(`three-ui must not depend on ${bad}`)
}
finish('check:boundaries')
