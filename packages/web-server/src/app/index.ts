import './shared/error'
import { appState, initAppEnv, sendInitedEvent } from '@/app/app'
import { initI18n } from './i18n'
import { startCommonWorkers, startExtensionServiceWorker } from './worker'
import { initModules } from './modules'
import { initRenderers } from './renderer'
import { appLog } from '@/shared/log4js'

// let isInited = false
// 初始化应用
export const initApp = async () => {
  console.log('init')
  await initAppEnv()
  initI18n()
  await startCommonWorkers(appState.dataPath)
  void startExtensionServiceWorker()
  await initModules()
  await initRenderers()

  sendInitedEvent()
  appLog.info('app initialized.')
}
