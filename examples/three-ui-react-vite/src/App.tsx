import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Image, ScrollView, Text, View, useThreeUI, type Style, type UIPointerEvent } from 'three-ui-react'
import { makeAvatar } from 'example-shared'

const C = { bg: '#09090b', surface: '#18181b', surface2: '#27272a', border: '#3f3f46', muted: '#a1a1aa', accent: '#8b5cf6', ok: '#22c55e', warn: '#fbbf24', danger: '#f43f5e' }

// ── building blocks ────────────────────────────────────────────────────────────────────────────────────────────
function Button({ label, onPress, color = C.accent, disabled = false }: { label: string; onPress: () => void; color?: string; disabled?: boolean }) {
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)
  const style: Style = {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: disabled ? C.surface2 : down ? '#00000055' : hover ? '#ffffff22' : 'transparent',
    borderWidth: 1,
    borderColor: disabled ? C.border : color,
    opacity: disabled ? 0.5 : 1,
    transform: down ? [{ scale: 0.96 }] : undefined,
  }
  return (
    <View
      style={[style, hover && !down && !disabled ? { backgroundColor: color } : null]}
      focusable
      disabled={disabled}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false)
        setDown(false)
      }}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerCancel={() => setDown(false)}
      onClick={onPress}
    >
      <Text style={{ fontWeight: 700, color: hover && !disabled ? '#ffffff' : disabled ? C.muted : color }}>{label}</Text>
    </View>
  )
}

function Card({ title, children, style }: { title: string; children: ReactNode; style?: Style }) {
  return (
    <View style={[{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, gap: 10 }, style]}>
      <Text style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '0.06em' }}>{title}</Text>
      {children}
    </View>
  )
}

/** Counts how many times a component *function* ran vs how many UI nodes exist: React updates, never re-creates. */
function useRenderCount(): number {
  const n = useRef(0)
  n.current++
  return n.current
}

// ── counter: state updates mutate existing nodes ─────────────────────────────────────────────────────────────────────
function Counter() {
  const [n, setN] = useState(0)
  const renders = useRenderCount()
  return (
    <Card title="STATE → MUTATION">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={{ fontSize: 40, fontWeight: 700, color: n % 2 ? C.warn : C.ok, width: 90 }}>{n}</Text>
        <View style={{ gap: 8 }}>
          <Button label="+1" onPress={() => setN(n + 1)} />
          <Button label="Reset" color={C.danger} onPress={() => setN(0)} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 12, color: C.muted }}>{`component renders: ${renders}`}</Text>
          <Text style={{ fontSize: 12, color: C.muted }}>text/style props change in place;</Text>
          <Text style={{ fontSize: 12, color: C.muted }}>the nodes are never remounted.</Text>
        </View>
      </View>
    </Card>
  )
}

// ── todo list: keyed insert / remove / reorder ─────────────────────────────────────────────────────────────────────
interface Todo {
  id: number
  text: string
  done: boolean
}
const IDEAS = ['Ship the Vite example', 'Bake a bitmap font', 'Try the WebGL2 fallback', 'Profile draw calls', 'Scroll the big list', 'Toggle dark mode', 'Port to React Native']

function Todos() {
  const [todos, setTodos] = useState<Todo[]>(() => IDEAS.slice(0, 4).map((text, id) => ({ id, text, done: id === 1 })))
  const nextId = useRef(IDEAS.slice(0, 4).length)
  const add = () => setTodos((t) => [...t, { id: nextId.current, text: IDEAS[nextId.current++ % IDEAS.length]!, done: false }])
  const move = (id: number, dir: -1 | 1) =>
    setTodos((t) => {
      const i = t.findIndex((x) => x.id === id)
      const j = i + dir
      if (j < 0 || j >= t.length) return t
      const copy = [...t]
      ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
      return copy
    })
  return (
    <Card title="KEYED LIST · insert / reorder / remove">
      <View style={{ gap: 6 }}>
        {todos.map((t) => (
          <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.surface2, borderRadius: 8, padding: 6, paddingLeft: 10 }}>
            <View
              onClick={() => setTodos((all) => all.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
              style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: t.done ? C.ok : C.muted, backgroundColor: t.done ? C.ok : 'transparent' }}
            />
            <Text style={{ flex: 1, color: t.done ? C.muted : '#fafafa', fontWeight: t.done ? 400 : 700 }}>{t.text}</Text>
            <Button label="↑" onPress={() => move(t.id, -1)} color={C.muted} />
            <Button label="↓" onPress={() => move(t.id, 1)} color={C.muted} />
            <Button label="×" onPress={() => setTodos((all) => all.filter((x) => x.id !== t.id))} color={C.danger} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Add todo" onPress={add} />
        <Button label="Clear done" color={C.warn} onPress={() => setTodos((all) => all.filter((x) => !x.done))} />
      </View>
    </Card>
  )
}

// ── event propagation lab ──────────────────────────────────────────────────────────────────────────────────────────
function Events() {
  const [log, setLog] = useState<string[]>([])
  const [stop, setStop] = useState(false)
  const push = (m: string) => setLog((l) => [m, ...l].slice(0, 7))
  const tag = (name: string) => ({
    onPointerDownCapture: () => push(`${name} · capture`),
    onPointerDown: (e: UIPointerEvent) => {
      push(`${name} · bubble${stop && name === 'inner' ? ' (stopped)' : ''}`)
      if (stop && name === 'inner') e.stopPropagation()
    },
  })
  return (
    <Card title="EVENTS · capture → target → bubble">
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View {...tag('outer')} style={{ width: 150, height: 110, backgroundColor: '#3b0764', borderRadius: 10, padding: 14, justifyContent: 'center' }}>
          <View {...tag('middle')} style={{ flex: 1, backgroundColor: '#6d28d9', borderRadius: 8, padding: 14 }}>
            <View {...tag('inner')} style={{ flex: 1, backgroundColor: '#a78bfa', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#1e1b4b', fontWeight: 700, fontSize: 12 }}>click me</Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Button label={stop ? 'stopPropagation: ON' : 'stopPropagation: OFF'} color={stop ? C.warn : C.muted} onPress={() => setStop(!stop)} />
          {log.map((l, i) => (
            <Text key={i} style={{ fontSize: 12, color: i === 0 ? C.ok : C.muted }}>{l}</Text>
          ))}
        </View>
      </View>
    </Card>
  )
}

// ── big scroll list (React-rendered rows; culling keeps the paint cost flat) ───────────────────────────────────────────
function BigList() {
  const [count, setCount] = useState(300)
  const avatars = useMemo(() => Array.from({ length: 8 }, (_, i) => makeAvatar(i + 3)), [])
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <Card title={`SCROLLVIEW · ${count} React-rendered rows`} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, gap: 4, paddingRight: 8 }}>
        {Array.from({ length: count }, (_, i) => (
          <View
            key={i}
            onClick={() => setSelected(i)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 6, borderRadius: 8, backgroundColor: selected === i ? '#4c1d95' : C.surface2 }}
          >
            <Image source={avatars[i % avatars.length]!} style={{ width: 28, height: 28, borderRadius: 14 }} />
            <Text style={{ flex: 1 }}>{`Row ${i + 1}`}</Text>
            <Text style={{ fontSize: 12, color: C.muted }}>{selected === i ? 'selected' : ''}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="+50 rows" onPress={() => setCount(count + 50)} />
        <Button label="−50 rows" color={C.danger} onPress={() => setCount(Math.max(0, count - 50))} />
      </View>
    </Card>
  )
}

function Stats() {
  const ui = useThreeUI()
  const [s, setS] = useState('')
  useEffect(() => {
    const id = setInterval(() => {
      const st = ui.stats
      setS(`nodes ${st.nodes} · layouts ${st.layoutPasses} · style recomputes ${st.styleRecomputes} · draw calls ${st.drawCalls} · glyphs ${st.glyphs}`)
    }, 500)
    return () => clearInterval(id)
  }, [ui])
  return <Text style={{ fontSize: 12, color: C.ok }}>{s}</Text>
}

export function App({ backend }: { backend: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 16, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 30, fontWeight: 700 }}>three-ui-react</Text>
          <Text style={{ fontSize: 13, color: C.muted }}>react-reconciler (mutation mode) → retained three-ui tree · style objects only</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={{ fontWeight: 700, color: C.warn }}>{backend}</Text>
          <Stats />
        </View>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 14 }}>
        <View style={{ flex: 1, gap: 12 }}>
          <Counter />
          <Todos />
          <Events />
        </View>
        <View style={{ width: 340 }}>
          <BigList />
        </View>
      </View>
    </View>
  )
}
