import type { ClientCall, ExposeFunctions, MainCall } from '.'

// 暴露给后端的方法
export const createExposeApp = (client: ClientCall) => {
  return {
    async mouseLeave() {
      return client.mouseLeave()
    },
  } satisfies Partial<ExposeFunctions>
}

// 暴露给前端的方法
export const createClientApp = (main: MainCall) => {
  return {
    async inited() {
      return main.inited()
    },
    async setWinBounds(bounds) {
      return main.setWinBounds(bounds)
    },
    async mouseEnterLeave(isEnter) {
      return main.mouseEnterLeave(isEnter)
    },
  } satisfies Partial<AnyListen.IPC_Lyric.ServerIPC>
}
