import path from 'node:path'

import { STORE_NAMES } from '@any-listen/common/constants'
import AsyncFS from '@any-listen/nodejs/AsyncFS'

let time = 0
let asyncFS: AsyncFS
let initState = 0
let dataPath: string

export const initPlayTimeStore = (_dataPath: string) => {
  dataPath = _dataPath
}

const init = async () => {
  if (initState != 0) return
  initState = 1
  if (!dataPath) throw new Error('Data path is not set')
  asyncFS = new AsyncFS(path.join(dataPath, STORE_NAMES.PLAY_TIME), { safeWrite: false })
  const data = await asyncFS.readFile()
  if (data) {
    time = parseInt(data.toString())
    if (Number.isNaN(time)) time = 0
  }
  // eslint-disable-next-line require-atomic-updates
  initState = 2
}

export const getPlayTime = async () => {
  await init()
  return time
}

export const savePlayTime = async (_time: number) => {
  await init()
  time = _time
  if (initState == 1) return
  asyncFS.writeFile(time.toString())
}
