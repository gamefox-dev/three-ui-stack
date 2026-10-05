import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { threeUITailwind } from '@implicit-invocation/three-ui-tailwind/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Compiles Tailwind v4 with its own compiler and serves the result as style data (no CSS at runtime).
    threeUITailwind({ css: './src/theme.css', ignoreWarningsFor: ['transform'] }),
  ],
  publicDir: resolve(import.meta.dirname, '../../test/fixtures/public'),
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
  build: { target: 'es2022' },
})
