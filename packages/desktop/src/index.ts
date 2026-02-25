import { isLinux } from '@any-listen/nodejs/index'
import { app } from 'electron'

import { appState, initAppEnv, sendInitedEvent } from '@/app'

import './shared/error'
import './shared/log'
// import registerModules from '@/modules'
import { initI18n } from './i18n'
import { initModules } from './modules'
import { initRenderers } from './renderer'
import { startCommonWorkers, startExtensionServiceWorker } from './worker'

let initedCount = 0
const handleInited = () => {
  initedCount++
  if (initedCount < 3) return
  sendInitedEvent()
}
// 初始化应用
const init = async () => {
  console.log('init')
  await initAppEnv()
  initI18n()
  await startCommonWorkers(appState.dataPath)
  void startExtensionServiceWorker()
  void initModules().finally(handleInited)
  await initRenderers()

  // registerModules()
  handleInited()
}

void app.whenReady().then(() => {
  // https://github.com/electron/electron/issues/16809
  if (isLinux) {
    setTimeout(() => {
      handleInited()
    }, 300)
  } else handleInited()
})

void init()
