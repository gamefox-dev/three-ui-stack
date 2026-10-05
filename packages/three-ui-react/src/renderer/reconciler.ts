import ReactReconciler from 'react-reconciler'
import { hostConfig } from './hostConfig'

/** The one reconciler instance for three-ui (mutation mode). */
export const reconciler = ReactReconciler(hostConfig as never) as unknown as {
  createContainer(...args: unknown[]): unknown
  updateContainer(element: unknown, container: unknown, parent: unknown, callback: (() => void) | null): void
  updateContainerSync?(element: unknown, container: unknown, parent: unknown, callback: (() => void) | null): void
  flushSyncWork?(): void
  flushSyncFromReconciler?(fn?: () => void): void
  batchedUpdates?<T>(fn: () => T): T
  injectIntoDevTools?(config: unknown): boolean
}
