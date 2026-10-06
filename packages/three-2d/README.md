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

### Nine-patches for high-DPI art

```ts
// art baked at 2×: one source pixel is half a logical unit
const patch = new NinePatch(region, 16, 16, 16, 16, { scale: 0.5 })      // or atlas.createPatch('panel', 0.5)
patch.minWidth      // 16 — borders, minWidth, minHeight and padding are in logical units
patch.draw(batch, x, y, w, h)           // patch.draw(batch, x, y, w, h, 0.25) overrides the scale for one draw
```

`TextureAtlas` reads libGDX `split:` (borders) and `pad:` (content padding) lines; `atlas.createPatch(name, scale)` builds the patch and `patch.padding` (`[top, right, bottom, left]`, scaled) is the content padding. Scaled patches inset every cell's UVs by half a texel so linear filtering never reads a neighbouring cell (`uvInset: 'auto'` — a 1:1 patch is not inset because it samples texel centers exactly; pass a number to force one). `tint` / `setColor` work as before.

### Boxes, shadows and the box table

```ts
batch.fillShadow({ x, y, width, height, radii: [16, 16, 16, 16], offsetY: 8, blur: 24, color: '#000a' })
batch.fillBox({ x, y, width, height, radii: [16, 16, 4, 4], borderWidths: [2, 2, 2, 2], borderColor: '#fbbf24',
                background: '#1e293b', gradient: { type: 'linear', dx: 0, dy: 1, length: height, stops: [{ color: '#334155', position: 0 }, { color: '#0f172a', position: 1 }] } })
```

Each box is **one 4-vertex quad**; everything else about it (radii, border widths/colors, background, up to 8 gradient stops, shadow geometry) lives in a per-frame float texture, the `BoxTable` (`RGBA32F`, fetched with `texelFetch`, grows by doubling, uploaded once per submit). Boxes, shadows and solid fills ignore the bound texture, so they **join any segment** — a screen of hundreds of panels with text is a handful of draw calls. Shadows are analytic (Gaussian integrated in x, four weighted rows in y, per-corner radii), one quad per layer, masked out of the casting box; gradients interpolate premultiplied in sRGB or OKLab.

`batch.fillBackdrop({ …, blur })` paints the blurred pixels behind a rounded rect (`new SpriteBatch({ renderer, backdrop: 'low' | 'full' })`): one framebuffer copy per capture generation + a dual-Kawase chain, see `BackdropBlur`.

### Multi-texture draw calls

A draw call samples up to `maxTextures` textures: each quad carries its texture *slot* in its vertex data and the shader reads exactly that one (a branch over the slot index, one fetch — never all of them). Atlas pages, avatars and bitmap fonts therefore share draw calls instead of splitting them at every change.

```ts
new SpriteBatch({ renderer })                  // maxTextures: 'auto' — the renderer's texture-unit budget, up to 8
new SpriteBatch({ renderer, maxTextures: 1 })  // one texture per draw call (the pre-0.4 behaviour)
```

`'auto'` needs a renderer that reports its limits (classic `WebGLRenderer`, `WebGPURenderer`); a bare batch or an unknown renderer uses 1. Which texture sits in a slot is a per-draw value, **not** part of the shader: shaders — and a classic `WebGLRenderer`'s GL programs — depend only on the blend mode, so new textures never compile anything. Counters: `textureSwitches` (a texture change that had no free slot), `texturesBound` (slots bound over all draw calls of the frame).

### Clipping: scissor or shader

`pushClip` clips with the hardware scissor by default, which costs one `renderer.render()` per distinct clip rectangle (≈ 1 ms of fixed CPU on a phone). With `new SpriteBatch({ renderer, clip: 'shader' })` clipping happens in the fragment shader instead: it is anti-aliased, never splits a draw call or adds a render pass, quads fully inside their clip cost nothing extra, quads fully outside are skipped, and `pushClip(x, y, w, h, radii)` rounds the clip's corners. (Nested clips intersect their rectangles; only the innermost rounded rectangle is honoured.)

### Shader warm-up (no first-use hitch)

Shaders are built lazily: the first draw of a blend mode costs ~20–40 ms per material (shader graph build + pipeline / program creation). A batch keeps just **two materials per blend mode**, however many draw calls a frame has — a draw call binds its texture slots in `mesh.onBeforeRender` — so that cost is paid at most twice per blend mode, never again when a scroll or a new screen needs more draw calls. To pay it up front, behind a loading screen: `await batch.warmup(camera, ['normal', 'additive'])` (uses `compileAsync` on a `WebGPURenderer`, a 1 × 1 scissored degenerate draw otherwise; nothing visible changes).

### Gradient cost

`maxGradientStops` (2…8, default 8) caps the gradient shader's loop. Gradients with ≤ 3 stops always take a cheaper path (2 mixes instead of 7), and boxes without a gradient never pay for the gradient code. `maxGradientStops: 3` also makes every gradient take the cheap path (extra stops are dropped). Shadows with `blur: 0` skip the Gaussian and cost two SDF evaluations.

### Replaying a frame

`batch.canReplay` / `batch.replay()` draw the previous finished frame again without rebuilding or re-uploading it (the frame must not have been split by a capacity or explicit flush). `@implicit-invocation/three-ui` uses it for UIs that did not change.

### Flush rules & counters

A batch starts a new segment (draw call) when every texture slot is taken, or on a blend change or — in scissor mode — a clip change; it submits on `end()`, `flush()` or capacity exhaustion. `batch.stats` exposes `sprites`, `boxes`, `shadows`, `flushes`, `drawCalls`, `renderPasses`, `glyphs`, `clipChanges`, `textureSwitches`, `texturesBound`, `backdropCopies`, `backdropPasses`. Solid fills, boxes and shadows never force a texture switch (a segment that holds only those even adopts the first textured quad's texture).

## Runtime support

| Target | Status |
| --- | --- |
| Browser + `WebGPURenderer` (WebGPU) | ✅ |
| Browser + `WebGPURenderer` (WebGL2 backend) | ✅ |
| Browser + classic `WebGLRenderer` + `WebGLNodesHandler` (`three/addons`) | ✅ (output transform, shared-buffer VAOs and scissor origin are handled; translucent layers blend in sRGB space instead of linear — see `@implicit-invocation/three-ui`) |
| React Native + `react-native-wgpu` + Three WebGPU | ✅ by design (no DOM/Canvas2D/`window` anywhere) |

## Resources & disposal

`SpriteBatch`, `BitmapFont`, `TextureAtlas`, `Three2D` expose `dispose()` (idempotent). Textures you pass in stay yours until you dispose them (atlas/font `dispose()` also disposes their textures).

## Examples

- [`examples/three-2d-basic`](../../examples/three-2d-basic) — 20 000-sprite swarm, atlas, animation, particles, nine-patch, viewports, WebGPU/WebGL2.
