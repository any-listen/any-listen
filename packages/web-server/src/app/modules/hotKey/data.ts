import getStore from '@/app/shared/store'
import { throttle } from '@/app/shared/utils'
import { STORE_NAMES } from '@any-listen/common/constants'
import defaultHotKey from './config/defaultHotKey'
// import { appState } from '@/app'
import type { HOTKEY_Type } from '@any-listen/common/hotKey'

/**
 * 获取快捷键设置
 */
export const getHotKeyConfig = async () => {
  const store_hotKey = getStore(STORE_NAMES.HOTKEY)

  let localConfig = store_hotKey.get<AnyListen.HotKey.HotKeyConfig<HOTKEY_Type>>('local')
  let globalConfig = store_hotKey.get<AnyListen.HotKey.HotKeyConfig<HOTKEY_Type>>('global')

  if (globalConfig) {
    // 移除v2.2.0及之前设置的全局媒体快捷键注册
    if (globalConfig.keys.MediaPlayPause) {
      delete globalConfig.keys.MediaPlayPause
      delete globalConfig.keys.MediaNextTrack
      delete globalConfig.keys.MediaPreviousTrack
      store_hotKey.set('global', globalConfig)
    }
  } else {
    localConfig = JSON.parse(JSON.stringify(defaultHotKey.local))
    globalConfig = JSON.parse(JSON.stringify(defaultHotKey.global))

    store_hotKey.set('local', localConfig)
    store_hotKey.set('global', globalConfig)
  }

  return {
    local: localConfig!,
    global: globalConfig!,
  }
}

type HotKeyType = 'local' | 'global'

const saveHotKeyConfigThrottle = throttle<[AnyListen.HotKey.HotKeyConfigAll<HOTKEY_Type>]>(
  (config: AnyListen.HotKey.HotKeyConfigAll<HOTKEY_Type>) => {
    for (const key of Object.keys(config) as HotKeyType[]) {
      getStore(STORE_NAMES.HOTKEY).set(key, config[key])
    }
  }
)
export const saveHotKeyConfig = (config: AnyListen.HotKey.HotKeyConfigAll<HOTKEY_Type>) => {
  saveHotKeyConfigThrottle(config)
}
