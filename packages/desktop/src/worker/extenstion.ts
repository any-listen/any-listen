import { startExtensionServiceWorker as _startExtensionServiceWorker, workers } from '@any-listen/app/modules/worker'
import { extensionEvent, extensionState } from '@/modules/extension'

const registerExtensionServiceEvent = () => {
  workers.extensionServiceWorker.on('messageerror', (err) => {
    console.error('extensionServiceWorker messageerror: ', err)
  })
  workers.extensionServiceWorker.on('error', (err: Error) => {
    console.error('extensionServiceWorker error: ', err)
    extensionEvent.extensionEvent({ action: 'crash', data: err.stack ?? err.message })
  })
  workers.extensionServiceWorker.on('exit', (exitCode) => {
    console.error('extensionServiceWorker exit code: ', exitCode)
  })
}

export const startExtensionServiceWorker = async (exposedFuncs: AnyListen.IPCExtension.MainIPCActions) =>
  new Promise<void>((resolve, reject) => {
    extensionState.crashMessage = null
    void _startExtensionServiceWorker(resolve, exposedFuncs).then(registerExtensionServiceEvent).catch(reject)
  })
