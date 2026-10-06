import type { AnimatedImage, Image, NinePatchView, ScrollView, Text, UIAnimationEvent, UIEvent, UIFocusEvent, UIKeyEvent, UINode, UIPointerEvent, UITransitionEvent, UIWheelEvent } from '@implicit-invocation/three-ui'
import type { Animation, NinePatch, TextureRegion } from '@implicit-invocation/three-2d'
import type { Texture } from 'three'
import type { Style } from '@implicit-invocation/three-ui'

/** Host element types. Public code imports the typed components, not these strings. */
export type HostType = 'tui-view' | 'tui-text' | 'tui-image' | 'tui-animatedimage' | 'tui-ninepatch' | 'tui-scrollview'

export type HostProps = Record<string, unknown> & {
  style?: unknown
  className?: string
  children?: unknown
}

/** Prop name → UI event type (+ capture flag). */
export const EVENT_PROPS: Readonly<Record<string, { type: string; capture: boolean; priority: 'discrete' | 'continuous' }>> = {
  onPointerDown: { type: 'pointerdown', capture: false, priority: 'discrete' },
  onPointerDownCapture: { type: 'pointerdown', capture: true, priority: 'discrete' },
  onPointerMove: { type: 'pointermove', capture: false, priority: 'continuous' },
  onPointerMoveCapture: { type: 'pointermove', capture: true, priority: 'continuous' },
  onPointerUp: { type: 'pointerup', capture: false, priority: 'discrete' },
  onPointerUpCapture: { type: 'pointerup', capture: true, priority: 'discrete' },
  onPointerCancel: { type: 'pointercancel', capture: false, priority: 'discrete' },
  onPointerEnter: { type: 'pointerenter', capture: false, priority: 'continuous' },
  onPointerLeave: { type: 'pointerleave', capture: false, priority: 'continuous' },
  onClick: { type: 'click', capture: false, priority: 'discrete' },
  onClickCapture: { type: 'click', capture: true, priority: 'discrete' },
  onWheel: { type: 'wheel', capture: false, priority: 'continuous' },
  onKeyDown: { type: 'keydown', capture: false, priority: 'discrete' },
  onKeyUp: { type: 'keyup', capture: false, priority: 'discrete' },
  onFocus: { type: 'focus', capture: false, priority: 'discrete' },
  onBlur: { type: 'blur', capture: false, priority: 'discrete' },
  onAnimationStart: { type: 'animationstart', capture: false, priority: 'continuous' },
  onAnimationIteration: { type: 'animationiteration', capture: false, priority: 'continuous' },
  onAnimationEnd: { type: 'animationend', capture: false, priority: 'discrete' },
  onAnimationCancel: { type: 'animationcancel', capture: false, priority: 'discrete' },
  onTransitionStart: { type: 'transitionstart', capture: false, priority: 'continuous' },
  onTransitionEnd: { type: 'transitionend', capture: false, priority: 'discrete' },
  onTransitionCancel: { type: 'transitioncancel', capture: false, priority: 'discrete' },
}

/** Props may be passed as `undefined` (conditional props under `exactOptionalPropertyTypes`). */
type Opt<T> = { [K in keyof T]?: T[K] | undefined }

interface CommonPropsDef<T extends UINode = UINode> {
  style?: import('@implicit-invocation/three-ui').StyleProp
  /** Resolved by the installed `ClassNameResolver` (e.g. `@implicit-invocation/three-ui-tailwind`). */
  className?: string | undefined
  children?: import('react').ReactNode
  /** Debug name (shows up in warnings and devtools). */
  name?: string
  focusable?: boolean
  disabled?: boolean
  ref?: import('react').Ref<T>

  onPointerDown?: (event: UIPointerEvent) => void
  onPointerDownCapture?: (event: UIPointerEvent) => void
  onPointerMove?: (event: UIPointerEvent) => void
  onPointerMoveCapture?: (event: UIPointerEvent) => void
  onPointerUp?: (event: UIPointerEvent) => void
  onPointerUpCapture?: (event: UIPointerEvent) => void
  onPointerCancel?: (event: UIPointerEvent) => void
  onPointerEnter?: (event: UIPointerEvent) => void
  onPointerLeave?: (event: UIPointerEvent) => void
  onClick?: (event: UIPointerEvent) => void
  onClickCapture?: (event: UIPointerEvent) => void
  onWheel?: (event: UIWheelEvent) => void
  onKeyDown?: (event: UIKeyEvent) => void
  onKeyUp?: (event: UIKeyEvent) => void
  onFocus?: (event: UIFocusEvent) => void
  onBlur?: (event: UIFocusEvent) => void
  /** CSS animation lifecycle (`animate-*` classes, style `animation`, `node.animate()`); they bubble like DOM events. */
  onAnimationStart?: (event: UIAnimationEvent) => void
  onAnimationIteration?: (event: UIAnimationEvent) => void
  onAnimationEnd?: (event: UIAnimationEvent) => void
  onAnimationCancel?: (event: UIAnimationEvent) => void
  onTransitionStart?: (event: UITransitionEvent) => void
  onTransitionEnd?: (event: UITransitionEvent) => void
  onTransitionCancel?: (event: UITransitionEvent) => void
}

export type CommonProps<T extends UINode = UINode> = Opt<CommonPropsDef<T>>

export type ViewProps = CommonProps<import('@implicit-invocation/three-ui').View>

/** Strings and numbers only as children (no nested elements in v0.1). */
export type TextProps = CommonProps<Text>

export type ImageProps = Omit<CommonProps<Image>, 'children'> &
  Opt<{
    source: TextureRegion | Texture | null
    resizeMode: 'stretch' | 'contain' | 'cover' | 'center'
    /** Source pixels per logical pixel (2 for @2x assets). */
    scale: number
  }>

export type AnimatedImageProps = Omit<CommonProps<AnimatedImage>, 'children'> &
  Opt<{
    animation: Animation<TextureRegion> | null
    playing: boolean
    resizeMode: 'stretch' | 'contain' | 'cover' | 'center'
    scale: number
  }>

export type NinePatchProps = CommonProps<NinePatchView> & Opt<{ patch: NinePatch | null }>

export type ScrollViewProps = CommonProps<ScrollView> &
  Opt<{
    /** Fixed at mount (changing it after mount is unsupported). */
    horizontal: boolean
    showsScrollIndicator: boolean
    onScroll: (x: number, y: number) => void
  }>

export type { Style, UIEvent }
