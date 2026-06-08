import { themeEvent, themeState } from '@any-listen/app/modules/theme'

import { appEvent, appState, updateSetting } from '@/app'

import { getAllThemes, getTheme, removeTheme as removeThemeData, saveTheme as saveThemeData } from './data'

const getActiveThemeId = () => {
  return appState.appSetting['theme.id'] == 'auto'
    ? appState.shouldUseDarkColors
      ? appState.appSetting['theme.darkId']
      : appState.appSetting['theme.lightId']
    : appState.appSetting['theme.id']
}

const getFallbackThemeId = (isDark?: boolean) => {
  return isDark ? 'black' : 'green'
}

const applyCurrentTheme = () => {
  Object.assign(themeState, getTheme())
  themeEvent.theme_change(themeState)
}

export const initTheme = async () => {
  Object.assign(themeState, getTheme())
  const watchConfigKeys: Array<keyof AnyListen.AppSetting> = ['theme.id', 'theme.lightId', 'theme.darkId']
  appEvent.on('updated_config', (keys) => {
    let requireUpdate = false
    for (const key of keys) {
      if (watchConfigKeys.includes(key)) {
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
  const activeThemeId = getActiveThemeId()
  saveThemeData(theme)
  themeEvent.theme_list_change(getAllThemes())
  if (activeThemeId == theme.id) applyCurrentTheme()
}

export const removeTheme = (id: string) => {
  const activeThemeId = getActiveThemeId()
  const targetTheme = getAllThemes().userThemes.find((theme) => theme.id == id)
  removeThemeData(id)
  if (activeThemeId == id) {
    const fallbackThemeId = getFallbackThemeId(targetTheme?.isDark)
    if (appState.appSetting['theme.id'] == 'auto') {
      updateSetting({
        [appState.shouldUseDarkColors ? 'theme.darkId' : 'theme.lightId']: fallbackThemeId,
      })
    } else {
      updateSetting({
        'theme.id': fallbackThemeId,
        [fallbackThemeId == 'black' ? 'theme.darkId' : 'theme.lightId']: fallbackThemeId,
      })
    }
  }
  themeEvent.theme_list_change(getAllThemes())
}

export { themeEvent, themeState }
