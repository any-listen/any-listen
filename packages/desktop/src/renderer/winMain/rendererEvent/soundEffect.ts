import type { ExposeFunctions } from '.'
import { STORE_NAMES } from '@any-listen/common/constants'
import getStore from '@/shared/store'

// 暴露给前端的方法
export const createExposeSoundEffect = () => {
  return {
    async getUserSoundEffectEQPresetList(event) {
      return getStore(STORE_NAMES.SOUND_EFFECT).get<AnyListen.SoundEffect.EQPreset[]>('eqPreset') ?? []
    },
    async saveUserSoundEffectEQPresetList(event, list) {
      getStore(STORE_NAMES.SOUND_EFFECT).set('eqPreset', list)
    },
    async getUserSoundEffectConvolutionPresetList(event) {
      return getStore(STORE_NAMES.SOUND_EFFECT).get<AnyListen.SoundEffect.ConvolutionPreset[]>('convolutionPreset') ?? []
    },
    async saveUserSoundEffectConvolutionPresetList(event, list) {
      getStore(STORE_NAMES.SOUND_EFFECT).set('convolutionPreset', list)
    },
  } satisfies Partial<ExposeFunctions>
}
