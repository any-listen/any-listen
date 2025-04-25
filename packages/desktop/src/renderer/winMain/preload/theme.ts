import type { ExposeFunctions, MainCall } from '.'
import { ipcPreloadEvent } from '@any-listen/app/modules/ipcPreloadEvent'

// 暴露给后端的方法
export const createExposeTheme = () => {
  return {
    async themeChanged(event, setting) {
      ipcPreloadEvent.themeChanged(setting)
    },
    async themeListChanged(event, list) {
      ipcPreloadEvent.themeListChanged(list)
    },
  } as const satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientTheme = (main: MainCall) => {
  return {
    async getThemeSetting() {
      return main.getThemeSetting()
    },
    async getThemeList() {
      return main.getThemeList()
    },
    async saveTheme(theme) {
      return main.saveTheme(theme)
    },
    async removeTheme(id) {
      return main.removeTheme(id)
    },
    onThemeChanged(listener) {
      ipcPreloadEvent.on('themeChanged', listener)
      return () => {
        ipcPreloadEvent.off('themeChanged', listener)
      }
    },
    onThemeListChanged(listener) {
      ipcPreloadEvent.on('themeListChanged', listener)
      return () => {
        ipcPreloadEvent.off('themeListChanged', listener)
      }
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
