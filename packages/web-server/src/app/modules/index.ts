// import { initDielikeList } from './dislikeList'
import { initDislikeList } from '@any-listen/app/modules/dislikeList'
import { initMusicList } from '@any-listen/app/modules/musicList'
import { initProxyServer } from '@any-listen/app/modules/proxyServer'
import { API_PREFIX, PROXY_SERVER_PATH, STORE_NAMES } from '@any-listen/common/constants'

import getStore from '@/app/shared/store'

import { appState } from '../app'
// import { initUserApi } from './userApi'
import { workers } from '../worker'
import { initExtension } from './extension'
import { initHotKey } from './hotKey'
import { initPlayer } from './player'
import { initResources } from './resources'
// import { initMusicList } from './musicList'
import { initTheme } from './theme'

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
    initExtension(),
    initResources(),
    initProxyServer(
      import.meta.env.DEV ? `http://localhost:9500${API_PREFIX}${PROXY_SERVER_PATH}` : `${API_PREFIX}${PROXY_SERVER_PATH}`,
      appState.cacheDataPath
    ),
  ])
  // initMusicList()
  // initDielikeList()
  // initUserApi()
}
