import { useState } from 'react'
import type { UIStats } from '@implicit-invocation/three-ui'
import { ScrollView, Text, View, useThreeUI } from '@implicit-invocation/three-ui-react'
import { Button, Card, Chip, Label, PageTitle, Row, Slider, Switch, useAnimationFrame, useInterval } from '../kit'

const FIELDS: [keyof UIStats, string][] = [
  ['nodes', 'nodes'],
  ['layoutPasses', 'layout passes'],
  ['styleRecomputes', 'style recomputes'],
  ['paintOps', 'paint ops'],
  ['sprites', 'quads'],
  ['flushes', 'batch flushes'],
  ['drawCalls', 'draw calls'],
  ['renderPasses', 'render passes'],
  ['glyphs', 'glyphs'],
  ['clipChanges', 'clip changes'],
  ['nodesPainted', 'nodes painted'],
  ['nodesCulled', 'nodes culled'],
]

export function Performance() {
  const ui = useThreeUI()
  const [stats, setStats] = useState<UIStats>({ ...ui.stats })
  const [count, setCount] = useState(600)
  const [hue, setHue] = useState(0)
  const [size, setSize] = useState(24)
  const [animate, setAnimate] = useState(false)
  useInterval(() => setStats({ ...ui.stats }), 300)
  useAnimationFrame((t) => setHue(t * 60), animate)

  return (
    <View className="gap-4">
      <PageTitle title="Counters & stress" subtitle="Debug counters straight from the UI: watch what each kind of change costs. Paint-only changes skip Yoga; thousands of nodes still end up in a handful of draw calls." />

      <Card title="LIVE COUNTERS">
        <View className="flex-row flex-wrap gap-2">
          {FIELDS.map(([k, label]) => (
            <View key={k} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2 w-40">
              <Text className="text-xs text-zinc-500 dark:text-zinc-400">{label}</Text>
              <Text className="text-lg font-bold">{String(stats[k])}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card title="INVALIDATION · compare the counters after each action">
        <Row>
          <Button label="Paint-only (recolor)" onPress={() => setHue((h) => h + 47)} variant="success" />
          <Button label="Layout (resize boxes)" onPress={() => setSize((s) => (s >= 40 ? 16 : s + 8))} variant="primary" />
          <Switch on={animate} onChange={setAnimate} label="animate all colors every frame" />
        </Row>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">Recoloring touches only paint data (no layout passes). Resizing changes Yoga properties → one relayout. Animating restyles every box each frame without any layout.</Text>
        <Row>
          <Label>boxes</Label>
          <Slider value={count} min={0} max={3000} step={50} onChange={setCount} width="w-72" />
          <Chip label={`${count} nodes`} tone="violet" />
        </Row>
      </Card>

      <Card title="STRESS GRID" className="h-96">
        <ScrollView className="flex-1">
          <View className="flex-row flex-wrap gap-1">
            {Array.from({ length: count }, (_, i) => (
              <View key={i} style={{ width: size, height: size, backgroundColor: `hsl(${Math.round((i * 7 + hue) % 360)} 75% 55%)` }} className="rounded-md" />
            ))}
          </View>
        </ScrollView>
      </Card>
    </View>
  )
}
