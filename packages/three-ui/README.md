# three-ui

Retained-mode **2D UI** for Three.js. Yoga flexbox layout, a computed-style cascade, bitmap-font text, images, nine-patches, `ScrollView`, an input/event system with capture/bubble and pointer capture — painted through [`@implicit-invocation/three-2d`](../three-2d) batches. **No React, no DOM, no Tailwind required.**

> ⚠️ **Alpha (0.x)** — APIs may change before 1.0.

## Install

```bash
bun add @implicit-invocation/three-ui @implicit-invocation/three-2d three
```

**Peer dependencies:** `three`. Depends on `@implicit-invocation/three-2d`. Yoga ships inside the package as a generated, synchronous asm.js build (no WebAssembly, safe for Hermes).

## Usage

```ts
import * as THREE from 'three/webgpu'
import { createThreeUI, View, Text, FontRegistry } from '@implicit-invocation/three-ui'
import { attachDOMInput } from '@implicit-invocation/three-ui/web'

const renderer = new THREE.WebGPURenderer(); await renderer.init()
const ui = createThreeUI({ renderer, width: innerWidth, height: innerHeight, pixelRatio: devicePixelRatio })
ui.fonts.register(bitmapFont)               // baked with three-2d-font
attachDOMInput(ui, renderer.domElement)

const root = new View({ style: { flex: 1, backgroundColor: '#09090b', padding: 24, color: '#fff' } })
root.append(new Text({ text: '@implicit-invocation/three-ui', style: { fontSize: 30, fontWeight: 700 } }))
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

Hit testing honors clips, scroll offsets, transforms and `pointerEvents` (`pointer-events-none` decorative layers are transparent to pointers).

**Letting presses through to the game:** `ui.hitTest(x, y)` returns the deepest node, decorative or not. `ui.hitTestInteractive(x, y)` returns the nearest node that would actually react (itself or an ancestor): enabled and `focusable`, or listening for `pointerdown/up/cancel/move`, `click` or `wheel`, or a `ScrollView` that can scroll — hover-only listeners and plain backgrounds do not count. `ui.isInteractiveAt(x, y)` is the boolean form; `node.isInteractive` / `node.hasEventListener(type)` expose the pieces. Do not put press listeners on a full-screen root, or everything counts as interactive. `ui.input.pointerDown/Move/Up/wheel/keyDown…` feed any platform; `@implicit-invocation/three-ui/web` adapts DOM events (the only DOM-aware file). Hover/pressed/focused/disabled state drives `hover:`/`active:`/`focus:`/`disabled:` class variants.

### Yoga runtime portability

`yoga-layout@3` ships WebAssembly only. `@implicit-invocation/three-ui` instead bundles an asm.js build generated from the **same Yoga release** (`bun run build:yoga-asm`: wasm → binaryen `wasm2js` + patched Emscripten glue). Initialization is synchronous. A WASM binding can be plugged in with `setYogaRuntime(YogaFromYogaLayout)`.

## Game-UI painting

Everything below is paint-only: the batching invariant holds (boxes, shadows, gradients and glyph effects are quads inside the **same** draw call as your text and images — [`three-ui-game-ui`](../../examples/three-ui-game-ui) paints 2 000 gradient + shadow panels in 2 draw calls).

### Boxes, gradients, borders

One SDF "box" shader paints a node's background, gradient and border in a single quad: **per-corner radii** (`borderTopLeftRadius`… override `borderRadius`; overlapping radii scale down together like CSS, so `rounded-full` is a pill), **per-side border widths** (the border follows the rounded corners), translucent borders over the background.

```ts
new View({ style: {
  borderRadius: 16, borderTopLeftRadius: 4, borderWidth: 3, borderColor: '#f59e0b', backgroundColor: '#1e293b',
  backgroundGradient: { type: 'linear', angle: 'to bottom right', colorSpace: 'oklab',
                        stops: [{ color: '#334155' }, { color: '#0f172a', position: '80%' }] },
  // radial: { type: 'radial', shape: 'circle', size: 'closest-side', at: ['25%', '50%'], stops: [...] }
} })
```

Stops interpolate **premultiplied** (CSS-correct for translucent colors); `colorSpace` is `'srgb'` (the CSS default) or `'oklab'` (what Tailwind v4's `bg-linear-*` emits). Up to 8 stops; angles are degrees (or `'90deg'`, `'0.25turn'`, `'to top right'`). The Tailwind `from-*`/`via-*`/`to-*` keys (`gradientFrom`, `gradientVia`, `gradientTo` + `…Position`) supply stops for a gradient that declares none.

### Shadows

`boxShadow` takes one layer or a list (first = top-most, like CSS): `{ offsetX, offsetY, blur, spread, color, inset }`; `color: 'currentColor'` follows the text color. Shadows are **analytic** — a blurred rounded rectangle is evaluated in the fragment shader (Gaussian integrated in x, four weighted rows in y); there is no offscreen pass and no blur kernel texture. Inset shadows are clipped to the padding box. Hard shadows (`blur: 0`) are anti-aliased.

### Text outlines and shadows

```ts
new Text({ text: 'VICTORY', style: { fontFamily: 'Inter Display', fontWeight: 800, fontSize: 48, color: '#fde047',
  textStrokeWidth: 6, textStrokeColor: '#451a03', paintOrder: 'stroke',      // -webkit-text-stroke + paint-order: stroke fill
  textShadow: [{ offsetY: 3, blur: 6, color: '#0008' }] } })
```

Needs a font baked with a stroke channel: `three-2d-font pack … --stroke 8` stores a signed distance field in the atlas' red channel (coverage stays in alpha), so **any** stroke width up to the baked `maxWidth` renders from the same atlas, and shadow blur is a threshold softness. Requesting more than the baked width clamps and warns once; a font without the channel ignores the stroke (one warning) and draws hard text-shadow copies. `paintOrder: 'stroke'` draws a true outline (the visible width is half the CSS stroke width); `'normal'` centers the stroke over the glyph edge. Load such atlases **without alpha premultiplication** (the field lives in transparent texels).

Also: `letterSpacing`, `lineHeight`, `textAlign`, `whiteSpace: 'nowrap'`, `numberOfLines` (+ `textOverflow: 'ellipsis'`, which Tailwind's `line-clamp-*` implies).

### Animations & transitions

All time comes from **your** `ui.update(dt)`: `dt = 0` freezes every animation and transition, a scaled `dt` slow-motions them, nothing reads a clock. `ui.needsRender` stays true while something moves.

```ts
// CSS-like, from style (keyframes registered once, or via Tailwind @keyframes)
ui.registerKeyframes('pulse', { '0%': { opacity: 1 }, '50%': { opacity: 0.4 }, '100%': { opacity: 1 } })
new View({ style: { animation: { name: 'pulse', duration: 1200, iterations: 'infinite' },
                    transition: { property: 'backgroundColor', duration: 150, easing: 'ease-out' } } })

// Web-Animations-like handle
const a = node.animate([{ transform: [{ scale: 1 }] }, { transform: [{ scale: 1.2 }] }],
                       { duration: 300, easing: 'cubic-bezier(.2,1.4,.4,1)', fill: 'forwards' })
await a.finished           // resolves on finish, rejects (AbortError) on cancel()
a.pause(); a.play(); a.finish(); a.cancel(); a.currentTime = 150; a.playbackRate = 0.5
node.addEventListener('animationend', (e) => e.animationName)   // + animationstart / animationiteration / animationcancel
node.addEventListener('transitionend', (e) => e.propertyName)   // + transitionstart / transitioncancel (events bubble)
```

Timing: `cubic-bezier()`, `ease*`, `linear`, `steps()`, `step-start/end`; `iterations` (incl. `'infinite'`), `direction` (all four), `fill`, `delay`; keyframes accept `offset`/`easing` per step or `'0%' | 'from' | 'to'` keys. Missing 0% / 100% start from / end at the node's own style. Style animations use CSS semantics (the easing applies per keyframe interval); `node.animate()` follows Web Animations (the `easing` option eases the whole iteration).

Animatable: `opacity`, colors (`backgroundColor`, `borderColor`, `color`, `tintColor`, `textStrokeColor`), `transform` (lists interpolate pairwise, `none` ↔ any list, `%` translations, mismatched lists via decomposition), radii, `boxShadow` / `textShadow` / `dropShadow` (lists are padded with transparent layers), gradient stops/angle, text stroke width, backdrop values. Transitions start when a recomputed style differs (e.g. `hover:` classes), retarget from the current value and fire events. **Layout properties** (`width`, `margin`, `padding`, `flex*`, `gap`, `top`…, `fontSize`) re-run Yoga every frame, so they need an explicit opt-in: `{ layout: true }` / `animationLayout: true` for keyframes, or naming the property in `transition` (`transition-[width]`). `transition: all` covers paint properties only.

`ui.setMediaFlags({ reducedMotion, colorScheme })` drives `motion-reduce:` / `motion-safe:` / `dark:` variants.

### Backdrop blur

`backdropBlur` (px), `backdropBrightness`, `backdropSaturate` blur what is behind a node, clipped to its rounded rect. Enable with `createThreeUI({ backdropBlur: 'full' | 'low' | 'off' })` (default `'full'`; `'off'` skips everything and the node just paints its own translucent background).

The renderer's framebuffer is copied **once per capture generation** and downsampled with a dual-Kawase chain at ½ … 1/16 resolution; every blurred element samples the shared result. Two strengths exist (small ≤ 20 px, large above; `'low'` only the small one). The first blurred element starts a new capture; a later one that overlaps UI painted *after* that capture starts another (so a modal scrim correctly blurs the HUD under it) — blurred panels over the game scene always share one. Frames without a blurred node do no extra work.

### Renderers: `WebGPURenderer` and the classic `WebGLRenderer`

`createThreeUI({ renderer })` accepts either of Three's renderers; the UI code, styles and batching are identical.

```ts
// classic WebGLRenderer driving TSL materials (three/addons)
import { WebGLRenderer } from 'three'
import { WebGLNodesHandler } from 'three/addons/tsl/WebGLNodesHandler.js'
const renderer = new WebGLRenderer({ canvas })
renderer.setNodesHandler(new WebGLNodesHandler())
const ui = createThreeUI({ renderer, width, height, pixelRatio })
// per frame: render the game scene, then   ui.update(dt); ui.render()   (the UI never clears; it sets autoClear = false while drawing)
```

What the classic path needed (all handled inside `@implicit-invocation/three-2d`): the output colour-space transform is applied inside the batch material (Three applies it for node materials *without* a `fragmentNode` only); the batch's meshes share one vertex/index buffer, so disposing one geometry — which `WebGLNodesHandler` does after every material build — disposes its siblings, otherwise the others' VAOs point at deleted buffers; scissor rectangles are converted to GL's bottom-left origin (`WebGPURenderer`'s are top-left). Backdrop blur, gradients, shadows, glyph effects, clipping and animations all work on both. Try it in any example with `?renderer=webgl`.

**Differences to know about:** translucent layers composite in *sRGB space* on a classic `WebGLRenderer` (like CSS) and in *linear space* on `WebGPURenderer` (its frame buffer is linear half-float), so rings, shadows, anti-aliased edges and scrims differ by a few levels — a 35 % black scrim over `#0b1020` ends at `#070a15` vs `#070b18`; opaque interiors are identical (`examples/three-ui-game-ui/parity.mjs` measures it). Tone mapping is never applied to UI output. Because the classic renderer has no framebuffer-sized linear target, the backdrop copy is already encoded (handled for you).

### Images

`objectFit` (`fill | contain | cover | none | scale-down`, wins over the `resizeMode` prop), rounded clipping (`borderRadius`, circle avatars inside a border ring), `tintColor` (multiply), and `dropShadow` — a tinted, offset copy of the image's alpha silhouette painted underneath (the blur radius is ignored; cost: one extra quad per layer). Image radii use the largest corner.

### Cost notes

| Feature | Draw calls | Per-frame work |
| --- | --- | --- |
| Box (radii, border, background) | 0 extra — joins the current segment | 1 quad + 6 table texels; one SDF per fragment |
| Gradient | 0 | + (stops + ⌈stops/4⌉) texels (≤ 8 stops); ≤ 3 stops use a 2-mix loop, more up to `maxGradientStops` |
| Shadow / ring / inset layer | 0 | 1 quad + 6 texels per layer; 4 Gaussian rows per fragment over the blur-expanded quad |
| Text stroke · text shadow | 0 | ×2 glyph quads for a stroke, +1 pass per shadow layer |
| Image drop-shadow | 0 | +1 quad per layer |
| Backdrop blur | +1 per capture generation (a forced segment break) | 1 framebuffer copy + 3 (small) and/or 6 (large) fullscreen passes at ≤ ½ res per generation; 0 when unused |
| Style / `node.animate()` of paint properties | 0 | in-place writes of the animated keys; no style recompute, no relayout |
| Animating layout (opt-in) | 0 | a Yoga relayout per frame |
| Hover / press transitions | 0 | a style recompute when the state flips, then in-place writes while it runs |

Box data lives in a per-frame float texture (`BoxTable`, `RGBA32F`, nearest-fetched); boxes are written as ordinary quads (not hardware-instanced) so they share segments, clipping and texture handling with text and images.

### Draw-call and pass budget

```ts
createThreeUI({
  renderer,
  maxTextures: 'auto',        // default: atlas pages, avatars and fonts share draw calls (up to 8 textures each); 1 = one per draw
  maxGradientStops: 3,        // cap the gradient shader's loop (2…8, default 8; ≤ 3-stop gradients are already cheap)
  clip: 'shader',             // overflow clipping in the fragment shader: no render pass per clip, rounded corners honoured
  replayStaticFrames: true,   // default: render() redraws the previous frame's batch when nothing changed
})
```

`ui.stats` reports `drawCalls`, `renderPasses`, `texturesBound`, `textureSwitches` and `replayed` (true when the last `render()` replayed). `clip: 'scissor'` (default) uses one `renderer.render()` per distinct clip rectangle; with `'shader'` a node with `overflow: hidden` and `border-radius` also round-clips its children.

### Nine-patch frames for 2×/3× art

`NinePatchView` takes a `NinePatch` from `@implicit-invocation/three-2d` (`atlas.createPatch('panel', 0.5)` for art baked at 2×). Its minimum size and — when the atlas region has `pad:` — its default padding come from the scaled patch (an explicit `padding*` style wins); `patchScale` overrides the patch's scale for one view.

### Limitations

`overflow: hidden` clips to the node's rectangle (with `clip: 'scissor'` a rounded card does not round-clip its children — give `Image`s their own radius, or use `clip: 'shader'`) · one border color (no per-side colors) · elliptical `border-radius` (`a / b`) uses the horizontal radii · image radii are one value · `opacity` multiplies each primitive (no offscreen group: overlapping children of a translucent parent show through each other) · gradients: ≤ 8 stops, no `repeating-*`/conic, no color hints · `drop-shadow` only on `Image`s and without blur · backdrop blur needs the default framebuffer and `renderer.copyFramebufferToTexture` (verified on WebGPU and WebGL2; not on a React Native device) · CSS `filter: blur()/brightness()…` on the node itself is not supported (only `backdrop-*`).

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
- [`examples/three-ui-game-ui`](../../examples/three-ui-game-ui) — game HUD: gradients, shadows, outlined text, animations, backdrop-blurred modal, 2 000-panel stress mode.
