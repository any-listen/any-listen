import { buildMusicName } from '@any-listen/common/tools'

import { showSimpleConfirmModal } from '@/components/apis/dialog'
import { addInfo } from '@/modules/dislikeList/actions'
import { hasDislike } from '@/modules/dislikeList/store/actions'
import { getListMusics, removeListMusics } from '@/modules/musicLibrary/actions'
import { addPlayLaterMusic, playList, playOnlineList, skipNext } from '@/modules/player/store/actions'
import type { OnlineListMetaInfo } from '@/modules/player/store/playerActions'
import { playerState } from '@/modules/player/store/state'
import { settingState } from '@/modules/setting/store/state'
import { i18n } from '@/plugins/i18n'
import { clipboardWriteText, openDirInExplorer } from '@/shared/ipc/app'

export const playLocalListMusic = async (listId: string, musicInfo: AnyListen.Music.MusicInfo, isClianHistory?: boolean) => {
  const list = await getListMusics(listId)
  const idx = list.findIndex((m) => m.id == musicInfo.id)
  if (idx < 0) return
  void playList(listId, list, idx, isClianHistory)
}

export const playOnlineListMusic = async (
  listId: string,
  list: AnyListen.Music.MusicInfo[],
  musicInfo: AnyListen.Music.MusicInfo,
  source: AnyListen.Player.SourceType,
  metaInfo: OnlineListMetaInfo,
  isClianHistory?: boolean
) => {
  const idx = list.findIndex((m) => m.id == musicInfo.id)
  if (idx < 0) return
  void playOnlineList(listId, list, idx, source, metaInfo, isClianHistory)
}

export const playMusic = async (
  listId: string,
  list: AnyListen.Music.MusicInfo[],
  musicInfo: AnyListen.Music.MusicInfo,
  source: AnyListen.Player.SourceType,
  metaInfo?: OnlineListMetaInfo,
  isClianHistory?: boolean
) => {
  if (source === 'local') {
    await playLocalListMusic(listId, musicInfo, isClianHistory)
  } else {
    if (!metaInfo) throw new Error('miss metaInfo for online music')
    await playOnlineListMusic(listId, list, musicInfo, source, metaInfo, isClianHistory)
  }
}

let clickTime = 0
let clickInfo: AnyListen.Music.MusicInfo | null = null
export const musicClick = async (
  list: AnyListen.Music.MusicInfo[],
  listId: string,
  musicInfo: AnyListen.Music.MusicInfo,
  source: AnyListen.Player.SourceType,
  metaInfo: OnlineListMetaInfo
) => {
  if (window.performance.now() - clickTime > 400 || clickInfo !== musicInfo) {
    clickTime = window.performance.now()
    clickInfo = musicInfo
    return
  }
  clickTime = 0
  clickInfo = null

  void playMusic(listId, list, musicInfo, source, metaInfo)
}

export const playMusicLater = async (
  listId: string,
  musicInfo: AnyListen.Music.MusicInfo,
  selectedList: AnyListen.Music.MusicInfo[],
  source: AnyListen.Player.SourceType,
  removeAllSelect?: () => void
) => {
  if (selectedList.length) {
    await addPlayLaterMusic(selectedList, listId, source)
    removeAllSelect?.()
  } else {
    await addPlayLaterMusic([musicInfo], listId, source)
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
            confirmBtn: i18n.t('confirm_button_text_2'),
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
