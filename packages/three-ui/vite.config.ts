import { resolve } from 'node:path'
import { defineLibraryConfig, externalPackage } from '../../vite.shared.ts'

export default defineLibraryConfig({
  entries: {
    index: resolve(import.meta.dirname, 'src/index.ts'),
    web: resolve(import.meta.dirname, 'src/web.ts'),
  },
  external: [externalPackage('three'), externalPackage('three-2d')],
})
