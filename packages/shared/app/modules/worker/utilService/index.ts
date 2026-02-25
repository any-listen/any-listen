import { exposeWorker } from '../utils/worker'
import * as common from './common'
import * as list from './list'
import * as music from './music'
import { setLogger } from './shared/logger'
import { setRemoveFile } from './shared/music'

void exposeWorker<{
  inited: () => void
  logger: AnyListen.Logger
  removeFile?: (filePath: string) => Promise<void>
}>({
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
  remote.inited()
})

export type workerUtilSeriveTypes = typeof common & typeof music & typeof list
