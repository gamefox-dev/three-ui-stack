# three-ui-game-ui

A **game-style UI** on `@implicit-invocation/three-ui` + Tailwind v4 (no React), laid over a busy 3D scene rendered by the same Three renderer. It exercises the whole game-UI paint stack:

| Feature | Where |
| --- | --- |
| Box shader: per-corner radii, borders, `bg-linear-*` / `bg-radial` gradients | every panel, chip and button |
| Shadows: `shadow-*`, `ring-*`, `inset-shadow-*`, hard `shadow-[0_5px_0_#92400e]` | quest panel, buttons |
| Outlined titles, text shadow, `line-clamp` ellipsis | `Slay the Dummy`, `VICTORY!` (font baked with `--stroke`) |
| Hover / press transitions (`transition duration-150 hover:scale-105 active:translate-y-1`) | buttons and chips |
| `@keyframes` from `@theme` (`animate-pop`, `animate-shine`, `animate-glow`) | modal, quest progress bar, `NEW` badge |
| Animated progress bar (`transition-[width]`, explicit layout opt-in) | boss HP, quest progress |
| Floating damage numbers (`node.animate`, `animationend`/`finished` → dispose) | click the boss card or press ATTACK! |
| Backdrop blur (`backdrop-blur-md/lg/xl/sm`), one shared capture | HUD pills, boss card, modal scrim + dialog |
| Images: `object-cover`, circle avatar + ring, `drop-shadow-lg` gems, `tint-color` | top bar, boss card |
| `pointer-events-none` layers, `motion-reduce:`, `setMediaFlags` | damage layer, "Reduced motion" toggle |

```bash
bun run build:packages && bun --cwd examples/three-ui-game-ui dev    # http://localhost:5175
```

URL parameters: `?webgl` (force the WebGL2 backend of `WebGPURenderer`), `?renderer=webgl` (a classic `WebGLRenderer` + `WebGLNodesHandler`; also the in-app renderer button), `?still` (freeze the 3D scene), `&flat` (opaque stress panels), `?blur=off|low|full` (backdrop quality; also the in-app "Blur" button), `?modal` (open the modal), `?stress=N` (stress mode), `&anim=1` (animate a quarter of the stress panels with `node.animate`).

## Stress mode

`Stress` (or `?stress=2000`) replaces the HUD with N panels — each a gradient (OKLab), a 1 px ring, an inset highlight and a drop shadow, authored as plain style objects — laid out by Yoga and painted into the same batch. The HUD prints the numbers live (`window.__perf` has them too):

```
WebGPU · 60 fps · CPU 4.4 ms/frame
draw calls 2 (1 passes) · quads 8213 · boxes 2010 · shadows 6020
```

`node measure.mjs` (needs `playwright-core`) sweeps both backends and prints a table; the numbers in the changeset were produced with it (Apple M-series, headless Chrome 1280×720, `--disable-frame-rate-limit --disable-gpu-vsync`).

Notes: the HUD itself is 24 draw calls (4 `renderer.render()` submissions) because it alternates three bitmap-font atlases and four image textures — painter's order forbids sorting by texture; the stress screen has one font and no images, which is what shows the batching claim. Each `renderer.render()` submission costs ~1 ms of fixed Three overhead, which is why the batch merges segments into as few submissions as it can (scissor groups whose clip contains everything under it are elided; backdrop capture generations are the only forced splits).

## Renderer parity

All three paths — `WebGPURenderer` on WebGPU, `WebGPURenderer` on its WebGL2 backend and a classic `WebGLRenderer` + `WebGLNodesHandler` — run the same UI and produce the same draw calls and `render()` passes (`node measure.mjs` has rows for each). `node parity.mjs` screenshots frozen scenes on every path and diffs them:

| scene | WebGPU vs WebGL2 backend (mean abs diff · pixels off by > 8) | WebGPU vs classic `WebGLRenderer` |
| --- | --- | --- |
| 300 opaque gradient panels | 0.00 · 0 % | 2.95 · 7.5 % |
| 300 panels with rings, insets and shadows | 0.00 · 0 % | 10.2 · 27 % |
| 300 panels + modal with backdrop blur | 3.5 · 6.2 % | 31.6 · 81 % |
| HUD + modal with backdrop blur | 2.4 · 8.7 % | 22.2 · 62 % |

The two `WebGPURenderer` backends match exactly for content without blur. The classic renderer differs only where something translucent is composited (anti-aliased edges, rings, shadows, the modal's 35 % scrim) because it blends in sRGB space like CSS while `WebGPURenderer` blends in a linear half-float frame buffer; opaque interiors are identical. Nothing is mis-encoded: a 128 gray stays 128 through the blur on every path.
