import { LIST_IDS, MEDIA_FILE_TYPES } from '@any-listen/common/constants'

import { createUserList as createUserListRemote, getSubUserLists, updateUserList } from '@/modules/musicLibrary/store/actions'
import { musicLibraryState } from '@/modules/musicLibrary/store/state'
import { i18n } from '@/plugins/i18n'
import { showOpenDialog } from '@/shared/ipc/app'

export const createUserList = async (listInfo: AnyListen.List.UserListInfo) => {
  const lists = getSubUserLists(null)
  let position: number
  if (listInfo.id) {
    if (listInfo.id == LIST_IDS.LOVE || listInfo.id == LIST_IDS.DEFAULT) {
      position = 0
    } else {
      position = lists.findIndex((l) => l.id == listInfo.id)
      if (position != -1) position += 1
    }
  } else {
    position = musicLibraryState.userLists.length
  }
  await createUserListRemote(position, listInfo)
}

export const editUserList = async (listInfo: AnyListen.List.UserListInfo) => {
  await updateUserList(listInfo)
}

export const selectLocalFolder = async () => {
  const { canceled, filePaths } = await showOpenDialog({
    title: i18n.t('user_list__select_local_file_folder'),
    properties: ['openDirectory'],
    filters: [
      // https://support.google.com/chromebook/answer/183093
      // 3gp, .avi, .mov, .m4v, .m4a, .mp3, .mkv, .ogm, .ogg, .oga, .webm, .wav
      { name: 'Media File', extensions: [...MEDIA_FILE_TYPES] },
    ],
  })
  if (canceled || !filePaths.length) return
  return filePaths[0]
}
