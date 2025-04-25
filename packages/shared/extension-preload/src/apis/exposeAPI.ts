import { hostContext } from '@/host/state'
import { translate } from '@/i18n'
import { app } from './app'
import { buffer } from './buffer'
import { configuration } from './configuration'
import { crypto } from './crypto'
import { env } from './env'
import { onEvent } from './event'
import { iconv } from './iconv'
import { logcat } from './logcat'
import { musicList } from './musicList'
import { player } from './player'
import { request } from './request'
import { registerResourceAction } from './resource'
import { storage } from './storage'

export const getAPI = () => {
  const extensionAPI: Partial<AnyListen_API.API> = {
    /** 环境相关 */
    env,
    /** 应用相关 */
    app,
    onEvent,
    logcat,
    storage,
    configuration,
    registerResourceAction,
    utils: {
      buffer,
      crypto,
      iconv,
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
        extensionAPI.musicList = musicList
        break
      case 'music_list':
        extensionAPI.player = player
        break

      // default:
      //   // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
      //   const neverValue: never = grant
    }
  }
  return extensionAPI as AnyListen_API.API
  // console.log('Preload finished.')
}
