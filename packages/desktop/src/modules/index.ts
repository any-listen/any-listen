import { initDislikeList } from '@any-listen/app/modules/dislikeList'
import { initMusicList } from '@any-listen/app/modules/musicList'
import { STORE_NAMES } from '@any-listen/common/constants'

import getStore from '@/shared/store'
// import { initMusicList } from './musicList'
import { workers } from '@/worker'

import { initAppMenu } from './appMenu'
import { initExtension } from './extension'
// import { initDielikeList } from './dislikeList'
import { initHotKey } from './hotKey'
// import { initUserApi } from './userApi'
import { initPlayer } from './player'
import { initProxyServer } from './proxyServer'
import { initResources } from './resources'
import { initTheme } from './theme'
import { initTray } from './tray'

export const initModules = async () => {
  await Promise.all([
    initHotKey(),
    initPlayer(),
    initTheme(),
    initDislikeList(workers.dbService),
    initMusicList(
      workers.dbService,
      async () => {
        return getStore(STORE_NAMES.LIST_SCROLL_POSITION).getAll()
      },
      async (info) => {
        getStore(STORE_NAMES.LIST_SCROLL_POSITION).override(info)
      }
    ),
    initAppMenu(),
    initTray(),
    initExtension(),
    initResources(),
    initProxyServer(),
  ])
  // initMusicList()
  // initDielikeList()
  // initUserApi()
}
