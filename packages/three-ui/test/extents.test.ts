import { describe, expect, it } from 'vitest'
import { ScrollView, Text, View, type UINode } from '../src'
import { makeUI } from './helpers'

/** A ScrollView holding one plain wrapper View with `rows` rows (a box plus a label each): the shape that used to defeat culling. */
function wrappedList(rows: number) {
  const ui = makeUI({ width: 300, height: 400 })
  const items = Array.from({ length: rows }, (_, i) => new View({ name: `row${i}`, style: { height: 40, backgroundColor: '#222' }, children: [new Text({ text: String(i) })] }))
  const wrapper = new View({ name: 'wrapper', style: { flexDirection: 'column' }, children: items })
  const scroll = new ScrollView({ name: 'scroll', style: { width: 300, height: 200 }, children: [wrapper] })
  const root = new View({ children: [scroll] })
  ui.setRoot(root)
  ui.update()
  return { ui, root, scroll, wrapper, items }
}

describe('paint extents: culling', () => {
  it('rows inside a plain wrapper View under a ScrollView are culled like direct children', () => {
    const { ui, scroll } = wrappedList(500)
    ui.render()
    expect(ui.stats.nodesPainted).toBeLessThan(40)
    expect(ui.stats.nodesCulled).toBeGreaterThan(400)
    scroll.scrollTo(0, 10000)
    ui.update(1)
    ui.render()
    expect(ui.stats.nodesPainted).toBeLessThan(40)
  })

  it('a descendant that overflows an off-screen visible-overflow parent keeps it alive', () => {
    const ui = makeUI({ width: 200, height: 200 })
    const overflowing = new View({ style: { position: 'absolute', left: 0, top: 100, width: 50, height: 50, backgroundColor: '#f00' } })
    const parent = new View({ style: { position: 'absolute', left: 0, top: -100, width: 10, height: 10 }, children: [overflowing] })
    ui.setRoot(new View({ children: [parent] }))
    ui.render()
    expect(ui.stats.nodesPainted).toBe(4) // implicit view root, root, parent and the overflowing child
    parent.setStyle({ position: 'absolute', left: 0, top: -100, width: 10, height: 10, overflow: 'hidden' })
    ui.update()
    ui.render()
    expect(ui.stats.nodesCulled).toBe(1) // a clipping parent bounds its descendants: nothing of it shows
  })

  it('a transformed node is culled by its transformed bounds, and a transform no longer disables culling inside it', () => {
    const ui = makeUI({ width: 200, height: 200 })
    const box = new View({ style: { position: 'absolute', left: 300, top: 0, width: 40, height: 40, backgroundColor: '#fff', transform: [{ translateX: -270 }] } })
    ui.setRoot(new View({ children: [box] }))
    ui.render()
    expect(ui.stats.nodesPainted).toBe(3) // translated into view (view root, root, box)
    box.setStyle({ position: 'absolute', left: 300, top: 0, width: 40, height: 40, backgroundColor: '#fff', transform: [{ translateX: -10 }] })
    ui.update()
    ui.render()
    expect(ui.stats.nodesCulled).toBe(1) // still off the right edge

    const { ui: ui2, root: root2 } = wrappedList(500)
    root2.setStyle({ transform: [{ scale: 1.5 }] })
    ui2.update()
    ui2.render()
    expect(ui2.stats.nodesCulled).toBeGreaterThan(400) // rows under a transformed ancestor are culled against the screen bounds
  })

  it('stays correct when layout, style, children or animations move a node', () => {
    const ui = makeUI({ width: 200, height: 200 })
    const a = new View({ name: 'a', style: { height: 150 } })
    const b = new View({ name: 'b', style: { height: 20, backgroundColor: '#0f0' } })
    const root = new View({ children: [a, b] })
    ui.setRoot(root)
    ui.render()
    expect(ui.stats.nodesPainted).toBe(4) // view root, root, a, b
    a.setStyle({ height: 400 }) // layout pushes b below the viewport
    ui.update()
    ui.render()
    expect(ui.stats.nodesCulled).toBe(1)
    root.remove(a) // removing a child pulls b back into view
    ui.update()
    ui.render()
    expect(ui.stats.nodesPainted).toBe(3)
    expect(ui.stats.nodesCulled).toBe(0)

    const c = new View({ name: 'c', style: { position: 'absolute', left: 300, top: 0, width: 40, height: 40, backgroundColor: '#fff' } })
    root.append(c)
    ui.update()
    ui.render()
    expect(ui.stats.nodesCulled).toBe(1)
    c.animate([{ transform: [{ translateX: 0 }] }, { transform: [{ translateX: -270 }] }], { duration: 1000, fill: 'forwards' })
    ui.update(1.1)
    ui.render()
    expect(ui.stats.nodesCulled).toBe(0)
  })
})

describe('paint extents: hit testing', () => {
  it('hits a descendant that overflows its visible-overflow parent, and nothing in pruned subtrees', () => {
    const ui = makeUI({ width: 300, height: 300 })
    const badge = new View({ name: 'badge', style: { position: 'absolute', left: 0, top: 100, width: 50, height: 50 } })
    const row = new View({ name: 'row', style: { height: 20, width: 100 }, children: [badge] })
    const root = new View({ children: [row] })
    ui.setRoot(root)
    ui.update()
    expect(ui.hitTest(10, 120)).toBe(badge)
    expect(ui.hitTest(10, 10)).toBe(row)
    expect(ui.hitTest(250, 250)).not.toBe(badge)
    expect(ui.hitTest(250, 250)).not.toBe(row)
    void root
  })

  it('finds the right row in a long list, also under a transform and after a scroll', () => {
    const { ui, scroll, items } = wrappedList(2000)
    const rowAt = (x: number, y: number): string | undefined => {
      for (let n: UINode | null = ui.hitTest(x, y); n; n = n.parent) if (n.name?.startsWith('row')) return n.name
      return undefined
    }
    expect(rowAt(10, 5)).toBe('row0')
    scroll.scrollTo(0, 40 * 1500)
    ui.update(1)
    expect(rowAt(10, 5)).toBe('row1500')
    expect(rowAt(10, 45)).toBe('row1501')
    items[1501]!.setStyle({ height: 40, transform: [{ translateX: 100 }] })
    ui.update()
    expect(rowAt(10, 45)).not.toBe('row1501') // moved away
    expect(rowAt(150, 45)).toBe('row1501') // …to where it is painted
  })
})

// ───────────────────────────── randomized: culling never drops anything visible ─────────────────────────────

function rng(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomTree(rand: () => number, depth: number): View {
  const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!
  const style: Record<string, unknown> = {
    width: 20 + Math.floor(rand() * 100),
    height: 20 + Math.floor(rand() * 100),
    backgroundColor: pick(['#f00', '#0f0', '#00f', '#ff0']),
  }
  if (rand() < 0.5) Object.assign(style, { position: 'absolute', left: -150 + Math.floor(rand() * 400), top: -150 + Math.floor(rand() * 400) })
  if (rand() < 0.3) style.overflow = pick(['hidden', 'visible'])
  if (rand() < 0.25) style.transform = [pick([{ translateX: -120 }, { translateY: 140 }, { scale: 2 }, { scale: 0.5 }, { rotate: '30deg' }, { rotate: '90deg' }])]
  if (rand() < 0.2) style.boxShadow = { offsetX: Math.floor(rand() * 40) - 20, offsetY: 10, blur: 20, color: '#000' }
  if (rand() < 0.2) style.borderRadius = 12
  const kids: View[] = []
  if (depth > 0) for (let i = 0, n = Math.floor(rand() * 4); i < n; i++) kids.push(randomTree(rand, depth - 1))
  return new View({ style, children: kids })
}

/** Quads of the last frame that show inside the viewport: their bounds intersect both the viewport and the segment's clip. */
function visibleQuads(ui: ReturnType<typeof makeUI>, size: number, shift: number): Set<string> {
  const b = ui.batch as unknown as { vertices: Float32Array }
  const stride = 21
  const out = new Set<string>()
  let quad = 0
  for (const seg of ui.batch.segments) {
    for (let i = 0, n = seg.indexCount / 6; i < n; i++, quad++) {
      let x0 = Infinity
      let y0 = Infinity
      let x1 = -Infinity
      let y1 = -Infinity
      for (let k = 0; k < 4; k++) {
        const x = b.vertices[(quad * 4 + k) * stride]! - shift
        const y = b.vertices[(quad * 4 + k) * stride + 1]! - shift
        x0 = Math.min(x0, x)
        y0 = Math.min(y0, y)
        x1 = Math.max(x1, x)
        y1 = Math.max(y1, y)
      }
      const c = seg.clip
      const cx0 = c ? Math.max(0, c.x - shift) : 0
      const cy0 = c ? Math.max(0, c.y - shift) : 0
      const cx1 = c ? Math.min(size, c.x + c.width - shift) : size
      const cy1 = c ? Math.min(size, c.y + c.height - shift) : size
      // box quads carry a 1px anti-aliasing margin around the shape: an overlap within it shows nothing
      if (Math.min(x1, cx1) - Math.max(x0, cx0) <= 1.01 || Math.min(y1, cy1) - Math.max(y0, cy0) <= 1.01) continue
      out.add([x0, y0, x1, y1].map((v) => Math.round(v * 100) / 100).join(','))
    }
  }
  return out
}

describe('paint extents: culling is lossless (randomized)', () => {
  it('everything an unculled frame shows inside the viewport is still painted when culling is on', async () => {
    const { culling } = await import('../src/paint/paintTree')
    const SIZE = 200
    const SHIFT = 500
    let compared = 0
    for (let seed = 1; seed <= 500; seed++) {
      const build = (): { ui: ReturnType<typeof makeUI>; root: View } => {
        const rand = rng(seed)
        const content = randomTree(rand, 3)
        const stage = new View({ style: { position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE, overflow: 'hidden' }, children: [content] })
        return { ui: makeUI({ width: SIZE, height: SIZE }), root: stage }
      }
      const a = build()
      a.ui.setRoot(a.root)
      a.ui.update()
      culling.enabled = true
      a.ui.render()
      const culled = visibleQuads(a.ui, SIZE, 0)

      // reference: same tree in a huge viewport (so only the stage's own clip applies), nothing culled
      const rand = rng(seed)
      const refContent = randomTree(rand, 3)
      const refStage = new View({ style: { position: 'absolute', left: SHIFT, top: SHIFT, width: SIZE, height: SIZE, overflow: 'hidden' }, children: [refContent] })
      const ref = makeUI({ width: SHIFT + SIZE, height: SHIFT + SIZE })
      ref.setRoot(new View({ children: [refStage] }))
      ref.update()
      culling.enabled = false
      ref.render()
      culling.enabled = true
      const full = visibleQuads(ref, SIZE, SHIFT)
      for (const q of full) {
        compared++
        expect(culled.has(q), `seed ${seed}: quad ${q} is visible without culling but missing with it`).toBe(true)
      }
    }
    expect(compared).toBeGreaterThan(1500)
  })
})
