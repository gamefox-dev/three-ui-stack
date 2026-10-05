# three-2d / three-ui Monorepo Implementation Spec

**Status:** Initial implementation specification  
**Audience:** Coding agents and maintainers  
**Date:** 2026-10-05  
**Primary goal:** Scaffold and implement the first vertical slice of a portable 2D/UI stack built on Three.js, with browser WebGL2/WebGPU and React Native WebGPU as first-class runtime targets.

---

## 1. Project summary

Build a TypeScript monorepo containing the following public libraries:

- `three-2d` — libGDX-inspired 2D rendering primitives on top of Three.js.
- `three-2d-font` — optional TTF/OTF -> bitmap-font atlas tooling/runtime packer on top of Three.js.
- `three-ui` — retained-mode 2D UI system built on `three-2d`, with Yoga as the required layout engine.
- `three-ui-react` — React renderer for `three-ui` using `react-reconciler` mutation mode.
- `three-ui-tailwind` — Tailwind CSS v4 authoring integration for `three-ui-react`, compiling class names to `three-ui` style data rather than DOM CSS.

The project must run anywhere the supported Three.js rendering path runs, with these initial targets:

1. Browser + Three `WebGPURenderer` using WebGPU.
2. Browser + Three WebGPU renderer fallback / WebGL2 path.
3. React Native + `react-native-webgpu` + Three WebGPU renderer.

The architecture must preserve these boundaries:

> Tailwind produces styles. Yoga produces geometry. `three-ui` produces paint commands. `three-2d` produces triangles. Three.js produces GPU work.

React must never be required by `three-ui`, and UI nodes must never be modeled as one-Three-object-per-view.

---

## 2. Non-negotiable architectural decisions

### 2.1 Three.js is the rendering substrate

Use Three.js for:

- math types where practical;
- textures;
- cameras;
- buffer geometry;
- meshes;
- render targets;
- TSL / NodeMaterial shader authoring;
- renderer/backend portability.

Do **not** make public `three-ui` components subclass `THREE.Object3D`.

A UI tree may contain thousands of nodes while rendering through a small number of Three meshes/batches.

### 2.2 `three-2d` is immediate/batched, not scene-node-per-sprite

The primary rendering primitive is a sprite/polygon batch.

Target shape:

```ts
batch.begin(camera)
batch.draw(texture, x, y, width, height)
font.draw(batch, 'Hello', x, y)
batch.end()
```

Internally, prefer a small stable set of Three `Mesh` + `BufferGeometry` objects backed by dynamic typed-array buffers.

Batch flush reasons include:

- texture/material state change;
- blend state change;
- clip/scissor state change;
- geometry capacity exhaustion;
- explicit flush.

### 2.3 TSL first

Portable custom GPU behavior must use Three's TSL/NodeMaterial path, not `ShaderMaterial` as the primary implementation.

Do not create separate WebGL shader and WebGPU shader code paths unless a proven blocker requires it.

### 2.4 Yoga is mandatory in `three-ui`

`three-ui` is not layout-engine-agnostic at the product level. Flexbox semantics are Yoga semantics.

However, do not expose Yoga node instances as public API or use Yoga nodes as the source of truth for styles.

Required flow:

```text
Raw style + inheritance + class styles + state variants
                    |
                    v
             ComputedStyle
                    |
                    v
              sync to Yoga
                    |
                    v
          Yoga.calculateLayout()
                    |
                    v
               LayoutRect
```

`ComputedStyle` is authoritative; Yoga is the geometry calculator.

### 2.5 Yoga runtime portability must be explicit

The normal `yoga-layout` JavaScript package currently uses WebAssembly for its modern fast path. Hermes does not provide a normal browser-style `WebAssembly` global, so the React Native target must not accidentally depend on browser WASM.

Create an internal Yoga runtime adapter from day one.

The UI API remains Yoga-specific, but the binary/runtime binding is isolated.

Required internal abstraction:

```ts
export interface YogaRuntime {
  readonly Node: YogaNodeFactory
  readonly Config: YogaConfigFactory
  // enums/constants used by the style adapter
}
```

Implementation policy:

1. Prefer an official Yoga asm.js/synchronous entry when available and compatible with current Yoga.
2. If the currently installed Yoga release does not expose a React-Native-safe asm.js entry, generate/vendor an asm.js build from the same Yoga source version used by the web binding.
3. Keep the generated artifact and license notice in the repository, plus a reproducible generation script.
4. Do not depend on a many-years-old third-party Yoga fork merely to obtain asm.js.
5. A browser-only optional WASM backend may be added later, but the public UI API must not require async initialization merely for layout.

Before implementing higher-level UI components, create a smoke test proving identical basic Yoga results in Node/browser and the React Native Hermes test app.

### 2.6 React is an adapter only

`three-ui` must work without React:

```ts
const root = new View()
root.append(new Text({ text: 'Hello' }))
ui.setRoot(root)
```

`three-ui-react` maps React host elements to this mutable tree.

Use React reconciler mutation mode.

All reconciler-specific code must stay inside `three-ui-react`.

### 2.7 Tailwind is an authoring/compiler layer, not a core dependency

`three-ui` must have no Tailwind dependency.

`three-ui-react` should always accept a `className?: string` prop, but resolving class names is delegated to an installed style resolver.

Without a resolver, development builds should warn if a non-empty `className` is supplied.

`three-ui-tailwind` supplies the Tailwind resolver/compiler.

### 2.8 ESM-only packages

Publish ESM only for the initial release.

Do not add CommonJS output unless a concrete supported target requires it.

All package `package.json` files use:

```json
{
  "type": "module"
}
```

---

## 3. Baseline toolchain

Use these as the initial compatibility baseline. Keep versions centralized in the root workspace configuration/catalog where supported.

- Bun: `>=1.4.2`; pin the exact repository version in `packageManager` and CI
- Node.js: not required for normal workspace operations; Bun is the canonical runtime for repository scripts, while published ESM should remain Node-compatible where practical
- TypeScript: current stable compatible with the selected Vite release
- Runtime/package manager/workspace runner: Bun workspaces
- Vite: v8.x
- Vitest: matching current Vite generation
- Three.js: `^0.186.1`
- React: `^19.3.0`
- `react-reconciler`: `0.34.x`, pinned carefully to the chosen React version
- Yoga: current `yoga-layout` release, initially `3.2.1`
- Tailwind CSS: v4 only, initially `^4.3.3`
- `@tailwindcss/node`: same Tailwind version line
- `@tailwindcss/vite`: same Tailwind version line
- `opentype.js`: current stable release selected during implementation
- Changesets: current stable `@changesets/cli`

Do not scatter version numbers across examples. Prefer a root version policy; Bun catalogs may be used for shared third-party versions when useful. Keep the Bun version pinned in CI and documented in the root `packageManager` field.

---

## 4. Repository layout

Scaffold this shape:

```text
/
├─ package.json
├─ bun.lock
├─ tsconfig.base.json
├─ tsconfig.json
├─ vite.shared.ts
├─ vitest.workspace.ts
├─ eslint.config.js              # optional if linting is implemented in milestone 1
├─ .editorconfig
├─ .gitignore
├─ LICENSE
├─ README.md
├─ CONTRIBUTING.md
├─ .changeset/
│  └─ config.json
├─ scripts/
│  ├─ check-package-exports.ts
│  ├─ check-package-boundaries.ts
│  ├─ pack-smoke-test.ts
│  ├─ publish-packages.ts
│  └─ build-yoga-asm.ts         # only if generated asm.js is required
├─ packages/
│  ├─ three-2d/
│  ├─ three-2d-font/
│  ├─ three-ui/
│  ├─ three-ui-react/
│  └─ three-ui-tailwind/
├─ examples/
│  ├─ three-2d-basic/
│  ├─ three-ui-basic/
│  ├─ three-ui-react-vite/
│  ├─ three-ui-tailwind-vite/
│  └─ three-ui-react-native-webgpu/
└─ test/
   ├─ fixtures/
   └─ package-consumer/
```

The examples are private workspace packages and are never published.

---

## 5. Public package dependency graph

Required dependency direction:

```text
three
  ^
  |
three-2d <-------- three-2d-font
  ^                    |
  |                    |
three-ui --------------+
  ^
  |
three-ui-react <----- three-ui-tailwind runtime integration
```

More precisely:

```text
three-2d
  peer: three

three-2d-font
  deps: three-2d, opentype.js
  peer: three

three-ui
  deps: three-2d, Yoga runtime/binding
  peer: three

three-ui-react
  deps: three-ui, react-reconciler
  peer: react, three

three-ui-tailwind
  deps/runtime: three-ui, optional glue for three-ui-react
  dev/build deps: tailwindcss, @tailwindcss/node, Vite integration package(s)
  peer: tailwindcss ^4, three-ui, optionally three-ui-react
```

Rules:

- `three-2d` never imports `three-ui`.
- `three-ui` never imports React.
- `three-ui-react` never implements layout or painting logic that belongs in `three-ui`.
- `three-ui-tailwind` never mutates core node internals directly; it only resolves styles/variants through public or explicitly internal style resolver contracts.
- examples may import any public package.

Add a simple boundary-check script if useful; even a static import scan is acceptable initially.

---

## 6. Root Bun workspace configuration and scripts

The root `package.json` is the workspace manifest. Do not create a separate workspace manifest or a lockfile from another package manager. Commit `bun.lock`.

Minimum workspace shape:

```json
{
  "name": "three-2d-monorepo",
  "private": true,
  "packageManager": "bun@<pinned-version>",
  "workspaces": [
    "packages/*",
    "examples/*"
  ]
}
```

Bun's `workspace:` protocol must be used for dependencies between packages in this repository, for example `"three-2d": "workspace:^"`. Bun workspaces and `--filter` are the canonical way to run package scripts.

Root `package.json` should expose at least:

```json
{
  "scripts": {
    "dev": "bun run --parallel --filter './examples/*' dev",
    "build": "bun run build:packages && bun run --filter './examples/*' build",
    "build:packages": "bun run --filter './packages/*' build",
    "typecheck": "bun run --filter './packages/*' --filter './examples/*' --if-present typecheck",
    "test": "vitest --run",
    "test:watch": "vitest",
    "lint": "bun run --filter './packages/*' --filter './examples/*' --if-present lint",
    "check": "bun run typecheck && bun run test && bun run build:packages && bun run check:exports",
    "check:exports": "bun scripts/check-package-exports.ts",
    "pack:smoke": "bun scripts/pack-smoke-test.ts",
    "changeset": "changeset",
    "version-packages": "changeset version && bun install --lockfile-only",
    "release": "bun run check && bun run pack:smoke && bun scripts/publish-packages.ts",
    "release:next": "bun run check && bun run pack:smoke && bun scripts/publish-packages.ts --tag next"
  }
}
```

Exact spelling can vary, but preserve the behavior. Bun currently supports running scripts across workspaces with `--filter`, and dependency relations may be used where useful to ensure build order.

Important release rules:

- `release` must build/test the exact publishable package state before publishing.
- Do **not** use `changeset publish` as the repository's publish implementation. Keep Changesets for change intent, semver calculation, and changelogs; use a Bun-aware publish script for registry publication.
- `scripts/publish-packages.ts` must publish public packages in workspace dependency order and must use `bun publish` or tarballs produced through a Bun-safe staging path.
- Before publishing, normalize every internal `workspace:` range to the version/range that will appear in the registry manifest. The smoke test must inspect the packed `package.json` and fail if any `workspace:` or `catalog:` token remains.
- `prepack` in every public package must run the package build or verify that `dist` is current.
- published tarballs must never contain source maps that embed absolute local paths.

---

## 7. Shared Vite library build

All public packages must use Vite library mode. Bun is the runtime/package manager/workspace orchestrator; **do not replace Vite library builds with `Bun.build`**.

Create a root helper, e.g. `vite.shared.ts`, so packages do not copy/paste build policy. Each public package should expose `"build": "vite build"` (plus its declaration-generation step if separate), and root Bun scripts should orchestrate those package-level Vite builds.

Target helper API:

```ts
export function defineLibraryConfig(options: {
  entries: Record<string, string>
  external: (string | RegExp)[]
  dts?: boolean
  target?: string
})
```

The helper should configure:

- `build.lib` with explicit entry points;
- ESM-only output;
- source maps;
- no minification for library packages by default;
- dependency externalization;
- Vite 8 `build.rolldownOptions`, not the deprecated `rollupOptions` alias;
- deterministic filenames;
- declaration generation, preferably using a Vite-compatible DTS plugin or a post-build declaration step invoked by the Vite build script;
- `emptyOutDir: true`;
- modern JS target suitable for current browsers, Metro, and React Native.

Example package config:

```ts
import { resolve } from 'node:path'
import { defineLibraryConfig } from '../../vite.shared'

export default defineLibraryConfig({
  entries: {
    index: resolve(import.meta.dirname, 'src/index.ts'),
  },
  external: ['three'],
})
```

Do not bundle these into public library output:

- `three`;
- React;
- React reconciler peers where appropriate;
- workspace public packages;
- Tailwind compiler dependencies into runtime code;
- Yoga binary/runtime artifacts unless intentionally packaged by `three-ui`.

### 7.1 Build output shape

Default:

```text
dist/
├─ index.js
├─ index.js.map
└─ index.d.ts
```

Multiple public subpaths become additional explicit Vite entries.

Avoid exposing arbitrary internal file paths from `dist`.

### 7.2 Package export maps

Every public package must use explicit `exports`.

Minimal shape:

```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "sideEffects": false
}
```

Only add `sideEffects: false` if package initialization truly has no required side effects. Tailwind compiler/plugin entry points may need more specific side-effect metadata.

### 7.3 React Native conditions

If a package needs runtime-specific entry points, publish explicit conditions, for example:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "react-native": "./dist/index.native.js",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```

Do not add a native entry until there is a real implementation difference.

The React Native example must verify Metro resolves the intended export condition.

---

## 8. `three-2d` package

### 8.1 Scope

`three-2d` contains runtime 2D graphics primitives only.

Initial public surface:

```text
TextureRegion
TextureAtlas
Animation<T>
Sprite
SpriteBatch
PolygonSpriteBatch
BitmapFont
BitmapFontData
GlyphLayout
NinePatch
ParticleEffect
ParticleEmitter
OrthographicCamera helpers
Viewport
FitViewport
FillViewport
ExtendViewport
ScreenViewport
```

Not all features need full implementation in milestone 1, but public folders/types should follow this shape.

### 8.2 MVP implementation priority

Implement in this order:

1. `TextureRegion`
2. `TextureAtlas` data model
3. orthographic camera/viewport helper
4. `SpriteBatch`
5. tint/color
6. transforms
7. blend modes
8. scissor/clip state
9. `BitmapFont` rendering from prebuilt atlas data
10. `NinePatch`
11. `Animation<T>`
12. `PolygonSpriteBatch`
13. particles

### 8.3 SpriteBatch design

Use a dynamic geometry buffer.

Suggested vertex attributes:

```ts
position: vec3
uv: vec2
color: packed/unpacked normalized color
```

The exact representation may change after profiling.

Start with indexed quads, 4 vertices + 6 indices per sprite.

Avoid per-draw object allocation in hot paths.

Required public concepts:

```ts
interface BatchDrawOptions {
  x: number
  y: number
  width: number
  height: number
  originX?: number
  originY?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  color?: ColorLike
}
```

The batch owns its Three mesh/geometry and may be attached to a caller-owned scene, or expose a render method that safely integrates with a caller-owned renderer/scene.

Do not instantiate the Three renderer inside `three-2d`.

### 8.4 Renderer ownership

Caller owns renderer lifecycle.

Preferred integration shape:

```ts
const renderer = new THREE.WebGPURenderer({ ... })
const graphics = new Three2D({ renderer })

// app controls frame loop
world.render()
graphics.render()
```

`three-2d` may own an internal scene/camera if useful, but must not own the renderer or animation loop.

### 8.5 Resource disposal

Every GPU-owning runtime type must expose `dispose()` where relevant.

Tests must cover idempotent disposal.

No hidden permanent event listeners.

---

## 9. `three-2d-font` package

### 9.1 Purpose

Keep TTF/OTF parsing and runtime/build-time font baking out of the core `three-2d` install path.

This package converts font bytes into assets compatible with `three-2d`'s `BitmapFont` runtime.

### 9.2 Required architecture

```text
TTF/OTF ArrayBuffer
      |
      v
FontParser
      |
      v
ParsedFont / glyph outlines / metrics
      |
      v
GlyphRasterizer
      |
      v
AtlasPacker
      |
      +--> THREE.Texture (runtime)
      |
      +--> PNG + JSON (CLI/build-time)
```

Required interfaces:

```ts
export interface FontParser {
  parse(data: ArrayBuffer): ParsedFont
}

export interface GlyphRasterizer {
  rasterize(
    font: ParsedFont,
    glyphs: readonly GlyphRequest[],
    options: RasterizeOptions,
  ): Promise<readonly RasterizedGlyph[]>
}
```

### 9.3 OpenType.js usage

Use `opentype.js` as an implementation detail for parsing bytes and retrieving glyph paths/metrics.

Do not expose OpenType.js objects in the public API.

Do not rely on:

- `opentype.load(url)`;
- DOM `Image`;
- `document`;
- `CanvasRenderingContext2D` as the portable default.

Portable input is `ArrayBuffer`.

### 9.4 Three-based glyph rasterizer

Default portable rasterizer should be Three-based.

Translate OpenType path commands to Three path/shape primitives, then rasterize glyphs into a Three render target.

MVP bitmap mode:

- render at configurable supersampling scale, default 4x;
- downsample to atlas resolution;
- preserve transparent background;
- record exact glyph bounds/advance/bearings.

Future modes:

```ts
type BitmapFontMode = 'bitmap' | 'sdf' | 'msdf'
```

Only `bitmap` is required initially.

### 9.5 Glyph identity

Store atlas entries by font glyph ID, not only Unicode code point.

This is necessary for future shaping/ligatures.

### 9.6 CLI

Expose a package binary:

```bash
three-2d-font pack ./Inter-Regular.ttf \
  --size 32 \
  --charset latin \
  --output ./assets/inter-32
```

Output:

```text
inter-32.png
inter-32.json
```

The JSON schema must be versioned:

```json
{
  "format": "three-2d-bitmap-font",
  "version": 1
}
```

### 9.7 Runtime API

Provide:

```ts
const packed = await packBitmapFont(fontBytes, {
  renderer,
  size: 32,
  characters: '...',
})
```

Runtime packing is optional for consumers; the build-time CLI is the recommended production path.

---

## 10. `three-ui` package

### 10.1 Scope

Retained-mode UI engine independent of React.

Initial node classes:

```text
UINode
View
Text
Image
AnimatedImage
NinePatchView
ScrollView
```

Potential later nodes are not part of v0.1 unless needed by examples.

### 10.2 Core tree API

Target shape:

```ts
abstract class UINode {
  readonly children: readonly UINode[]
  parent: UINode | null

  style: Style
  readonly computedStyle: ComputedStyle
  readonly layout: LayoutRect

  append(child: UINode): void
  insert(child: UINode, index: number): void
  remove(child: UINode): void
  setStyle(style: Style | null): void
  dispose(): void
}
```

Internally nodes own exactly one Yoga node each where meaningful.

Yoga node lifetime follows UI node lifetime and must be freed.

### 10.3 Style model

React-Native-like object syntax, but with inheritance/cascade for selected properties.

Example:

```ts
{
  flex: 1,
  flexDirection: 'row',
  padding: 16,
  backgroundColor: '#18181b',
  color: '#fff',
  fontSize: 16,
}
```

Separate property categories:

#### Yoga/layout properties

- display
- width/height
- min/max dimensions
- flex/flexGrow/flexShrink/flexBasis
- flexDirection
- flexWrap
- alignItems/alignSelf/alignContent
- justifyContent
- gap/rowGap/columnGap
- margin/padding
- position/top/right/bottom/left
- aspectRatio
- overflow where supported by UI semantics

#### Paint properties

- backgroundColor
- opacity
- border width/color/radius
- image tint
- overflow/clipping
- transform
- zIndex / paint ordering policy

#### Inherited text properties

At minimum:

- color
- fontFamily
- fontSize
- fontWeight
- fontStyle
- lineHeight
- letterSpacing
- textAlign when semantically valid

Do **not** inherit layout spacing or size properties.

### 10.4 Style precedence

Lock this precedence:

```text
component defaults
      <
parent inherited values
      <
theme/default stylesheet
      <
className-resolved styles
      <
style prop / direct style
```

Interaction/responsive variants are applied within the class/style layer according to their rule order.

Inline/direct `style` wins over `className` for the same property.

### 10.5 Computed style invalidation

Use dirty flags; do not recompute the full tree on every frame.

Suggested flags:

```text
STYLE_DIRTY
LAYOUT_DIRTY
PAINT_DIRTY
TEXT_DIRTY
CHILD_ORDER_DIRTY
```

An inherited property change invalidates descendants that depend on inheritance.

A layout property change marks the relevant Yoga node dirty and schedules layout.

A paint-only property change does not force Yoga layout.

### 10.6 Measurement

Leaf nodes use Yoga measure functions.

`Text` measure callback delegates to text layout.

`Image` uses intrinsic source dimensions/aspect ratio when width/height are not fully constrained.

`NinePatchView` may expose minimum intrinsic dimensions from patch metadata.

Text measurement must be deterministic and cacheable by:

- text;
- font identity;
- font size/style;
- width constraint;
- wrapping/alignment options.

### 10.7 Painting API

Do not let every component directly manipulate SpriteBatch state.

Create a logical painter/context:

```ts
interface UIDrawContext {
  rect(rect: Rect, style: RectPaint): void
  image(region: TextureRegion, rect: Rect, style?: ImagePaint): void
  ninePatch(patch: NinePatch, rect: Rect, style?: NinePatchPaint): void
  text(layout: GlyphLayout, x: number, y: number, style?: TextPaint): void

  pushClip(rect: Rect): void
  popClip(): void

  pushTransform(transform: Matrix3): void
  popTransform(): void
}
```

The concrete painter translates operations to one or more `three-2d` batches.

### 10.8 Clip model

Start with axis-aligned rectangular clipping using renderer scissor where possible.

Nested clips intersect.

Do not implement arbitrary stencil masks in milestone 1.

### 10.9 Input/event model

Input is owned by `three-ui`, not React.

Normalize platform input into internal events:

```text
UIPointerEvent
UIWheelEvent
UIKeyEvent
UIFocusEvent
```

Support:

- hit testing;
- capture phase;
- target;
- bubble phase;
- stop propagation;
- pointer capture;
- hovered/pressed/focused/disabled state.

The React package only maps handlers to this event system.

### 10.10 ScrollView

`ScrollView` is a required architecture validation component.

Initial required behavior:

- vertical scrolling;
- clipping;
- pointer/touch drag;
- wheel on browser;
- bounded offset;
- basic inertia;
- content size derived from Yoga layout.

Horizontal and nested scrolling may follow after the basic vertical implementation.

Do not use DOM scroll containers.

### 10.11 Theme/environment

Create a root environment object:

```ts
interface UIEnvironment {
  viewport: {
    width: number
    height: number
    pixelRatio: number
  }
  colorScheme: 'light' | 'dark'
  theme: string
  platform: 'web' | 'native' | string
}
```

Changes to environment selectively invalidate variant/style resolution.

---

## 11. `three-ui-react` package

### 11.1 Goal

Provide React host components that render into `three-ui` nodes.

Public API target:

```tsx
import {
  createThreeUIRoot,
  View,
  Text,
  Image,
  ScrollView,
} from 'three-ui-react'
```

Possible usage:

```tsx
const root = createThreeUIRoot(uiRoot)
root.render(<App />)
```

Do not require React DOM.

### 11.2 Reconciler strategy

Use mutation mode.

Host config must be isolated under a renderer folder, e.g.:

```text
src/renderer/
├─ hostConfig.ts
├─ reconciler.ts
├─ root.ts
└─ props.ts
```

Never access undocumented fields on React internal handles.

Because `react-reconciler` is experimental, pin/test the React + reconciler pair and centralize all compatibility shims in this package.

### 11.3 Host elements

The initial renderer may represent host types internally using strings/symbols, but public users import typed components.

Mapping:

```text
View          -> three-ui View
Text          -> three-ui Text
Image         -> three-ui Image
AnimatedImage -> three-ui AnimatedImage
NinePatch     -> three-ui NinePatchView
ScrollView    -> three-ui ScrollView
```

### 11.4 Prop rules

Base props include:

```ts
interface CommonProps {
  style?: Style | readonly Style[] | null
  className?: string
  children?: React.ReactNode

  onPointerDown?: (event: UIPointerEvent) => void
  onPointerMove?: (event: UIPointerEvent) => void
  onPointerUp?: (event: UIPointerEvent) => void
  onClick?: (event: UIPointerEvent) => void
}
```

`className` support exists in types even without Tailwind installed.

### 11.5 Text children

Support:

```tsx
<Text>Hello</Text>
```

and nested text only if the core text system explicitly supports it.

For v0.1, it is acceptable to require `Text` children to flatten to a string/number sequence and reject arbitrary `View` descendants.

### 11.6 React update behavior

Prop updates mutate existing nodes where possible.

Do not recreate UI nodes for ordinary style/text changes.

Unmount must detach event handlers and dispose/release node resources correctly.

---

## 12. `three-ui-tailwind` package

### 12.1 Goal

Provide Tailwind CSS v4 authoring semantics for `three-ui-react` without a DOM/CSS runtime.

Example target:

```tsx
<View className="flex-1 flex-row items-center gap-4 bg-zinc-950 p-4">
  <Text className="text-lg font-bold text-white">Hello</Text>
</View>
```

Tailwind classes compile to `three-ui` style rules.

### 12.2 Tailwind version

Support Tailwind CSS v4 only.

Use CSS-first theme configuration:

```css
@import "tailwindcss";
@import "three-ui-tailwind";

@theme {
  --color-primary: #6d5dfc;
  --font-ui: Inter;
  --spacing: 4px;
}
```

### 12.3 Compiler boundary

Do not write a hand-made Tailwind parser.

Use Tailwind's own compiler packages through a small adapter owned by `three-ui-tailwind`.

Preferred build-time dependency is `@tailwindcss/node` or documented Tailwind APIs. Do not import undocumented deep internal files from the Tailwind package.

Compiler flow:

```text
project source
   |
   +--> Tailwind source scanning
   |
   v
Tailwind v4 compiler
   |
   v
generated utilities/rules
   |
   v
three-ui CSS-rule converter
   |
   v
serialized ThreeUI style registry
```

The runtime consumes the registry, not CSS.

### 12.4 Vite integration

Expose:

```ts
import { threeUITailwind } from 'three-ui-tailwind/vite'
```

Example:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { threeUITailwind } from 'three-ui-tailwind/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    threeUITailwind({
      css: './src/theme.css',
    }),
  ],
})
```

The custom plugin may share the Tailwind compiler pipeline rather than requiring generated browser CSS to be shipped.

### 12.5 Metro integration

Expose a planned/required native entry:

```ts
import { withThreeUITailwind } from 'three-ui-tailwind/metro'
```

The Metro adapter must use the same compiler core and serialized registry format as Vite.

Do not create a second Tailwind semantics implementation for native.

If full Metro integration is not completed in milestone 1, scaffold the export and create a failing/skip-marked integration test plus explicit TODO issue. The React Native example must initially be usable without Tailwind so RN graphics/layout validation is not blocked.

### 12.6 Runtime style resolver

Core contract:

```ts
interface ClassNameResolver {
  resolve(
    className: string,
    node: UINode,
    env: UIEnvironment,
  ): ResolvedClassStyle
}
```

`three-ui` or `three-ui-react` exposes registration/injection of a resolver without importing Tailwind.

### 12.7 MVP registry strategy

For v0.1, optimize for correctness before zero-overhead transforms.

Acceptable runtime strategy:

1. build step emits a map from complete utility tokens to compact style rule objects;
2. runtime splits `className` into complete tokens;
3. runtime resolves tokens through precompiled registry lookup;
4. cache final resolutions by `(className, environment state, interaction state)`.

Do not parse CSS at runtime.

Future optimization:

- transform static class strings to numeric style IDs at build time;
- pre-intern common class combinations.

### 12.8 Required utility subset

MVP should support enough utilities to build real examples.

#### Layout

- `flex`, `hidden`
- `flex-row`, `flex-col`, reverse variants if easy
- `flex-1`, `grow`, `shrink`
- `items-*`
- `justify-*`
- `self-*`
- `gap-*`, `gap-x-*`, `gap-y-*`
- width/height/min/max utilities
- `size-*`
- margin/padding axes and individual sides
- `absolute`, `relative`
- inset/top/right/bottom/left
- aspect ratio

#### Paint

- `bg-*`
- `opacity-*`
- border width/color
- rounded radius utilities
- `overflow-hidden`, `overflow-visible`

#### Text

- `text-*` colors
- text sizes
- font weight
- line height
- letter spacing
- text alignment

#### State variants

- `hover:`
- `active:`
- `focus:`
- `disabled:`
- `dark:`

#### Responsive variants

- `sm:`, `md:`, `lg:`, `xl:` based on logical UI viewport width and Tailwind theme breakpoints.

### 12.9 Unsupported utilities

Unsupported CSS concepts must produce a build-time warning in development, not silently emit nonsense.

Examples likely unsupported at first:

- CSS grid;
- table layout;
- floats;
- complex browser filters;
- arbitrary selectors;
- generated pseudo-elements.

Warnings should include source/class where available.

### 12.10 Class ordering and specificity

Do not resolve styles using plain class-string order.

Preserve Tailwind's generated rule ordering/specificity semantics in the compiled registry.

Inline/direct `style` still wins over the class layer.

### 12.11 CSS variables/theme variables

Compile Tailwind theme variables to a `three-ui` theme/variable registry.

Support inherited custom variables in the `three-ui` tree eventually. For v0.1, global/root theme variables are sufficient if subtree scoping would delay the vertical slice.

---

## 13. Examples

Every example must be a real workspace package with its own README and commands.

### 13.1 `examples/three-2d-basic`

Vite browser example, no React.

Demonstrate:

- WebGPU renderer creation;
- clear screen;
- sprite batch with multiple sprites;
- texture atlas region;
- animation;
- prebuilt bitmap font text;
- nine patch if implemented;
- resize handling.

Show draw-call/batch count in a simple debug overlay/log.

### 13.2 `examples/three-ui-basic`

Vite browser example, no React.

Demonstrate:

- `View` tree;
- Yoga row/column layout;
- inherited text color/font size;
- `Image`;
- `Text` measurement;
- clipping;
- basic `ScrollView`.

This proves React is optional.

### 13.3 `examples/three-ui-react-vite`

Vite + React example without Tailwind.

Use `style` objects only.

Demonstrate:

- reconciliation/mutation;
- state updates;
- list insertion/removal;
- event handlers;
- scroll view.

### 13.4 `examples/three-ui-tailwind-vite`

Vite + React + Tailwind v4.

Use the full intended ergonomics:

```tsx
<View className="flex-1 bg-zinc-950 p-6 gap-4">
  <Text className="text-3xl font-bold text-white">three-ui</Text>
  <ScrollView className="flex-1 rounded-xl bg-zinc-900 p-4">
    ...
  </ScrollView>
</View>
```

Must demonstrate:

- layout utilities;
- theme colors;
- inherited text style;
- hover/active;
- dark theme;
- at least one responsive rule.

### 13.5 `examples/three-ui-react-native-webgpu`

Expo/React Native example using `react-native-webgpu` and Three's WebGPU renderer.

Do not force this example through Vite; Metro/Expo is its application bundler. The **libraries themselves** are still built/published via Vite.

Demonstrate first:

- Three WebGPU canvas/context;
- one batched sprite;
- Yoga UI tree;
- React renderer;
- Text and Image;
- touch input.

Then add Tailwind after the Metro adapter is available.

The native example is the portability gate. Browser-only success is not sufficient for declaring the architecture stable.

---

## 14. Testing strategy

### 14.1 Unit tests

Use Vitest for pure logic:

- atlas parsing;
- animation frame selection;
- color packing;
- rectangle packing;
- style cascade;
- style precedence;
- Yoga style mapping;
- layout dirty propagation;
- event propagation;
- Tailwind rule conversion;
- font metadata serialization.

### 14.2 Golden layout tests

Create deterministic Yoga layout fixtures.

Given tree + style JSON, snapshot normalized layout rectangles.

Run the same logical fixtures against the standard web/Node Yoga binding and RN-safe Yoga binding where possible.

### 14.3 Renderer integration tests

Where headless WebGPU/WebGL is impractical, keep renderer tests narrow and run browser smoke tests through a real browser runner.

At minimum validate:

- generated buffer lengths;
- batch flush boundaries;
- UVs;
- draw order;
- clipping state stack;
- resource disposal.

### 14.4 React reconciler tests

Test:

- mount;
- prop update;
- text update;
- child insertion;
- child reorder;
- child removal;
- unmount/disposal;
- event handler replacement.

### 14.5 Package consumer tests

After build, create a clean temporary package and install generated tarballs from `bun pm pack`. The smoke test must inspect each tarball manifest before installation and reject unresolved `workspace:`/`catalog:` references.

Verify imports only from declared package exports.

At minimum test:

```ts
import { SpriteBatch } from 'three-2d'
import { View } from 'three-ui'
import { createThreeUIRoot } from 'three-ui-react'
```

And subpath exports such as:

```ts
import { threeUITailwind } from 'three-ui-tailwind/vite'
```

This catches missing files, incorrect export maps, and accidental workspace-only resolution.

---

## 15. Publish/versioning workflow

Use Changesets for release intent, version calculation, and changelogs. Use Bun for workspace management, packing, and publication.

### 15.1 Development

Contributor adds a changeset for publishable changes:

```bash
bun run changeset
```

### 15.2 Version preparation

Maintainer/CI:

```bash
bun run version-packages
```

This runs `changeset version` and then refreshes Bun's lockfile metadata. Review all generated version/changelog changes before publishing.

### 15.3 Release validation

Before publish:

```bash
bun run check
bun run pack:smoke
```

`pack:smoke` must use `bun pm pack` or the exact same staging logic used by publication, then install the resulting tarballs into a clean consumer fixture.

### 15.4 Bun-aware publication

Publish through the repository script:

```bash
bun run release
```

For prerelease/testing tags:

```bash
bun run release:next
```

`scripts/publish-packages.ts` is required. It must:

1. discover the public workspaces under `packages/*`;
2. read their actual versions from each package manifest;
3. determine internal workspace dependency order;
4. skip private packages;
5. prepare a publishable manifest in which `workspace:` and `catalog:` references are replaced with ordinary semver ranges;
6. run a final package/tarball validation;
7. invoke `bun publish` for each package in dependency order, forwarding `--tag` when supplied;
8. stop on a real publication error instead of hiding failures with blanket `|| true`;
9. optionally skip a version already present on the registry only after explicitly checking that exact name/version.

Do not implement publication through another package manager. Registry publication must ultimately use `bun publish`.

If direct `bun publish` from a workspace is proven to produce the correct manifest for the Bun version pinned by the repository, the staging implementation may be simplified. The correctness test remains mandatory: packed/published manifests must never contain workspace-only protocols.

### 15.5 Workspace dependency ranges

Use Bun's workspace protocol during development, for example:

```json
{
  "dependencies": {
    "three-2d": "workspace:^"
  }
}
```

Published manifests must resolve these to normal semver ranges such as `^0.2.0`.

### 15.6 Package access

If packages are scoped, set `publishConfig.access` appropriately.

If using unscoped names (`three-2d`, etc.), verify npm name availability before the first real publish. Do not silently rename packages during scaffolding; keep logical names and document any publishing-name change separately.

## 16. Package READMEs

Every public package needs a focused README containing:

1. what the package is;
2. install command;
3. peer dependencies;
4. minimal usage;
5. runtime support matrix;
6. disposal/resource notes;
7. links to examples;
8. alpha/API-stability warning until 1.0.

Root README should explain the stack diagram and quick start.

---

## 17. TypeScript conventions

Use strict TypeScript.

Recommended root settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

Adjust only when a proven React Native/Metro incompatibility requires it.

Avoid ambient globals in core packages.

Avoid browser DOM types in `three-2d`, `three-ui`, and shared runtime code unless isolated behind web-specific files.

---

## 18. Runtime/platform constraints

### 18.1 No DOM assumption in core

These packages must not assume `window`, `document`, `HTMLElement`, `Image`, or Canvas2D:

- `three-2d`
- `three-2d-font` portable path
- `three-ui`
- `three-ui-react`

Web adapters may use DOM APIs only for input/canvas attachment where required.

### 18.2 Time/frame source

Do not hardcode `window.requestAnimationFrame` in core libraries.

The application owns the frame loop.

Animation helpers accept elapsed time/time source explicitly.

### 18.3 Asset loading

Core APIs consume already-created Three textures or bytes/ArrayBuffers.

Do not make browser `fetch()` the only asset-loading path.

Examples may provide convenience loaders per platform.

### 18.4 Coordinate system

Choose and document one UI coordinate convention early.

Recommended:

- logical UI origin at top-left;
- +x right;
- +y down;
- logical pixels independent of physical framebuffer DPR;
- conversion to Three camera/world coordinates hidden by viewport/painter.

The same logical layout must render consistently on browser and native.

---

## 19. Performance requirements

Treat these as architectural constraints, not final benchmarks.

### 19.1 Avoid per-frame tree reconstruction

UI is retained mode.

Only React reconciliation or direct user mutations update the UI tree.

### 19.2 Avoid per-sprite Three objects

Sprites/images/text glyphs should normally enter batch buffers.

### 19.3 Avoid runtime Tailwind parsing

No CSS parsing in application runtime.

Class token lookup/cached resolution is acceptable for v0.1.

### 19.4 Avoid avoidable garbage in hot loops

Batch drawing, hit testing, and paint traversal should avoid temporary arrays/objects where straightforward.

### 19.5 Debug counters

Expose optional development counters:

```text
nodes
layout passes
style recomputes
paint operations
sprite batch flushes
draw calls
glyphs drawn
clip changes
```

Use them in examples.

---

## 20. Error handling and developer diagnostics

Development builds should provide actionable errors/warnings for:

- `className` used without a resolver;
- unsupported Tailwind utility;
- invalid UI child type;
- Yoga node use after disposal;
- drawing outside `batch.begin/end` contract;
- missing/disposed textures;
- duplicate parent insertion;
- cyclic node parenting;
- unsupported font table/path feature in the portable font packer;
- React renderer version mismatch if detectable.

Production builds may reduce verbose diagnostics but must not hide fatal invariant errors.

---

## 21. Initial milestones

The coding agent should not attempt the entire product in one pass. Implement vertical slices in this order.

### Milestone 0 — Monorepo and publishing skeleton

Deliver:

- Bun workspace (`package.json#workspaces` + committed `bun.lock`);
- all five public packages scaffolded;
- shared TS config;
- shared Vite library build helper;
- ESM output;
- declarations;
- export maps;
- Changesets config;
- package tarball smoke test;
- minimal READMEs;
- one import/export unit test per package.

Acceptance:

```bash
bun install
bun run build:packages
bun run typecheck
bun run test
bun run pack:smoke
```

all pass from a clean clone.

### Milestone 1 — `three-2d` rendering vertical slice

Deliver:

- TextureRegion;
- basic SpriteBatch;
- TSL material;
- orthographic viewport;
- browser example;
- WebGPU path plus WebGL2-compatible path through Three.

Acceptance:

- render >=1000 sprites from one texture in one batch/draw path where no state change occurs;
- resize works;
- no per-sprite Three object allocation;
- resource disposal test passes.

### Milestone 2 — Yoga + non-React `three-ui`

Deliver:

- portable Yoga runtime adapter;
- RN-safe Yoga strategy validated;
- UINode/View;
- ComputedStyle;
- basic flex row/column layout;
- background painting;
- Image;
- prebuilt bitmap Text measurement/rendering;
- browser non-React example.

Acceptance:

- identical fixture layout between supported Yoga runtime bindings;
- UI tree renders without React;
- inherited `color` and `fontSize` work;
- direct style precedence documented/tested.

### Milestone 3 — React renderer

Deliver:

- mutation reconciler;
- View/Text/Image components;
- updates/unmount;
- pointer event handlers;
- Vite React example.

Acceptance:

- React state update changes existing UI node instead of remounting it;
- list insertion/removal works;
- event callback replacement works;
- reconciler code exists only in `three-ui-react`.

### Milestone 4 — ScrollView and interaction state

Deliver:

- clipping stack;
- hit testing;
- hover/pressed/focus state;
- vertical ScrollView;
- wheel and pointer/touch scrolling;
- inertia.

Acceptance:

- scrolling never paints outside viewport;
- nested child hit testing accounts for scroll offset;
- state changes can invalidate paint/style without unnecessary layout.

### Milestone 5 — Tailwind Vite integration

Deliver:

- Tailwind v4 compiler adapter;
- Vite plugin;
- generated style registry;
- required MVP utility subset;
- `hover`, `active`, `dark`, responsive variants;
- Tailwind Vite example.

Acceptance:

- no runtime CSS parser;
- inline `style` beats `className`;
- Tailwind rule ordering is deterministic;
- unsupported utilities warn at build/dev time.

### Milestone 6 — Font packer

Deliver:

- OpenType.js parser adapter;
- Three glyph rasterizer;
- atlas packing;
- JSON format v1;
- CLI;
- runtime packing API;
- prebuilt font fixture used by examples.

Acceptance:

- no Canvas2D required by portable rasterizer;
- CLI output can be loaded by `three-2d` BitmapFont;
- glyph metrics survive roundtrip serialization.

### Milestone 7 — React Native WebGPU portability gate

Deliver:

- Expo/Metro example;
- React Native WebGPU + Three integration;
- SpriteBatch render;
- Yoga View/Text/Image;
- touch event;
- correct disposal/reload behavior.

Acceptance:

- app runs on at least one iOS simulator/device and one Android emulator/device if CI/hardware allows;
- no DOM/Canvas2D dependency leaks into core;
- no browser-WASM dependency for Yoga under Hermes.

### Milestone 8 — Tailwind Metro integration

Deliver:

- Metro compiler wrapper using the same Tailwind compiler core and registry format;
- native example using `className`;
- theme and interaction variant parity with Vite for the supported subset.

---

## 22. First coding-agent task

For the first implementation pass, the agent should complete **Milestone 0 only**, plus the smallest possible `three-2d` smoke implementation needed to prove package imports/builds.

Do not begin full UI/Tailwind/font work until the workspace build/export/publish skeleton is green.

The first PR/commit should produce:

```text
packages/three-2d/src/index.ts
packages/three-2d-font/src/index.ts
packages/three-ui/src/index.ts
packages/three-ui-react/src/index.ts
packages/three-ui-tailwind/src/index.ts
```

with meaningful placeholder exports/types, not empty modules.

Example placeholder public contracts are acceptable, such as:

```ts
// three-2d
export interface Disposable {
  dispose(): void
}

// three-ui
export type Length = number | `${number}%` | 'auto'

// three-ui-react
export interface ThreeUIRoot {
  render(node: React.ReactNode): void
  unmount(): void
}
```

Do not publish from the agent automatically. Publishing requires maintainer credentials/approval.

---

## 23. Definition of done for repository scaffolding

A fresh clone is considered correctly scaffolded when all of the following are true:

1. `bun install --frozen-lockfile` succeeds in CI; `bun install` succeeds locally.
2. `bun run build:packages` builds all public packages with Vite.
3. each package emits JS + `.d.ts` + source maps.
4. no package accidentally bundles Three.js or React.
5. `bun run typecheck` succeeds.
6. `bun run test` succeeds.
7. `bun run pack:smoke` packs and installs the tarballs into a clean consumer fixture, with no unresolved workspace/catalog protocols.
8. consumer fixture can import each documented public entry/subpath.
9. package tarballs contain only intended publish files.
10. Changesets is initialized and can create/version a test changeset.
11. examples resolve workspace packages through normal package exports rather than internal source aliases.
12. core packages contain no DOM imports.

---

## 24. Design decisions intentionally deferred

Do not block initial implementation on these decisions:

- SDF vs MSDF final text strategy;
- full Unicode shaping engine/HarfBuzz integration;
- arbitrary stencil clipping/masking;
- CSS grid;
- text input/IME;
- accessibility bridge;
- virtualized lists;
- native OS focus/accessibility semantics;
- complex transforms in Yoga layout;
- full particle editor/format compatibility;
- animation framework beyond sprite/frame animation;
- component kit (Button/Card/etc.);
- server rendering;
- CJS package output.

Keep APIs extensible enough to add these later, but do not over-engineer them now.

---

## 25. Architecture invariants to protect in code review

Reject changes that violate these unless the architecture spec itself is deliberately revised:

1. **No one-Three-object-per-UI-node design.**
2. **No React dependency from `three-ui`.**
3. **No Tailwind dependency from `three-ui`.**
4. **No Canvas2D requirement in portable font packing.**
5. **No browser DOM dependency in core runtime packages.**
6. **No renderer ownership hidden inside `three-2d`.**
7. **No runtime CSS parsing.**
8. **No Yoga node as the public style/source-of-truth object.**
9. **No separate browser/native UI semantics.** Platform adapters may differ; computed styles/layout behavior should not.
10. **No undocumented React internals outside the isolated reconciler adapter.**
11. **No duplicate Three.js/React copies bundled into published libraries.**
12. **No React Native path that assumes browser WebAssembly for Yoga.**

---

## 26. Reference developer experience

This is the eventual ergonomic target and should guide API naming.

### Browser / React / Tailwind

```tsx
import * as THREE from 'three/webgpu'
import { createThreeUI } from 'three-ui'
import { createThreeUIRoot, View, Text, Image, ScrollView } from 'three-ui-react'

const renderer = new THREE.WebGPURenderer({ antialias: true })
await renderer.init()

const ui = createThreeUI({
  renderer,
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio,
})

const root = createThreeUIRoot(ui)

root.render(
  <View className="flex-1 bg-zinc-950 p-6 gap-4 text-white">
    <Text className="text-3xl font-bold">three-ui</Text>

    <ScrollView className="flex-1 rounded-xl bg-zinc-900 p-4">
      <View className="flex-row items-center gap-3 p-3 rounded-lg hover:bg-zinc-800">
        <Image source={icon} className="size-10" />
        <Text>Hello</Text>
      </View>
    </ScrollView>
  </View>,
)
```

### Non-React

```ts
const root = new View({
  style: {
    flex: 1,
    backgroundColor: '#09090b',
    padding: 24,
    color: '#fff',
  },
})

root.append(
  new Text({
    text: 'three-ui',
    style: { fontSize: 30, fontWeight: 700 },
  }),
)

ui.setRoot(root)
```

### Font packing

```ts
import { packBitmapFont } from 'three-2d-font'

const font = await packBitmapFont(fontBytes, {
  renderer,
  size: 32,
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  supersample: 4,
})
```

---

## 27. Notes for the coding agent

- Prefer a working vertical slice over speculative abstractions.
- Keep public API small in early commits.
- Use internal interfaces where future swapping is expected, but do not advertise pluggability the product does not need.
- Add TODOs only when linked to a concrete deferred milestone.
- When a platform difference is discovered, first try to solve it below the `three-ui` API boundary.
- Treat the React Native example as an architecture test, not a secondary port.
- Keep changesets/release metadata out of examples.
- Do not run `bun publish`, `npm publish`, or any release script without explicit maintainer instruction.

---

## 28. Current ecosystem assumptions checked when this spec was written

These are not permanent API guarantees; they are implementation context that should be re-verified during dependency upgrades.

- Vite 8 library mode supports `build.lib`, and current Vite prefers `build.rolldownOptions` over the deprecated `build.rollupOptions` alias.
- Three.js current npm releases expose WebGL/WebGPU renderer paths; this project targets the modern Three line and should keep Three as a peer dependency.
- React reconciler remains explicitly experimental and recommends mutation mode for mutable host trees.
- Tailwind CSS v4 uses CSS-first configuration and `@theme`; official Vite and Node integration packages exist.
- Yoga's modern JS package ships a WebAssembly-oriented path; the portable/native-safe Yoga binding must therefore be validated explicitly for Hermes rather than assumed.
- Bun workspaces are declared in the root `package.json`, `bun.lock` is the committed lockfile, and Bun supports workspace filtering plus `workspace:` dependency rewriting during Bun-managed pack/publish flows. Changesets is used for release intent/versioning/changelogs only; publication is handled by the repository's Bun-aware publish script.

Re-check these assumptions whenever major versions change.

