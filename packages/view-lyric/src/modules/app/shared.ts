import { appEvent } from './store/event'

export const onConnected = (handler: () => void) => {
  return appEvent.on('connected', handler)
}

export const onDesconnected = (handler: () => void) => {
  return appEvent.on('desconnected', handler)
}

export const onConnectFailed = (handler: (message: string) => void) => {
  return appEvent.on('connectFailed', handler)
}

export const onWinMainIPCConnected = (handler: () => void) => {
  return appEvent.on('winMainIPCConnected', handler)
}
export const onWinMainIPCDisconnected = (handler: () => void) => {
  return appEvent.on('winMainIPCDisconnected', handler)
}

// export const onRelease = (handler: () => void) => {
//   return appEvent.on('release', handler)
// }

export const onFocus = (handler: () => void) => {
  return appEvent.on('focus', handler)
}

export const onBlur = (handler: () => void) => {
  return appEvent.on('blur', handler)
}

// export const onLogoutOnec = (handler: () => void) => {
//   const unsubscribe = () => {
//     if (unsub) {
//       unsub()
//       unsub = null
//     }
//   }
//   let unsub: (() => void) | null = appEvent.on('logout', () => {
//     unsubscribe()
//     handler()
//   })
//   return unsubscribe
// }
