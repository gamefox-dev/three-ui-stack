import { resolve } from 'node:path'
import { defineLibraryConfig, externalPackage } from '../../vite.shared.ts'

export default defineLibraryConfig({
  entries: {
    index: resolve(import.meta.dirname, 'src/index.ts'),
    compiler: resolve(import.meta.dirname, 'src/compiler.ts'),
    vite: resolve(import.meta.dirname, 'src/vite.ts'),
    metro: resolve(import.meta.dirname, 'src/metro.ts'),
    'compile-cli': resolve(import.meta.dirname, 'src/compile-cli.ts'),
  },
  external: [
    externalPackage('@implicit-invocation/three-ui'),
    externalPackage('vite'),
    externalPackage('tailwindcss'),
    externalPackage('@tailwindcss/node'),
    externalPackage('@tailwindcss/oxide'),
    /^node:/,
  ],
})
