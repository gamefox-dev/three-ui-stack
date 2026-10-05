import { resolve } from 'node:path'
import { defineLibraryConfig, externalPackage } from '../../vite.shared.ts'

export default defineLibraryConfig({
  entries: { index: resolve(import.meta.dirname, 'src/index.ts') },
  external: [externalPackage('react'), externalPackage('react-reconciler'), externalPackage('three'), externalPackage('three-2d'), externalPackage('three-ui')],
})
