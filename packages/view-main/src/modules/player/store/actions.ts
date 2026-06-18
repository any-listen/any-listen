import { createPlayMusicInfoList } from '@any-listen/common/tools'

import { showMusicCommentModal } from '@/components/apis/musicCommentModal'

import * as commit from './commit'
import { playerEvent } from './event'
import { addPlayListMusic } from './listRemoteAction'
import { playerState } from './state'

export const initPlayList = (list: AnyListen.Player.PlayMusicInfo[]) => {
  commit.setPlayListMusic(list)
}

export {
  setPlayHistoryList as initPlayHistoryList,
  setDislikeIds,
  setIsLinkedList,
  setMaxPlayTime,
  setNowPlayTime,
  setPlayerPlaying,
  setPlayListId,
  setPlaybackRate as setStatePlaybackRate,
  setVolume as setStateVolume,
  setVolumeMute as setStateVolumeMute,
  setStatusText,
  updatePlayHistoryIndex,
  setMusicInfo,
  updatePlayIndex,
} from './commit'

export {
  addPlayListMusic,
  registerRemoteListAction,
  removePlayListMusic,
  setPlayListMusic,
  setPlayListMusicPlayed,
  setPlayListMusicUnplayed,
  setPlayListMusicUnplayedAll,
  updatePlayListMusic,
  updatePlayListMusicPos,
} from './listRemoteAction'

export {
  getMusicPicDelay,
  getPlayInfo,
  registerLocalPlayerAction,
  registerRemoteHistoryListAction,
  registerRemotePlayerAction,
} from './playerRemoteAction'

export {
  collectMusic,
  dislikeMusic,
  pause,
  play,
  playId,
  playIndex,
  playList,
  playOnlineList,
  release,
  seekTo,
  setCollectStatus,
  setLyricOffset,
  setMusicUrl,
  setPlaybackRate,
  setPlayMusicInfo,
  setVolume,
  setVolumeMute,
  skipNext,
  skipPrev,
  stop,
  togglePlay,
  uncollectMusic,
  checkCollectMusic,
} from './playerActions'

export const addPlayLaterMusic = async (
  musicInfos: AnyListen.Music.MusicInfo[],
  listId: string,
  source: AnyListen.Player.SourceType = 'local'
) => {
  const list = createPlayMusicInfoList({
    musicInfos,
    listId,
    source,
    playLater: true,
  })
  await addPlayListMusic({ musics: list, pos: playerState.playList.findIndex((m) => m.playLater) + 1 })
}

export const sendCreatedEvent = () => {
  playerEvent.created()
}

export {
  getHasMediaDevicePermission,
  getMediaDeviceIdSetting,
  saveMediaDeviceIdSetting,
  setHasMediaDevicePermission,
  getMediaDevices,
} from './mediaDevice'

export const showMusicComment = async () => {
  const musicInfo = playerState.playMusicInfo?.musicInfo
  if (!musicInfo) return
  await showMusicCommentModal(musicInfo, () => {
    return playerState.playMusicInfo?.musicInfo || null
  })
}
