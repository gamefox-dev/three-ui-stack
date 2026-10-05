import { useState } from 'react'
import { Text, View } from 'three-ui-react'
import { Card, Label, PageTitle, Row, Segmented, Slider } from '../kit'

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const
const TRACK = { tight: 'tracking-tight', normal: 'tracking-normal', wide: 'tracking-wide', widest: 'tracking-widest' } as const
const LEAD = { none: 'leading-none', tight: 'leading-tight', normal: 'leading-normal', loose: 'leading-loose' } as const
const LOREM = 'Bitmap fonts are baked once with three-2d-font, packed into an atlas and drawn as batched quads. Layout wraps at word boundaries, honors alignment, letter-spacing and line-height, and is cached by text, font, size and width.'

export function Typography() {
  const [width, setWidth] = useState(360)
  const [align, setAlign] = useState<keyof typeof ALIGN>('left')
  const [track, setTrack] = useState<keyof typeof TRACK>('normal')
  const [lead, setLead] = useState<keyof typeof LEAD>('normal')

  return (
    <View className="gap-4">
      <PageTitle title="Typography" subtitle="Font size, weight, tracking, leading and alignment are Tailwind utilities compiled to style data. Color and size inherit down the tree." />

      <Card title="TYPE SCALE">
        <View className="gap-1">
          <Text className="text-4xl font-bold">text-4xl · Aa</Text>
          <Text className="text-3xl font-bold">text-3xl · Aa</Text>
          <Text className="text-2xl font-bold">text-2xl · The quick brown fox</Text>
          <Text className="text-xl">text-xl · The quick brown fox</Text>
          <Text className="text-lg">text-lg · The quick brown fox jumps</Text>
          <Text className="text-base">text-base · The quick brown fox jumps over the lazy dog</Text>
          <Text className="text-sm">text-sm · The quick brown fox jumps over the lazy dog</Text>
          <Text className="text-xs">text-xs · The quick brown fox jumps over the lazy dog</Text>
        </View>
      </Card>

      <Card title="INHERITANCE · color and font size cascade; descendants can override">
        <View className="text-amber-500 text-lg gap-1 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950">
          <Text>Parent sets text-amber-500 + text-lg.</Text>
          <Text>This Text sets nothing and inherits both.</Text>
          <View className="text-sky-500 pl-4 gap-1">
            <Text>A nested View switches only the color (text-sky-500).</Text>
            <Text className="text-sm font-bold text-emerald-500">A Text overrides color, size and weight.</Text>
          </View>
        </View>
      </Card>

      <Card title="WRAPPING · drag the width">
        <Row>
          <Label>width</Label>
          <Slider value={width} min={120} max={640} step={4} onChange={setWidth} width="w-64" />
          <Text className="text-sm font-bold">{`${width}px`}</Text>
        </Row>
        <Row>
          <Label>align</Label>
          <Segmented value={align} options={Object.keys(ALIGN) as (keyof typeof ALIGN)[]} onChange={setAlign} />
        </Row>
        <Row>
          <Label>tracking</Label>
          <Segmented value={track} options={Object.keys(TRACK) as (keyof typeof TRACK)[]} onChange={setTrack} />
        </Row>
        <Row>
          <Label>leading</Label>
          <Segmented value={lead} options={Object.keys(LEAD) as (keyof typeof LEAD)[]} onChange={setLead} />
        </Row>
        <View style={{ width }} className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3">
          <Text className={`text-sm ${ALIGN[align]} ${TRACK[track]} ${LEAD[lead]}`}>{LOREM}</Text>
        </View>
      </Card>

      <Card title="WEIGHTS · baked Inter regular + bold (other weights pick the nearest face)">
        <View className="gap-1">
          <Text className="text-lg font-normal">font-normal — 400</Text>
          <Text className="text-lg font-medium">font-medium — nearest face</Text>
          <Text className="text-lg font-bold">font-bold — 700</Text>
        </View>
      </Card>
    </View>
  )
}
