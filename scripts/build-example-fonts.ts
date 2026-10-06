/**
 * Bakes the prebuilt bitmap-font fixtures used by the examples (and tests) from the Inter TTFs in
 * test/fixtures/fonts, using the real `@implicit-invocation/three-2d-font` package. Run: `bun run build:fonts`.
 */
import { resolve } from 'node:path'
import { packFontFile } from '@implicit-invocation/three-2d-font/node'

const root = resolve(import.meta.dirname, '..')
const fonts = [
  { file: 'Inter_400Regular.ttf', name: 'inter-regular', weight: 400 },
  { file: 'Inter_700Bold.ttf', name: 'inter-bold', weight: 700 },
]
const sizes = [24, 48]

for (const f of fonts) {
  for (const size of sizes) {
    const out = resolve(root, 'test/fixtures/public/fonts', `${f.name}-${size}`)
    const r = await packFontFile(resolve(root, 'test/fixtures/fonts', f.file), out, {
      size,
      characters: 'latin',
      family: 'Inter',
      weight: f.weight,
      style: 'normal',
      supersample: 4,
      padding: 2,
    })
    console.log(`${f.name}-${size}: ${r.baked.atlas.width}×${r.baked.atlas.height}, ${r.baked.json.glyphs.length} glyphs`)
  }
}

// Display face with a distance channel (text outlines / shadows). Same Inter Bold outlines, registered as weight 800 of
// the family "Inter Display" so `font-extrabold` + a display font family picks it. maxWidth is in px at each baked size.
for (const { size, stroke } of [
  { size: 32, stroke: 8 },
  { size: 64, stroke: 16 },
]) {
  const out = resolve(root, 'test/fixtures/public/fonts', `game-display-${size}`)
  const r = await packFontFile(resolve(root, 'test/fixtures/fonts', 'Inter_700Bold.ttf'), out, {
    size,
    characters: 'latin',
    family: 'Inter Display',
    weight: 800,
    style: 'normal',
    supersample: 4,
    stroke: { maxWidth: stroke },
  })
  console.log(`game-display-${size}: ${r.baked.atlas.width}×${r.baked.atlas.height}, ${r.baked.json.glyphs.length} glyphs, stroke ≤ ${stroke}px`)
}
