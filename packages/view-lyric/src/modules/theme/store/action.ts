import { themeChangedEvent } from '@/shared/ipcMain/event'
import { ipc } from '@/shared/ipcMain/ipc'

import * as commit from './commit'
import { themeState } from './state'

export const applyTheme = (colors: AnyListen.ThemeSetting['colors']) => {
  window.setTheme(colors)
}

export const setThemePreview = (preview: boolean) => {
  commit.setThemePreview(preview)
}

export const themePreview = (colors: AnyListen.ThemeSetting['colors'] | null) => {
  if (colors) {
    applyTheme(colors)
    setThemePreview(true)
  } else {
    applyTheme(themeState.theme.colors)
    setThemePreview(false)
  }
}

export const registerRemoteThemeAction = () => {
  return themeChangedEvent.on((theme) => {
    commit.updateTheme(theme)
    if (themeState.themePreview) return
    applyTheme(theme.colors)
  })
}

export const getThemeSetting = async () => {
  return ipc.getThemeSetting()
}
