import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  // prebuilt bitmap fonts (test/fixtures/public/fonts) are served at /fonts
  publicDir: resolve(import.meta.dirname, '../../test/fixtures/public'),
  server: { port: 5171, strictPort: true },
  preview: { port: 5171, strictPort: true },
  build: { target: 'es2022' },
})
