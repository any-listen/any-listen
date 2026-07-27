import { clearCache, getCacheSize } from '@any-listen/app/cache'
import { exportData, importData } from '@any-listen/app/modules/backup'
import { logs } from '@any-listen/app/modules/logs'
import { proxyServerState } from '@any-listen/app/modules/proxyServer/state'

import { appState, setSystemMode, updateSetting } from '@/app/app'
import { checkAllowPathError, fileSystemAction } from '@/app/modules/fileSystem'
import { socketEvent } from '@/modules/ipc/event'
import { broadcast } from '@/modules/ipc/websocket'
import { getClientInfos } from '@/shared/data'

import type { ExposeClientFunctions, ExposeServerFunctions } from '.'
import { checkUpdate, downloadUpdate, restartUpdate } from '../autoUpdate'

const IGINORE_KEYS: Array<keyof AnyListen.AppSetting> = [
  'network.proxy.enable',
  'network.proxy.host',
  'network.proxy.port',
  'extension.ghMirrorHosts',
]

// 暴露给前端的方法
export const createExposeApp = () => {
  return {
    async inited(event) {
      event.isInited = true
      socketEvent.new_socket_inited(event)
    },
    async setSystemThemeMode(event, isDark) {
      setSystemMode(isDark)
    },
    async getAppInfo(event) {
      return {
        machineId: appState.machineId,
        proxyServerHost: proxyServerState.proxyHost,
      }
    },
    async getSetting(event) {
      return appState.appSetting
    },
    async setSetting(event, setting) {
      for (const key of Object.keys(setting) as Array<keyof AnyListen.AppSetting>) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        if (IGINORE_KEYS.includes(key)) delete setting[key]
      }
      updateSetting(setting)
    },
    async fileSystemAction(event, action) {
      return fileSystemAction(action)
    },
    async getLoginDevices(event) {
      return {
        list: getClientInfos(),
        currentId: event.keyInfo.clientId,
      }
    },
    async removeLoginDevice(event, id) {
      socketEvent.remove_session(id)
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
    async getCacheSize(event) {
      return getCacheSize()
    },
    async clearCache(event) {
      await clearCache()
    },
    async exportData(event, path, types) {
      checkAllowPathError(path)
      await exportData(path, types)
    },
    async importData(event, path, selectData, getListMergeMode) {
      checkAllowPathError(path)
      await importData(path, selectData, getListMergeMode)
    },
    async getAppLogs(event, type) {
      return logs[type].getLogs()
    },
    async clearAppLog(event, type) {
      return logs[type].clearLog()
    },
  } satisfies Partial<ExposeClientFunctions>
}

// 暴露给后端的方法
export const createServerApp = () => {
  return {
    async settingChanged(keys, setting) {
      broadcast((socket) => {
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.settingChanged(keys, setting)
      })
    },
    async deeplink(deeplink) {
      broadcast((socket) => {
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.deeplink(deeplink)
      })
    },
    // async createDesktopLyricProcess(action) {
    //   // TODO
    //   // broadcast((socket) => {
    //   //   if (socket.winType != 'main' || !socket.isInited) return
    //   //   socket.remoteQueuePlayer.playerAction(action)
    //   // })
    // },
    async closeMessageBox(key) {
      broadcast((socket) => {
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.closeMessageBox(key)
      })
    },
    async updateInfo(info) {
      broadcast((socket) => {
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.updateInfo(info)
      })
    },
    async appLog(type, log) {
      broadcast((socket) => {
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.appLog(type, log)
      })
    },
  } satisfies Partial<ExposeServerFunctions>
}
