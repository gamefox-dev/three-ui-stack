# three-ui-tailwind-vite — the showcase

Vite + React + **Tailwind CSS v4** → `three-ui`. Classes are compiled at build time by Tailwind's own compiler and converted to
style data (`threeUITailwind()` Vite plugin); no CSS is shipped or parsed at runtime.

```bash
bun run dev        # http://localhost:5174   (?webgl for WebGL2, ?page=layout|type|input|scroll|media|perf to deep-link)
bun run build
```

| Page | Demonstrates |
| --- | --- |
| Overview | responsive variants (`sm:`…`xl:`, `md:flex`), breakpoint readout, dark mode toggle, live viewport info |
| Layout | interactive Yoga flexbox playground (direction, justify, items, wrap, gap, grow) with LayoutRect readout |
| Typography | type scale, weights, tracking/leading/alignment, wrapping at a draggable width, color + size **inheritance** |
| Interaction | `hover:` `active:` `focus:` `disabled:`, Tab focus rings, switches, sliders, **pointer capture** drag, capture→bubble log, keyboard |
| Scrolling | 1 000-row `ScrollView`, nested horizontal carousels, wheel/drag/inertia, culling counters |
| Media | `Image` resize modes, SDF rounded corners/borders/opacity, `AnimatedImage`, atlas regions, transforms, `NinePatch` |
| Counters | live `ui.stats`, paint-only vs layout invalidation, a 3 000-node stress grid |

Configuration lives in `src/theme.css` (CSS-first `@theme`) and `vite.config.ts`. `src/kit.tsx` has the small component kit
(Button, Segmented, Switch, Slider, Card…). Unsupported utilities (grid, shadows, …) are reported by the plugin at dev time.
