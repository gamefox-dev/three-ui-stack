import { createContext, useContext } from 'react'
import type { ThreeUI } from 'three-ui'

export const ThreeUIContext = createContext<ThreeUI | null>(null)

/** Access the `ThreeUI` instance the current tree renders into. */
export function useThreeUI(): ThreeUI {
  const ui = useContext(ThreeUIContext)
  if (!ui) throw new Error('[three-ui-react] useThreeUI() must be used inside a tree rendered with createThreeUIRoot()')
  return ui
}
