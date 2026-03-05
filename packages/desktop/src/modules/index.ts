import { initDislikeList } from '@any-listen/app/modules/dislikeList'

// import { initMusicList } from './musicList'
import { workers } from '@/worker'

import { initAppMenu } from './appMenu'
import { initExtension } from './extension'
// import { initDielikeList } from './dislikeList'
import { initHotKey } from './hotKey'
import { initMusicList } from './musicList'
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
    initMusicList(),
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
