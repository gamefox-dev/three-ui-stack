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
| Drawing | `SpriteBatch`, `PolygonSpriteBatch`, `Sprite`, `NinePatch`, rounded-rect/border SDF (`fillRect`) |
| Text | `BitmapFont`, `BitmapFontData` (`three-2d-bitmap-font` v1 JSON), `GlyphLayout` (wrap/align/spacing) |
| Motion | `Animation<T>`, `ParticleEmitter`, `ParticleEffect` (pooled, allocation-free) |
| Cameras | `createOrthographicCamera`, `Viewport`, `FitViewport`, `FillViewport`, `ExtendViewport`, `StretchViewport`, `ScreenViewport` |
| State | blend modes (`normal`/`additive`/`multiply`/`screen`/`premultiplied`), transform stack, clip (scissor) stack |

Coordinate convention: origin top-left, **+y down**, logical pixels.

### Flush rules & counters

A batch starts a new segment (draw call) on a texture, blend or clip change; it submits on `end()`, `flush()` or capacity exhaustion. `batch.stats` exposes `sprites`, `flushes`, `drawCalls`, `renderPasses`, `glyphs`, `clipChanges`. Solid fills (`fillRect`) never force a texture switch.

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
