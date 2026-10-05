# Contributing

## Setup

```bash
bun --version        # >= 1.4.2 (pinned in package.json "packageManager" and CI)
bun install
bun run build:packages
```

`bun run check` runs everything CI runs: typecheck, tests, builds, export-map and architecture-boundary checks.

## Layout rules

- Public libraries live in `packages/*`, are **ESM only**, built with **Vite library mode** (`vite.shared.ts`) and emit
  JS + source maps (`vite build`) and declarations (`tsc -p tsconfig.build.json`).
- Shared third-party versions are centralized in the root `package.json` `workspaces.catalog`. Use `catalog:` and
  `workspace:^` in package manifests; `bun pm pack` rewrites both before publication.
- Examples (`examples/*`) are private, consume packages through their normal `exports`, and are never published.
- `bun run check:boundaries` fails on architecture violations (see the root README). Keep core packages DOM-free; web-only
  code goes in clearly named adapters (`three-ui/src/web.ts`).

## Yoga asm.js

`yoga-layout@3.x` is WebAssembly-only. `three-ui` ships an asm.js build derived from the same release:

```bash
bun run build:yoga-asm                    # regenerate packages/three-ui/src/yoga/generated/*
bun scripts/build-yoga-asm.ts --check     # verify the committed artifact is up to date
```

Tests prove asm.js and the WASM binding produce identical layouts (`packages/three-ui/test/yoga.test.ts`, snapshot
fixtures in `test/fixtures/layouts`) and that the asm build initializes with the `WebAssembly` global deleted.

## Fonts

`bun run build:fonts` re-bakes `test/fixtures/public/fonts` (served by every example at `/fonts`) from the Inter TTFs in
`test/fixtures/fonts`.

## Releasing

1. `bun run changeset` for every user-visible change.
2. Maintainer: `bun run version-packages` (applies versions + changelogs, refreshes `bun.lock`), review, commit.
3. `bun run release` (or `release:next`). It runs `check`, `pack:smoke`, then `scripts/publish-packages.ts`, which packs with
   `bun pm pack`, rejects any `workspace:`/`catalog:` leftovers and publishes in dependency order with `bun publish`.

**Never publish from an automated agent or CI without explicit maintainer approval.**

### npm names

Before the first publish verify availability of every name. At the time of writing `three-2d`, `three-2d-font`,
`three-ui-react` and `three-ui-tailwind` are free but **`three-ui` is already taken** on the public registry (a different,
unrelated project). Package names are intentionally *not* renamed in the repo; resolve this (scope, rename or transfer)
before publishing and document the decision here.

## Browser verification

Rendering changes should be checked in a real browser on both backends (WebGPU and `?webgl`). Headless Chrome with
`--enable-unsafe-webgpu --use-angle=metal` (macOS) works for screenshots.
