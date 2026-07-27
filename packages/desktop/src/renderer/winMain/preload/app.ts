import { createProxyCallback } from 'message2call'

import type { ClientCall, ExposeFunctions, MainCall } from '.'

// 暴露给后端的方法
export const createExposeApp = (client: ClientCall) => {
  return {
    async settingChanged(event, keys, setting) {
      return client.settingChanged(keys, setting)
    },
    async deeplink(event, deeplink) {
      return client.deeplink(deeplink)
    },
    async winShow(event, show) {
      return client.winShow(show)
    },
    async fullscreen(event, isFullscreen) {
      return client.fullscreen(isFullscreen)
    },

    async showMessageBox(event, key, extId, options) {
      return client.showMessageBox(key, extId, options)
    },
    async showInputBox(event, key, extId, options, validateInput) {
      return client.showInputBox(key, extId, options, validateInput)
    },
    async showOpenBox(event, key, extId, options) {
      return client.showOpenBox(key, extId, options)
    },
    async showSaveBox(event, key, extId, options) {
      return client.showSaveBox(key, extId, options)
    },
    async closeMessageBox(event, key) {
      return client.closeMessageBox(key)
    },
    async updateInfo(event, info) {
      return client.updateInfo(info)
    },
    async appLog(event, type, log) {
      return client.appLog(type, log)
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientApp = (main: MainCall) => {
  return {
    async getAppInfo() {
      return main.getAppInfo()
    },
    async getSetting() {
      return main.getSetting()
    },
    async setSetting(setting) {
      return main.setSetting(setting)
    },
    async inited() {
      return main.inited()
    },
    async minWindow() {
      return main.minWindow()
    },
    async closeWindow(isForce) {
      return main.closeWindow(isForce)
    },
    async exitApp() {
      return main.exitApp()
    },
    async fullscreenWindow(isFull) {
      return main.fullscreenWindow(isFull)
    },
    async showOpenDialog(opts) {
      return main.showOpenDialog(opts)
    },
    async showSaveDialog(opts) {
      return main.showSaveDialog(opts)
    },
    async openDirInExplorer(path) {
      return main.openDirInExplorer(path)
    },
    async clipboardReadText() {
      return main.clipboardReadText()
    },
    async clipboardWriteText(text) {
      return main.clipboardWriteText(text)
    },
    async openDevTools() {
      return main.openDevTools()
    },
    async openUrl(url) {
      return main.openUrl(url)
    },
    async getCurrentVersionInfo() {
      return main.getCurrentVersionInfo()
    },
    async checkUpdate() {
      return main.checkUpdate()
    },
    async downloadUpdate() {
      return main.downloadUpdate()
    },
    async restartUpdate() {
      return main.restartUpdate()
    },
    async getSystemFonts() {
      return main.getSystemFonts()
    },
    async getCacheSize() {
      return main.getCacheSize()
    },
    async clearCache() {
      return main.clearCache()
    },
    async exportData(path, types) {
      return main.exportData(path, types)
    },
    async importData(path, selectData, getListMergeMode) {
      const proxySelectData = createProxyCallback(selectData)
      const proxyGetListMergeMode = createProxyCallback(getListMergeMode)

      return main.importData(path, proxySelectData, proxyGetListMergeMode).finally(() => {
        proxySelectData.releaseProxy()
        proxyGetListMergeMode.releaseProxy()
      })
    },
    async setBackupPath(path) {
      return main.setBackupPath(path)
    },
    async getAppLogs(type) {
      return main.getAppLogs(type)
    },
    async clearAppLog(type) {
      return main.clearAppLog(type)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
