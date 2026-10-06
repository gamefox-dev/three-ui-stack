import { Text, View, type ThreeUI, type Style, type UIAnimation } from '@implicit-invocation/three-ui'

export interface StressHandle {
  root: View
  count: number
  dispose(): void
}

/**
 * Stress screen: `count` panels, each with a gradient, a ring, an outer shadow and an inset highlight, authored with plain
 * style objects (no classes), laid out by Yoga and painted into the SAME batch as everything else. The point is to prove
 * the batching claim: draw calls stay at a handful no matter how many panels there are.
 */
export function buildStress(ui: ThreeUI, parent: View, count: number, animate: boolean): StressHandle {
  const { width, height } = ui.environment.viewport
  const gap = count > 800 ? 4 : 8
  const pad = 14
  const top = 70
  const bottom = 90
  const availW = width - pad * 2
  const availH = height - top - bottom
  // largest square cell that fits `count` cells in the area
  let size = Math.floor(Math.sqrt((availW * availH) / count)) - gap
  size = Math.max(10, size)
  while (Math.floor(availW / (size + gap)) * Math.floor(availH / (size + gap)) < count && size > 10) size--

  const root = new View({
    name: 'stress',
    style: { position: 'absolute', top, left: pad, width: availW, height: availH, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', gap },
  })
  // attach first: node.animate() needs a ThreeUI to drive it
  parent.append(root)
  const animations: UIAnimation[] = []
  const radius = Math.min(14, size / 4)
  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / Math.max(count, 1) + 20
    const style: Style = {
      width: size,
      height: size,
      borderRadius: radius,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundGradient: {
        type: 'linear',
        angle: 135,
        colorSpace: 'oklab',
        stops: [{ color: `hsl(${hue} 90% 62%)` }, { color: `hsl(${(hue + 50) % 360} 85% 42%)` }],
      },
      boxShadow: [
        { offsetY: 1, blur: 0, spread: 0, color: '#ffffff55', inset: true },
        { spread: 1, color: '#ffffff40' },
        { offsetY: Math.max(2, size / 8), blur: Math.max(6, size / 3), color: '#00000099' },
      ],
    }
    const panel = new View({ style })
    if (size >= 36) panel.append(new Text({ text: String(i + 1), style: { fontSize: Math.min(16, size / 3), fontWeight: 700, color: '#ffffff' } }))
    root.append(panel)
    if (animate && i % 4 === 0) {
      // transform + opacity only: no layout, no style recompute — the cheap animation path
      animations.push(panel.animate([{ transform: [{ scale: 1 }], opacity: 1 }, { transform: [{ scale: 0.82 }], opacity: 0.7 }], { duration: 700 + (i % 7) * 120, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: (i % 11) * 60 }))
    }
  }
  return {
    root,
    count,
    dispose() {
      for (const a of animations) a.cancel()
      root.dispose()
    },
  }
}
