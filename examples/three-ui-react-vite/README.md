# three-ui-react-vite

Vite + React (**no Tailwind**, `style` objects only) rendering into `three-ui` via `three-ui-react` (react-reconciler, mutation mode).

```bash
bun run dev        # http://localhost:5173   (?webgl for the WebGL2 backend)
bun run build
```

Shows: state updates mutating existing nodes (no remounts — look at the component render counter), keyed list
insert/reorder/remove, event handlers (`onClick`, pointer capture/bubble with `stopPropagation`), a 300-row React-rendered `ScrollView`
and live `ui.stats` through `useThreeUI()`.
