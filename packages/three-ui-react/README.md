# three-ui-react

React renderer for [`@implicit-invocation/three-ui`](../three-ui), built on `react-reconciler` in **mutation mode**. No React DOM required. The React tree maps to the mutable `@implicit-invocation/three-ui` node tree; updates mutate existing nodes (no remounting for style/text changes).

> ⚠️ **Alpha (0.x)** — `react-reconciler` itself is experimental; this package pins the React + reconciler pair (React 19.3 / reconciler 0.34).

## Install

```bash
bun add @implicit-invocation/three-ui-react @implicit-invocation/three-ui @implicit-invocation/three-2d three react
```

**Peer dependencies:** `react` (`^19.3.0`), `three`. Depends on `@implicit-invocation/three-ui` and `react-reconciler`.

## Usage

```tsx
import { createThreeUI } from '@implicit-invocation/three-ui'
import { createThreeUIRoot, View, Text, ScrollView, Image } from '@implicit-invocation/three-ui-react'

const ui = createThreeUI({ renderer, width, height, pixelRatio })
const root = createThreeUIRoot(ui)

root.render(
  <View style={{ flex: 1, padding: 24, gap: 12 }}>
    <Text style={{ fontSize: 24, fontWeight: 700 }}>Hello three-ui</Text>
    <ScrollView style={{ flex: 1 }}>
      <View onClick={(e) => console.log(e.localX)}><Text>Tap me</Text></View>
    </ScrollView>
  </View>,
)
// you own the frame loop: ui.update(dt); ui.render()
```

Components: `View`, `Text`, `Image`, `AnimatedImage`, `NinePatch`, `ScrollView` · hooks: `useThreeUI()`.

Every host element accepts `style`, `className` (resolved by an installed `ClassNameResolver`, e.g. [`@implicit-invocation/three-ui-tailwind`](../three-ui-tailwind); a dev warning appears if none is installed), `ref` (the underlying `UINode`), `focusable`, `disabled` and the pointer/wheel/key/focus handlers (`onClick`, `onPointerDown/Move/Up/Enter/Leave`, `…Capture`, `onWheel`, `onKeyDown`, `onFocus`, `onBlur`).

`<Text>` children must flatten to strings/numbers (nested elements are rejected in v0.1). Bare strings outside `<Text>` throw an actionable error.

## Runtime support

Browser (WebGPU/WebGL2) and React Native (Hermes) — the package contains no DOM code. All reconciler specifics live in `src/renderer/`.

## Resources & disposal

Unmounting removes handlers and disposes every `UINode` (Yoga nodes freed). `root.unmount()` tears down the host view.

## Examples

[`three-ui-react-vite`](../../examples/three-ui-react-vite) (style objects) · [`three-ui-tailwind-vite`](../../examples/three-ui-tailwind-vite) (Tailwind).
