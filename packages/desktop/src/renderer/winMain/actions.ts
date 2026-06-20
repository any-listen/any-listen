import { IPC_CHANNEL_NAMES } from '@any-listen/common/constants'

import { getWebContents } from './main'
import { rendererIPC } from './rendererEvent'

export { hideWindow, showWindow } from './main'

export const play = async () => {
  await rendererIPC.playerAction({ action: 'play' })
}

export const pause = async () => {
  await rendererIPC.playerAction({ action: 'pause' })
}

export const next = async () => {
  await rendererIPC.playerAction({ action: 'next' })
}

export const prev = async () => {
  await rendererIPC.playerAction({ action: 'prev' })
}

export const toggle = async () => {
  await rendererIPC.playerAction({ action: 'toggle' })
}

export const sendWinLyricChannelPort = async (port: Electron.MessagePortMain) => {
  getWebContents()?.postMessage(IPC_CHANNEL_NAMES.WIN_LYRIC_CHANNEL_PORT, null, [port])
}
