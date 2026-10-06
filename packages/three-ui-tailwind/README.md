# three-ui-tailwind

**Tailwind CSS v4** authoring for [`@implicit-invocation/three-ui-react`](../three-ui-react) — class names are compiled at build time to `@implicit-invocation/three-ui` style data. No DOM CSS, **no CSS parsing at runtime**.

> ⚠️ **Alpha (0.x)** — APIs may change before 1.0. Tailwind v4 only.

## Install

```bash
bun add @implicit-invocation/three-ui-tailwind @implicit-invocation/three-ui @implicit-invocation/three-ui-react
bun add -d tailwindcss @tailwindcss/node @tailwindcss/vite
```

**Peer dependencies:** `tailwindcss ^4`, `@tailwindcss/node` (build step), `@implicit-invocation/three-ui-react` (optional), `vite` (optional, for the plugin).

## Vite

```css
/* src/theme.css */
@import "tailwindcss";
@import "@implicit-invocation/three-ui-tailwind";
@theme { --color-primary: #6d5dfc; --font-ui: Inter; --spacing: 4px; }
```

```ts
// vite.config.ts
import { threeUITailwind } from '@implicit-invocation/three-ui-tailwind/vite'
export default defineConfig({ plugins: [react(), tailwindcss(), threeUITailwind({ css: './src/theme.css' })] })
```

```tsx
// main.tsx — installs the compiled registry as the default className resolver
import 'virtual:three-ui-tailwind/register'

<View className="flex-1 flex-row items-center gap-4 bg-zinc-950 p-4 hover:bg-zinc-900 dark:bg-black md:flex-col">
  <Text className="text-lg font-bold text-white">Hello</Text>
</View>
```

The plugin runs Tailwind's own compiler (`@tailwindcss/node` + its source scanner), converts the generated utilities into a versioned registry (`three-ui-tailwind-registry` v1) and serves it as `virtual:three-ui-tailwind`. At runtime a token lookup + cache resolves `className` per **(className, interaction state, color scheme, breakpoint)**.

## Metro (React Native)

```js
const { withThreeUITailwind } = require('@implicit-invocation/three-ui-tailwind/metro')
module.exports = withThreeUITailwind(config, { css: './src/theme.css' })
```

Same compiler core and registry format as Vite (the wrapper runs `three-ui-tailwind compile` at config time and maps the same virtual module ids). Restart Metro after adding new classes.

## Supported utilities

Layout (`flex*`, `grow/shrink`, `items/justify/self/content`, `gap`, `size/w/h/min/max`, margins/paddings, `absolute/relative`, `inset`, `aspect`, `hidden`), paint (`bg-*`, `opacity`, borders & color, `rounded*` **including per-corner and logical corners**, `overflow-hidden`, `scale/rotate/translate` **including `-translate-x-1/2`-style percentages**), text (size, weight, color, leading, tracking, align, italic), variants `hover:` `active:` `focus:` `disabled:` `dark:` `motion-safe:` `motion-reduce:` `sm: md: lg: xl:` (+ `max-*`). Game-UI additions:

| Area | Classes |
| --- | --- |
| Gradients | `bg-linear-to-{t,tr,r,…}`, `bg-linear-<angle>`, `bg-radial`, `bg-radial-[at_25%_25%]`, `from-*` `via-*` `to-*` (+ `from-10%` positions), `bg-none`, arbitrary `bg-[linear-gradient(135deg,#f00_0%,#00f_100%)]`. Tailwind v4's `in oklab` interpolation is honored (up to 8 stops). |
| Shadows | `shadow-*` (+ `shadow-red-500`, `shadow-xl/30`, `shadow-[0_4px_0_#000]`), `ring`, `ring-N`, `ring-<color>`, `ring-inset`, `ring-offset-*`, `inset-shadow-*`, `inset-ring-*`, arbitrary `[box-shadow:…]`. The separate `--tw-shadow` / `--tw-ring-shadow` / `--tw-inset-*` / `--tw-ring-offset-*` custom properties are kept as data and **composed into one real shadow list** by the resolver (CSS order, per-slot color overrides, ring-offset widths included). |
| Text | `text-shadow-*` (v4.1), `[-webkit-text-stroke:3px_#123]`, `[paint-order:stroke_fill]` (or define `@utility outlined { … }`), `truncate`, `text-ellipsis`, `whitespace-nowrap`, `line-clamp-N`, `tracking-*`, `leading-*`, `text-left/center/right` |
| Images | `object-{fill,contain,cover,none,scale-down}`, `drop-shadow-*` (+ color), `[tint-color:#f00]` |
| Backdrop | `backdrop-blur-*`, `backdrop-brightness-*`, `backdrop-saturate-*` (other backdrop filters warn) |
| Motion | `animate-{spin,ping,pulse,bounce}`, custom `--animate-*` with `@keyframes` in `@theme`, `animate-[spin_2s_linear_infinite]`, `animate-none`, `transition`, `transition-{colors,opacity,shadow,transform,all,none}`, `transition-[width,height]`, `duration-*`, `ease-*`, `delay-*`, `motion-reduce:` / `motion-safe:` |

`@keyframes` are compiled into `registry.keyframes` (build time) and looked up by name at runtime (`resolver.keyframes(name)`, wired into `ThreeUI` automatically). Keyframes may use any animatable style property; **layout** properties inside keyframes (or in `transition-[width]`-style lists) need an explicit opt-in because they re-run Yoga every frame — add `[--ui-animate-layout:1]` next to the `animate-*` class.

- `display: flex` implies Tailwind/CSS's initial **row** direction (explicit `flex-col` always wins, also under variants).
- Rule order follows Tailwind's generated output (not class-string order); inline `style` always beats `className`.
- `transition-all` animates paint properties only (layout properties transition when named explicitly).
- Unsupported utilities (grid, `space-*`, `group-*`, `uppercase`, CSS `filter: blur()`…) **warn at build time** and are skipped.

## Runtime support

The runtime (`@implicit-invocation/three-ui-tailwind`) is platform-neutral. `@implicit-invocation/three-ui-tailwind/compiler`, `/vite`, `/metro` and the CLI run in Node/Bun at build time.

## Examples

[`examples/three-ui-tailwind-vite`](../../examples/three-ui-tailwind-vite)
