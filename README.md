# three-2d · three-ui

A portable **2D / UI stack on Three.js**, running anywhere Three's WebGPU renderer runs: browsers (WebGPU or the WebGL2 backend) and React Native (`react-native-wgpu`).

> Tailwind produces styles. Yoga produces geometry. `three-ui` produces paint commands. `three-2d` produces triangles. Three.js produces GPU work.

```
                      ┌────────────────────────────── React (optional) ───────────────────────────────┐
 className ─▶ three-ui-tailwind ─┐                                                                       │
 style ─────────────────────────┼─▶ ComputedStyle ─▶ Yoga ─▶ LayoutRect ─▶ paint commands ─▶ three-2d ─▶ Three.js
                                 │        (three-ui)         (three-ui)     (three-ui)      SpriteBatch   WebGPU/WebGL2
 three-ui-react (reconciler) ────┘
```

| Package | What it is |
| --- | --- |
| [`three-2d`](packages/three-2d) | Batched 2D primitives: `SpriteBatch`, atlases, nine-patch, bitmap fonts, animation, particles, viewports. TSL material, no renderer ownership. |
| [`three-2d-font`](packages/three-2d-font) | TTF/OTF → bitmap-font atlas: parser, Three/CPU rasterizers, atlas packer, CLI. |
| [`three-ui`](packages/three-ui) | Retained-mode UI: Yoga flexbox (asm.js, Hermes-safe), computed styles, text, images, `ScrollView`, input/events. No React/DOM/Tailwind. |
| [`three-ui-react`](packages/three-ui-react) | `react-reconciler` (mutation mode) renderer for `three-ui`. |
| [`three-ui-tailwind`](packages/three-ui-tailwind) | Tailwind v4 classes → three-ui style data at build time (Vite + Metro). No runtime CSS parsing. |

## Try it

```bash
bun install
bun run build:packages
bun run dev            # all example sites in parallel
```

| Example | Port | What it shows |
| --- | --- | --- |
| [`three-ui-tailwind-vite`](examples/three-ui-tailwind-vite) | 5174 | **Flagship showcase**: React + Tailwind v4 — layout lab, typography, interaction states, scrolling, images/effects, counters & stress test, dark mode, responsive sidebar. |
| [`three-ui-react-vite`](examples/three-ui-react-vite) | 5173 | React with style objects: state → mutation, keyed lists, event propagation, big lists. |
| [`three-ui-basic`](examples/three-ui-basic) | 5172 | The plain (non-React) API: layout, text inheritance, images, clipping, ScrollView, theme toggle. |
| [`three-2d-basic`](examples/three-2d-basic) | 5171 | 20 000-sprite batches, atlas, animation, particles, nine-patch, polygons, blend modes, viewports. |
| [`three-ui-react-native-webgpu`](examples/three-ui-react-native-webgpu) | — | Expo + `react-native-wgpu` portability gate (Metro, no Vite). |

Append `?webgl` to any web example URL to force the WebGL2 backend. Press <kbd>Tab</kbd> to move focus.

## Quick start (React + Tailwind)

```tsx
import 'virtual:three-ui-tailwind/register'
import * as THREE from 'three/webgpu'
import { createThreeUI } from 'three-ui'
import { createThreeUIRoot, View, Text, ScrollView } from 'three-ui-react'

const renderer = new THREE.WebGPURenderer({ antialias: true })
await renderer.init()

const ui = createThreeUI({ renderer, width: innerWidth, height: innerHeight, pixelRatio: devicePixelRatio })
ui.fonts.register(bitmapFont)                       // baked with three-2d-font

createThreeUIRoot(ui).render(
  <View className="flex-1 bg-zinc-950 p-6 gap-4 text-white">
    <Text className="text-3xl font-bold">three-ui</Text>
    <ScrollView className="flex-1 rounded-xl bg-zinc-900 p-4">
      <View className="flex-row items-center gap-3 p-3 rounded-lg hover:bg-zinc-800"><Text>Hello</Text></View>
    </ScrollView>
  </View>,
)

renderer.setAnimationLoop(() => { ui.update(1 / 60); ui.render() })   // the app owns the frame loop
```

## Repository

```
packages/  three-2d · three-2d-font · three-ui · three-ui-react · three-ui-tailwind
examples/  five example apps (+ shared helpers)
scripts/   export / boundary checks · pack smoke test · publish · Yoga asm.js generator · font baker
test/      fixtures (layout goldens, Inter fonts + baked atlases) · clean-room package consumer
```

Commands (Bun is the workspace runner; libraries are built with **Vite library mode**):

```bash
bun run build:packages   # vite build + tsc declarations for every package
bun run typecheck && bun run test
bun run check            # typecheck + tests + build + export & boundary checks
bun run pack:smoke       # bun pm pack → tarball manifest checks → clean-room install → import every entry
bun run changeset        # release intent (publish is done by scripts/publish-packages.ts, never automatically)
```

### Architecture invariants (enforced by `bun run check:boundaries`)

No one-Three-object-per-UI-node · no React in `three-ui` · no Tailwind in `three-ui` · no DOM / Canvas2D in core packages · no renderer ownership in `three-2d` · no runtime CSS parsing · Yoga nodes are never public API · no browser `WebAssembly` for Yoga · reconciler code only in `three-ui-react/src/renderer`.

## Status & notes

Everything is **alpha (0.x)**. Rendering was verified in headless Chrome on both the WebGPU and the WebGL2 backends; the React Native example is scaffolded but has not been run on a device from this repo's CI. See [CONTRIBUTING.md](CONTRIBUTING.md) for the release workflow and the npm name caveat (`three-ui` is already taken on the public registry).

MIT licensed. Yoga (MIT, Meta) is bundled in `three-ui` — see its `THIRD_PARTY_NOTICES.md`. Example fonts: Inter (SIL OFL 1.1).
