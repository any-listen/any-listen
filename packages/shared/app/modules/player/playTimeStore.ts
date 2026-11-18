import path from 'node:path'

import { STORE_NAMES } from '@any-listen/common/constants'
import AsyncFS from '@any-listen/nodejs/AsyncFS'

let time = 0
let asyncFS: AsyncFS
let inited = false
let initPromise: Promise<void> | null = null
let dataPath: string

export const initPlayTimeStore = (_dataPath: string) => {
  dataPath = _dataPath
}

const handleInit = async () => {
  if (!dataPath) throw new Error('Data path is not set')
  asyncFS = new AsyncFS(path.join(dataPath, STORE_NAMES.PLAY_TIME), { safeWrite: false })
  const data = await asyncFS.readFile()
  if (data) {
    time = parseInt(data.toString())
    if (Number.isNaN(time)) time = 0
  }
}
const init = async () => {
  if (inited) return
  if (initPromise) return initPromise
  initPromise = handleInit()
    .then(() => {
      inited = true
    })
    .finally(() => {
      initPromise = null
    })
  return initPromise
}

export const getPlayTime = async () => {
  await init()
  return time
}

export const savePlayTime = async (_time: number) => {
  await init()
  time = _time
  asyncFS.writeFile(time.toString())
}
