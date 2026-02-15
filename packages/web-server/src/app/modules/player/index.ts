import { appEvent, appState } from '@/app/app'
import { workers } from '@/app/worker'
import { musicListEvent, sendMusicListAction } from '@any-listen/app/modules/musicList'
import {
  getPlayInfo as getPlayInfoRaw,
  getPlayMusicInfo,
  initPlayer as initPlayerModule,
  playerEvent,
  setPlayInfo,
  setPlayMusic,
  setPlayMusicInfo,
  setPlayTime,
} from '@any-listen/app/modules/player'
import { LIST_IDS } from '@any-listen/common/constants'

const registerProgressSave = () => {
  const handler = async (progress: AnyListen.IPCPlayer.Progress) => {
    void setPlayTime(progress.nowPlayTime)
  }
  playerEvent.on('progress', handler)

  return () => {
    playerEvent.off('progress', handler)
  }
}

const updateLatestPlayList = async (info: AnyListen.Player.PlayMusicInfo) => {
  if (info.listId == LIST_IDS.LAST_PLAYED) return
  const list = await workers.dbService.getListMusics(LIST_IDS.LAST_PLAYED)
  const mId = info.musicInfo.id
  const addType = appState.appSetting['list.addMusicLocationType']
  if (list.some((m) => m.id == mId)) {
    if (list[addType == 'top' ? 0 : list.length - 1].id != mId) {
      await sendMusicListAction({
        action: 'list_music_update_position',
        data: {
          listId: LIST_IDS.LAST_PLAYED,
          position: addType == 'top' ? 0 : list.length - 1,
          ids: [mId],
        },
      })
    }
  } else {
    // @ts-expect-error
    const newInfo: AnyListen.Music.MusicInfo = {
      ...info.musicInfo,
      meta: {
        ...info.musicInfo.meta,
        createTime: Date.now(),
      },
    }
    await sendMusicListAction({
      action: 'list_music_add',
      data: {
        id: LIST_IDS.LAST_PLAYED,
        addMusicLocationType: addType,
        musicInfos: [newInfo],
      },
    })
    if (list.length + 1 > 1000) {
      await sendMusicListAction({
        action: 'list_music_remove',
        data: {
          listId: LIST_IDS.LAST_PLAYED,
          ids: [list[addType == 'top' ? list.length - 1 : 0].id],
        },
      })
    }
  }
}

const checkCollect = async (minfo: AnyListen.Player.PlayMusicInfo) => {
  return minfo.listId == LIST_IDS.LOVE ? true : workers.dbService.checkListExistMusic(LIST_IDS.LOVE, minfo.musicInfo.id)
}
export const initPlayer = async () => {
  initPlayerModule(workers.dbService, appState.dataPath)
  let prevCollectStatus = false
  playerEvent.on('musicChanged', async (index, historyIndex, lastTrackId) => {
    void setPlayMusic(index, historyIndex, lastTrackId)
    const prevMusic = getPlayMusicInfo()
    const targetMusic = await getPlayerMusic()
    setPlayMusicInfo(targetMusic)
    if (targetMusic) {
      void updateLatestPlayList(targetMusic)
      void checkCollect(targetMusic).then((isCollect) => {
        prevCollectStatus = isCollect
        playerEvent.collectStatus(isCollect)
      })
      // TODO play count
      // let mInfo = getMusicInfo(targetMusic.musicInfo)
      // workers.dbService.playCountAdd({ name: mInfo.name, singer: mInfo.singer })
      // await musicListEvent.list_update_play_count(targetMusic.listId, targetMusic.musicInfo.name, targetMusic.musicInfo.singer)
      // workers.dbService.updateMetadataPlayCount()
    }
    if (prevMusic?.playLater) {
      void playerEvent.playListAction({ action: 'remove', data: [prevMusic.itemId] })
    }
  })
  playerEvent.on('playInfoUpdated', (info) => {
    void setPlayInfo(info.duration, info.index, info.lastTrackId)
  })
  let unregistered: (() => void) | null = null
  if (appState.appSetting['player.isSavePlayTime']) unregistered = registerProgressSave()
  appEvent.on('updated_config', (config, setting) => {
    if (config.includes('player.isSavePlayTime')) {
      if (setting['player.isSavePlayTime']!) {
        if (unregistered) return
        unregistered = registerProgressSave()
      } else {
        if (!unregistered) return
        unregistered()
        unregistered = null
      }
    }
    if (config.includes('player.togglePlayMethod')) {
      void workers.dbService.getPlayList().then((playList) => {
        if (playList.some((m) => m.played)) {
          void playerEvent.playListAction({ action: 'unplayedAll' })
        }
      })
      void workers.dbService.queryMetadataPlayHistoryList().then((historyList) => {
        if (!historyList.length) return
        void playerEvent.playHistoryListAction({ action: 'setList', data: [] })
      })
    }
  })

  playerEvent.on('playListAction', async (action) => {
    if (action.action == 'set') {
      if (!action.data.isSync) {
        const historyList = await workers.dbService.queryMetadataPlayHistoryList()
        if (!historyList.length) return
        void playerEvent.playHistoryListAction({ action: 'setList', data: [] })
      }
    } else if (action.action == 'remove') {
      const ids = action.data
      const historyList = await workers.dbService.queryMetadataPlayHistoryList()
      if (!historyList.length) return
      const idxs: number[] = []
      historyList.forEach((item, idx) => {
        if (ids.includes(item.id)) idxs.push(idx)
      })
      if (idxs.length) void playerEvent.playHistoryListAction({ action: 'removeIdx', data: idxs })
    }
  })

  musicListEvent.on('list_music_changed', async (ids) => {
    if (!ids.includes(LIST_IDS.LOVE)) return
    void getPlayerMusic().then(async (music) => {
      if (!music) return
      const isCollect = await checkCollect(music)
      if (isCollect == prevCollectStatus) return
      prevCollectStatus = isCollect
      playerEvent.collectStatus(isCollect)
    })
  })

  appEvent.on('inited', () => {
    void getPlayerMusic().then((music) => {
      if (music) {
        void checkCollect(music).then((isCollect) => {
          playerEvent.collectStatus(isCollect)
        })
      }
    })
  })
}

// export const updatePlayCount = (name?: string, singer?: string, count?: number) => {
//   if (name) workers.dbService.playCountAdd({ name, singer: singer! })
//   workers.dbService.updateMetadataPlayCount(count)
// }

export const getPlayInfo = async (): Promise<AnyListen.IPCPlayer.PlayInfo> => {
  const playInfo = await getPlayInfoRaw()
  const [[list, isCollect], { listId, isOnline }, historyList] = await Promise.all([
    workers.dbService.getPlayList().then(async (list) => {
      const minfo = list[playInfo.index]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!minfo) return [list, false] as const
      return [list, await checkCollect(minfo)] as const
    }),
    workers.dbService.queryMetadataPlayListInfo(),
    workers.dbService.queryMetadataPlayHistoryList(),
  ])
  return {
    info: playInfo,
    list,
    listId,
    isOnline,
    historyList,
    isCollect,
  }
}

export const getPlayerMusic = async (): Promise<AnyListen.Player.PlayMusicInfo | null> => {
  const playInfo = await getPlayInfoRaw()
  const list = await workers.dbService.getPlayList()
  return list[playInfo.index] ?? null
}

export { playerEvent }
