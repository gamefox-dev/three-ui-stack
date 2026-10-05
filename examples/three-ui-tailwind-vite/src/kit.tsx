import { useEffect, useRef, type ReactNode } from 'react'
import { Text, View, useThreeUI, type UIPointerEvent } from '@implicit-invocation/three-ui-react'

// Every Tailwind class below is a complete literal token so the build-time scanner can see it.

type Variant = 'primary' | 'ghost' | 'danger' | 'success'

const BUTTON: Record<Variant, string> = {
  primary: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white',
  ghost: 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 active:bg-zinc-400 dark:active:bg-zinc-600 text-zinc-800 dark:text-zinc-100',
  danger: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white',
}

export function Button({ label, onPress, variant = 'primary', disabled, small, className = '' }: { label: string; onPress?: () => void; variant?: Variant; disabled?: boolean; small?: boolean; className?: string }) {
  return (
    <View
      focusable
      disabled={disabled}
      onClick={onPress}
      className={`${BUTTON[variant]} ${small ? 'px-3 py-1' : 'px-4 py-2'} rounded-lg border-2 border-transparent focus:border-amber-400 active:scale-95 disabled:opacity-40 items-center ${className}`}
    >
      <Text className={`${small ? 'text-xs' : 'text-sm'} font-bold`}>{label}</Text>
    </View>
  )
}

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <View className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 gap-3 ${className}`}>
      {title ? <Text className="text-xs font-bold tracking-widest text-zinc-500 dark:text-zinc-400">{title}</Text> : null}
      {children}
    </View>
  )
}

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="gap-1 mb-1">
      <Text className="text-2xl font-bold">{title}</Text>
      <Text className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">{subtitle}</Text>
    </View>
  )
}

export function Chip({ label, tone = 'zinc' }: { label: string; tone?: 'zinc' | 'violet' | 'emerald' | 'amber' }) {
  const tones = {
    zinc: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
    violet: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300',
    emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
  }
  return (
    <View className={`${tones[tone]} px-2 py-0.5 rounded-full`}>
      <Text className="text-xs font-bold">{label}</Text>
    </View>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <View className="flex-row flex-wrap gap-1 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl">
      {options.map((o) => (
        <View
          key={o}
          focusable
          onClick={() => onChange(o)}
          className={`${o === value ? 'bg-white dark:bg-zinc-600 text-violet-700 dark:text-white' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'} px-3 py-1 rounded-lg border-2 border-transparent focus:border-amber-400`}
        >
          <Text className="text-xs font-bold">{o}</Text>
        </View>
      ))}
    </View>
  )
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <View focusable onClick={() => onChange(!on)} onKeyDown={(e) => (e.key === 'ArrowLeft' ? onChange(false) : e.key === 'ArrowRight' ? onChange(true) : undefined)} className="flex-row items-center gap-3 border-2 border-transparent focus:border-amber-400 rounded-full">
      <View className={`${on ? 'bg-violet-600 justify-end' : 'bg-zinc-300 dark:bg-zinc-700 justify-start'} w-11 h-6 rounded-full flex-row items-center px-0.5`}>
        <View className="size-5 rounded-full bg-white" />
      </View>
      {label ? <Text className="text-sm">{label}</Text> : null}
    </View>
  )
}

/** Horizontal slider using pointer capture: drag anywhere on the track. */
export function Slider({ value, min = 0, max = 100, step = 1, onChange, width = 'w-56' }: { value: number; min?: number; max?: number; step?: number; onChange: (v: number) => void; width?: string }) {
  const ui = useThreeUI()
  const dragging = useRef(false)
  const set = (e: UIPointerEvent) => {
    const w = e.currentTarget?.layout.width ?? 1
    const t = Math.min(1, Math.max(0, e.localX / w))
    const v = Math.round((min + t * (max - min)) / step) * step
    onChange(Math.min(max, Math.max(min, v)))
  }
  const pct = ((value - min) / (max - min)) * 100
  return (
    <View
      focusable
      className={`${width} h-6 justify-center border-2 border-transparent focus:border-amber-400 rounded-full`}
      onPointerDown={(e) => {
        dragging.current = true
        ui.input.setPointerCapture(e.pointerId, e.currentTarget!)
        set(e)
      }}
      onPointerMove={(e) => dragging.current && set(e)}
      onPointerUp={() => (dragging.current = false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') onChange(Math.max(min, value - step))
        if (e.key === 'ArrowRight') onChange(Math.min(max, value + step))
      }}
    >
      <View className="h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 overflow-hidden">
        <View style={{ width: `${pct}%` }} className="h-2 bg-violet-600" />
      </View>
      <View style={{ left: `${pct}%`, marginLeft: -9 }} className="absolute size-5 top-0.5 rounded-full bg-white border-2 border-violet-600" />
    </View>
  )
}

export function Row({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`flex-row items-center gap-3 flex-wrap ${className}`}>{children}</View>
}

export function Label({ children }: { children: string }) {
  return <Text className="text-xs font-bold text-zinc-500 dark:text-zinc-400 w-24">{children}</Text>
}

/** requestAnimationFrame hook (examples may use DOM APIs; the libraries never do). */
export function useAnimationFrame(callback: (timeSeconds: number, dtSeconds: number) => void, active = true): void {
  const cb = useRef(callback)
  cb.current = callback
  useEffect(() => {
    if (!active) return
    let id = 0
    let last = performance.now()
    const tick = (now: number) => {
      cb.current(now / 1000, Math.min(0.1, Math.max(0, (now - last) / 1000)))
      last = now
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [active])
}

export function useInterval(callback: () => void, ms: number): void {
  const cb = useRef(callback)
  cb.current = callback
  useEffect(() => {
    const id = setInterval(() => cb.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}
