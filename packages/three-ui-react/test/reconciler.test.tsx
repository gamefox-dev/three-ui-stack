import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DataTexture, RGBAFormat, UnsignedByteType } from 'three'
import { BitmapFont, BitmapFontData, configureTexture } from 'three-2d'
import { FontRegistry, ScrollView as ScrollNode, Text as TextNode, View as ViewNode, createThreeUI, type ThreeUI, type UINode } from 'three-ui'
import { act, useState, type ReactNode, type Ref } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Image, ScrollView, Text, View, createThreeUIRoot, useThreeUI, type ThreeUIRoot } from '../src'
import { bridgeCount } from '../src/renderer/applyProps'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const fontDir = resolve(import.meta.dirname, '../../../test/fixtures/public/fonts')
function fonts(): FontRegistry {
  const reg = new FontRegistry()
  for (const n of ['inter-regular-48', 'inter-bold-48']) {
    const json = JSON.parse(readFileSync(resolve(fontDir, `${n}.json`), 'utf8'))
    reg.register(new BitmapFont(BitmapFontData.parse(json), configureTexture(new DataTexture(new Uint8Array(4), 1, 1, RGBAFormat, UnsignedByteType))))
  }
  return reg
}

let ui: ThreeUI
let root: ThreeUIRoot

beforeEach(() => {
  ui = createThreeUI({ width: 400, height: 300, fonts: fonts() })
  root = createThreeUIRoot(ui)
})
afterEach(async () => {
  await act(async () => root.unmount())
  ui.dispose()
})

const render = async (node: ReactNode) => act(async () => root.render(node))
const app = (): UINode => ui.root!.children[0]!
const all = (n: UINode = ui.root!): UINode[] => [n, ...n.children.flatMap((c) => all(c))]

describe('mount', () => {
  it('maps host elements to three-ui nodes and applies style props', async () => {
    await render(
      <View style={{ flex: 1, padding: 10, backgroundColor: '#112233' }}>
        <Text style={{ fontSize: 20 }}>Hello</Text>
        <Image style={{ width: 20, height: 20 }} />
        <ScrollView style={{ height: 50 }} />
      </View>,
    )
    ui.update()
    expect(app().kind).toBe('View')
    expect(app().children.map((c) => c.kind)).toEqual(['Text', 'Image', 'ScrollView'])
    expect(app().computedStyle.padding).toBe(10)
    expect((app().children[0] as TextNode).text).toBe('Hello')
    expect(app().children[0]!.layout.width).toBeGreaterThan(20)
    // the host View is the UI root and fills the viewport
    expect(ui.root!.layout).toMatchObject({ width: 400, height: 300 })
  })

  it('hands out the underlying UI node through refs', async () => {
    let node: UINode | null = null
    const ref: Ref<ViewNode> = (n) => {
      node = n
    }
    await render(<View ref={ref} name="box" />)
    expect(node).toBe(app())
    expect((node as unknown as UINode).name).toBe('box')
  })

  it('rejects bare strings outside <Text> with an actionable error', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(render(<View>{'oops' as never}</View>)).rejects.toThrow(/inside a <Text>/)
    err.mockRestore()
  })

  it('flattens string/number children of Text and rejects elements', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    await render(<Text>{'a'}{1}{'b'}</Text>)
    expect((app() as TextNode).text).toBe('a1b')
    await expect(render(<Text><View /></Text>)).rejects.toThrow(/strings or numbers/)
    err.mockRestore()
  })

  it('exposes the UI via useThreeUI', async () => {
    let seen: ThreeUI | null = null
    function Probe() {
      seen = useThreeUI()
      return <View />
    }
    await render(<Probe />)
    expect(seen).toBe(ui)
  })
})

describe('updates mutate existing nodes', () => {
  it('state changes update props on the same node instances', async () => {
    let setN: (n: number) => void = () => {}
    const seen: UINode[] = []
    function Counter() {
      const [n, set] = useState(0)
      setN = set
      return (
        <View style={{ padding: n }} ref={(v) => void (v && seen.push(v))}>
          <Text>{`count ${n}`}</Text>
        </View>
      )
    }
    await render(<Counter />)
    const view = app()
    const text = view.children[0] as TextNode
    await act(async () => setN(5))
    ui.update()
    expect(app()).toBe(view)
    expect(view.children[0]).toBe(text) // no remount
    expect(view.computedStyle.padding).toBe(5)
    expect(text.text).toBe('count 5')
    expect(new Set(seen).size).toBe(1)
  })

  it('inserts, reorders and removes list items without recreating survivors', async () => {
    const item = (id: string) => <Text key={id} name={id}>{id}</Text>
    await render(<View>{['a', 'b', 'c'].map(item)}</View>)
    const byName = () => Object.fromEntries(app().children.map((c) => [c.name, c]))
    const orig = byName()
    expect(app().children.map((c) => c.name)).toEqual(['a', 'b', 'c'])

    await render(<View>{['c', 'a', 'x', 'b'].map(item)}</View>)
    ui.update()
    expect(app().children.map((c) => c.name)).toEqual(['c', 'a', 'x', 'b'])
    expect(byName().a).toBe(orig.a)
    expect(byName().b).toBe(orig.b)
    expect(byName().c).toBe(orig.c)
    // Yoga order matches: layout y grows in child order
    const ys = app().children.map((c) => c.layout.y)
    expect([...ys].sort((p, q) => p - q)).toEqual(ys)

    await render(<View>{['a'].map(item)}</View>)
    await act(async () => {}) // flush passive cleanup
    expect(app().children.map((c) => c.name)).toEqual(['a'])
    expect(orig.b!.isDisposed).toBe(true) // removed nodes free their Yoga nodes
    expect(orig.c!.isDisposed).toBe(true)
    expect(orig.a!.isDisposed).toBe(false)
  })
})

describe('events', () => {
  it('replaces handlers without re-subscribing and fires them from the UI input system', async () => {
    const calls: string[] = []
    function Button({ label }: { label: string }) {
      const [n, setN] = useState(0)
      return (
        <View name="btn" style={{ width: 100, height: 40 }} onClick={() => { calls.push(`${label}${n}`); setN(n + 1) }}>
          <Text>{`${label}${n}`}</Text>
        </View>
      )
    }
    await render(<Button label="A" />)
    ui.update()
    const btn = app()
    expect(btn.listenerCount).toBe(1)
    await act(async () => {
      ui.input.pointerDown(10, 10)
      ui.input.pointerUp(10, 10)
    })
    expect(calls).toEqual(['A0'])
    expect((btn.children[0] as TextNode).text).toBe('A1')
    await render(<Button label="B" />) // new handler closure, same node
    await act(async () => {
      ui.input.pointerDown(10, 10)
      ui.input.pointerUp(10, 10)
    })
    expect(calls).toEqual(['A0', 'B1'])
    expect(btn.listenerCount).toBe(1) // replaced in place, never stacked
  })

  it('detaches handlers when a handler prop is removed and on unmount', async () => {
    await render(<View onClick={() => {}} onPointerMove={() => {}} />)
    const node = app()
    expect(bridgeCount(node)).toBe(2)
    await render(<View onClick={() => {}} />)
    expect(bridgeCount(node)).toBe(1)
    await act(async () => root.unmount())
    expect(bridgeCount(node)).toBe(0)
    expect(node.isDisposed).toBe(true)
  })

  it('updates are applied at discrete priority synchronously after input events', async () => {
    function Toggle() {
      const [on, set] = useState(false)
      return <View style={{ width: 50, height: 50, backgroundColor: on ? '#ff0000' : '#00ff00' }} onPointerDown={() => set(!on)} />
    }
    await render(<Toggle />)
    ui.update()
    expect(app().computedStyle.backgroundColor.toHex()).toBe('#00ff00')
    await act(async () => {
      ui.input.pointerDown(5, 5)
    })
    ui.update()
    expect(app().computedStyle.backgroundColor.toHex()).toBe('#ff0000')
  })
})

describe('unmount', () => {
  it('disposes every node and detaches the root', async () => {
    await render(
      <View>
        <ScrollView>
          <Text>x</Text>
        </ScrollView>
      </View>,
    )
    const nodes = all()
    await act(async () => root.unmount())
    expect(ui.root).toBeNull()
    expect(nodes.every((n) => n.isDisposed)).toBe(true)
    expect(() => root.render(<View />)).toThrow(/after unmount/)
    // re-create for afterEach
    root = createThreeUIRoot(ui)
  })

  it('keeps ScrollView type identity (not recreated) across re-renders', async () => {
    await render(<ScrollView style={{ height: 10 }} />)
    const s = app()
    await render(<ScrollView style={{ height: 20 }} />)
    expect(app()).toBe(s)
    expect(s instanceof ScrollNode).toBe(true)
  })
})
