import { defineConfig, type UserConfig } from 'vite'

export interface LibraryConfigOptions {
  /** Named entry points → absolute source paths. Each becomes `dist/<name>.js`. */
  entries: Record<string, string>
  /** Modules that must never be bundled into library output. */
  external: (string | RegExp)[]
  /** Declarations are emitted by the package `build` script (`tsc -p tsconfig.build.json`). */
  dts?: boolean
  target?: string
}

/**
 * Shared Vite library-mode policy for all public packages:
 * ESM only, deterministic file names, sources maps, unminified, explicit externals.
 */
export function defineLibraryConfig(options: LibraryConfigOptions): UserConfig {
  const { entries, external, target = 'es2022' } = options
  return defineConfig({
    build: {
      target,
      lib: {
        entry: entries,
        formats: ['es'],
        fileName: (_format, entryName) => `${entryName}.js`,
      },
      sourcemap: true,
      minify: false,
      emptyOutDir: true,
      outDir: 'dist',
      rolldownOptions: {
        external,
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          // Source maps must never embed absolute local paths.
          sourcemapPathTransform: (relativeSourcePath: string) =>
            relativeSourcePath.replace(/^(\.\.\/)+/, ''),
          sourcemapExcludeSources: false,
        },
      },
    },
  })
}

/** Helper: externalize a package name and all of its subpaths. */
export function externalPackage(name: string): RegExp {
  return new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}(/.*)?$`)
}
