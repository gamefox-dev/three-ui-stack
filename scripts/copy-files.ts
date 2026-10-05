/** Tiny build helper: `bun scripts/copy-files.ts '<dir>/*<suffix>' <destDir>` (relative to cwd). Ships hand-written .d.ts files. */
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

const [pattern, dest] = process.argv.slice(2)
if (!pattern || !dest || !pattern.includes('*')) throw new Error("usage: copy-files.ts '<dir>/*<suffix>' <destDir>")
const dir = dirname(pattern)
const suffix = basename(pattern).replace('*', '')
mkdirSync(resolve(dest), { recursive: true })
let n = 0
for (const file of readdirSync(resolve(dir))) {
  if (!file.endsWith(suffix)) continue
  copyFileSync(resolve(dir, file), resolve(dest, file))
  n++
}
if (n === 0) throw new Error(`no files matched ${pattern}`)
