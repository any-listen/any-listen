import { hostContext } from '@/host/state'
import { translate } from '@/i18n'

import { app } from './app'
import { command } from './command'
import { configuration } from './configuration'
import { constants } from './constants'
import { crypto } from './crypto'
import { dataConverter } from './dataConverter'
import { env } from './env'
import { iconv } from './iconv'
import { createIsolateContext } from './isolateContext'
import { logcat } from './logcat'
// import { musicList } from './musicList'
import { musicUtils } from './musicUtils'
// import { player } from './player'
import { request } from './request'
import { registerResourceAction } from './resource'
import { storage } from './storage'
import { zlib } from './zlib'

export const getAPI = () => {
  const extensionAPI: AnyListen_API.API = {
    /** 环境相关 */
    env,
    /** 应用相关 */
    app,
    logcat,
    storage,
    configuration,
    musicUtils,
    registerResourceAction,
    command,
    constants,
    utils: {
      dataConverter,
      crypto,
      iconv,
      zlib,
    },
    t(key, data) {
      return translate(key, data)
    },
  }

  for (const grant of hostContext.extension.grant) {
    switch (grant) {
      case 'internet':
        extensionAPI.request = request
        break
      case 'player':
        // TODO
        // extensionAPI.musicList = musicList
        break
      case 'music_list':
        // TODO
        // extensionAPI.player = player
        break
      case 'isolate_context':
        extensionAPI.utils!.createIsolateContext = createIsolateContext
        break
    }
  }
  return extensionAPI as AnyListen_API.API
  // console.log('Preload finished.')
}
