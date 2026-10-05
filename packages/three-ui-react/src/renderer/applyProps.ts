import { AnimatedImage, Image, NinePatchView, ScrollView, Text, type UIEvent, type UINode } from '@implicit-invocation/three-ui'
import { EVENT_PROPS, type HostProps, type HostType } from './props'

interface Bridge {
  fn: ((e: never) => void) | undefined
  remove: () => void
}

/** Per-node table of stable DOM-like listeners so replacing a handler never re-subscribes. */
const bridges = new WeakMap<UINode, Map<string, Bridge>>()
const hidden = new WeakSet<UINode>()

/** Hook installed by the reconciler to run handlers at the right update priority. */
export let runWithPriority: (priority: 'discrete' | 'continuous', fn: () => void) => void = (_p, fn) => fn()
export function setPriorityRunner(runner: typeof runWithPriority): void {
  runWithPriority = runner
}

function flattenText(children: unknown, out: string[] = []): string[] {
  if (children === null || children === undefined || typeof children === 'boolean') return out
  if (typeof children === 'string' || typeof children === 'number') out.push(String(children))
  else if (Array.isArray(children)) for (const c of children) flattenText(c, out)
  else throw new Error('[three-ui-react] <Text> children must be strings or numbers; nested elements are not supported in v0.1')
  return out
}

function syncEvents(node: UINode, prev: HostProps, next: HostProps): void {
  let table = bridges.get(node)
  for (const prop in EVENT_PROPS) {
    const nextFn = next[prop] as ((e: never) => void) | undefined
    const prevFn = prev[prop]
    if (nextFn === prevFn && (table?.has(prop) ?? false) === (typeof nextFn === 'function')) continue
    const entry = table?.get(prop)
    if (typeof nextFn === 'function') {
      if (entry) {
        entry.fn = nextFn
      } else {
        const { type, capture, priority } = EVENT_PROPS[prop]!
        const bridge: Bridge = { fn: nextFn, remove: () => {} }
        const listener = (e: UIEvent) => {
          const f = bridge.fn
          if (f) runWithPriority(priority, () => (f as (e: UIEvent) => void)(e))
        }
        bridge.remove = node.addEventListener(type as never, listener as never, capture)
        if (!table) bridges.set(node, (table = new Map()))
        table.set(prop, bridge)
      }
    } else if (entry) {
      entry.remove()
      table!.delete(prop)
    }
  }
}

/** Create the UI node for a host element. */
export function createNode(type: HostType, props: HostProps): UINode {
  const base = { name: props.name as string | undefined, focusable: props.focusable as boolean | undefined, disabled: props.disabled as boolean | undefined }
  let node: UINode
  switch (type) {
    case 'tui-text':
      node = new Text({ ...base, text: flattenText(props.children).join('') })
      break
    case 'tui-image':
      node = new Image({ ...base, ...(props.resizeMode ? { resizeMode: props.resizeMode as never } : {}), ...(props.scale ? { scale: props.scale as number } : {}) })
      break
    case 'tui-animatedimage':
      node = new AnimatedImage({ ...base, ...(props.resizeMode ? { resizeMode: props.resizeMode as never } : {}), ...(props.scale ? { scale: props.scale as number } : {}) })
      break
    case 'tui-ninepatch':
      node = new NinePatchView(base)
      break
    case 'tui-scrollview':
      node = new ScrollView({ ...base, horizontal: props.horizontal === true })
      break
    default:
      node = new (ViewCtor())(base)
  }
  applyProps(node, type, {}, props)
  return node
}

// `View` lives in three-ui; resolved lazily to keep this module's import list tidy.
import { View } from '@implicit-invocation/three-ui'
function ViewCtor(): typeof View {
  return View
}

/** Mutate `node` to match `next`. Never recreates nodes for ordinary style/text changes. */
export function applyProps(node: UINode, type: HostType, prev: HostProps, next: HostProps): void {
  if (prev.style !== next.style) node.setStyle(hiddenAware(node, next.style))
  if (prev.className !== next.className) node.setClassName((next.className as string | undefined) ?? '')
  if (prev.focusable !== next.focusable) node.focusable = next.focusable === true
  if (prev.disabled !== next.disabled) node.setDisabled(next.disabled === true)
  if (prev.name !== next.name) node.name = next.name as string | undefined
  syncEvents(node, prev, next)

  switch (type) {
    case 'tui-text': {
      const nextText = flattenText(next.children).join('')
      const t = node as Text
      if (t.text !== nextText) t.setText(nextText)
      break
    }
    case 'tui-image':
    case 'tui-animatedimage': {
      const img = node as Image
      if (prev.source !== next.source && type === 'tui-image') img.setSource((next.source as never) ?? null)
      if (prev.resizeMode !== next.resizeMode) img.setResizeMode((next.resizeMode as never) ?? 'stretch')
      if (prev.scale !== next.scale) img.setScale((next.scale as number | undefined) ?? 1)
      if (type === 'tui-animatedimage') {
        const a = node as AnimatedImage
        if (prev.animation !== next.animation) a.setAnimation((next.animation as never) ?? null)
        if (prev.playing !== next.playing) a.setPlaying(next.playing !== false)
      }
      break
    }
    case 'tui-ninepatch':
      if (prev.patch !== next.patch) (node as NinePatchView).setPatch((next.patch as never) ?? null)
      break
    case 'tui-scrollview': {
      const s = node as ScrollView
      if (prev.onScroll !== next.onScroll) s.onScroll = next.onScroll as never
      if (prev.showsScrollIndicator !== next.showsScrollIndicator) s.showsScrollIndicator = next.showsScrollIndicator !== false
      break
    }
  }
}

function hiddenAware(node: UINode, style: unknown): never {
  return (hidden.has(node) ? [style, { display: 'none' }] : style) as never
}

/** Suspense support: hide without removing. */
export function setHidden(node: UINode, props: HostProps, isHidden: boolean): void {
  if (isHidden) hidden.add(node)
  else hidden.delete(node)
  node.setStyle(hiddenAware(node, props.style))
}

/** Drop every handler bridge and free the node. */
export function releaseNode(node: UINode): void {
  const table = bridges.get(node)
  if (table) {
    for (const b of table.values()) b.remove()
    table.clear()
    bridges.delete(node)
  }
  hidden.delete(node)
  node.dispose()
}

/** Number of live handler bridges on a node (test hook for leak checks). */
export function bridgeCount(node: UINode): number {
  return bridges.get(node)?.size ?? 0
}
