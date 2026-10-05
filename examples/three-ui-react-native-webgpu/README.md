# three-ui-react-native-webgpu

The **portability gate** (spec milestone 7): the same stack on **React Native** with [`react-native-webgpu`](https://github.com/wcandillon/react-native-webgpu) and Three's WebGPU renderer. Bundled by **Metro/Expo** — not Vite (the *libraries* are still built with Vite and consumed through their `exports`).

It renders: a Three WebGPU canvas/context · one batched sprite (`@implicit-invocation/three-2d`) · a Yoga UI tree (asm.js — Hermes has no `WebAssembly`) · the React renderer · `Text` (bitmap font baked **on the device** with the pure-JS rasterizer, so no image decoding is needed) · `Image` · a `ScrollView` · touch input (RN responder events → `ui.input.pointerDown/Move/Up`). Tailwind arrives with the Metro adapter (`@implicit-invocation/three-ui-tailwind/metro`, see the commented lines in `metro.config.js`); this example starts on `style` objects so graphics/layout validation isn't blocked by it.

## Run

```bash
bun install
bun run build:packages          # libraries are consumed from dist/ through their export maps
cd examples/three-ui-react-native-webgpu
bunx expo prebuild              # react-native-webgpu is a native module: a dev build, not Expo Go
bunx expo run:ios               # or: bunx expo run:android
```

## What was verified (and what wasn't)

| Check | Result |
| --- | --- |
| `bun run typecheck` | ✅ |
| `expo export --platform ios` (Metro) | ✅ 614 modules bundled; every workspace package resolved through `exports` (`unstable_enablePackageExports` + `react-native` condition first) |
| Hermes bytecode compile (`hermesc`, run by `expo export`) | ✅ — all library code, including the generated asm.js Yoga and `three/webgpu`, is valid Hermes syntax (no top-level `await`, no `import.meta`) |
| `@implicit-invocation/three-ui` Yoga under a runtime **without** `WebAssembly` | ✅ unit test (`packages/three-ui/test/yoga.test.ts`) with the global deleted; layouts identical to the WASM binding |
| Running on an iOS simulator / Android emulator / device | ⚠️ **not run from this repository's tooling** — treat the first device run as the real gate and fix findings below the `@implicit-invocation/three-ui` API boundary |

## React version constraint (important)

React Native bundles a renderer built for one exact React version (**19.2.3** for RN 0.86/0.87, which is also what Expo SDK 57
pins). `react` must match it, so this app depends on `react@19.2.3` / `react-native@0.86.3` instead of the catalog's
`react ^19.3.0`. `@implicit-invocation/three-ui-react` is built against React 19.3 + `react-reconciler` 0.34 (the spec baseline) and declares
`react: ^19.3.0`, so on RN it currently runs *outside its declared peer range*. Until React Native ships React ≥ 19.3
either (a) accept the peer warning and test thoroughly, or (b) publish a build of `@implicit-invocation/three-ui-react` against
`react-reconciler` 0.33 for RN. `metro.config.js` forces a single `react` copy for the whole bundle (workspace packages
otherwise resolve their own).

## Other notes

- `react-native-webgpu` (formerly `react-native-wgpu`) provides `navigator.gpu` and a canvas with the DOM stubs Three needs.
  Call `context.present()` after rendering every frame (the render loop does).
- The font TTF is loaded through Metro as an asset (`expo-asset`) from `test/fixtures/fonts` (Inter, SIL OFL).
