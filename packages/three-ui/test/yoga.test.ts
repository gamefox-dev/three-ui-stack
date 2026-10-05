import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import YogaWasm from 'yoga-layout'
import { computeStyle, normalizeStyle, type Style } from '../src'
import { syncYoga } from '../src/style/yogaSync'
import { createYogaAsm } from '../src/yoga/generated/yoga-asm.js'
import { YGEnums as E, type YogaNode, type YogaRuntime } from '../src/yoga/runtime'

interface FixtureNode {
  style?: Style
  measure?: { width: number; height: number }
  children?: FixtureNode[]
}
interface Fixture {
  name: string
  width: number
  height: number
  root: FixtureNode
}

const dir = resolve(import.meta.dirname, '../../../test/fixtures/layouts')
const fixtures: Fixture[] = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => JSON.parse(readFileSync(resolve(dir, f), 'utf8')))

type Rect = { x: number; y: number; w: number; h: number; children: Rect[] }

function layout(runtime: YogaRuntime, fx: Fixture): Rect {
  const config = runtime.Config.create()
  config.setUseWebDefaults(false)
  const build = (n: FixtureNode): YogaNode => {
    const node = runtime.Node.create(config)
    syncYoga(node, null, computeStyle([normalizeStyle(n.style ?? {})], null, undefined))
    if (n.measure) node.setMeasureFunc(() => ({ ...n.measure! }))
    n.children?.forEach((c, i) => node.insertChild(build(c), i))
    return node
  }
  const root = build(fx.root)
  root.setWidth(fx.width)
  root.setHeight(fx.height)
  root.calculateLayout(undefined, undefined, E.Direction.LTR)
  const read = (n: YogaNode): Rect => {
    const r = (v: number) => Math.round(v * 100) / 100
    const out: Rect = { x: r(n.getComputedLeft()), y: r(n.getComputedTop()), w: r(n.getComputedWidth()), h: r(n.getComputedHeight()), children: [] }
    for (let i = 0; i < n.getChildCount(); i++) out.children.push(read(n.getChild(i)))
    return out
  }
  const result = read(root)
  root.freeRecursive()
  config.free()
  return result
}

describe('Yoga runtime portability', () => {
  const asm = createYogaAsm()

  it.each(fixtures)('asm.js and WASM bindings agree on $name', (fx) => {
    const a = layout(asm, fx)
    const w = layout(YogaWasm as unknown as YogaRuntime, fx)
    expect(a).toEqual(w)
    expect(a).toMatchSnapshot()
  })

  it('initializes synchronously without any WebAssembly global (Hermes-like)', () => {
    const saved = (globalThis as { WebAssembly?: unknown }).WebAssembly
    delete (globalThis as { WebAssembly?: unknown }).WebAssembly
    try {
      expect(typeof (globalThis as { WebAssembly?: unknown }).WebAssembly).toBe('undefined')
      const Yoga = createYogaAsm()
      const n = Yoga.Node.create()
      n.setWidth(10)
      n.setHeight(20)
      n.calculateLayout(undefined, undefined, E.Direction.LTR)
      expect(n.getComputedWidth()).toBe(10)
      n.free()
    } finally {
      ;(globalThis as { WebAssembly?: unknown }).WebAssembly = saved
    }
  })

  it('sanity-checks a known layout', () => {
    const r = layout(asm, fixtures.find((f) => f.name === 'row-grow-gap')!)
    // padding 10, gap 8, widths 50 + flex(1) + flex(2): remaining = 400-20-50-16 = 314 → 104.67 / 209.33,
    // snapped to the whole-pixel grid (point scale factor 1)
    expect(r.children[0]).toMatchObject({ x: 10, y: 10, w: 50, h: 50 })
    expect(r.children[1]!.w).toBe(105)
    expect(r.children[2]!.w).toBe(209)
    expect(r.children[2]).toMatchObject({ y: 160, h: 30 }) // alignSelf: flex-end inside padding
  })
})
