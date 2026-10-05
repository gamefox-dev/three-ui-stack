import { createElement, type ReactElement } from 'react'
import type { AnimatedImageProps, ImageProps, NinePatchProps, ScrollViewProps, TextProps, ViewProps } from './renderer/props'

/** Flexbox container (maps to `three-ui` `View`). */
export function View(props: ViewProps): ReactElement {
  return createElement('tui-view', props as never)
}

/** Text leaf (maps to `three-ui` `Text`). Children must be strings/numbers. */
export function Text(props: TextProps): ReactElement {
  return createElement('tui-text', props as never)
}

export function Image(props: ImageProps): ReactElement {
  return createElement('tui-image', props as never)
}

export function AnimatedImage(props: AnimatedImageProps): ReactElement {
  return createElement('tui-animatedimage', props as never)
}

/** Maps to `three-ui` `NinePatchView`. */
export function NinePatch(props: NinePatchProps): ReactElement {
  return createElement('tui-ninepatch', props as never)
}

export function ScrollView(props: ScrollViewProps): ReactElement {
  return createElement('tui-scrollview', props as never)
}
