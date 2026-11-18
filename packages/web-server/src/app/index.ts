import './shared/error'
import { appState, initAppEnv, sendInitedEvent } from '@/app/app'

import { initI18n } from './i18n'
import { initModules } from './modules'
import { initRenderers } from './renderer'
import { startCommonWorkers, startExtensionServiceWorker } from './worker'

// let isInited = false
// 初始化应用
export const initApp = async () => {
  await initAppEnv()
  initI18n()
  await startCommonWorkers(appState.dataPath)
  void startExtensionServiceWorker()
  await initModules()
  await initRenderers()

  sendInitedEvent()
}
