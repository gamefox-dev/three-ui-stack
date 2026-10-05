import { deflateSync } from 'node:zlib'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { bakeBitmapFont, type BakeOptions, type BakedBitmapFont } from './bake'

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]!) & 255]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length)
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i)
  out.set(data, 8)
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

/** Minimal deterministic RGBA8 PNG encoder (no ancillary chunks). */
export function encodePng(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const ihdr = new Uint8Array(13)
  const view = new DataView(ihdr.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const raw = new Uint8Array((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1)
  }
  const parts = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', new Uint8Array(0)),
  ]
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

/** Write `<outputBase>.png` + `<outputBase>.json`. */
export async function writeBitmapFont(baked: BakedBitmapFont, outputBase: string): Promise<{ png: string; json: string }> {
  const base = resolve(outputBase)
  await mkdir(dirname(base), { recursive: true })
  const png = `${base}.png`
  const json = `${base}.json`
  const out = { ...baked.json, atlas: { ...baked.json.atlas, image: `${basename(base)}.png` } }
  await writeFile(png, encodePng(baked.atlas.width, baked.atlas.height, baked.atlas.rgba))
  await writeFile(json, `${JSON.stringify(out)}\n`)
  return { png, json }
}

export async function packFontFile(fontPath: string, outputBase: string, options: BakeOptions): Promise<{ png: string; json: string; baked: BakedBitmapFont }> {
  const bytes = await readFile(fontPath)
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const baked = await bakeBitmapFont(data, { ...options, imageName: `${basename(outputBase)}.png` })
  const files = await writeBitmapFont(baked, outputBase)
  return { ...files, baked }
}
