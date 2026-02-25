import { buildMusicName } from '@any-listen/common/tools'

import { showSimpleConfirmModal } from '@/components/apis/dialog'
import { addInfo } from '@/modules/dislikeList/actions'
import { hasDislike } from '@/modules/dislikeList/store/actions'
import { getListMusics, removeListMusics } from '@/modules/musicLibrary/actions'
import { addPlayLaterMusic, playList, skipNext } from '@/modules/player/store/actions'
import { playerState } from '@/modules/player/store/state'
import { settingState } from '@/modules/setting/store/state'
import { i18n } from '@/plugins/i18n'
import { clipboardWriteText, openDirInExplorer } from '@/shared/ipc/app'

export const playMusic = async (listId: string, musicInfo: AnyListen.Music.MusicInfo, isClianHistory?: boolean) => {
  const list = await getListMusics(listId)
  const idx = list.findIndex((m) => m.id == musicInfo.id)
  if (idx < 0) return
  void playList(listId, list, idx, isClianHistory)
}

let clickTime = 0
let clickInfo: AnyListen.Music.MusicInfo | null = null
export const musicClick = async (listId: string, musicInfo: AnyListen.Music.MusicInfo) => {
  if (window.performance.now() - clickTime > 400 || clickInfo !== musicInfo) {
    clickTime = window.performance.now()
    clickInfo = musicInfo
    return
  }
  clickTime = 0
  clickInfo = null
  await playMusic(listId, musicInfo)
}

export const playMusicLater = async (
  listId: string,
  musicInfo: AnyListen.Music.MusicInfo,
  selectedList: AnyListen.Music.MusicInfo[],
  removeAllSelect?: () => void
) => {
  if (selectedList.length) {
    await addPlayLaterMusic(selectedList, listId)
    removeAllSelect?.()
  } else {
    await addPlayLaterMusic([musicInfo], listId)
  }
}

export const copyName = (musicInfo: AnyListen.Music.MusicInfo) => {
  void clipboardWriteText(buildMusicName(settingState.setting['download.fileName'], musicInfo.name, musicInfo.singer))
}

export const locateMusic = (musicInfo: AnyListen.Music.MusicInfoLocal) => {
  void openDirInExplorer(musicInfo.meta.filePath)
}

export const dislikeMusic = async (musicInfo: AnyListen.Music.MusicInfo) => {
  const confirm = await showSimpleConfirmModal(
    musicInfo.singer
      ? i18n.t('music_list__dislike_music_singer_tip', { name: musicInfo.name, singer: musicInfo.singer })
      : i18n.t('music_list__dislike_music_tip', { name: musicInfo.name }),
    {
      cancelBtn: i18n.t('cancel_button_text_2'),
      confirmBtn: i18n.t('confirm_button_text'),
    }
  )
  if (!confirm) return
  await addInfo([{ name: musicInfo.name, singer: musicInfo.singer }])
  if (playerState.playMusicInfo && hasDislike(playerState.playMusicInfo.musicInfo)) {
    void skipNext()
  }
}

export const removeMusic = async (
  listId: string,
  musicInfo: AnyListen.Music.MusicInfo,
  selectedList: AnyListen.Music.MusicInfo[],
  removeAllSelect?: () => void
) => {
  if (selectedList.length) {
    const confirm =
      selectedList.length > 1
        ? await showSimpleConfirmModal(i18n.t('music_list__remove_music_tip', { len: selectedList.length }), {
            confirmBtn: i18n.t('music_list__remove_tip_confirm_btn'),
          })
        : true
    if (!confirm) return
    await removeListMusics(
      listId,
      selectedList.map((m) => m.id)
    )
    removeAllSelect?.()
  } else {
    await removeListMusics(listId, [musicInfo.id])
  }
}
