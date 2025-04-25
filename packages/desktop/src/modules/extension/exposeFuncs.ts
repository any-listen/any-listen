import { extensionEvent } from '@/modules/extension'
import { getPlayInfo, playerEvent } from '../player'
import { getAllUserLists, getListMusics, sendMusicListAction } from '@any-listen/app/modules/musicList'
import { boxTools } from './clientTools'
import { rendererIPC } from '@/renderer/winMain/rendererEvent'

/**
 * 暴露给扩展进程调用的方法
 */
export const exposedFuncs: AnyListen.IPCExtension.MainIPCActions = {
  async onExtensionEvent(action) {
    extensionEvent.extensionEvent(action)
  },

  async getPlayInfo() {
    return getPlayInfo()
  },
  async playerAction(action) {
    playerEvent.playerAction(action)
  },
  async playListAction(action) {
    await playerEvent.playListAction(action)
  },
  async playHistoryListAction(action) {
    await playerEvent.playHistoryListAction(action)
  },

  async getAllUserLists() {
    return getAllUserLists()
  },
  async getListMusics(listId) {
    return getListMusics(listId)
  },
  async musicListAction(action) {
    await sendMusicListAction(action)
  },

  async showMessageBox(extId, key, options) {
    return boxTools.showBox(key, async () => {
      return rendererIPC.showMessageBox(extId, key, options)
    })
  },
  async showInputBox(extId, key, options) {
    return boxTools.showBox(key, async () => {
      return rendererIPC.showInputBox(extId, key, options)
    })
  },
  async showOpenBox(extId, key, options) {
    return boxTools.showBox(key, async () => {
      return rendererIPC.showOpenBox(extId, key, options)
    })
  },
  async showSaveBox(extId, key, options) {
    return boxTools.showBox(key, async () => {
      return rendererIPC.showSaveBox(extId, key, options)
    })
  },
  async closeMessageBox(key) {
    boxTools.closeBox(key)
  },
} as const

export type ExposedFuncs = typeof exposedFuncs
