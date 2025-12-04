import {
  createDBServiceWorker,
  createExtensionServiceWorker,
  createUtilServiceWorker,
  type UtilServiceWorkerExposedFuncs,
} from './utils'

let dbService: ReturnType<typeof createDBServiceWorker>
let utilService: ReturnType<typeof createUtilServiceWorker>
let extensionService: ReturnType<typeof createExtensionServiceWorker> | null

export const workers = {
  get dbService() {
    return dbService
  },
  get utilService() {
    return utilService
  },
  get extensionService() {
    if (extensionService == null) throw new Error('Extension host not available')
    return extensionService.service
  },
  get extensionServiceWorker() {
    if (extensionService == null) throw new Error('Extension host not available')
    return extensionService.worker
  },
}

export const startDBServiceWorker = async (onWorkerInited: () => void) => {
  dbService = createDBServiceWorker(onWorkerInited)
}

export const startUtilServiceWorker = async (onWorkerInited: () => void, exposedFuncs: UtilServiceWorkerExposedFuncs) => {
  utilService = createUtilServiceWorker(onWorkerInited, exposedFuncs)
}

export const startExtensionServiceWorker = async (
  onWorkerInited: () => void,
  exposedFuncs: AnyListen.IPCExtension.MainIPCActions
) => {
  let oldService = extensionService
  extensionService = createExtensionServiceWorker(onWorkerInited, exposedFuncs)
  extensionService.worker.on('exit', () => {
    extensionService?.worker.removeAllListeners()
    extensionService = null
  })
  if (oldService) {
    oldService.worker.removeAllListeners()
    await oldService.worker.terminate().catch((err) => {
      console.error(err)
    })
  }
}
