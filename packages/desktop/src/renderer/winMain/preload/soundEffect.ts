import type { MainCall } from '.'

// // 暴露给后端的方法
// export const createExposeDislike = () => {
//   return {
//     async dislikeAction(event, action) {
//       ipcPreloadEvent.dislikeAction(action)
//     },
//   } satisfies Partial<ExposeFunctions>
// }

// 暴露给前端的方法
export const createClientSoundEffect = (main: MainCall) => {
  return {
    async getUserSoundEffectEQPresetList() {
      return main.getUserSoundEffectEQPresetList()
    },
    async saveUserSoundEffectEQPresetList(list) {
      return main.saveUserSoundEffectEQPresetList(list)
    },
    async getUserSoundEffectConvolutionPresetList() {
      return main.getUserSoundEffectConvolutionPresetList()
    },
    async saveUserSoundEffectConvolutionPresetList(list) {
      return main.saveUserSoundEffectConvolutionPresetList(list)
    },
  } satisfies Partial<AnyListen.IPC.ServerIPC>
}
