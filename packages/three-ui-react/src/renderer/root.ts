import { createElement, version as reactVersion, type ReactNode } from 'react'
import { View, type ThreeUI } from '@implicit-invocation/three-ui'
import { ThreeUIContext } from '../context'
import type { Container } from './hostConfig'
import { reconciler } from './reconciler'

export interface ThreeUIRoot {
  /** Render (or update) the React tree. */
  render(node: ReactNode): void
  /** Unmount the tree, dispose every node and detach the host from the UI. */
  unmount(): void
}

const ConcurrentRoot = 1
const noop = () => {}

let devtoolsInjected = false
function injectDevTools(): void {
  if (devtoolsInjected) return
  devtoolsInjected = true
  try {
    // Lets React DevTools / Fast Refresh (dev) see this renderer.
    reconciler.injectIntoDevTools?.({ bundleType: 1, version: reactVersion, rendererPackageName: '@implicit-invocation/three-ui-react', findFiberByHostInstance: () => null })
  } catch {
    /* optional */
  }
}

let versionChecked = false
function checkVersions(): void {
  if (versionChecked) return
  versionChecked = true
  if (!/^19\./.test(reactVersion)) {
    ;(globalThis as { console?: { warn(...a: unknown[]): void } }).console?.warn(
      `[three-ui-react] React ${reactVersion} is untested; this package pins react-reconciler 0.34 for React 19.3. Expect breakage.`,
    )
  }
}

/**
 * Create a React root that renders into a `ThreeUI`. The React tree is mounted inside a host `View`
 * (`flex: 1`) that becomes the UI root, so a top-level `flex: 1` element fills the viewport.
 */
export function createThreeUIRoot(ui: ThreeUI): ThreeUIRoot {
  checkVersions()
  injectDevTools()
  const host = new View({ name: 'react-root', style: { flex: 1 } })
  ui.setRoot(host)
  const container: Container = { ui, host }
  const onError = (error: unknown) => {
    ;(globalThis as { console?: { error(...a: unknown[]): void } }).console?.error(error)
  }
  const fiberRoot = reconciler.createContainer(container, ConcurrentRoot, null, false, null, '@implicit-invocation/three-ui', onError, onError, onError, noop, null)
  let unmounted = false
  return {
    render(node) {
      if (unmounted) throw new Error('[three-ui-react] render() after unmount()')
      reconciler.updateContainer(createElement(ThreeUIContext.Provider, { value: ui }, node), fiberRoot, null, null)
    },
    unmount() {
      if (unmounted) return
      unmounted = true
      // Tear the host down only after React has committed the deletions (they still touch `host`).
      const finish = () => {
        if (ui.root === host) ui.setRoot(null)
        host.dispose()
      }
      reconciler.updateContainer(null, fiberRoot, null, finish)
      reconciler.flushSyncWork?.()
    },
  }
}
