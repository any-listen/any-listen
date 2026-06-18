import { getThemeImages, getThemeList, getThemeSetting, removeTheme, removeThemeImage, saveTheme, saveThemeImage } from '@/modules/theme'

import type { ExposeFunctions } from '.'

// 暴露给前端的方法
export const createExposeTheme = () => {
  return {
    async getThemeSetting(event) {
      return getThemeSetting()
    },
    async getThemeList(event) {
      return getThemeList()
    },
    async getThemeImages(event) {
      return getThemeImages()
    },
    async saveThemeImage(event, filePath) {
      return saveThemeImage(filePath)
    },
    async removeThemeImage(event, fileName) {
      await removeThemeImage(fileName)
    },
    async saveTheme(event, theme) {
      saveTheme(theme)
    },
    async removeTheme(event, id) {
      removeTheme(id)
    },
  } satisfies Partial<ExposeFunctions>
}
