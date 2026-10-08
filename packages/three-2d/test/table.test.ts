import { describe, expect, it } from 'vitest'
import { BoxTable, TABLE_WIDTH } from '../src/batch/BoxTable'
import { SpriteBatch, createOrthographicCamera } from '../src'
import { makeTexture, MockRenderer } from './helpers'

function fill(table: BoxTable, values: number[]): void {
  table.reset()
  table.alloc(values.length / 4)
  table.data.set(values)
  table.upload()
}

describe('cached clip-table uploads', () => {
  it('retains identical entries across resets, but uploads changed values', () => {
    const t = new BoxTable(true)
    fill(t, [1, 2, 3, 4])
    const version = t.texture.version
    fill(t, [1, 2, 3, 4])
    expect(t.texture.version).toBe(version)
    fill(t, [1, 2, 30, 4])
    expect(t.texture.version).toBe(version + 1)
    t.dispose()
  })

  it('checks newly active entries and entry reordering', () => {
    const t = new BoxTable(true)
    fill(t, [1, 2, 3, 4])
    const version = t.texture.version
    fill(t, [1, 2, 3, 4, 5, 6, 7, 8])
    expect(t.texture.version).toBe(version + 1)
    fill(t, [5, 6, 7, 8, 1, 2, 3, 4])
    expect(t.texture.version).toBe(version + 2)
    t.dispose()
  })

  it('can reuse a shorter unchanged prefix, including after an empty frame', () => {
    const t = new BoxTable(true)
    fill(t, [1, 2, 3, 4, 5, 6, 7, 8])
    const version = t.texture.version
    fill(t, [1, 2, 3, 4])
    fill(t, [])
    fill(t, [1, 2, 3, 4, 5, 6, 7, 8])
    expect(t.texture.version).toBe(version)
    // A changed shorter upload makes its old suffix untrusted.
    fill(t, [10, 2, 3, 4])
    fill(t, [10, 2, 3, 4, 5, 6, 7, 8])
    expect(t.texture.version).toBe(version + 2)
    t.dispose()
  })

  it('invalidates cached contents when the texture grows and updates subscribers', () => {
    const t = new BoxTable(true)
    const subscriber = { value: null as unknown }
    t.subscribe(subscriber)
    fill(t, [1, 2, 3, 4])
    const texture = t.texture
    t.reset()
    t.alloc(TABLE_WIDTH * t.rowCount + 1)
    expect(t.texture).not.toBe(texture)
    expect(subscriber.value).toBe(t.texture)
    const version = t.texture.version
    t.upload()
    expect(t.texture.version).toBe(version + 1)
    t.upload()
    expect(t.texture.version).toBe(version + 1)
    t.dispose()
  })

  it('compares exact float bits, including signed zero and stable NaN payloads', () => {
    const t = new BoxTable(true)
    fill(t, [0, 1, 2, 3])
    let version = t.texture.version
    fill(t, [-0, 1, 2, 3])
    expect(t.texture.version).toBe(++version)
    const bits = new Uint32Array(t.data.buffer)
    bits[0] = 0x7fc00001
    t.upload()
    expect(t.texture.version).toBe(++version)
    t.upload()
    expect(t.texture.version).toBe(version)
    bits[0] = 0x7fc00002
    t.upload()
    expect(t.texture.version).toBe(++version)
    t.dispose()
  })

  it('keeps the default box-table path uncached', () => {
    const t = new BoxTable()
    fill(t, [1, 2, 3, 4])
    const version = t.texture.version
    fill(t, [1, 2, 3, 4])
    expect(t.texture.version).toBe(version + 1)
    t.dispose()
  })

  it('SpriteBatch skips stable clip uploads but refreshes changed rectangles and radii', () => {
    const b = new SpriteBatch({ renderer: new MockRenderer(), clip: 'shader' })
    const texture = makeTexture()
    const frame = (x: number, radius: number) => {
      b.begin(createOrthographicCamera(200, 200))
      b.pushClip(x, 0, 50, 50, [radius, radius, radius, radius])
      b.draw(texture, 0, 0, 100, 100)
      b.popClip()
      b.end()
    }
    frame(0, 0)
    const version = b.clipTable!.texture.version
    frame(0, 0)
    expect(b.clipTable!.texture.version).toBe(version)
    frame(10, 0)
    expect(b.clipTable!.texture.version).toBe(version + 1)
    frame(10, 12)
    expect(b.clipTable!.texture.version).toBe(version + 2)
    b.dispose()
  })

  it('refreshes reused entries across capacity and explicit mid-frame flushes', () => {
    for (const explicit of [false, true]) {
      const renderer = new MockRenderer()
      const b = new SpriteBatch({ renderer, clip: 'shader', maxSprites: 1, maxSpritesLimit: 1 })
      const versions: number[] = []
      const render = renderer.render.bind(renderer)
      renderer.render = (...args) => { versions.push(b.clipTable!.texture.version); render(...args) }
      b.begin(createOrthographicCamera(200, 200))
      b.pushClip(0, 0, 50, 50)
      b.draw(makeTexture(), 0, 0, 100, 100)
      b.popClip()
      if (explicit) b.flush()
      b.pushClip(10, 10, 50, 50)
      b.draw(makeTexture(), 0, 0, 100, 100)
      b.popClip()
      b.end()
      expect(versions).toHaveLength(2)
      expect(versions[1]).toBe(versions[0]! + 1)
      b.dispose()
    }
  })
})
