import { appState, updateSetting } from '@/app'
import { clipboardReadText, clipboardWriteText, exitApp, openDirInExplorer, openUrl } from '@/shared/electron'
import type { ExposeFunctions } from '.'
import { checkUpdate, downloadUpdate, restartUpdate } from '../autoUpdate'
import { winMainEvent } from '../event'
import { closeWindow, minimize, showOpenDialog, showSaveDialog, toggleDevTools } from '../main'

// 暴露给前端的方法
export const createExposeApp = () => {
  return {
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
      restartUpdate()
    },
  } satisfies Partial<ExposeFunctions>
}
