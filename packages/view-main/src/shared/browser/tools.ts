import { workers } from '@/worker'
import { proxyCallback } from '@/worker/utils'
import { generateId } from '@any-listen/common/utils'

const proxyCbs = new Map<string, () => void>()
export const runTimeout = (cb: () => void, d?: number) => {
  const id = generateId()
  const clear = () => {
    proxyCbs.delete(id)
    pcb.releaseProxy()
  }
  proxyCbs.set(id, clear)
  const pcb = proxyCallback(() => {
    if (!proxyCbs.has(id)) return
    clear()
    cb()
  })
  void workers.main.runTimeout(id, pcb, d)
  return id
}
export const stopTimeout = (id: string) => {
  const clear = proxyCbs.get(id)
  if (!clear) return
  clear()
  void workers.main.stopTimeout(id)
}

let themeMediaQuery: MediaQueryList
const initThemeMediaQuery = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (themeMediaQuery) return
  themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
}
export const onSystemThemeModeChanged = (handler: (isDark: boolean) => void) => {
  initThemeMediaQuery()
  const handleThemeChange = (e: MediaQueryListEvent) => {
    handler(e.matches)
  }

  // 监听变化
  themeMediaQuery.addEventListener('change', handleThemeChange)

  return () => {
    themeMediaQuery.removeEventListener('change', handleThemeChange)
  }
}
export const getSystemThemeIsDark = () => {
  initThemeMediaQuery()
  return themeMediaQuery.matches
}
