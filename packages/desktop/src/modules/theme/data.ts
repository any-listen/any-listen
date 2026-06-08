import { STORE_NAMES } from '@any-listen/common/constants'
import themes from '@any-listen/theme/index.json'

import { appState } from '@/app'
import getStore from '@/shared/store'
import { encodePath, isUrl, joinPath } from '@/shared/utils'

let userThemes: AnyListen.Theme[]
const getUserThemes = () => {
  userThemes ??= getStore(STORE_NAMES.THEME).get<AnyListen.Theme[]>('themes') ?? []
  return userThemes
}

export const getAllThemes = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  getUserThemes()
  return {
    themes,
    userThemes,
    dataPath: joinPath(appState.dataPath, 'theme_images'),
  }
}

export const saveTheme = (theme: AnyListen.Theme) => {
  if (themes.some((presetTheme) => presetTheme.id == theme.id)) return
  const targetTheme = getUserThemes().find((t) => t.id === theme.id)
  if (targetTheme) Object.assign(targetTheme, theme)
  else userThemes.push(theme)
  getStore(STORE_NAMES.THEME).set('themes', userThemes)
}

export const removeTheme = (id: string) => {
  const index = getUserThemes().findIndex((t) => t.id === id)
  if (index < 0) return
  userThemes.splice(index, 1)
  getStore(STORE_NAMES.THEME).set('themes', userThemes)
}

const copyTheme = (theme: AnyListen.Theme): AnyListen.Theme => {
  return {
    ...theme,
    config: {
      ...theme.config,
      extInfo: { ...theme.config.extInfo },
      themeColors: { ...theme.config.themeColors },
    },
  }
}

const formatUserThemeBackgroundImage = (backgroundImage: string) => {
  if (backgroundImage == 'none') return backgroundImage
  const urlMatch = /^url\((['"]?)(.*?)\1\)$/.exec(backgroundImage)
  const imagePath = urlMatch?.[2] ?? backgroundImage
  if (urlMatch && (imagePath.startsWith('./theme_images/') || imagePath.startsWith('file:///'))) return backgroundImage
  if (isUrl(imagePath)) return `url(${imagePath})`
  return `url(file:///${encodePath(joinPath(appState.dataPath, 'theme_images', imagePath))})`
}

export const getTheme = () => {
  // fs.promises.readdir()
  const shouldUseDarkColors = appState.shouldUseDarkColors
  let themeId =
    appState.appSetting['theme.id'] == 'auto'
      ? shouldUseDarkColors
        ? appState.appSetting['theme.darkId']
        : appState.appSetting['theme.lightId']
      : appState.appSetting['theme.id']
  // themeId = 'naruto'
  // themeId = 'pink'
  // themeId = 'black'
  let theme = themes.find((theme) => theme.id == themeId)
  if (!theme) {
    theme = getUserThemes().find((theme) => theme.id == themeId)
    if (theme) {
      if (theme.config.extInfo['--background-image'] != 'none') {
        theme = copyTheme(theme)
        theme.config.extInfo['--background-image'] = formatUserThemeBackgroundImage(theme.config.extInfo['--background-image'])
      }
    } else {
      themeId = appState.appSetting['theme.id'] == 'auto' && shouldUseDarkColors ? 'black' : 'green'
      theme = themes.find((theme) => theme.id == themeId) as AnyListen.Theme
    }
  }

  const colors: Record<string, string> = {
    ...theme.config.themeColors,
    ...theme.config.extInfo,
  }

  return {
    id: themeId,
    name: theme.name,
    isDark: theme.isDark,
    colors,
  }
}
