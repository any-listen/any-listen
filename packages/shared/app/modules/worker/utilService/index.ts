import { exposeWorker } from '../utils/worker'

import * as common from './common'
import * as list from './list'
import * as music from './music'
import { setLogger } from './shared/logger'

void exposeWorker<{
  inited: () => void
  logger: AnyListen.Logger
}>({
  ...common,
  ...music,
  ...list,
}).then(({ remote }) => {
  setLogger(remote.logger)
  remote.inited()
})

export type workerUtilSeriveTypes = typeof common & typeof music & typeof list
