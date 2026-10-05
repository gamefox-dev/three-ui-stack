import type { Texture } from 'three'
import type { Disposable } from '../types'
import { TextureRegion } from './TextureRegion'

export class AtlasRegion extends TextureRegion {
  name = ''
  index = -1
  offsetX = 0
  offsetY = 0
  originalWidth = 0
  originalHeight = 0
  rotate = false
}

export interface AtlasRegionData {
  name: string
  x: number
  y: number
  width: number
  height: number
  index?: number
  offsetX?: number
  offsetY?: number
  originalWidth?: number
  originalHeight?: number
}

export interface AtlasPageData {
  /** Page file name / key, resolved to a texture by the caller. */
  name: string
  width?: number
  height?: number
  regions: readonly AtlasRegionData[]
}

export interface AtlasData {
  pages: readonly AtlasPageData[]
}

export type TextureResolver = (pageName: string) => Texture

/**
 * Named regions over one or more texture pages. Pure data model: the caller supplies already-created
 * textures, so it works on every platform (no DOM, no fetch).
 */
export class TextureAtlas implements Disposable {
  readonly textures: Texture[] = []
  readonly regions: AtlasRegion[] = []
  private readonly byName = new Map<string, AtlasRegion[]>()
  private disposed = false

  /** Build an atlas from structured data; `resolve` maps page names to textures. */
  static fromData(data: AtlasData, resolve: TextureResolver): TextureAtlas {
    const atlas = new TextureAtlas()
    for (const page of data.pages) {
      const texture = resolve(page.name)
      atlas.textures.push(texture)
      for (const r of page.regions) {
        const region = new AtlasRegion(texture, r.x, r.y, r.width, r.height)
        region.name = r.name
        region.index = r.index ?? -1
        region.offsetX = r.offsetX ?? 0
        region.offsetY = r.offsetY ?? 0
        region.originalWidth = r.originalWidth ?? r.width
        region.originalHeight = r.originalHeight ?? r.height
        atlas.addRegion(region)
      }
    }
    return atlas
  }

  /** Parse the libGDX `.atlas` text format (both the legacy and the `bounds:` flavours). */
  static fromText(text: string, resolve: TextureResolver): TextureAtlas {
    return TextureAtlas.fromData(parseAtlasText(text), resolve)
  }

  addRegion(region: AtlasRegion): void {
    this.regions.push(region)
    let list = this.byName.get(region.name)
    if (!list) this.byName.set(region.name, (list = []))
    list.push(region)
    list.sort((a, b) => a.index - b.index)
  }

  /** First region with `name` (and `index`, if given). */
  findRegion(name: string, index?: number): AtlasRegion | undefined {
    const list = this.byName.get(name)
    if (!list) return undefined
    return index === undefined ? list[0] : list.find((r) => r.index === index)
  }

  /** All regions sharing `name`, ordered by `index` (animation frames). */
  findRegions(name: string): AtlasRegion[] {
    return [...(this.byName.get(name) ?? [])]
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    for (const t of this.textures) t.dispose()
  }
}

function pair(value: string | undefined): [number, number] {
  const [a, b] = (value ?? '').split(',').map((s) => parseFloat(s.trim()))
  return [a ?? 0, b ?? 0]
}

export function parseAtlasText(text: string): AtlasData {
  const lines = text.split(/\r?\n/)
  const pages: { name: string; width?: number; height?: number; regions: AtlasRegionData[] }[] = []
  let page: (typeof pages)[number] | null = null
  let region: AtlasRegionData | null = null
  let expectPageName = true

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.trim() === '') {
      expectPageName = true
      page = page // blank line separates pages
      region = null
      continue
    }
    const colon = line.indexOf(':')
    const indented = /^\s/.test(line)
    if (colon < 0) {
      if (expectPageName) {
        page = { name: line.trim(), regions: [] }
        pages.push(page)
        expectPageName = false
        region = null
      } else if (page) {
        region = { name: line.trim(), x: 0, y: 0, width: 0, height: 0 }
        page.regions.push(region)
      }
      continue
    }
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim()
    if (!region && page && !indented) {
      if (key === 'size') {
        const [w, h] = pair(value)
        page.width = w
        page.height = h
      }
      continue
    }
    if (!region) continue
    switch (key) {
      case 'xy': {
        const [x, y] = pair(value)
        region.x = x
        region.y = y
        break
      }
      case 'size': {
        const [w, h] = pair(value)
        region.width = w
        region.height = h
        break
      }
      case 'bounds': {
        const [x, y, w, h] = value.split(',').map((s) => parseFloat(s.trim()))
        region.x = x ?? 0
        region.y = y ?? 0
        region.width = w ?? 0
        region.height = h ?? 0
        break
      }
      case 'orig': {
        const [w, h] = pair(value)
        region.originalWidth = w
        region.originalHeight = h
        break
      }
      case 'offset': {
        const [x, y] = pair(value)
        region.offsetX = x
        region.offsetY = y
        break
      }
      case 'index':
        region.index = parseInt(value, 10)
        break
      case 'rotate':
        if (value !== 'false' && value !== '0') {
          throw new Error('[three-2d] rotated atlas regions are not supported yet')
        }
        break
    }
  }
  return { pages }
}
