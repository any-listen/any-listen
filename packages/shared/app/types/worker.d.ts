import type { workerDBSeriveTypes } from '../modules/worker/dbService'
import type { workerExtensionSeriveTypes } from '../modules/worker/extensionService'
import type { workerUtilSeriveTypes } from '../modules/worker/utilService'

declare global {
  // interface WorkerDBSeriveTypes {
  //   list: typeof list
  // }
  namespace AnyListen {
    type WorkerDBSeriveListTypes = workerDBSeriveTypes
    type WorkerUtilSeriveTypes = workerUtilSeriveTypes
    type WorkerExtensionSeriveTypes = workerExtensionSeriveTypes
  }
}
