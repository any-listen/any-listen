// import { appState } from '@/app'
import { STORE_NAMES } from '@any-listen/common/constants'

import { getStore } from '@/shared/store'
import { cloneData, throttle } from '@/shared/utils'

import defaultHotKey from './config/defaultHotKey'

/**
 * 获取快捷键设置
 */
export const getHotKeyConfig = async (): Promise<AnyListen.HotKey.HotKeyConfigAll> => {
  const storeHotKey = getStore(STORE_NAMES.HOTKEY)

  const version = storeHotKey.get<number>('version')
  let localConfig = storeHotKey.get<AnyListen.HotKey.HotKeyConfig>('local')
  let globalConfig = storeHotKey.get<AnyListen.HotKey.HotKeyConfig>('global')

  if (!globalConfig || version == null) {
    localConfig = cloneData(defaultHotKey.local)
    globalConfig = cloneData(defaultHotKey.global)

    storeHotKey.set('version', 1)
    storeHotKey.set('local', localConfig)
    storeHotKey.set('global', globalConfig)
  }

  return {
    local: localConfig!,
    global: globalConfig,
  }
}

type HotKeyType = 'local' | 'global'

const saveHotKeyConfigThrottle = throttle<[AnyListen.HotKey.HotKeyConfigAll]>((config: AnyListen.HotKey.HotKeyConfigAll) => {
  for (const key of Object.keys(config) as HotKeyType[]) {
    getStore(STORE_NAMES.HOTKEY).set(key, config[key])
  }
})
export const saveHotKeyConfig = (config: AnyListen.HotKey.HotKeyConfigAll) => {
  saveHotKeyConfigThrottle(config)
}
