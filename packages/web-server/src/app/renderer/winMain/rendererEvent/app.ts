import { appState, updateSetting } from '@/app/app'
import { fileSystemAction } from '@/app/modules/fileSystem'
import { socketEvent } from '@/modules/ipc/event'
import { broadcast } from '@/modules/ipc/websocket'
import { getClientInfos } from '@/shared/data'
import type { ExposeClientFunctions, ExposeServerFunctions } from '.'
import { checkUpdate, downloadUpdate, restartUpdate } from '../autoUpdate'

// 暴露给前端的方法
export const createExposeApp = () => {
  return {
    async inited(event) {
      event.isInited = true
      socketEvent.new_socket_inited(event)
    },
    async getSetting(event) {
      return appState.appSetting
    },
    async setSetting(event, setting) {
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
      restartUpdate()
    },
  } satisfies Partial<ExposeClientFunctions>
}

// 暴露给后端的方法
export const createServerApp = () => {
  return {
    async settingChanged(keys, setting) {
      broadcast((socket) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.settingChanged(keys, setting)
      })
    },
    async deeplink(deeplink) {
      broadcast((socket) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.deeplink(deeplink)
      })
    },
    async createDesktopLyricProcess(action) {
      // TODO
      // broadcast((socket) => {
      //   if (socket.winType != 'main' || !socket.isInited) return
      //   socket.remoteQueuePlayer.playerAction(action)
      // })
    },
    async closeMessageBox(key) {
      broadcast((socket) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.closeMessageBox(key)
      })
    },
    async updateInfo(info) {
      broadcast((socket) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (socket.winType != 'main' || !socket.isInited) return
        void socket.remote.updateInfo(info)
      })
    },
  } satisfies Partial<ExposeServerFunctions>
}
