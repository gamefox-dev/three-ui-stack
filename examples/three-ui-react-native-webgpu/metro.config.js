// Metro / Expo — the app is bundled by Metro, NOT Vite. The libraries themselves are built with Vite and consumed
// through their normal `exports`; nothing is aliased to source.
const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
const config = getDefaultConfig(projectRoot)

// monorepo: watch the workspace (packages' dist is rebuilt by `bun run dev:packages`) and resolve from both node_modules roots
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules'), path.join(workspaceRoot, 'node_modules')]

// Resolve packages through `exports`. The `react-native` condition comes first so a package can ship a native entry
// (`"react-native": "./dist/index.native.js"`) the day a real platform difference appears; today every package uses
// the plain `import`/`default` entry, and `pnpm`-style duplicate copies of three/react are prevented by the root install.
config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_conditionNames = ['react-native', 'import', 'default']

// React Native's renderer is pinned to one exact React version (19.2.3 for RN 0.86). Workspace packages are devDependency-
// linked to the monorepo's own React, so force every `react` import (including three-ui-react's) to this app's copy.
const reactDir = path.dirname(require.resolve('react/package.json', { paths: [projectRoot] }))
const upstreamResolve = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    return context.resolveRequest({ ...context, originModulePath: path.join(projectRoot, 'index.js') }, moduleName, platform)
  }
  return (upstreamResolve ?? context.resolveRequest)(context, moduleName, platform)
}
void reactDir

// Tailwind (milestone 8) — enable once the example switches from `style` to `className`:
// const { withThreeUITailwind } = require('three-ui-tailwind/metro')
// module.exports = withThreeUITailwind(config, { css: './src/theme.css' })
module.exports = config
