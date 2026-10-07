# @implicit-invocation/three-2d

## 0.9.0

### Minor Changes

- Overall performance: paint extents, auto-growing batch capacity, rounded shader-clip fix
  
  - three-ui: every node caches the bounds of everything it paints (box, shadows, text shadow/stroke, overflowing descendants, its own transform), invalidated on layout / style / child / animation changes. Painting culls whole subtrees against them, also under transforms and for rows inside a plain wrapper `View` under a `ScrollView`; hit testing prunes with the same bounds. A 2000-row list paints 49 nodes instead of 2037 (render 0.96 → 0.11 ms, hit test 0.10 → 0.03 ms headless)
  - three-2d: a frame that flushed for capacity doubles the batch buffers at the next `begin()`, up to the new `maxSpritesLimit` option (default 32768; materials are kept)
  - three-2d: fix `clip: 'shader'` with rounded clips: quads in the top-right, bottom-right and bottom-left corner squares were not clipped (only the top-left was)

## 0.8.0

### Minor Changes

- Pointer events of a captured touch / pen pointer no longer hit-test the node tree: like Flutter, Android and DOM pointer capture, the target is fixed once a node (a drag-scrolling `ScrollView`) captures the pointer, so a drag does no tree walk on any move or on the release. A mouse still looks under the pointer for hover, and an uncaptured press still resolves its click target. Adds `docs/scroll-profile.js`, a console snippet that profiles scrolling per direction.

## 0.7.0

### Minor Changes

- No more first-use frame hitches.
  
  - A batch now keeps **two materials per blend mode** instead of one per draw-call index; a draw call binds its texture slots in `mesh.onBeforeRender`. Every newly reached draw-call index used to build and compile a new material (~23 ms on WebGPU and classic WebGL), which dropped a frame the first time a scroll or screen needed more draw calls. It also removes the classic renderer's "maximum number of uniforms groups" error on frames with many draw calls.
  - `batch.warmup(camera, blends?)` / `await ui.warmup(blends?)` build and compile the shaders up front (`compileAsync` on `WebGPURenderer`, a 1×1 scissored degenerate draw otherwise). The examples call it after loading fonts.

## 0.6.0

### Minor Changes

- `ScrollView` drag now follows Cocos Creator's ScrollView: elastic overscroll at half rate, a release velocity from the last 5 drag moves, an attenuated quint-ease-out flick (`brake` 0.5, movement factor 0.7, `√√(v/5)` seconds) and a 1 s bounce-back. New `elastic`, `inertia`, `brake`, `bounceDuration` options. Replaces the old exponential-decay inertia; scroll offsets can briefly leave `[0, max]` while overscrolled.

## 0.5.0

### Minor Changes

- Scrolling and idle cost.
  
  - `createThreeUI` now clips in the fragment shader by default when it has a renderer (`clip: 'shader'`; pass `clip: 'scissor'` for the old behaviour). On `WebGPURenderer` every scissor clip was a separate render pass: a page with 7 clipped lists spent ~5.7 ms of CPU per frame on passes alone, now ~0.7 ms. Children of a rounded `overflow: hidden` box are round-clipped.
  - `ui.renderIfNeeded()`: draws only when something changed (idle UIs cost nothing).
  - Layout read-back only visits nodes Yoga laid out again (a text change no longer re-reads the whole tree).
  - `ScrollView`: notched wheel steps ease toward their target and accumulate (`smoothWheel`, default true); trackpad deltas, drag, keys and `scrollTo` stay immediate.

## 0.4.0

### Minor Changes

- Cheaper UI batches (all defaults stay compatible; `maxTextures: 1` restores the old draw-call behaviour).
  
  three-2d
  - **Multi-texture draw calls**: a draw call samples up to `maxTextures` textures (`'auto'` from the renderer, up to 8). Each quad carries its slot and the shader reads exactly one texture; atlas pages, avatars and fonts share draw calls. New stats `texturesBound`; `BatchSegment.textures`.
  - **One shader program for all textures**: the texture is a per-draw value, not part of the shader, so a classic `WebGLRenderer` + `WebGLNodesHandler` links one GL program per blend mode instead of one per texture (no more compile hitches for every new image).
  - **`NinePatch` scale** (`new NinePatch(region, l, r, t, b, { scale })`, `setScale()`, `draw(…, scale)`): borders, `minWidth`/`minHeight` and padding in logical units, half-texel UV inset against seams; `TextureAtlas` parses `split:` / `pad:` and has `createPatch(name, scale)`.
  - **Gradient cost**: `maxGradientStops` option (2…8); gradients with ≤ 3 stops use a cheaper shader path.
  - **Cheaper shader paths**: sprite / glyph / 9-patch quads fetch one texel and touch no table; plain and shaped (rounded/bordered) sprites are separate modes; shadows with `blur: 0` skip the Gaussian; the box / clip table fetches no longer carry a texture-matrix and flip uniform each.
  - **`clip: 'shader'`**: clip in the fragment shader (anti-aliased, optional rounded corners via `pushClip(x, y, w, h, radii)`), no render pass or draw-call split per clip.
  - **`batch.canReplay` / `batch.replay()`**: draw the previous finished frame again without rebuilding it.
  - Fix: gradient boxes had aliased (unsmoothed) rounded corners.
  
  three-ui
  - `createThreeUI({ maxTextures, maxGradientStops, clip, replayStaticFrames })`; `ui.stats.texturesBound`, `textureSwitches`, `replayed`. `render()` replays the previous frame when nothing changed.
  - `NinePatchView`: `patchScale`, scaled minimum size, and default padding from an atlas `pad:`; a component default padding edge no longer beats an author's `padding` shorthand.
  - With `clip: 'shader'`, `overflow: hidden` + `border-radius` round-clips children.
  
  three-ui-react
  - `<NinePatch patchScale>`.

## 0.3.0

### Patch Changes

- 1ca2ef0: Classic `WebGLRenderer` + `WebGLNodesHandler` support, and `ui.hitTestInteractive()`.
  
  **three-2d (fixes for a classic `WebGLRenderer` with `renderer.setNodesHandler(new WebGLNodesHandler())`)**
  - Output colour space: `NodeMaterial` applies the handler's output transform only for materials without a `fragmentNode`, so the batch material rendered un-encoded (far too dark). The batch material (`BatchNodeMaterial`) now applies `workingToColorSpace` itself when — and only when — the handler is present; `WebGPURenderer` is untouched. Render-target passes (backdrop blur) are never encoded; tone mapping is never applied to UI.
  - `GL_INVALID_OPERATION: no buffer is bound to enabled attribute`: all pooled batch meshes share one interleaved vertex buffer and one index buffer, and `WebGLNodesHandler` calls `geometry.dispose()` after every node-material build, which deleted the shared GL buffers under the other meshes' VAOs (garbled text, one draw per frame failing once other materials were built). Disposing one batch geometry now disposes its siblings, so every mesh re-binds against the re-created buffers.
  - Scissors are converted to the bottom-left origin a classic `WebGLRenderer` uses (nested `ScrollView`s were clipped wrongly).
  - Backdrop blur works on the classic renderer.
  
  **three-ui**
  - `ui.hitTestInteractive(x, y)` / `ui.isInteractiveAt(x, y)` / `node.isInteractive` / `node.hasEventListener(type)`: find the nearest node that would react to a press (focusable, press/drag/wheel listeners, scrollable `ScrollView`; decorative nodes, hover-only listeners and disabled subtrees are ignored) so a host can let other presses through.
  
  **Examples** — every example accepts `?renderer=webgl` (classic renderer); `three-ui-game-ui` gets a renderer toggle, `?still`, `&flat`, a three-renderer `measure.mjs` and a `parity.mjs` pixel-diff script. Classic-renderer numbers equal the other paths' draw calls and render passes (e.g. 2 000 gradient + shadow panels: 2 draw calls, 1 pass, ~3.8 ms CPU).

## 0.2.0

### Minor Changes

- Game-UI features: SDF box shader, gradients, shadows, text outline/shadow, animations, backdrop blur (all batched).
  
  **three-2d**
  - One SDF *box* shader (`fillBox`): per-corner radii, per-side borders that follow the corners, background + linear/radial gradient (≤ 8 stops, premultiplied sRGB or OKLab). Boxes are single quads whose data lives in a per-frame float `BoxTable` texture, so they join any draw-call segment.
  - Analytic blurred shadows (`fillShadow`): outer + inset, blur, spread, offset, one quad per layer, no offscreen pass.
  - `drawGlyph` / `drawGlyphEffect`: glyph quads read coverage from alpha and a signed-distance field from the red channel (outline, soft shadow).
  - Backdrop blur (`fillBackdrop`, `backdrop: 'low' | 'full'`): one framebuffer copy per capture generation + dual-Kawase chain at ½…1/16 res, two strengths, clipped to a rounded rect; skipped entirely when unused.
  - `GlyphLayout`: `maxLines` truncation with `ellipsis`, `wrap: false`, `truncated`.
  - A segment holding only boxes/shadows adopts the first textured quad's texture (no split); scissor groups whose clip contains everything painted under them are elided, so adjacent segments share one `render()` call.
  - Vertex stride 20 → 21 (adds the table index); `RenderStats` gains `boxes`, `shadows`, `backdropCopies`, `backdropPasses`; `FlushReason` gains `'backdrop'`.
  
  **three-2d-font** — `bakeBitmapFont({ stroke: { maxWidth } })` / `three-2d-font pack --stroke <px>` bakes a distance channel (JSON `stroke`), growing the glyph padding to fit. Load such atlases without alpha premultiplication.
  
  **three-ui**
  - Style: `borderTop/…Radius`, `backgroundGradient` (+ `gradientFrom/Via/To`), `boxShadow` (outer/inset/multi), `textShadow`, `textStrokeWidth/Color`, `paintOrder`, `whiteSpace`, `textOverflow`, `numberOfLines`, `objectFit`, `dropShadow`, `backdropBlur/Brightness/Saturate`, `animation`, `transition*`, `animationLayout`; percentage `translateX/Y`.
  - Animation engine driven by `ui.update(dt)` (`dt = 0` freezes everything): CSS-like keyframes (percent stops, cubic-bezier/ease/linear/steps, iterations incl. infinite, direction, fill, delay), transitions (`hover:` etc. animate), `node.animate()` Web-Animations-like handle (`finished`, `pause/play/finish/cancel`, `currentTime`, `playbackRate`), `animationstart/iteration/end/cancel` and `transitionstart/end/cancel` events, `ui.registerKeyframes`, `ui.setMediaFlags({ reducedMotion, colorScheme })`. Layout properties need an explicit opt-in.
  - `createThreeUI({ backdropBlur: 'off' | 'low' | 'full' })`; `UIStats` gains `boxes`, `shadows`, `backdropCopies`, `backdropPasses`.
  - `Image`: `object-fit` (incl. `scale-down`), `drop-shadow`, alpha-silhouette tint; `paintBox` replaces the strip-based non-uniform border.
  
  **three-ui-react** — `onAnimationStart/Iteration/End/Cancel`, `onTransitionStart/End/Cancel` props.
  
  **three-ui-tailwind** — gradients (`bg-linear-*`, `bg-radial`, `from/via/to` + positions, arbitrary), shadows/rings/insets composed from Tailwind's separate `--tw-*` properties into real shadow data, `text-shadow-*`, text stroke / `paint-order`, `truncate`/`line-clamp`/`whitespace-nowrap`, `object-*`, `drop-shadow-*`, `backdrop-*`, per-corner radii, `-translate-x-1/2`, `animate-*` + `@keyframes` (built-in and `@theme`), `transition-*`/`duration-*`/`ease-*`/`delay-*`, `motion-safe:`/`motion-reduce:`. `registry.keyframes` is new (registry format stays v1).
  
  **Measured** (new `examples/three-ui-game-ui`, `measure.mjs`; Apple M-series, headless Chrome 1280×720, frame limiter + vsync off; CPU = `ui.update()+ui.render()` JS time, frame = 1000/fps):
  
  | scene | backend | draw calls | `render()` passes | quads | CPU ms | frame ms |
  | --- | --- | ---: | ---: | ---: | ---: | ---: |
  | 100 panels (gradient + ring + inset + shadow) | WebGPU / WebGL2 | 2 / 2 | 1 / 1 | 801 | 1.7 / 3.0 | 1.8 / 3.2 |
  | 500 panels | WebGPU / WebGL2 | 2 / 2 | 1 / 1 | 2 211 | 1.6 / 1.1 | 1.7 / 3.1 |
  | 1 000 panels | WebGPU / WebGL2 | 2 / 2 | 1 / 1 | 4 213 | 2.5 / 2.1 | 2.7 / 3.7 |
  | 2 000 panels | WebGPU / WebGL2 | 2 / 2 | 1 / 1 | 8 213 | 4.9 / 4.1 | 5.2 / 4.3 |
  | 2 000 panels, 500 animated (`node.animate`) | WebGPU / WebGL2 | 2 / 2 | 1 / 1 | 8 213 | 5.7 / 4.9 | 5.9 / 5.0 |
  | HUD (24 gradient/shadow nodes, images, 3 fonts, 4 backdrop blurs) | WebGPU / WebGL2 | 24 / 24 | 4 / 4 | 568 | 3.9 / 5.1 | 3.8 / 5.1 |
  | HUD + modal (3 capture generations, 12 blur passes) | WebGPU / WebGL2 | 29 / 29 | 6 / 6 | 681 | 7.8 / 6.2 | 8.0 / 6.4 |
