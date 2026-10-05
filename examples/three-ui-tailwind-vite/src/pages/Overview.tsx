import { useState } from 'react'
import { Text, View, useThreeUI } from '@implicit-invocation/three-ui-react'
import { Button, Card, Chip, PageTitle, Row, useInterval } from '../kit'
import type { PageId } from '../App'

const FEATURES: { id: PageId; title: string; body: string; tag: string }[] = [
  { id: 'layout', title: 'Yoga flexbox layout', body: 'Direction, wrap, gap, justify, align, grow/shrink. ComputedStyle is the source of truth; Yoga only calculates geometry.', tag: '@implicit-invocation/three-ui' },
  { id: 'type', title: 'Bitmap-font text', body: 'Baked by three-2d-font, measured through Yoga, cached by font/size/width. Inherited color + size.', tag: '@implicit-invocation/three-2d-font' },
  { id: 'input', title: 'Interaction state', body: 'hover:, active:, focus:, disabled: variants, pointer capture, capture/bubble, keyboard focus.', tag: 'tailwind' },
  { id: 'scroll', title: 'ScrollView', body: 'Clipping stack, wheel + touch drag + inertia, nested scrolling, paint culling. No DOM scrolling.', tag: '@implicit-invocation/three-ui' },
  { id: 'media', title: 'Images & effects', body: 'Image resize modes, frame animations, nine-patch, rotate/scale transforms, rounded SDF corners.', tag: '@implicit-invocation/three-2d' },
  { id: 'perf', title: 'Counters & stress', body: 'Paint-only vs layout invalidation, batch flush counters, thousands of nodes in a handful of draw calls.', tag: 'perf' },
]

export function Overview({ go, backend }: { go: (p: PageId) => void; backend: string }) {
  const ui = useThreeUI()
  const [info, setInfo] = useState({ w: 0, h: 0, dpr: 1, scheme: 'dark' })
  useInterval(() => {
    const v = ui.environment.viewport
    setInfo((p) => (p.w === v.width && p.h === v.height && p.scheme === ui.environment.colorScheme ? p : { w: Math.round(v.width), h: Math.round(v.height), dpr: v.pixelRatio, scheme: ui.environment.colorScheme }))
  }, 250)

  const bp = info.w >= 1280 ? 'xl' : info.w >= 1024 ? 'lg' : info.w >= 768 ? 'md' : info.w >= 640 ? 'sm' : 'base'

  return (
    <View className="gap-4">
      <PageTitle title="three-ui + Tailwind v4" subtitle="Tailwind classes compile at build time to three-ui style data. Yoga lays it out, three-ui paints it, three-2d batches it, Three.js draws it." />
      <Row>
        <Chip label={backend} tone="amber" />
        <Chip label={`${info.w} × ${info.h} @${info.dpr}x`} />
        <Chip label={`scheme: ${info.scheme}`} tone="violet" />
        <Chip label={`breakpoint: ${bp}`} tone="emerald" />
      </Row>

      <Card title="RESPONSIVE VARIANTS · resize the window">
        <View className="flex-row gap-2">
          <View className="bg-zinc-300 dark:bg-zinc-700 sm:bg-sky-500 md:bg-emerald-500 lg:bg-amber-500 xl:bg-rose-500 h-12 grow rounded-xl items-center justify-center">
            <Text className="text-sm font-bold text-white">bg changes at sm / md / lg / xl</Text>
          </View>
          <View className="hidden md:flex bg-violet-600 w-24 h-12 rounded-xl items-center justify-center">
            <Text className="text-sm font-bold text-white">md:flex</Text>
          </View>
        </View>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">Breakpoints come from Tailwind&apos;s theme and are matched against the UI viewport width, not the DOM.</Text>
      </Card>

      <View className="flex-row flex-wrap gap-4">
        {FEATURES.map((f) => (
          <Card key={f.id} className="grow basis-64">
            <Row className="justify-between">
              <Text className="text-lg font-bold">{f.title}</Text>
              <Chip label={f.tag} />
            </Row>
            <Text className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">{f.body}</Text>
            <Button label="Open demo" small variant="ghost" onPress={() => go(f.id)} className="self-start" />
          </Card>
        ))}
      </View>

      <Card title="THE STACK">
        <View className="gap-1">
          <Text className="text-sm">Tailwind produces styles → Yoga produces geometry → three-ui produces paint commands</Text>
          <Text className="text-sm">three-2d produces triangles → Three.js produces GPU work.</Text>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Tip: Tab moves focus, arrow keys drive sliders and lists, the wheel scrolls the nearest ScrollView.</Text>
        </View>
      </Card>
    </View>
  )
}
