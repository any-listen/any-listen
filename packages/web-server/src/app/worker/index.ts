import { workers } from '@any-listen/app/modules/worker'

import { exposedFuncs } from '@/app/modules/extension/exposeFuncs'

import { startDBServiceWorker } from './dbService'
import { startExtensionServiceWorker as _startExtensionServiceWorker } from './extenstion'
import { startUtilServiceWorker } from './utilService'

export const startCommonWorkers = async (dataPath: string) => {
  return Promise.all([startDBServiceWorker(dataPath), startUtilServiceWorker()])
}

export const startExtensionServiceWorker = async () => {
  await _startExtensionServiceWorker(exposedFuncs)
}

export { startDBServiceWorker, startUtilServiceWorker, workers }
