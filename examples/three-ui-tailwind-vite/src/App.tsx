import { useState } from 'react'
import { Image, ScrollView, Text, View, useThreeUI } from '@implicit-invocation/three-ui-react'
import { makeAvatar } from 'example-shared'
import { Button } from './kit'
import { Interaction } from './pages/Interaction'
import { LayoutLab } from './pages/LayoutLab'
import { Media } from './pages/Media'
import { Overview } from './pages/Overview'
import { Performance } from './pages/Performance'
import { Scrolling } from './pages/Scrolling'
import { Typography } from './pages/Typography'

export type PageId = 'home' | 'layout' | 'type' | 'input' | 'scroll' | 'media' | 'perf'

const NAV: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Overview' },
  { id: 'layout', label: 'Layout' },
  { id: 'type', label: 'Typography' },
  { id: 'input', label: 'Interaction' },
  { id: 'scroll', label: 'Scrolling' },
  { id: 'media', label: 'Media' },
  { id: 'perf', label: 'Counters' },
]

const logo = makeAvatar(3, 64)

export function App({ backend }: { backend: string }) {
  const ui = useThreeUI()
  const [page, setPage] = useState<PageId>(() => (new URLSearchParams(location.search).get('page') as PageId | null) ?? 'home')
  const [dark, setDark] = useState(ui.environment.colorScheme === 'dark')
  const toggleDark = () => {
    ui.setColorScheme(dark ? 'light' : 'dark')
    setDark(!dark)
  }

  return (
    <View className="flex-1 flex-col md:flex-row bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-ui text-base">
      {/* sidebar on md+, top bar below md — pure Tailwind responsive variants */}
      <View className="flex-row md:flex-col items-center md:items-stretch gap-2 md:w-56 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-3 md:p-4">
        <View className="flex-row items-center gap-3 md:mb-4">
          <Image source={logo} className="size-9 rounded-xl" />
          <View className="hidden sm:flex flex-col">
            <Text className="text-base font-bold">three-ui</Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">showcase</Text>
          </View>
        </View>
        <View className="flex-row md:flex-col gap-1 grow shrink flex-wrap">
          {NAV.map((n) => (
            <View
              key={n.id}
              focusable
              onClick={() => setPage(n.id)}
              className={`${page === n.id ? 'bg-violet-600 text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'} px-3 py-2 rounded-xl border-2 border-transparent focus:border-amber-400 active:scale-95`}
            >
              <Text className="text-sm font-bold">{n.label}</Text>
            </View>
          ))}
        </View>
        <View className="md:mt-auto gap-2">
          <Button label={dark ? 'Light mode' : 'Dark mode'} variant="ghost" small onPress={toggleDark} />
          <Text className="hidden md:flex text-xs text-zinc-500 dark:text-zinc-400">{backend}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 md:p-6 gap-4" key={page}>
        {page === 'home' && <Overview go={setPage} backend={backend} />}
        {page === 'layout' && <LayoutLab />}
        {page === 'type' && <Typography />}
        {page === 'input' && <Interaction />}
        {page === 'scroll' && <Scrolling />}
        {page === 'media' && <Media />}
        {page === 'perf' && <Performance />}
      </ScrollView>
    </View>
  )
}
