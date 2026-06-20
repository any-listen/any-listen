import { IPC_CHANNEL_NAMES, DEV_SERVER_PORTS } from '@any-listen/common/constants'

import type { IPCSocket } from '@/preload/ws'

// 暴露给前端的方法
export const createClientDesktopLyric = (ipcSocket: IPCSocket) => {
  let lyricWindow: Window | null = null
  return {
    async showDesktopLyric() {
      if (lyricWindow && !lyricWindow.closed) {
        lyricWindow.focus()
        return
      }

      // TODO: PROD location href
      const winURL = import.meta.env.DEV
        ? `http://localhost:${DEV_SERVER_PORTS['view-lyric']}`
        : `${location.origin}/view-lyric/index.html`

      const w = 400
      const h = 500
      const left = window.screen.width - w
      const top = window.screen.availHeight - h
      lyricWindow = window.open(
        winURL,
        'desktop-lyric',
        `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,location=no,status=no`
      )
      if (!lyricWindow) {
        throw new Error('Failed to open desktop lyric window')
      }
      window.addEventListener('message', (event) => {
        if (import.meta.env.DEV) {
          if (event.data !== IPC_CHANNEL_NAMES.WIN_CHANNEL_PORT_REQUEST) return
        } else if (event.origin !== location.origin || event.data !== IPC_CHANNEL_NAMES.WIN_CHANNEL_PORT_REQUEST) return

        if (!lyricWindow) return
        console.log('postMessage to lyricWindow')
        // if (import.meta.env.DEV) {
        const channel = new MessageChannel()
        lyricWindow.postMessage(
          IPC_CHANNEL_NAMES.WIN_MAIN_CHANNEL_PORT,
          '*',
          [channel.port2] // 转移 port2
        )
        window.postMessage(IPC_CHANNEL_NAMES.WIN_LYRIC_CHANNEL_PORT, '*', [channel.port1])
        // }
      })
      // const checkReady = () => {
      //   if (!lyricWindow) return
      //   if (lyricWindow.closed) {
      //     if (import.meta.env.PROD) {
      //       const channel = new BroadcastChannel(IPC_CHANNEL_NAMES.WIN_LYRIC_CHANNEL_PORT)
      //       window.postMessage(IPC_CHANNEL_NAMES.WIN_LYRIC_CHANNEL_PORT, '*', [channel])
      //     }
      //     // window.postMessage(IPC_CHANNEL_NAMES.WIN_LYRIC_CHANNEL_PORT, '*', [lyricWindow])
      //     return
      //   }
      //   lyricWindow.postMessage({ type: 'check-ready' }, location.origin)
      //   setTimeout(checkReady, 1000)
      // }
      // checkReady()
    },
    async hideDesktopLyric() {
      if (lyricWindow && !lyricWindow.closed) {
        lyricWindow.close()
      }
      lyricWindow = null
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
