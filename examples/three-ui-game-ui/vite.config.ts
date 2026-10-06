import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { threeUITailwind } from '@implicit-invocation/three-ui-tailwind/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    // Compiles Tailwind v4 (classes, @theme, @keyframes) with its own compiler into style data; no CSS at runtime.
    threeUITailwind({ css: './src/theme.css', ignoreWarningsFor: ['transform', 'filter'] }),
  ],
  publicDir: resolve(import.meta.dirname, '../../test/fixtures/public'),
  server: { port: 5175, strictPort: true },
  preview: { port: 5175, strictPort: true },
  build: { target: 'es2022' },
})
