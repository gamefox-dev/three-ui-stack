import { DefaultEventPriority, ContinuousEventPriority, DiscreteEventPriority, NoEventPriority } from 'react-reconciler/constants.js'
import type { ThreeUI, UINode, View } from 'three-ui'
import { applyProps, createNode, releaseNode, setHidden, setPriorityRunner } from './applyProps'
import type { HostProps, HostType } from './props'

/** Container handed to the reconciler: the host `View` that holds the React tree plus its UI. */
export interface Container {
  ui: ThreeUI
  host: View
}

const NO_CONTEXT = {}

let currentUpdatePriority: number = NoEventPriority

function resolvePriority(): number {
  return currentUpdatePriority !== NoEventPriority ? currentUpdatePriority : DefaultEventPriority
}

setPriorityRunner((priority, fn) => {
  const prev = currentUpdatePriority
  currentUpdatePriority = priority === 'discrete' ? DiscreteEventPriority : ContinuousEventPriority
  try {
    fn()
  } finally {
    currentUpdatePriority = prev
  }
})

// Host timers come from globalThis so this module typechecks without DOM or Node typings (also true on Hermes).
const host = globalThis as unknown as {
  setTimeout(fn: (...args: unknown[]) => unknown, delay?: number): number
  clearTimeout(id: number): void
  queueMicrotask?: (fn: () => void) => void
}
const queueMicro: (fn: () => void) => void = typeof host.queueMicrotask === 'function' ? (fn) => host.queueMicrotask!(fn) : (fn) => void Promise.resolve().then(fn)

/**
 * react-reconciler host config (mutation mode). All reconciler-specific behavior lives in this folder;
 * `three-ui` itself never sees React.
 */
export const hostConfig = {
  // ───────── capabilities ─────────
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  supportsResources: false,
  supportsSingletons: false,
  supportsTestSelectors: false,
  isPrimaryRenderer: true,
  warnsIfNotActing: true,
  supportsMicrotasks: true,
  scheduleMicrotask: queueMicro,
  scheduleTimeout: (fn: (...args: unknown[]) => unknown, delay?: number) => host.setTimeout(fn, delay),
  cancelTimeout: (id: number) => host.clearTimeout(id),
  noTimeout: -1 as const,

  // ───────── instances ─────────
  getRootHostContext: () => NO_CONTEXT,
  getChildHostContext: () => NO_CONTEXT,
  shouldSetTextContent: (type: HostType) => type === 'tui-text',
  createInstance(type: HostType, props: HostProps): UINode {
    return createNode(type, props)
  },
  createTextInstance(text: string): never {
    throw new Error(`[three-ui-react] Text strings must be rendered inside a <Text> component (got "${text.slice(0, 40)}")`)
  },
  appendInitialChild(parent: UINode, child: UINode): void {
    parent.append(child)
  },
  finalizeInitialChildren: () => false,
  getPublicInstance: (instance: UINode) => instance,
  prepareForCommit: () => null,
  resetAfterCommit: () => {},
  preparePortalMount: () => {},

  // ───────── mutation ─────────
  appendChild(parent: UINode, child: UINode): void {
    parent.append(child)
  },
  appendChildToContainer(container: Container, child: UINode): void {
    container.host.append(child)
  },
  insertBefore(parent: UINode, child: UINode, before: UINode): void {
    parent.insert(child, parent.indexOf(before))
  },
  insertInContainerBefore(container: Container, child: UINode, before: UINode): void {
    container.host.insert(child, container.host.indexOf(before))
  },
  removeChild(parent: UINode, child: UINode): void {
    parent.remove(child)
  },
  removeChildFromContainer(container: Container, child: UINode): void {
    if (!container.host.isDisposed) container.host.remove(child)
  },
  clearContainer(container: Container): void {
    if (container.host.isDisposed) return
    for (const c of [...container.host.children]) container.host.remove(c)
  },
  commitUpdate(instance: UINode, type: HostType, prevProps: HostProps, nextProps: HostProps): void {
    applyProps(instance, type, prevProps, nextProps)
  },
  commitTextUpdate(): void {},
  resetTextContent(): void {},
  hideInstance(instance: UINode): void {
    setHidden(instance, {}, true)
  },
  unhideInstance(instance: UINode, props: HostProps): void {
    setHidden(instance, props, false)
  },
  hideTextInstance(): void {},
  unhideTextInstance(): void {},
  detachDeletedInstance(instance: UINode): void {
    releaseNode(instance)
  },
  commitMount(): void {},
  getInstanceFromNode: () => null,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  prepareScopeUpdate: () => {},
  getInstanceFromScope: () => null,

  // ───────── priorities / transitions (React 19) ─────────
  getCurrentUpdatePriority: () => currentUpdatePriority,
  setCurrentUpdatePriority(p: number): void {
    currentUpdatePriority = p
  },
  resolveUpdatePriority: resolvePriority,
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1.1,
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent: () => {},
  requestPostPaintCallback: () => {},
  maySuspendCommit: () => false,
  preloadInstance: () => true,
  startSuspendingCommit: () => {},
  suspendInstance: () => {},
  waitForCommitToBeReady: () => null,
  NotPendingTransition: null,
  HostTransitionContext: { $$typeof: Symbol.for('react.context'), _currentValue: null, _currentValue2: null, _threadCount: 0, Provider: null, Consumer: null } as never,
  resetFormInstance: () => {},
}
