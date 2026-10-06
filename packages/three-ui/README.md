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

Hit testing honors clips, scroll offsets, transforms and `pointerEvents` (`pointer-events-none` decorative layers are transparent to pointers). `ui.input.pointerDown/Move/Up/wheel/keyDown…` feed any platform; `@implicit-invocation/three-ui/web` adapts DOM events (the only DOM-aware file). Hover/pressed/focused/disabled state drives `hover:`/`active:`/`focus:`/`disabled:` class variants.

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

### Images

`objectFit` (`fill | contain | cover | none | scale-down`, wins over the `resizeMode` prop), rounded clipping (`borderRadius`, circle avatars inside a border ring), `tintColor` (multiply), and `dropShadow` — a tinted, offset copy of the image's alpha silhouette painted underneath (the blur radius is ignored; cost: one extra quad per layer). Image radii use the largest corner.

### Cost notes

| Feature | Draw calls | Per-frame work |
| --- | --- | --- |
| Box (radii, border, background) | 0 extra — joins the current segment | 1 quad + 6 table texels; one SDF per fragment |
| Gradient | 0 | + (stops + ⌈stops/4⌉) texels (≤ 8 stops); ≤ 16 table fetches per fragment |
| Shadow / ring / inset layer | 0 | 1 quad + 6 texels per layer; 4 Gaussian rows per fragment over the blur-expanded quad |
| Text stroke · text shadow | 0 | ×2 glyph quads for a stroke, +1 pass per shadow layer |
| Image drop-shadow | 0 | +1 quad per layer |
| Backdrop blur | +1 per capture generation (a forced segment break) | 1 framebuffer copy + 3 (small) and/or 6 (large) fullscreen passes at ≤ ½ res per generation; 0 when unused |
| Style / `node.animate()` of paint properties | 0 | in-place writes of the animated keys; no style recompute, no relayout |
| Animating layout (opt-in) | 0 | a Yoga relayout per frame |
| Hover / press transitions | 0 | a style recompute when the state flips, then in-place writes while it runs |

Box data lives in a per-frame float texture (`BoxTable`, `RGBA32F`, nearest-fetched); boxes are written as ordinary quads (not hardware-instanced) so they share segments, clipping and texture handling with text and images.

### Limitations

`overflow: hidden` clips to the node's rectangle (a rounded card does not round-clip its children — give `Image`s their own radius) · one border color (no per-side colors) · elliptical `border-radius` (`a / b`) uses the horizontal radii · image radii are one value · `opacity` multiplies each primitive (no offscreen group: overlapping children of a translucent parent show through each other) · gradients: ≤ 8 stops, no `repeating-*`/conic, no color hints · `drop-shadow` only on `Image`s and without blur · backdrop blur needs the default framebuffer and `renderer.copyFramebufferToTexture` (verified on WebGPU and WebGL2; not on a React Native device) · CSS `filter: blur()/brightness()…` on the node itself is not supported (only `backdrop-*`).

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
