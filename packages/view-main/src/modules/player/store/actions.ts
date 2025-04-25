import { createPlayMusicInfoList } from '@any-listen/common/tools'
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
} from './playerActions'

export const addPlayLaterMusic = async (musicInfos: AnyListen.Music.MusicInfo[], listId: string, isOnline = false) => {
  const list = createPlayMusicInfoList({
    musicInfos,
    listId,
    isOnline,
    playLater: true,
  })
  await addPlayListMusic({ musics: list, pos: playerState.playList.findIndex((m) => m.playLater) + 1 })
}

export const sendCreatedEvent = () => {
  playerEvent.created()
}
