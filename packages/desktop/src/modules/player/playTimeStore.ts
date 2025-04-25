import path from 'node:path'
import { appState } from '@/app'
import AsyncFS from '@any-listen/nodejs/AsyncFS'
import { STORE_NAMES } from '@any-listen/common/constants'

let time = 0
let asyncFS: AsyncFS
let initState = 0

const init = async () => {
  if (initState != 0) return
  initState = 1
  asyncFS = new AsyncFS(path.join(appState.dataPath, STORE_NAMES.PLAY_TIME))
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
