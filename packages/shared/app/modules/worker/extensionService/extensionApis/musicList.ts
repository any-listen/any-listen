import { cloneData } from '@any-listen/common/utils'

import { extensionState } from '../state'

export const createMusicList = (extension: AnyListen.Extension.Extension) => {
  const musicList = {
    async getAllUserLists() {
      const data = await extensionState.remoteFuncs.getAllUserLists()
      return cloneData(data)
    },
    async getListMusics(id: string) {
      const data = await extensionState.remoteFuncs.getListMusics(id)
      return cloneData(data)
    },
    async listAction(action: AnyListen.IPCList.ActionList) {
      await extensionState.remoteFuncs.musicListAction(cloneData(action))
    },
  } as const
  if (extension.grant.includes('music_list')) return musicList
  return {} as unknown as typeof musicList
}
