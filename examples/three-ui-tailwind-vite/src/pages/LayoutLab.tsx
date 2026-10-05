import { useRef, useState } from 'react'
import type { View as ViewNode } from 'three-ui'
import { Text, View } from 'three-ui-react'
import { Button, Card, Label, PageTitle, Row, Segmented, Slider } from '../kit'

const DIRECTION = { row: 'flex-row', col: 'flex-col', 'row-reverse': 'flex-row-reverse', 'col-reverse': 'flex-col-reverse' } as const
const JUSTIFY = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly' } as const
const ITEMS = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' } as const
const WRAP = { nowrap: 'flex-nowrap', wrap: 'flex-wrap' } as const
const GAP = { '0': 'gap-0', '2': 'gap-2', '4': 'gap-4', '8': 'gap-8' } as const
const SIZES = ['w-12 h-12', 'w-16 h-10', 'w-10 h-16', 'w-20 h-12', 'w-14 h-14', 'w-12 h-20', 'w-24 h-10', 'w-16 h-16', 'w-10 h-10', 'w-20 h-20']
const COLORS = ['bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-fuchsia-500', 'bg-cyan-500', 'bg-lime-500', 'bg-orange-500', 'bg-indigo-500']

export function LayoutLab() {
  const [dir, setDir] = useState<keyof typeof DIRECTION>('row')
  const [justify, setJustify] = useState<keyof typeof JUSTIFY>('start')
  const [items, setItems] = useState<keyof typeof ITEMS>('start')
  const [wrap, setWrap] = useState<keyof typeof WRAP>('nowrap')
  const [gap, setGap] = useState<keyof typeof GAP>('4')
  const [count, setCount] = useState(5)
  const [grow, setGrow] = useState(false)
  const [rect, setRect] = useState('')
  const first = useRef<ViewNode | null>(null)

  return (
    <View className="gap-4">
      <PageTitle title="Flexbox playground" subtitle="Every control swaps a Tailwind class. The preview is a real three-ui View tree laid out by Yoga on every change." />
      <Card title="CONTROLS">
        <Row>
          <Label>direction</Label>
          <Segmented value={dir} options={Object.keys(DIRECTION) as (keyof typeof DIRECTION)[]} onChange={setDir} />
        </Row>
        <Row>
          <Label>justify</Label>
          <Segmented value={justify} options={Object.keys(JUSTIFY) as (keyof typeof JUSTIFY)[]} onChange={setJustify} />
        </Row>
        <Row>
          <Label>items</Label>
          <Segmented value={items} options={Object.keys(ITEMS) as (keyof typeof ITEMS)[]} onChange={setItems} />
        </Row>
        <Row>
          <Label>wrap</Label>
          <Segmented value={wrap} options={Object.keys(WRAP) as (keyof typeof WRAP)[]} onChange={setWrap} />
          <Label>gap</Label>
          <Segmented value={gap} options={Object.keys(GAP) as (keyof typeof GAP)[]} onChange={setGap} />
        </Row>
        <Row>
          <Label>items</Label>
          <Slider value={count} min={1} max={10} onChange={setCount} />
          <Text className="text-sm font-bold w-6">{count}</Text>
          <Button label={grow ? 'grow: on' : 'grow: off'} small variant={grow ? 'success' : 'ghost'} onPress={() => setGrow(!grow)} />
        </Row>
      </Card>

      <Card title="PREVIEW">
        <View className="bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-400 dark:border-zinc-600 p-3 h-72">
          <View className={`flex-1 ${DIRECTION[dir]} ${JUSTIFY[justify]} ${ITEMS[items]} ${WRAP[wrap]} ${GAP[gap]}`}>
            {Array.from({ length: count }, (_, i) => (
              <View
                key={i}
                ref={i === 0 ? first : undefined}
                className={`${COLORS[i % COLORS.length]} ${grow ? 'grow' : ''} ${SIZES[i % SIZES.length]} rounded-lg items-center justify-center`}
                onPointerEnter={() => {
                  const l = first.current?.layout
                  if (l) setRect(`first item → x ${l.x}  y ${l.y}  w ${l.width}  h ${l.height}`)
                }}
              >
                <Text className="text-sm font-bold text-white">{String(i + 1)}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">{rect || 'hover an item to read its LayoutRect from Yoga'}</Text>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">{`className: ${DIRECTION[dir]} ${JUSTIFY[justify]} ${ITEMS[items]} ${WRAP[wrap]} ${GAP[gap]}`}</Text>
      </Card>
    </View>
  )
}
