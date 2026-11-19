import { app, dialog } from 'electron'

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
  await initI18n()
  await startCommonWorkers(appState.dataPath)
  void startExtensionServiceWorker()
  void initModules()
    .then(handleInited)
    .catch((err: Error) => {
      void app.whenReady().then(() => {
        dialog.showMessageBoxSync({
          type: 'error',
          title: 'Module Initialization Failed',
          message: 'An error occurred while initializing modules.',
          detail: err.message,
        })
        app.quit()
      })
    })
  await initRenderers()

  // registerModules()
  handleInited()
}

void app.whenReady().then(() => {
  // https://github.com/electron/electron/issues/16809
  if (import.meta.env.VITE_IS_LINUX) {
    setTimeout(() => {
      handleInited()
    }, 300)
  } else handleInited()
})

void init()
