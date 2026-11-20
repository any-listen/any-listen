import { STORE_NAMES } from '@any-listen/common/constants'
import themes from '@any-listen/theme/index.json'

import { appState } from '@/app/app'
import { getStore } from '@/app/shared/store'
import { joinPath, encodePath, isUrl } from '@/app/shared/utils'

let userThemes: AnyListen.Theme[]

// 主题由客户端提交并持久化，getTheme 启动时会按 Theme 的形状解引用，
// 不合规的数据存进去会让之后的每次启动都崩在这里
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const isValidTheme = (theme: AnyListen.Theme | null | undefined): boolean => {
  return !!theme && !!theme.id && !!theme.config && !!theme.config.extInfo && !!theme.config.themeColors
}

export const getAllThemes = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  userThemes ??= getStore(STORE_NAMES.THEME).get<AnyListen.Theme[]>('themes') ?? []
  return {
    themes,
    userThemes,
    dataPath: joinPath(appState.dataPath, 'theme_images'),
  }
}

export const saveTheme = (theme: AnyListen.Theme) => {
  if (!isValidTheme(theme)) throw new Error('Invalid theme')
  const targetTheme = userThemes.find((t) => t.id === theme.id)
  if (targetTheme) Object.assign(targetTheme, theme)
  else userThemes.push(theme)
  getStore(STORE_NAMES.THEME).set('themes', userThemes)
}

export const removeTheme = (id: string) => {
  const index = userThemes.findIndex((t) => t.id === id)
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
    userThemes = getStore(STORE_NAMES.THEME).get('themes') ?? []
    theme = userThemes.find((theme) => theme.id == themeId && isValidTheme(theme))
    if (theme) {
      if (theme.config.extInfo['--background-image'] != 'none') {
        theme = copyTheme(theme)
        theme.config.extInfo['--background-image'] = isUrl(theme.config.extInfo['--background-image'])
          ? `url(${theme.config.extInfo['--background-image']})`
          : `url(file:///${encodePath(joinPath(appState.dataPath, 'theme_images', theme.config.extInfo['--background-image']))})`
      }
    } else {
      themeId = appState.appSetting['theme.id'] == 'auto' && shouldUseDarkColors ? 'black' : 'green'
      theme = themes.find((theme) => theme.id == themeId)!
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
