import { resolve } from 'node:path'
import { defineLibraryConfig, externalPackage } from '../../vite.shared.ts'

export default defineLibraryConfig({
  entries: { index: resolve(import.meta.dirname, 'src/index.ts') },
  external: [externalPackage('react'), externalPackage('react-reconciler'), externalPackage('three'), externalPackage('@implicit-invocation/three-2d'), externalPackage('@implicit-invocation/three-ui')],
})
