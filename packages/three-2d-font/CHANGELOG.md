# @implicit-invocation/three-2d-font

## 0.3.0

### Patch Changes

- Updated dependencies [1ca2ef0]
  - @implicit-invocation/three-2d@0.3.0

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

### Patch Changes

- Updated dependencies
  - @implicit-invocation/three-2d@0.2.0
