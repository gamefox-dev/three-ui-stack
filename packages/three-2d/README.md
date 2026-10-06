# three-2d

libGDX-inspired **batched 2D rendering primitives** on top of [Three.js](https://threejs.org): `SpriteBatch`, texture regions & atlases, bitmap fonts, nine-patch, animation, particles and viewports. Sprites are *not* scene nodes — everything is written into dynamic typed-array buffers and drawn through a handful of meshes using a portable TSL material.

> ⚠️ **Alpha (0.x)** — APIs may change before 1.0.

## Install

```bash
bun add @implicit-invocation/three-2d three
```

**Peer dependencies:** `three` (`^0.186.1`).

## Usage

```ts
import * as THREE from 'three/webgpu'
import { Three2D, TextureRegion, configureTexture } from '@implicit-invocation/three-2d'

const renderer = new THREE.WebGPURenderer({ antialias: false })
await renderer.init()

const graphics = new Three2D({ renderer, clearColor: '#101018' })
graphics.resize(innerWidth, innerHeight)

const sprite = new TextureRegion(configureTexture(myTexture)) // v = 0 is the top row

renderer.setAnimationLoop(() => {
  graphics.render((batch) => {
    batch.draw(sprite, 10, 10, 64, 64)                       // x, y, width, height (y-down)
    batch.fillRect(100, 10, 200, 48, { color: '#6d5dfc', radius: 12 })
    font.draw(batch, 'Hello', 24, 80)                         // BitmapFont
  })
})
```

Lower level: `batch.begin(camera)` → `batch.draw…` → `batch.end()`. The **caller owns the renderer and the frame loop**; `@implicit-invocation/three-2d` never creates either.

### What's inside

| Area | Types |
| --- | --- |
| Textures | `TextureRegion`, `TextureAtlas` (libGDX `.atlas` text + structured data), `configureTexture` |
| Drawing | `SpriteBatch`, `PolygonSpriteBatch`, `Sprite`, `NinePatch`, rounded-rect/border SDF (`fillRect`), **`fillBox`** (per-corner radii, per-side border, linear/radial gradients), **`fillShadow`** (analytic outer/inset shadows), **`fillBackdrop`** (blurred backdrop) |
| Text | `BitmapFont`, `BitmapFontData` (`three-2d-bitmap-font` v1 JSON, optional `stroke` distance channel), `GlyphLayout` (wrap/align/spacing, `maxLines`, `wrap: false`, `ellipsis`), `drawGlyph` / `drawGlyphEffect` |
| Motion | `Animation<T>`, `ParticleEmitter`, `ParticleEffect` (pooled, allocation-free) |
| Cameras | `createOrthographicCamera`, `Viewport`, `FitViewport`, `FillViewport`, `ExtendViewport`, `StretchViewport`, `ScreenViewport` |
| State | blend modes (`normal`/`additive`/`multiply`/`screen`/`premultiplied`), transform stack, clip (scissor) stack |

Coordinate convention: origin top-left, **+y down**, logical pixels.

### Boxes, shadows and the box table

```ts
batch.fillShadow({ x, y, width, height, radii: [16, 16, 16, 16], offsetY: 8, blur: 24, color: '#000a' })
batch.fillBox({ x, y, width, height, radii: [16, 16, 4, 4], borderWidths: [2, 2, 2, 2], borderColor: '#fbbf24',
                background: '#1e293b', gradient: { type: 'linear', dx: 0, dy: 1, length: height, stops: [{ color: '#334155', position: 0 }, { color: '#0f172a', position: 1 }] } })
```

Each box is **one 4-vertex quad**; everything else about it (radii, border widths/colors, background, up to 8 gradient stops, shadow geometry) lives in a per-frame float texture, the `BoxTable` (`RGBA32F`, fetched with `texelFetch`, grows by doubling, uploaded once per submit). Boxes, shadows and solid fills ignore the bound texture, so they **join any segment** — a screen of hundreds of panels with text is a handful of draw calls. Shadows are analytic (Gaussian integrated in x, four weighted rows in y, per-corner radii), one quad per layer, masked out of the casting box; gradients interpolate premultiplied in sRGB or OKLab.

`batch.fillBackdrop({ …, blur })` paints the blurred pixels behind a rounded rect (`new SpriteBatch({ renderer, backdrop: 'low' | 'full' })`): one framebuffer copy per capture generation + a dual-Kawase chain, see `BackdropBlur`.

### Flush rules & counters

A batch starts a new segment (draw call) on a texture, blend or clip change; it submits on `end()`, `flush()` or capacity exhaustion. `batch.stats` exposes `sprites`, `boxes`, `shadows`, `flushes`, `drawCalls`, `renderPasses`, `glyphs`, `clipChanges`, `backdropCopies`, `backdropPasses`. Solid fills, boxes and shadows never force a texture switch (a segment that holds only those even adopts the first textured quad's texture).

## Runtime support

| Target | Status |
| --- | --- |
| Browser + `WebGPURenderer` (WebGPU) | ✅ |
| Browser + `WebGPURenderer` (WebGL2 backend) | ✅ |
| React Native + `react-native-wgpu` + Three WebGPU | ✅ by design (no DOM/Canvas2D/`window` anywhere) |

## Resources & disposal

`SpriteBatch`, `BitmapFont`, `TextureAtlas`, `Three2D` expose `dispose()` (idempotent). Textures you pass in stay yours until you dispose them (atlas/font `dispose()` also disposes their textures).

## Examples

- [`examples/three-2d-basic`](../../examples/three-2d-basic) — 20 000-sprite swarm, atlas, animation, particles, nine-patch, viewports, WebGPU/WebGL2.
