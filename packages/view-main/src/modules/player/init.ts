import { onRelease } from '@/modules/app/shared'
import { appState } from '@/modules/app/store/state'
import { settingEvent } from '@/modules/setting/store/event'
import { createUnsubscriptionSet } from '@/shared'
import { initPlayer as initPlayerModules } from './init/index'
import {
  initPlayHistoryList,
  initPlayList,
  registerLocalPlayerAction,
  registerRemoteHistoryListAction,
  registerRemoteListAction,
  registerRemotePlayerAction,
  release,
  sendCreatedEvent,
  setCollectStatus,
  setPlayListId,
  setPlayMusicInfo,
} from './store/actions'
import { playerEvent } from './store/event'
import { getPlayInfo } from './store/playerRemoteAction'
import { playerState } from './store/state'

const init = async (isInited: boolean) => {
  initPlayerModules()
  sendCreatedEvent()
  const [{ info, list, listId, isOnline, historyList, isCollect }] = await Promise.all([
    getPlayInfo(),
    appState.workerInitPromiseMain,
  ])
  console.log(info)
  console.log(list, listId, historyList)
  initPlayList(list)
  setPlayListId(listId, isOnline)
  setCollectStatus(isCollect)
  initPlayHistoryList(historyList)
  const targetMusicInfo = list[info.index] as AnyListen.Player.PlayMusicInfo | undefined
  if (targetMusicInfo && (!isInited || !playerState.playing)) {
    setPlayMusicInfo(targetMusicInfo, null, info.historyIndex)
    playerEvent.setProgress(info.time, info.maxTime)
  }
}

let unregistereds = createUnsubscriptionSet()
export const initPlayer = () => {
  let isInit = false
  onRelease(() => {
    isInit &&= false
    unregistereds.clear()
    void release()
  })
  settingEvent.on('inited', () => {
    unregistereds.register((subscriptions) => {
      subscriptions.add(registerRemotePlayerAction())
      subscriptions.add(registerLocalPlayerAction())
      subscriptions.add(registerRemoteHistoryListAction())
      subscriptions.add(registerRemoteListAction())
    })
    void init(isInit)
    isInit ||= true
  })
}
