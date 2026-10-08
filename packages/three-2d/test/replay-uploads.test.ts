import { describe, expect, it, vi } from 'vitest'
import { DynamicDrawUsage, StreamDrawUsage, type Mesh } from 'three'
// @ts-expect-error Three's private attribute manager has no published declaration; test its real upload gate, not a mock of it.
import Attributes from 'three/src/renderers/common/Attributes.js'
import { AttributeType } from 'three/src/renderers/common/Constants.js'
import { SpriteBatch, createOrthographicCamera } from '../src'
import { MockRenderer, makeTexture } from './helpers'

describe('version-tracked replay uploads', () => {
  it('does not trigger Three common Attributes uploads on static replay, and uploads only modified retained vertices', () => {
    const renderer = new MockRenderer()
    const batch = new SpriteBatch({ renderer, maxSprites: 4 })
    const frame = () => { batch.begin(createOrthographicCamera(200, 200)); batch.draw(makeTexture(), 0, 0, 10, 10); batch.end() }
    frame()
    const mesh = batch.scene.children[0] as Mesh
    const position = mesh.geometry.getAttribute('position')
    const index = mesh.geometry.index!
    const backend = { createAttribute: vi.fn(), createIndexAttribute: vi.fn(), updateAttribute: vi.fn() }
    const info = { createAttribute() {}, createIndexAttribute() {} }
    const attributes = new Attributes(backend as never, info as never)
    const update = () => { attributes.update(position, AttributeType.VERTEX); attributes.update(index, AttributeType.INDEX) }
    update()
    expect(index.usage).toBe(StreamDrawUsage)
    batch.replay(); update()
    expect(backend.updateAttribute).not.toHaveBeenCalled()
    const indexVersion = index.version
    batch.updateVertexAlpha(0, 4, .5)
    batch.replay(); update()
    expect(backend.updateAttribute).toHaveBeenCalledExactlyOnceWith(position)
    expect(index.version).toBe(indexVersion)
    backend.updateAttribute.mockClear()
    expect(batch.updateVertexAlpha(0, 4, .5)).toBe(false)
    batch.replay(); update()
    expect(backend.updateAttribute).not.toHaveBeenCalled()
    backend.updateAttribute.mockClear()
    frame(); update()
    expect(backend.updateAttribute).toHaveBeenCalledTimes(2)
    batch.dispose()
  })

  it('keeps the classic WebGL usage hint and rejects invalid retained ranges', () => {
    const renderer = Object.assign(new MockRenderer(), { isWebGLRenderer: true })
    const batch = new SpriteBatch({ renderer })
    batch.begin(createOrthographicCamera(200, 200)); batch.draw(makeTexture(), 0, 0, 10, 10); batch.end()
    const mesh = batch.scene.children[0] as Mesh
    expect(mesh.geometry.index!.usage).toBe(DynamicDrawUsage)
    expect(() => batch.updateVertexAlpha(-1, 4, 1)).toThrow()
    expect(() => batch.updateVertexAlpha(NaN, 4, 1)).toThrow()
    expect(() => batch.updateVertexAlpha(.5, 4, 1)).toThrow()
    expect(() => batch.updateVertexAlpha(0, 8, 1)).toThrow()
    batch.dispose()
  })
})
