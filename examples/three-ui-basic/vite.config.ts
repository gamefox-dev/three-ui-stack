import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: resolve(import.meta.dirname, '../../test/fixtures/public'),
  server: { port: 5172, strictPort: true },
  preview: { port: 5172, strictPort: true },
  build: { target: 'es2022' },
})
