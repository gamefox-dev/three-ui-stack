# three-2d-basic

Vite + plain TypeScript (no React, no UI layer) showcasing **`@implicit-invocation/three-2d`** on Three's WebGPU renderer (WebGL2 fallback).

```bash
bun run dev        # http://localhost:5171   (append ?webgl to force the WebGL2 backend)
bun run build
```

Interact: <kbd>↑</kbd>/<kbd>↓</kbd> double/halve the sprite count (up to 20 000 — still one draw call per segment) · <kbd>V</kbd> cycles
`Fit`/`Fill`/`Extend`/`Stretch`/`Screen` viewports · <kbd>C</kbd> toggles the scissor clip on the arena · <kbd>P</kbd> pauses ·
click bursts particles · drag the nine-patch's handle (bottom-right) to resize it while its text re-wraps.

Covers: `SpriteBatch` / `PolygonSpriteBatch`, texture atlas from libGDX `.atlas` text, frame `Animation`, bitmap fonts
(`GlyphLayout` wrapping), `NinePatch`, blend modes, clip stack, particles, viewports and the stats overlay
(`sprites`, `draw calls`, `render passes`, `flushes`, `glyphs`, `clip changes`).
