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

export const sendWinMainIPCConnected = () => {
  appEvent.winMainIPCConnected()
}

export const sendWinMainIPCDisconnected = () => {
  appEvent.winMainIPCDisconnected()
}

// export {
//   setFullScreen,
//   setMachineId,
//   setRootOffset,
//   // setInited,
//   // setShowLogin,
//   setWorkerInitPromise,
// } from './commit'

export { sendInitedEvent } from '@/shared/ipc/app'
