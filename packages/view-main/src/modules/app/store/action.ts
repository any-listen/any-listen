import { getLocation, push } from '@/plugins/routes'

import { appEvent } from './event'
// import { parseUrlParams } from '@/shared'
// import * as commit from './commit'

// export const setInited = (init: boolean) => {
//   commit.setInited(init)
// }

// export const setLogin = (show: boolean) => {
//   commit.setLogin(show)
// }

export const sendConnected = () => {
  appEvent.connected()
}

export const sendDesconnected = () => {
  appEvent.desconnected()
}

export const sendConnectFailed = (message: string) => {
  appEvent.connectFailed(message)
}

export const sendRelease = () => {
  appEvent.release()
}

export const scrollListTo = (listId: string, isOnline: boolean, musicId: string) => {
  let path = isOnline ? '/list' : '/library'
  const loc = getLocation()
  if (path == loc.location && loc.query.id == listId) {
    appEvent.scrollListTo(listId, musicId)
  } else {
    void push(`${path}?id=${encodeURIComponent(listId)}&mid=${musicId}`)
  }
}

export {
  setFullScreen,
  setMachineId,
  setRootOffset,
  // setInited,
  // setShowLogin,
  setWorkerInitPromise,
} from './commit'

export { getLoginDevices, getMachineId, getSetting, removeLoginDevice, sendInitedEvent, setSetting } from '@/shared/ipc/app'
