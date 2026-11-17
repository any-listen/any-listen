import path from 'node:path'

import { STORE_NAMES } from '@any-listen/common/constants'
import AsyncFS from '@any-listen/nodejs/AsyncFS'

let time = 0
let asyncFS: AsyncFS
let initPromise: Promise<void> | null = null
let dataPath: string

export const initPlayTimeStore = (_dataPath: string) => {
  dataPath = _dataPath
}

const init = async () => {
  // 并发调用必须等同一个初始化完成：early-return 会让后来者拿到初始值 0
  initPromise ??= (async () => {
    if (!dataPath) throw new Error('Data path is not set')
    asyncFS = new AsyncFS(path.join(dataPath, STORE_NAMES.PLAY_TIME), { safeWrite: false })
    const data = await asyncFS.readFile()
    if (data) {
      time = parseInt(data.toString())
      if (Number.isNaN(time)) time = 0
    }
  })()
  await initPromise
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
