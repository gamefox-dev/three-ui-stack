import { resolve } from 'node:path'
import { defineLibraryConfig, externalPackage } from '../../vite.shared.ts'

export default defineLibraryConfig({
  entries: {
    index: resolve(import.meta.dirname, 'src/index.ts'),
    node: resolve(import.meta.dirname, 'src/node.ts'),
    cli: resolve(import.meta.dirname, 'src/cli.ts'),
  },
  external: [externalPackage('three'), externalPackage('@implicit-invocation/three-2d'), externalPackage('opentype.js'), /^node:/],
})
