import getStore from '@/shared/store'
import { throttle } from '@/shared/utils'
import { STORE_NAMES } from '@any-listen/common/constants'
import defaultHotKey from './config/defaultHotKey'
// import { appState } from '@/app'
import type { HOTKEY_Type } from '@any-listen/common/hotKey'

/**
 * 获取快捷键设置
 */
export const getHotKeyConfig = async () => {
  const storeHotKey = getStore(STORE_NAMES.HOTKEY)

  let localConfig = storeHotKey.get<AnyListen.HotKey.HotKeyConfig<HOTKEY_Type>>('local')
  let globalConfig = storeHotKey.get<AnyListen.HotKey.HotKeyConfig<HOTKEY_Type>>('global')

  if (!globalConfig) {
    localConfig = JSON.parse(JSON.stringify(defaultHotKey.local)) as AnyListen.HotKey.HotKeyConfig<HOTKEY_Type>
    globalConfig = JSON.parse(JSON.stringify(defaultHotKey.global)) as AnyListen.HotKey.HotKeyConfig<HOTKEY_Type>

    storeHotKey.set('local', localConfig)
    storeHotKey.set('global', globalConfig)
  }

  return {
    local: localConfig!,
    global: globalConfig,
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
