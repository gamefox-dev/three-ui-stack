import { useMemo, useState } from 'react'
import { AnimatedImage, Image, NinePatch, Text, View } from '@implicit-invocation/three-ui-react'
import { Animation } from '@implicit-invocation/three-2d'
import { makeAvatar, makeGemAtlas, makeLandscape, makeNinePatch, makeWalkCycle } from 'example-shared'
import { Button, Card, Label, PageTitle, Row, Slider, useAnimationFrame } from '../kit'

const MODES = ['contain', 'cover', 'stretch', 'center'] as const

export function Media() {
  const landscape = useMemo(() => makeLandscape(), [])
  const avatar = useMemo(() => makeAvatar(7), [])
  const walk = useMemo(() => new Animation(0.1, makeWalkCycle().frames, 'loop'), [])
  const { gems, coin } = useMemo(() => makeGemAtlas(), [])
  const patch = useMemo(() => makeNinePatch('#7c3aed'), [])
  const [playing, setPlaying] = useState(true)
  const [pw, setPw] = useState(300)
  const [ph, setPh] = useState(120)
  const [angle, setAngle] = useState(0)
  const [spin, setSpin] = useState(true)
  const [picked, setPicked] = useState(-1)
  useAnimationFrame((t) => setAngle(t), spin)

  return (
    <View className="gap-4">
      <PageTitle title="Images & effects" subtitle="Image resize modes, frame animations from a TextureAtlas, nine-patch panels, SDF rounded corners, opacity and paint-time transforms." />

      <Card title="RESIZE MODES · one 2:1 landscape in a 96×96 box">
        <Row className="gap-4">
          {MODES.map((m) => (
            <View key={m} className="items-center gap-1">
              <Image source={landscape} resizeMode={m} className="size-24 rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden" />
              <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{m}</Text>
            </View>
          ))}
        </Row>
      </Card>

      <Card title="CORNERS · opacity · borders (SDF in the fragment shader)">
        <Row className="gap-4">
          {(['rounded-none', 'rounded-lg', 'rounded-2xl', 'rounded-full'] as const).map((r) => (
            <Image key={r} source={avatar} className={`size-20 ${r}`} />
          ))}
          {(['opacity-100', 'opacity-70', 'opacity-40', 'opacity-20'] as const).map((o) => (
            <View key={o} className={`${o} size-14 rounded-xl bg-violet-600 items-center justify-center`}>
              <Text className="text-xs font-bold text-white">{o.slice(8)}</Text>
            </View>
          ))}
          <View className="size-16 rounded-xl border bg-transparent border-violet-500" />
          <View className="size-16 rounded-xl border-2 border-emerald-500" />
          <View className="size-16 rounded-xl border-4 border-amber-500" />
        </Row>
      </Card>

      <Card title="ANIMATION · frame Animation, libGDX atlas regions">
        <Row className="gap-4">
          <AnimatedImage animation={walk} playing={playing} className="size-16" />
          <AnimatedImage animation={coin} playing={playing} className="size-12" />
          <Button label={playing ? 'Pause' : 'Play'} small variant="ghost" onPress={() => setPlaying(!playing)} />
          <View className="flex-row gap-1">
            {gems.map((g, i) => (
              <View key={i} onClick={() => setPicked(i)} className={`${picked === i ? 'bg-violet-200 dark:bg-violet-900' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'} p-1 rounded-lg`}>
                <Image source={g} className={`${picked === i ? 'size-10' : 'size-8'}`} />
              </View>
            ))}
          </View>
        </Row>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">{picked < 0 ? 'Gems come from TextureAtlas.fromText() (libGDX .atlas format) — click one.' : `picked atlas region gem#${picked}`}</Text>
      </Card>

      <Card title="TRANSFORMS · paint-time only (no relayout)">
        <Row className="gap-8 py-4">
          <View className="size-16 rounded-xl bg-sky-500 rotate-12 items-center justify-center">
            <Text className="text-xs font-bold text-white">rotate-12</Text>
          </View>
          <View className="size-16 rounded-xl bg-emerald-500 scale-110 items-center justify-center">
            <Text className="text-xs font-bold text-white">scale-110</Text>
          </View>
          <View className="size-16 rounded-xl bg-rose-500 hover:scale-125 items-center justify-center">
            <Text className="text-xs font-bold text-white">hover</Text>
          </View>
          <View style={{ transform: [{ rotate: `${angle * 90}deg` }, { scale: 1 + Math.sin(angle * 2) * 0.15 }] }} className="size-16 rounded-xl bg-amber-500 items-center justify-center">
            <Text className="text-xs font-bold text-white">spin</Text>
          </View>
          <Button label={spin ? 'Stop' : 'Spin'} small variant="ghost" onPress={() => setSpin(!spin)} />
        </Row>
      </Card>

      <Card title="NINE-PATCH · corners stay crisp while the center stretches">
        <Row>
          <Label>width</Label>
          <Slider value={pw} min={96} max={560} onChange={setPw} />
          <Label>height</Label>
          <Slider value={ph} min={96} max={240} onChange={setPh} />
        </Row>
        <NinePatch patch={patch} style={{ width: pw, height: ph }} className="p-6 items-center justify-center">
          <Text className="text-sm font-bold text-white">{`${pw} × ${ph}`}</Text>
        </NinePatch>
      </Card>
    </View>
  )
}
