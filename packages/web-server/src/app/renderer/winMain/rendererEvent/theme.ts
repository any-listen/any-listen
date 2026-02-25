import { getThemeList, getThemeSetting, removeTheme, saveTheme } from '@/app/modules/theme'
import { broadcast } from '@/modules/ipc/websocket'

import type { ExposeClientFunctions, ExposeServerFunctions } from '.'

// 暴露给前端的方法
export const createExposeTheme = () => {
  return {
    async getThemeSetting(event) {
      return getThemeSetting()
    },
    async getThemeList(event) {
      return getThemeList()
    },
    async saveTheme(event, theme) {
      saveTheme(theme)
    },
    async removeTheme(event, id) {
      removeTheme(id)
    },
  } satisfies Partial<ExposeClientFunctions>
}

// 暴露给后端的方法
export const createServerTheme = () => {
  return {
    async themeChanged(setting) {
      broadcast((socket) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remoteQueueTheme.themeChanged(setting)
      })
    },
    async themeListChanged(list) {
      broadcast((socket) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remoteQueueTheme.themeListChanged(list)
      })
    },
  } as const satisfies Partial<ExposeServerFunctions>
}
