import { useRef, useState } from 'react'
import { Text, View, useThreeUI, type UIPointerEvent } from 'three-ui-react'
import { Button, Card, Chip, PageTitle, Row, Switch } from '../kit'

function Draggable() {
  const ui = useThreeUI()
  const [pos, setPos] = useState({ x: 24, y: 24 })
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const [active, setActive] = useState(false)
  const area = useRef<{ w: number; h: number }>({ w: 300, h: 160 })
  return (
    <View
      className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl h-44 w-full overflow-hidden"
      onPointerMove={(e: UIPointerEvent) => {
        if (!drag.current) return
        const r = e.currentTarget!.getAbsoluteRect()
        area.current = { w: r.width, h: r.height }
        setPos({ x: Math.min(r.width - 56, Math.max(0, e.x - r.x - drag.current.dx)), y: Math.min(r.height - 56, Math.max(0, e.y - r.y - drag.current.dy)) })
      }}
    >
      <View
        style={{ left: pos.x, top: pos.y }}
        className={`${active ? 'bg-amber-400 scale-110' : 'bg-violet-600'} absolute size-14 rounded-2xl items-center justify-center`}
        onPointerDown={(e) => {
          // pointer capture: the box keeps receiving moves even when the pointer leaves it (or the canvas)
          ui.input.setPointerCapture(e.pointerId, e.currentTarget!.parent!)
          drag.current = { dx: e.localX, dy: e.localY }
          setActive(true)
        }}
        onPointerUp={() => {
          drag.current = null
          setActive(false)
        }}
      >
        <Text className="text-xs font-bold text-white">drag</Text>
      </View>
    </View>
  )
}

function EventLab() {
  const [log, setLog] = useState<string[]>([])
  const [stopMiddle, setStopMiddle] = useState(false)
  const push = (m: string) => setLog((l) => [m, ...l].slice(0, 9))
  const tag = (name: string) => ({
    onPointerDownCapture: () => push(`${name}  capture`),
    onPointerDown: (e: UIPointerEvent) => {
      push(`${name}  bubble${stopMiddle && name === 'middle' ? '  ⛔ stopPropagation' : ''}`)
      if (stopMiddle && name === 'middle') e.stopPropagation()
    },
    onClick: () => push(`${name}  click`),
  })
  return (
    <View className="flex-row gap-4 flex-wrap">
      <View {...tag('outer')} className="bg-fuchsia-950 rounded-xl p-4 w-48 h-40 justify-center">
        <View {...tag('middle')} className="bg-fuchsia-700 rounded-lg p-4 grow">
          <View {...tag('inner')} className="bg-fuchsia-300 rounded-md grow items-center justify-center">
            <Text className="text-xs font-bold text-fuchsia-950">press me</Text>
          </View>
        </View>
      </View>
      <View className="grow basis-48 gap-1">
        <Switch on={stopMiddle} onChange={setStopMiddle} label="middle calls stopPropagation()" />
        {log.map((l, i) => (
          <Text key={`${i}-${l}`} className={`${i === 0 ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-400'} text-xs`}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  )
}

export function Interaction() {
  const [toggles, setToggles] = useState({ a: true, b: false })
  const [key, setKey] = useState('(focus the box below, then press keys)')
  const [clicks, setClicks] = useState(0)
  return (
    <View className="gap-4">
      <PageTitle title="Interaction" subtitle="hover:, active:, focus:, disabled: and dark: variants are resolved from the node's interaction state — changing them never triggers a Yoga layout pass." />

      <Card title="STATE VARIANTS (hover, press, Tab to focus)">
        <Row>
          <Button label="primary" onPress={() => setClicks(clicks + 1)} />
          <Button label="ghost" variant="ghost" onPress={() => setClicks(clicks + 1)} />
          <Button label="danger" variant="danger" onPress={() => setClicks(clicks + 1)} />
          <Button label="success" variant="success" onPress={() => setClicks(clicks + 1)} />
          <Button label="disabled" disabled />
          <Chip label={`clicks: ${clicks}`} tone="violet" />
        </Row>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">{'className="bg-violet-600 hover:bg-violet-500 active:bg-violet-700 active:scale-95 border-2 border-transparent focus:border-amber-400 disabled:opacity-40"'}</Text>
      </Card>

      <Card title="TOGGLES">
        <Row>
          <Switch on={toggles.a} onChange={(v) => setToggles({ ...toggles, a: v })} label="Notifications" />
          <Switch on={toggles.b} onChange={(v) => setToggles({ ...toggles, b: v })} label="Reduce motion" />
        </Row>
      </Card>

      <Card title="POINTER CAPTURE · drag the square (it keeps tracking outside its bounds)">
        <Draggable />
      </Card>

      <Card title="EVENT PROPAGATION · capture → target → bubble → click">
        <EventLab />
      </Card>

      <Card title="KEYBOARD">
        <View
          focusable
          onKeyDown={(e) => setKey(`${e.key}${e.shiftKey ? ' +shift' : ''}${e.ctrlKey ? ' +ctrl' : ''}`)}
          className="bg-zinc-100 dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 focus:border-violet-500 rounded-xl p-4"
        >
          <Text className="text-sm font-bold">{key}</Text>
        </View>
      </Card>
    </View>
  )
}
