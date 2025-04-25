import { showNotify } from '@/components/apis/notify'
import {
  addListMusics,
  removeUserList as removeUserListRemote,
  setFetchingListStatus,
} from '@/modules/musicLibrary/store/actions'
import { i18n } from '@/plugins/i18n'
import { showOpenDialog } from '@/shared/ipc/app'
import { createLocalMusicInfos } from '@/shared/ipc/music'
import { MEDIA_FILE_TYPES } from '@any-listen/common/constants'

const handleAddMusics = async (listId: string, filePaths: string[], index = -1) => {
  // console.log(index + 1, index + 201)
  const paths = filePaths.slice(index + 1, index + 201)
  const musicInfos = await createLocalMusicInfos(paths)
  let failedCount = paths.length - musicInfos.length
  if (musicInfos.length) await addListMusics(listId, musicInfos)
  index += 200
  if (filePaths.length - 1 > index) {
    failedCount += await handleAddMusics(listId, filePaths, index)
  }
  return failedCount
}
export const importLocalFile = async (listInfo: AnyListen.List.MyListInfo) => {
  const { canceled, filePaths } = await showOpenDialog({
    title: i18n.t('user_list__select_local_file'),
    properties: ['openFile', 'multiSelections'],
    filters: [
      // https://support.google.com/chromebook/answer/183093
      // 3gp, .avi, .mov, .m4v, .m4a, .mp3, .mkv, .ogm, .ogg, .oga, .webm, .wav
      { name: 'Media File', extensions: [...MEDIA_FILE_TYPES] },
    ],
  })
  if (canceled || !filePaths.length) return
  console.log(filePaths)
  setFetchingListStatus(listInfo.id, true)
  const failedCount = await handleAddMusics(listInfo.id, filePaths)
  setFetchingListStatus(listInfo.id, false)
  const all = filePaths.length
  let message =
    failedCount == 0
      ? i18n.t('user_list__add_local_file_successfull', { num: all })
      : failedCount != all
        ? i18n.t('user_list__add_local_file_success_part', { all, count: failedCount })
        : i18n.t('user_list__add_local_file_failed', { num: all })
  showNotify(message)
}

export const removeUserList = async (id: string) => {
  await removeUserListRemote([id])
}
