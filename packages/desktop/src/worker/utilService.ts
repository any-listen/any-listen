import { startUtilServiceWorker as _startUtilServiceWorker } from '@any-listen/app/modules/worker'

// const registerExtensionServiceEvent = () => {
//   workers.extensionServiceWorker.on('messageerror', (err) => {
//     console.error('extensionServiceWorker messageerror: ', err)
//   })
//   workers.extensionServiceWorker.on('error', (err: Error) => {
//     console.error('extensionServiceWorker error: ', err)
//     extensionEvent.extensionEvent({ action: 'crash', data: err.stack ?? err.message })
//   })
//   workers.extensionServiceWorker.on('exit', (exitCode) => {
//     console.error('extensionServiceWorker exit code: ', exitCode)
//   })
// }

export const startUtilServiceWorker = async () =>
  new Promise<void>((resolve, reject) => {
    void _startUtilServiceWorker(resolve).catch(reject)
  })
