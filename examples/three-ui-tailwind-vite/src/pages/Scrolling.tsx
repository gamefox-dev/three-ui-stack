import { useMemo, useRef, useState } from 'react'
import type { ScrollView as ScrollNode } from 'three-ui'
import { Image, ScrollView, Text, View, useThreeUI } from 'three-ui-react'
import { makeAvatar } from 'example-shared'
import { Button, Card, Chip, PageTitle, Row, useInterval } from '../kit'

const NAMES = ['Ada', 'Grace', 'Linus', 'Margaret', 'Dennis', 'Barbara', 'Ken', 'Radia', 'Alan', 'Hedy', 'Tim', 'Frances']

export function Scrolling() {
  const ui = useThreeUI()
  const avatars = useMemo(() => Array.from({ length: 12 }, (_, i) => makeAvatar(i + 20)), [])
  const [count, setCount] = useState(1000)
  const [y, setY] = useState(0)
  const [selected, setSelected] = useState(-1)
  const [culled, setCulled] = useState(0)
  const list = useRef<ScrollNode | null>(null)
  useInterval(() => setCulled(ui.stats.nodesCulled), 400)

  return (
    <View className="gap-4 flex-1">
      <PageTitle title="ScrollView" subtitle="No DOM scroll containers: content size comes from Yoga, drawing goes through the batch clip stack (scissor) and off-screen rows are culled." />
      <Row>
        <Chip label={`rows: ${count}`} tone="violet" />
        <Chip label={`scrollY: ${Math.round(y)}`} />
        <Chip label={`culled nodes/frame: ${culled}`} tone="emerald" />
        <Button label="Top" small variant="ghost" onPress={() => list.current?.scrollTo(0, 0)} />
        <Button label="Bottom" small variant="ghost" onPress={() => list.current?.scrollTo(0, 1e9)} />
        <Button label="+250" small onPress={() => setCount(count + 250)} />
        <Button label="−250" small variant="danger" onPress={() => setCount(Math.max(0, count - 250))} />
      </Row>

      <View className="flex-row gap-4 flex-wrap flex-1">
        <Card title="VERTICAL LIST · wheel, drag, fling, PageUp/PageDown when focused" className="grow basis-72 min-h-64 h-96">
          <ScrollView ref={list} focusable onScroll={(_x, sy) => setY(sy)} className="flex-1 gap-1 pr-2 border-2 border-transparent focus:border-violet-500 rounded-xl">
            {Array.from({ length: count }, (_, i) => (
              <View
                key={i}
                onClick={() => setSelected(i)}
                className={`${selected === i ? 'bg-violet-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'} flex-row items-center gap-3 p-2 rounded-xl`}
              >
                <Image source={avatars[i % avatars.length]!} className="size-9 rounded-full" />
                <View className="grow">
                  <Text className="text-sm font-bold">{`${NAMES[i % NAMES.length]} #${i + 1}`}</Text>
                  <Text className={`${selected === i ? 'text-violet-200' : 'text-zinc-500 dark:text-zinc-400'} text-xs`}>{`Row ${i + 1} of ${count}`}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Card>

        <View className="grow basis-72 gap-4">
          <Card title="NESTED · horizontal ScrollView inside a vertical one">
            <ScrollView className="h-72 gap-3 pr-2">
              {['Featured', 'Trending', 'New'].map((section) => (
                <View key={section} className="gap-2">
                  <Text className="text-sm font-bold">{section}</Text>
                  <ScrollView horizontal className="gap-2 pb-2">
                    {Array.from({ length: 14 }, (_, i) => (
                      <View key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-2 items-center gap-1 w-24">
                        <Image source={avatars[(i + section.length) % avatars.length]!} className="size-16 rounded-2xl" />
                        <Text className="text-xs font-bold">{`Card ${i + 1}`}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ))}
              <Text className="text-xs text-zinc-500 dark:text-zinc-400">Wheel over a carousel scrolls it sideways; at its end the wheel chains to the outer list.</Text>
            </ScrollView>
          </Card>
        </View>
      </View>
    </View>
  )
}
