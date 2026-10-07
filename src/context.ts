import { createContext, useContext } from 'react'
import type { ComponentReadiness, EnvironmentFilter } from './types'
interface AppContextValue {
  environment: EnvironmentFilter
  setEnvironment: (value: EnvironmentFilter) => void
  openDrawer: (record: ComponentReadiness) => void
  selectedRecordId?: string
}
export const AppContext = createContext<AppContextValue | null>(null)
export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('Readiness views must be rendered inside AppContext.Provider')
  return value
}
