# three-ui-basic

Vite + plain TypeScript — **`three-ui` without React** (proving React and Tailwind are optional).

```bash
bun run dev        # http://localhost:5172   (?webgl for the WebGL2 backend)
bun run build
```

Shows: a `View` tree laid out by Yoga (row/column/flex/gap), text measurement and re-wrapping (drag the divider),
inherited text color/size from the theme layer, `Image` resize modes, `AnimatedImage`, `NinePatchView`, `overflow: hidden`
clipping with rounded corners, a `ScrollView` (wheel, drag, fling, keyboard), hover/press/focus feedback via listeners, add/remove
rows (`dispose()` frees Yoga nodes) and a theme toggle. `ui.stats` is printed live in the header.
