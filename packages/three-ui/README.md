# three-ui

Retained-mode **2D UI** for Three.js. Yoga flexbox layout, a computed-style cascade, bitmap-font text, images, nine-patches, `ScrollView`, an input/event system with capture/bubble and pointer capture — painted through [`three-2d`](../three-2d) batches. **No React, no DOM, no Tailwind required.**

> ⚠️ **Alpha (0.x)** — APIs may change before 1.0.

## Install

```bash
bun add three-ui three-2d three
```

**Peer dependencies:** `three`. Depends on `three-2d`. Yoga ships inside the package as a generated, synchronous asm.js build (no WebAssembly, safe for Hermes).

## Usage

```ts
import * as THREE from 'three/webgpu'
import { createThreeUI, View, Text, FontRegistry } from 'three-ui'
import { attachDOMInput } from 'three-ui/web'

const renderer = new THREE.WebGPURenderer(); await renderer.init()
const ui = createThreeUI({ renderer, width: innerWidth, height: innerHeight, pixelRatio: devicePixelRatio })
ui.fonts.register(bitmapFont)               // baked with three-2d-font
attachDOMInput(ui, renderer.domElement)

const root = new View({ style: { flex: 1, backgroundColor: '#09090b', padding: 24, color: '#fff' } })
root.append(new Text({ text: 'three-ui', style: { fontSize: 30, fontWeight: 700 } }))
ui.setRoot(root)

renderer.setAnimationLoop((t) => { ui.update(dt); ui.render() })   // you own the loop
```

### Pipeline

```
Style + inheritance + className + state ─▶ ComputedStyle ─▶ Yoga (geometry) ─▶ LayoutRect ─▶ paint commands ─▶ three-2d batches ─▶ Three.js
```

`ComputedStyle` is authoritative; Yoga nodes are never exposed. Precedence: component defaults < parent (inherited text props) < theme < `className` < `style`.

### Nodes

`View`, `Text`, `Image`, `AnimatedImage`, `NinePatchView`, `ScrollView` — plain objects, **not** `Object3D`. A tree of thousands of nodes renders through a few meshes.

### Invalidation

Dirty flags (`STYLE_DIRTY`, `TEXT_DIRTY`, …): paint-only changes never touch Yoga; layout changes relayout once; inherited changes recompute descendants only. `ui.stats` exposes `nodes`, `layoutPasses`, `styleRecomputes`, `paintOps`, `drawCalls`, `glyphs`, `clipChanges`, culling counts.

### Input

Hit testing honors clips, scroll offsets, transforms and `pointerEvents`. `ui.input.pointerDown/Move/Up/wheel/keyDown…` feed any platform; `three-ui/web` adapts DOM events (the only DOM-aware file). Hover/pressed/focused/disabled state drives `hover:`/`active:`/`focus:`/`disabled:` class variants.

### Yoga runtime portability

`yoga-layout@3` ships WebAssembly only. `three-ui` instead bundles an asm.js build generated from the **same Yoga release** (`bun run build:yoga-asm`: wasm → binaryen `wasm2js` + patched Emscripten glue). Initialization is synchronous. A WASM binding can be plugged in with `setYogaRuntime(YogaFromYogaLayout)`.

## Runtime support

| Target | Status |
| --- | --- |
| Browser (WebGPU / WebGL2) | ✅ |
| React Native + WebGPU | ✅ by design — no `WebAssembly`, DOM or Canvas2D dependency (Yoga parity is tested with `WebAssembly` deleted) |
| Node / Bun (headless layout, tests) | ✅ |

## Resources & disposal

`UINode.dispose()` frees the node's Yoga node (idempotent); `ThreeUI.dispose()` disposes the tree and batch. Fonts and textures you register remain yours.

## Examples

- [`examples/three-ui-basic`](../../examples/three-ui-basic) — plain API: layout, text inheritance, images, clipping, ScrollView, hover/press via listeners.
- [`examples/three-ui-tailwind-vite`](../../examples/three-ui-tailwind-vite) — full showcase.
