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

## Supported utilities (v0.1)

Layout (`flex*`, `grow/shrink`, `items/justify/self/content`, `gap`, `size/w/h/min/max`, margins/paddings, `absolute/relative`, `inset`, `aspect`, `hidden`), paint (`bg-*`, `opacity`, borders & color, `rounded*` uniform, `overflow-hidden`, `scale/rotate/translate`), text (size, weight, color, leading, tracking, align, italic), variants `hover:` `active:` `focus:` `disabled:` `dark:` `sm: md: lg: xl:` (+ `max-*`).

- `display: flex` implies Tailwind/CSS's initial **row** direction (explicit `flex-col` always wins, also under variants).
- Rule order follows Tailwind's generated output (not class-string order); inline `style` always beats `className`.
- Unsupported utilities (grid, shadows, `space-*`, `group-*`, per-corner radii, `uppercase`, …) **warn at build time** and are skipped.

## Runtime support

The runtime (`@implicit-invocation/three-ui-tailwind`) is platform-neutral. `@implicit-invocation/three-ui-tailwind/compiler`, `/vite`, `/metro` and the CLI run in Node/Bun at build time.

## Examples

[`examples/three-ui-tailwind-vite`](../../examples/three-ui-tailwind-vite)
