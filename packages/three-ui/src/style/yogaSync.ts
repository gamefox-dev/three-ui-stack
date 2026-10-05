import type { YogaNode } from '../yoga/runtime'
import { YGEnums as E } from '../yoga/runtime'
import { LAYOUT_KEYS, type ComputedStyle } from './computed'

type Key = (typeof LAYOUT_KEYS)[number]

const ALIGN: Record<string, number> = {
  auto: E.Align.Auto,
  'flex-start': E.Align.FlexStart,
  center: E.Align.Center,
  'flex-end': E.Align.FlexEnd,
  stretch: E.Align.Stretch,
  baseline: E.Align.Baseline,
  'space-between': E.Align.SpaceBetween,
  'space-around': E.Align.SpaceAround,
  'space-evenly': E.Align.SpaceEvenly,
}
const JUSTIFY: Record<string, number> = {
  'flex-start': E.Justify.FlexStart,
  center: E.Justify.Center,
  'flex-end': E.Justify.FlexEnd,
  'space-between': E.Justify.SpaceBetween,
  'space-around': E.Justify.SpaceAround,
  'space-evenly': E.Justify.SpaceEvenly,
}
const DIRECTION: Record<string, number> = {
  row: E.FlexDirection.Row,
  column: E.FlexDirection.Column,
  'row-reverse': E.FlexDirection.RowReverse,
  'column-reverse': E.FlexDirection.ColumnReverse,
}
const WRAP: Record<string, number> = { nowrap: E.Wrap.NoWrap, wrap: E.Wrap.Wrap, 'wrap-reverse': E.Wrap.WrapReverse }
const OVERFLOW: Record<string, number> = { visible: E.Overflow.Visible, hidden: E.Overflow.Hidden, scroll: E.Overflow.Scroll }

type Setter = (node: YogaNode, v: never) => void
// Yoga treats `undefined`/NaN as "unset". Patched length setters accept undefined; raw float setters need NaN.
// Enums always carry concrete defaults.
const SETTERS: Record<Key, Setter> = {
  display: (n, v: string) => n.setDisplay(v === 'none' ? E.Display.None : E.Display.Flex),
  position: (n, v: string) => n.setPositionType(v === 'absolute' ? E.PositionType.Absolute : E.PositionType.Relative),
  width: (n, v: never) => n.setWidth(v),
  height: (n, v: never) => n.setHeight(v),
  minWidth: (n, v: never) => n.setMinWidth(v),
  minHeight: (n, v: never) => n.setMinHeight(v),
  maxWidth: (n, v: never) => n.setMaxWidth(v),
  maxHeight: (n, v: never) => n.setMaxHeight(v),
  flexGrow: (n, v: number | undefined) => n.setFlexGrow(v ?? NaN),
  flexShrink: (n, v: number | undefined) => n.setFlexShrink(v ?? NaN),
  flexBasis: (n, v: never) => n.setFlexBasis(v),
  flexDirection: (n, v: string) => n.setFlexDirection(DIRECTION[v]!),
  flexWrap: (n, v: string) => n.setFlexWrap(WRAP[v]!),
  alignItems: (n, v: string) => n.setAlignItems(ALIGN[v]!),
  alignSelf: (n, v: string) => n.setAlignSelf(ALIGN[v]!),
  alignContent: (n, v: string) => n.setAlignContent(ALIGN[v]!),
  justifyContent: (n, v: string) => n.setJustifyContent(JUSTIFY[v]!),
  gap: (n, v: never) => n.setGap(E.Gutter.All, v),
  rowGap: (n, v: never) => n.setGap(E.Gutter.Row, v),
  columnGap: (n, v: never) => n.setGap(E.Gutter.Column, v),
  margin: (n, v: never) => n.setMargin(E.Edge.All, v),
  marginHorizontal: (n, v: never) => n.setMargin(E.Edge.Horizontal, v),
  marginVertical: (n, v: never) => n.setMargin(E.Edge.Vertical, v),
  marginTop: (n, v: never) => n.setMargin(E.Edge.Top, v),
  marginRight: (n, v: never) => n.setMargin(E.Edge.Right, v),
  marginBottom: (n, v: never) => n.setMargin(E.Edge.Bottom, v),
  marginLeft: (n, v: never) => n.setMargin(E.Edge.Left, v),
  padding: (n, v: never) => n.setPadding(E.Edge.All, v),
  paddingHorizontal: (n, v: never) => n.setPadding(E.Edge.Horizontal, v),
  paddingVertical: (n, v: never) => n.setPadding(E.Edge.Vertical, v),
  paddingTop: (n, v: never) => n.setPadding(E.Edge.Top, v),
  paddingRight: (n, v: never) => n.setPadding(E.Edge.Right, v),
  paddingBottom: (n, v: never) => n.setPadding(E.Edge.Bottom, v),
  paddingLeft: (n, v: never) => n.setPadding(E.Edge.Left, v),
  top: (n, v: never) => n.setPosition(E.Edge.Top, v),
  right: (n, v: never) => n.setPosition(E.Edge.Right, v),
  bottom: (n, v: never) => n.setPosition(E.Edge.Bottom, v),
  left: (n, v: never) => n.setPosition(E.Edge.Left, v),
  aspectRatio: (n, v: number | undefined) => n.setAspectRatio(v ?? NaN),
  overflow: (n, v: string) => n.setOverflow(OVERFLOW[v]!),
  borderWidth: (n, v: number | undefined) => n.setBorder(E.Edge.All, v ?? NaN),
  borderTopWidth: (n, v: number | undefined) => n.setBorder(E.Edge.Top, v ?? NaN),
  borderRightWidth: (n, v: number | undefined) => n.setBorder(E.Edge.Right, v ?? NaN),
  borderBottomWidth: (n, v: number | undefined) => n.setBorder(E.Edge.Bottom, v ?? NaN),
  borderLeftWidth: (n, v: number | undefined) => n.setBorder(E.Edge.Left, v ?? NaN),
}

/**
 * Push layout-affecting values from `next` to Yoga. With `prev` only changed properties are written
 * (paint-only style changes never reach here). Returns true when any Yoga property changed.
 */
export function syncYoga(node: YogaNode, prev: ComputedStyle | null, next: ComputedStyle): boolean {
  let changed = false
  for (const key of LAYOUT_KEYS) {
    const value = next[key]
    if (prev !== null && prev[key] === value) continue
    ;(SETTERS[key] as (n: YogaNode, v: unknown) => void)(node, value)
    changed = true
  }
  return changed
}
