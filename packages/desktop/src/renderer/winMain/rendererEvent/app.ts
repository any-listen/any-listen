import { appState, updateSetting } from '@/app'
import { clipboardReadText, clipboardWriteText, exitApp, openDirInExplorer, openUrl } from '@/shared/electron'
import { getFonts } from '@/shared/fontManage'
import { clearCache, getCacheSize } from '@any-listen/app/cache'
import type { ExposeFunctions } from '.'
import { checkUpdate, downloadUpdate, restartUpdate } from '../autoUpdate'
import { winMainEvent } from '../event'
import {
  clearCache as clearAppCache,
  closeWindow,
  getCacheSize as getAppCacheSize,
  minimize,
  setFullScreen,
  showOpenDialog,
  showSaveDialog,
  toggleDevTools,
} from '../main'

// 暴露给前端的方法
export const createExposeApp = () => {
  return {
    async getMachineId(event) {
      return appState.machineId
    },
    async getSetting(event) {
      return appState.appSetting
    },
    async setSetting(event, setting) {
      updateSetting(setting)
    },
    async inited() {
      winMainEvent.inited()
    },
    async minWindow() {
      minimize()
    },
    async closeWindow(event, isForce) {
      if (isForce) {
        exitApp(0)
        return
      }
      closeWindow()
    },
    async fullscreenWindow(event, isFull) {
      setFullScreen(isFull)
    },

    async showOpenDialog(event, opts) {
      return showOpenDialog(opts)
    },
    async showSaveDialog(event, opts) {
      return showSaveDialog(opts)
    },
    async openDirInExplorer(event, path) {
      openDirInExplorer(path)
    },
    async clipboardReadText() {
      return clipboardReadText()
    },
    async clipboardWriteText(event, text) {
      clipboardWriteText(text)
    },
    async openDevTools(event) {
      toggleDevTools()
    },
    async openUrl(event, url) {
      return openUrl(url)
    },
    async getCurrentVersionInfo() {
      return appState.version
    },
    async checkUpdate(event) {
      return checkUpdate()
    },
    async downloadUpdate(event) {
      void downloadUpdate()
    },
    async restartUpdate(event) {
      await restartUpdate()
    },
    async getSystemFonts(event) {
      return getFonts()
    },
    async getCacheSize() {
      const sizes = await Promise.all([getAppCacheSize(), getCacheSize()])
      return sizes.reduce((a, b) => a + b, 0)
    },
    async clearCache() {
      await Promise.all([clearAppCache(), clearCache()])
    },
  } satisfies Partial<ExposeFunctions>
}
