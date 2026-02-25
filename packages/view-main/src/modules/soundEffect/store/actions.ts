import {
  getUserSoundEffectConvolutionPresetList,
  getUserEQPresetList as getUserSoundEffectEQPresetList,
  saveUserSoundEffectConvolutionPresetList,
  saveUserSoundEffectEQPresetList,
} from '@/shared/ipc/soundEffect'

import * as commit from './commit'
import { soundEffectState } from './state'

export const initUserEQPresetList = async () => {
  if (soundEffectState.userEqPresetList == null) {
    commit.setUserEqPresetList(await getUserSoundEffectEQPresetList())
  }
}
// export const getUserEQPresetList = async() => {
//   await initUserEQPresetList()
//   return soundEffectState.userEqPresetList!
// }
export const saveUserEQPreset = async (preset: AnyListen.SoundEffect.EQPreset) => {
  await initUserEQPresetList()
  commit.updateUserEqPresetList(preset)
  void saveUserSoundEffectEQPresetList(soundEffectState.userEqPresetList!)
}
export const removeUserEQPreset = async (id: string) => {
  await initUserEQPresetList()
  commit.removeUserEqPresetList(id)
  void saveUserSoundEffectEQPresetList(soundEffectState.userEqPresetList!)
}

export const initUserConvolutionPresetList = async () => {
  if (soundEffectState.userConvolutionPresetList == null) {
    commit.setUserConvolutionPresetList(await getUserSoundEffectConvolutionPresetList())
  }
}
// export const getUserConvolutionPresetList = async() => {
//   await initUserConvolutionPresetList()
//   return soundEffectState.userConvolutionPresetList!
// }
export const saveUserConvolutionPreset = async (preset: AnyListen.SoundEffect.ConvolutionPreset) => {
  await initUserConvolutionPresetList()
  commit.updateUserConvolutionPresetList(preset)
  void saveUserSoundEffectConvolutionPresetList(soundEffectState.userConvolutionPresetList!)
}
export const removeUserConvolutionPreset = async (id: string) => {
  await initUserConvolutionPresetList()
  commit.removeUserConvolutionPresetList(id)
  void saveUserSoundEffectConvolutionPresetList(soundEffectState.userConvolutionPresetList!)
}
