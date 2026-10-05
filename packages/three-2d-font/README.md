# three-2d-font

TTF/OTF → **bitmap-font atlas** tooling for [`@implicit-invocation/three-2d`](../three-2d): a portable parser, two rasterizers, an atlas packer, a runtime packing API and a CLI.

> ⚠️ **Alpha (0.x)** — APIs may change before 1.0.

## Install

```bash
bun add @implicit-invocation/three-2d-font @implicit-invocation/three-2d three
```

**Peer dependencies:** `three`. Depends on `@implicit-invocation/three-2d` and `opentype.js` (never exposed in the public API).

## CLI (recommended for production)

```bash
three-2d-font pack ./Inter-Regular.ttf --size 32 --charset latin --output ./assets/inter-32
# → inter-32.png + inter-32.json   (format "three-2d-bitmap-font", version 1)
```

Options: `--size`, `--charset latin|ascii|digits`, `--chars "<literal>"`, `--supersample`, `--padding`, `--family/--weight/--style`, `--max-atlas`.

## Runtime packing

```ts
import { packBitmapFont } from '@implicit-invocation/three-2d-font'

const font = await packBitmapFont(fontBytes /* ArrayBuffer */, {
  renderer,          // optional: bake on the GPU (Three render target); omit to use the CPU rasterizer
  size: 32,
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  supersample: 4,
})
font.draw(batch, 'Hello', 10, 10)   // three-2d BitmapFont
```

## Architecture

```
ArrayBuffer → FontParser → ParsedFont → GlyphRasterizer → AtlasPacker → THREE.Texture | PNG + JSON
```

- `OpenTypeFontParser` — opentype.js adapter; input is an `ArrayBuffer` (no `fetch`, no DOM).
- `ThreeGlyphRasterizer` — default portable rasterizer: outlines → `ShapeGeometry` → supersampled render target (no Canvas2D).
- `CpuGlyphRasterizer` — pure-JS scanline rasterizer (CLI, tests, headless).
- Atlas entries are keyed by **font glyph ID**, not just Unicode, leaving room for shaping/ligatures.

Pair kerning is read when the font exposes a `kern` table; GPOS-only kerning is not applied yet.

## Runtime support

Core (`@implicit-invocation/three-2d-font`): browser, Node, Bun, React Native (no DOM, no Canvas2D). `@implicit-invocation/three-2d-font/node` and the CLI need Node/Bun (`node:fs`, `node:zlib`).

## Examples

`bun run build:fonts` at the repo root bakes the Inter fixtures used by every example.
