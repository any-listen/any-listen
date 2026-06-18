import { onRelease } from '@/modules/app/shared'
import { appState } from '@/modules/app/store/state'
import { settingEvent } from '@/modules/setting/store/event'
import { settingState } from '@/modules/setting/store/state'
import { createUnsubscriptionSet } from '@/shared'

import { appEvent } from '../app/store/event'
import { initPlayer as initPlayerModules } from './init/index'
import {
  initPlayHistoryList,
  initPlayInfo,
  initPlayList,
  registerLocalPlayerAction,
  registerRemoteHistoryListAction,
  registerRemoteListAction,
  registerRemotePlayerAction,
  release,
  sendCreatedEvent,
  setCollectStatus,
  setInited,
  setPlayMusicInfo,
  showMusicComment,
} from './store/actions'
import { playerEvent } from './store/event'
import { getPlayInfo } from './store/playerRemoteAction'
import { playerState } from './store/state'

const init = async (isInited: boolean) => {
  setInited(false)
  initPlayerModules()
  sendCreatedEvent()
  const [{ info, list, listId, source, historyList, isCollect }] = await Promise.all([
    getPlayInfo(),
    appState.workerInitPromiseMain,
  ])
  console.log(info)
  console.log(list, listId, historyList)
  initPlayList(list)
  initPlayInfo({
    duration: info.maxTime,
    historyIndex: info.historyIndex,
    index: info.index,
    lastTrackId: info.lastTrackId,
    isLinkedList: info.isLinkedList,
    listId,
    source,
  })
  // setPlayListId(listId, source)
  setCollectStatus(isCollect)
  initPlayHistoryList(historyList)
  const targetMusicInfo = list[info.index] as AnyListen.Player.PlayMusicInfo | undefined
  if (targetMusicInfo && (!isInited || !playerState.playing)) {
    setPlayMusicInfo(targetMusicInfo, null, info.historyIndex)
    if (settingState.setting['player.isSavePlayTime']) {
      playerEvent.setProgress(info.time, info.maxTime)
    }
  }
  setInited(true)
}

let unregistereds = createUnsubscriptionSet()
export const initPlayer = () => {
  let isInit = false
  onRelease(() => {
    isInit &&= false
    setInited(false)
    unregistereds.clear()
    void release()
  })
  settingEvent.on('inited', () => {
    unregistereds.register((subscriptions) => {
      subscriptions.add(registerRemotePlayerAction())
      subscriptions.add(registerLocalPlayerAction())
      subscriptions.add(registerRemoteHistoryListAction())
      subscriptions.add(registerRemoteListAction())
      subscriptions.add(
        appEvent.on('executeCommand', (command) => {
          if (command === 'showMusicComment') void showMusicComment()
        })
      )
    })
    void init(isInit)
    isInit ||= true
  })
}
