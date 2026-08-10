import { exposeWorker } from '../utils/worker'
import * as common from './common'
import * as list from './list'
import * as music from './music'
import { setLogger } from './shared/logger'
import { setRemoveFile } from './shared/music'
import { setGetSettings } from './shared/settings'

void exposeWorker<ExposedWorkerUtilService>({
  ...common,
  ...music,
  ...list,
}).then(({ remote }) => {
  if (import.meta.env.VITE_IS_DESKTOP) {
    setRemoveFile(async (filePath: string) => {
      await remote.removeFile!(filePath)
    })
  }
  setLogger(remote.logger)
  setGetSettings(remote.getSettings)
  remote.inited()
})

export type workerUtilSeriveTypes = typeof common & typeof music & typeof list

export interface ExposedWorkerUtilService {
  inited: () => void
  logger: AnyListen.Logger
  getSettings: <T extends keyof AnyListen.AppSetting>(key: T) => Promise<AnyListen.AppSetting[T]>
  removeFile?: (filePath: string) => Promise<void>
}
