// import { initDielikeList } from './dislikeList'
import { initDislikeList } from '@any-listen/app/modules/dislikeList'
import { initAppLog } from '@any-listen/app/modules/logs'
import { initProxyServer } from '@any-listen/app/modules/proxyServer'
import { API_PREFIX, PROXY_SERVER_PATH } from '@any-listen/common/constants'

import { appState } from '../app'
// import { initUserApi } from './userApi'
import { workers } from '../worker'
import { initExtension } from './extension'
import { initHotKey } from './hotKey'
import { initMusicList } from './musicList'
import { initPlayer } from './player'
import { initResources } from './resources'
import { initSync } from './sync'
// import { initMusicList } from './musicList'
import { initTheme } from './theme'

export const initModules = async () => {
  await Promise.all([
    initHotKey(),
    initPlayer(),
    initTheme(),
    initDislikeList(workers.dbService),
    initMusicList(),
    initExtension(),
    initResources(),
    initSync(),
    initProxyServer(
      import.meta.env.DEV ? 'http://localhost:9500' : '.',
      `${API_PREFIX}${PROXY_SERVER_PATH}`,
      appState.cacheDataPath
    ),
    initAppLog(appState.dataPath),
  ])
  // initMusicList()
  // initDielikeList()
  // initUserApi()
}
