import { defineConfig } from 'vitest/config'

const projects = [
  'three-2d',
  'three-2d-font',
  'three-ui',
  'three-ui-react',
  'three-ui-tailwind',
].map((name) => ({
  test: {
    name,
    root: `packages/${name}`,
    environment: 'node',
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
  },
}))

// Vitest ≥ 4 replaced `vitest.workspace.ts` with `test.projects`.
export default defineConfig({
  test: { projects },
})
