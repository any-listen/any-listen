import { getAllThemes, getTheme, saveTheme as saveThemeData, removeTheme as removeThemeData } from './data'
import { themeState, themeEvent } from '@any-listen/app/modules/theme'
import { appEvent, appState } from '@/app'

export const initTheme = () => {
  Object.assign(themeState, getTheme())
  const themeConfigKeys = ['theme.id', 'theme.lightId', 'theme.darkId']
  appEvent.on('updated_config', (keys) => {
    let requireUpdate = false
    for (const key of keys) {
      if (themeConfigKeys.includes(key)) {
        requireUpdate = true
        break
      }
    }
    if (requireUpdate) {
      const theme = getTheme()
      if (theme.id == themeState.id) return
      Object.assign(themeState, theme)
      themeEvent.theme_change(themeState)
    }
  })
  appEvent.on('system_theme_change', () => {
    if (appState.appSetting['theme.id'] == 'auto') {
      const theme = getTheme()
      if (theme.id == themeState.id) return
      Object.assign(themeState, theme)
      themeEvent.theme_change(themeState)
    }
  })
}

export const getThemeSetting = () => {
  return themeState
}

export const getThemeList = () => {
  return getAllThemes()
}

export const saveTheme = (theme: AnyListen.Theme) => {
  saveThemeData(theme)
  themeEvent.theme_list_change(getAllThemes())
}

export const removeTheme = (id: string) => {
  removeThemeData(id)
  themeEvent.theme_list_change(getAllThemes())
}

export { themeState, themeEvent }
