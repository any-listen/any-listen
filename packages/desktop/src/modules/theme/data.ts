import fs from 'node:fs/promises'

import { PIC_FILE_TYPES, STORE_NAMES } from '@any-listen/common/constants'
import themes from '@any-listen/theme/index.json'

import { appState } from '@/app'
import getStore from '@/shared/store'
import { basename, checkAndCreateDir, copyFile, encodePath, extname, getFileStats, isUrl, joinPath, removeFile } from '@/shared/utils'

let userThemes: AnyListen.Theme[]
const THEME_IMAGE_DIR = 'theme_images'
const THEME_IMAGE_EXTS = new Set<string>(PIC_FILE_TYPES)

const getUserThemeImageDir = () => joinPath(appState.dataPath, THEME_IMAGE_DIR)

const getPresetThemeImageDir = () => {
  return import.meta.env.DEV ? joinPath(__dirname, THEME_IMAGE_DIR) : joinPath(__dirname, '../view-main', THEME_IMAGE_DIR)
}

const isThemeImageName = (name: string) => {
  return THEME_IMAGE_EXTS.has(extname(name).substring(1))
}

const listThemeImageNames = async (dir: string) => {
  return fs
    .readdir(dir, { withFileTypes: true })
    .then((files) => files.filter((file) => file.isFile() && isThemeImageName(file.name)).map((file) => file.name))
    .catch(() => [])
}

const buildPresetThemeImage = (name: string): AnyListen.ThemeImage => {
  const url = `./${encodePath(joinPath(THEME_IMAGE_DIR, name))}`
  return {
    id: `preset:${name}`,
    name,
    url,
    value: `url(${url})`,
    source: 'preset',
    canDelete: false,
  }
}

const buildUserThemeImage = (name: string): AnyListen.ThemeImage => {
  const filePath = joinPath(getUserThemeImageDir(), name)
  return {
    id: `user:${name}`,
    name,
    url: `file:///${encodePath(filePath)}`,
    value: name,
    source: 'user',
    canDelete: true,
  }
}

const getAvailableThemeImageName = async (sourcePath: string, dir: string) => {
  const ext = extname(sourcePath)
  const rawName = basename(sourcePath, ext).replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim() || 'theme-image'
  let name = `${rawName}${ext}`
  let index = 1
  while (await getFileStats(joinPath(dir, name))) {
    name = `${rawName}-${index}${ext}`
    index += 1
  }
  return name
}

const normalizeUserThemeImageName = (name: string) => {
  name = basename(name)
  if (!isThemeImageName(name)) throw new Error(`Not allow file type: ${name}`)
  return name
}

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

export const getThemeImages = async () => {
  const [presetNames, userNames] = await Promise.all([listThemeImageNames(getPresetThemeImageDir()), listThemeImageNames(getUserThemeImageDir())])
  return [...presetNames.map(buildPresetThemeImage), ...userNames.map(buildUserThemeImage)]
}

export const saveThemeImage = async (filePath: string) => {
  const ext = extname(filePath).substring(1)
  if (!THEME_IMAGE_EXTS.has(ext)) throw new Error(`Not allow file type: ${ext}`)
  const stat = await getFileStats(filePath)
  if (!stat?.isFile()) throw new Error(`File not found: ${filePath}`)

  const dir = getUserThemeImageDir()
  await checkAndCreateDir(dir)
  const name = await getAvailableThemeImageName(filePath, dir)
  await copyFile(filePath, joinPath(dir, name))
  return buildUserThemeImage(name)
}

export const removeThemeImage = async (name: string) => {
  name = normalizeUserThemeImageName(name)
  await removeFile(joinPath(getUserThemeImageDir(), name))
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
  if (!backgroundImage || backgroundImage == 'none') return 'none'
  const urlMatch = /^url\((['"]?)(.*?)\1\)$/.exec(backgroundImage)
  const imagePath = urlMatch?.[2] ?? backgroundImage
  if (!imagePath) return 'none'
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
