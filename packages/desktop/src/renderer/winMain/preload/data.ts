import type { MainCall } from '.'

// 暴露给前端的方法
export const createClientData = (main: MainCall) => {
  return {
    async getLastStartInfo() {
      return main.getLastStartInfo()
    },
    async saveLastStartInfo() {
      return main.saveLastStartInfo()
    },
    async getPlayInfo() {
      return main.getPlayInfo()
    },

    async getListPrevSelectId() {
      return main.getListPrevSelectId()
    },
    async saveListPrevSelectId(id) {
      return main.saveListPrevSelectId(id)
    },

    async getSearchHistoryList() {
      return main.getSearchHistoryList()
    },
    async saveSearchHistoryList(list) {
      return main.saveSearchHistoryList(list)
    },

    async saveIgnoreVersion(ver) {
      return main.saveIgnoreVersion(ver)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
