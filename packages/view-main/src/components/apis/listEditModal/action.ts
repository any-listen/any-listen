import { MEDIA_FILE_TYPES } from '@any-listen/common/constants'

import { i18n } from '@/plugins/i18n'
import { showOpenDialog } from '@/shared/ipc/app'

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
