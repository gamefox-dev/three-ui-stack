---
'@implicit-invocation/three-2d': patch
'@implicit-invocation/three-ui': minor
---

Classic `WebGLRenderer` + `WebGLNodesHandler` support, and `ui.hitTestInteractive()`.

**three-2d (fixes for a classic `WebGLRenderer` with `renderer.setNodesHandler(new WebGLNodesHandler())`)**
- Output colour space: `NodeMaterial` applies the handler's output transform only for materials without a `fragmentNode`, so the batch material rendered un-encoded (far too dark). The batch material (`BatchNodeMaterial`) now applies `workingToColorSpace` itself when — and only when — the handler is present; `WebGPURenderer` is untouched. Render-target passes (backdrop blur) are never encoded; tone mapping is never applied to UI.
- `GL_INVALID_OPERATION: no buffer is bound to enabled attribute`: all pooled batch meshes share one interleaved vertex buffer and one index buffer, and `WebGLNodesHandler` calls `geometry.dispose()` after every node-material build, which deleted the shared GL buffers under the other meshes' VAOs (garbled text, one draw per frame failing once other materials were built). Disposing one batch geometry now disposes its siblings, so every mesh re-binds against the re-created buffers.
- Scissors are converted to the bottom-left origin a classic `WebGLRenderer` uses (nested `ScrollView`s were clipped wrongly).
- Backdrop blur works on the classic renderer.

**three-ui**
- `ui.hitTestInteractive(x, y)` / `ui.isInteractiveAt(x, y)` / `node.isInteractive` / `node.hasEventListener(type)`: find the nearest node that would react to a press (focusable, press/drag/wheel listeners, scrollable `ScrollView`; decorative nodes, hover-only listeners and disabled subtrees are ignored) so a host can let other presses through.

**Examples** — every example accepts `?renderer=webgl` (classic renderer); `three-ui-game-ui` gets a renderer toggle, `?still`, `&flat`, a three-renderer `measure.mjs` and a `parity.mjs` pixel-diff script. Classic-renderer numbers equal the other paths' draw calls and render passes (e.g. 2 000 gradient + shadow panels: 2 draw calls, 1 pass, ~3.8 ms CPU).
