import type { UINode } from '../core/UINode'

export type UIEventPhase = 'none' | 'capture' | 'target' | 'bubble'

export type UIPointerEventType = 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel' | 'pointerenter' | 'pointerleave' | 'click'
export type UIEventType = UIPointerEventType | 'wheel' | 'keydown' | 'keyup' | 'focus' | 'blur'

export interface Modifiers {
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export const NO_MODIFIERS: Modifiers = { altKey: false, ctrlKey: false, metaKey: false, shiftKey: false }

/** Base event with capture → target → bubble propagation. */
export class UIEvent {
  target: UINode
  currentTarget: UINode | null = null
  phase: UIEventPhase = 'none'
  defaultPrevented = false
  propagationStopped = false
  readonly timeStamp: number

  constructor(
    readonly type: UIEventType,
    target: UINode,
    readonly bubbles: boolean,
    timeStamp = 0,
  ) {
    this.target = target
    this.timeStamp = timeStamp
  }

  stopPropagation(): void {
    this.propagationStopped = true
  }

  preventDefault(): void {
    this.defaultPrevented = true
  }
}

export interface PointerEventInit extends Partial<Modifiers> {
  pointerId?: number
  pointerType?: 'mouse' | 'touch' | 'pen'
  button?: number
  buttons?: number
  timeStamp?: number
}

export class UIPointerEvent extends UIEvent {
  readonly pointerId: number
  readonly pointerType: 'mouse' | 'touch' | 'pen'
  /** Position in root (logical pixel) coordinates. */
  readonly x: number
  readonly y: number
  readonly button: number
  readonly buttons: number
  readonly altKey: boolean
  readonly ctrlKey: boolean
  readonly metaKey: boolean
  readonly shiftKey: boolean

  constructor(type: UIPointerEventType, target: UINode, x: number, y: number, init: PointerEventInit = {}) {
    super(type, target, type !== 'pointerenter' && type !== 'pointerleave', init.timeStamp ?? 0)
    this.x = x
    this.y = y
    this.pointerId = init.pointerId ?? 1
    this.pointerType = init.pointerType ?? 'mouse'
    this.button = init.button ?? 0
    this.buttons = init.buttons ?? 0
    this.altKey = init.altKey ?? false
    this.ctrlKey = init.ctrlKey ?? false
    this.metaKey = init.metaKey ?? false
    this.shiftKey = init.shiftKey ?? false
  }

  /** X relative to `currentTarget`'s top-left (logical px). */
  get localX(): number {
    return this.currentTarget ? this.x - this.currentTarget.getAbsoluteRect().x : this.x
  }

  get localY(): number {
    return this.currentTarget ? this.y - this.currentTarget.getAbsoluteRect().y : this.y
  }
}

export class UIWheelEvent extends UIEvent {
  readonly altKey: boolean
  readonly ctrlKey: boolean
  readonly metaKey: boolean
  readonly shiftKey: boolean

  constructor(
    target: UINode,
    readonly x: number,
    readonly y: number,
    readonly deltaX: number,
    readonly deltaY: number,
    init: Partial<Modifiers> & { timeStamp?: number } = {},
  ) {
    super('wheel', target, true, init.timeStamp ?? 0)
    this.altKey = init.altKey ?? false
    this.ctrlKey = init.ctrlKey ?? false
    this.metaKey = init.metaKey ?? false
    this.shiftKey = init.shiftKey ?? false
  }
}

export interface KeyInit extends Partial<Modifiers> {
  repeat?: boolean
  timeStamp?: number
}

export class UIKeyEvent extends UIEvent {
  readonly repeat: boolean
  readonly altKey: boolean
  readonly ctrlKey: boolean
  readonly metaKey: boolean
  readonly shiftKey: boolean

  constructor(
    type: 'keydown' | 'keyup',
    target: UINode,
    readonly key: string,
    readonly code: string,
    init: KeyInit = {},
  ) {
    super(type, target, true, init.timeStamp ?? 0)
    this.repeat = init.repeat ?? false
    this.altKey = init.altKey ?? false
    this.ctrlKey = init.ctrlKey ?? false
    this.metaKey = init.metaKey ?? false
    this.shiftKey = init.shiftKey ?? false
  }
}

export class UIFocusEvent extends UIEvent {
  constructor(
    type: 'focus' | 'blur',
    target: UINode,
    readonly relatedTarget: UINode | null,
    timeStamp = 0,
  ) {
    super(type, target, false, timeStamp)
  }
}

export type UIEventHandler<E extends UIEvent = UIEvent> = (event: E) => void

export interface EventMap {
  pointerdown: UIPointerEvent
  pointermove: UIPointerEvent
  pointerup: UIPointerEvent
  pointercancel: UIPointerEvent
  pointerenter: UIPointerEvent
  pointerleave: UIPointerEvent
  click: UIPointerEvent
  wheel: UIWheelEvent
  keydown: UIKeyEvent
  keyup: UIKeyEvent
  focus: UIFocusEvent
  blur: UIFocusEvent
}

/** Interaction state bits readable by class resolvers (`hover:`, `active:`, `focus:`, `disabled:`). */
export const StateFlags = {
  HOVER: 1,
  ACTIVE: 2,
  FOCUS: 4,
  DISABLED: 8,
} as const
