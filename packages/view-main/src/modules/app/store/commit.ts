import { fullscreenWindow } from '@/shared/ipc/app'

import { appEvent } from './event'
import { appState } from './state'

// export const setInited = (init: boolean) => {
//   appState.inited = init
//   appEvent.inited()
// }

// export const setShowLogin = (show: boolean) => {
//   appState.showLogin = show
//   appEvent.showLogin()
// }

export const setMachineId = (machineId: string) => {
  appState.machineId = machineId
}

export const setRootOffset = (x: number, y: number) => {
  appState.rootOffsetX = x
  appState.rootOffsetY = y
}
export const setFullScreen = (isFullscreen: boolean) => {
  if (appState.isFullscreen == isFullscreen) return
  appState.isFullscreen = isFullscreen
  if (import.meta.env.VITE_IS_DESKTOP) {
    const offset = window.dt || isFullscreen ? 0 : 8
    setRootOffset(offset, offset)
    void fullscreenWindow(isFullscreen)
  }
  appEvent.fullscreen(isFullscreen)
}

export const setWorkerInitPromise = (pMain: Promise<void>) => {
  appState.workerInitPromiseMain = pMain
}
