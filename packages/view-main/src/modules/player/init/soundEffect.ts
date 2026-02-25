import { onRelease } from '@/modules/app/shared'
import { settingEvent } from '@/modules/setting/store/event'
import { settingState } from '@/modules/setting/store/state'
import {
  freqs,
  getAudioContext,
  getBiquadFilter,
  setConvolver,
  setConvolverMainGain,
  setConvolverSendGain,
  setPannerSoundR,
  setPannerSpeed,
  setPitchShifter,
  startPanner,
  stopPanner,
} from '@/plugins/player'
import { createUnsubscriptionSet } from '@/shared'

import { onPlayerCreated } from '../shared'

const cache = new Map<string, AudioBuffer>()
const loadBuffer = async (name: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const path = (await import(`../../../assets/medias/filters/${name.replace('.wav', '')}.wav`)).default as string
  return new Promise<AudioBuffer>((resolve, reject) => {
    if (cache.has(path)) {
      resolve(cache.get(path)!)
      return
    }
    // Load buffer asynchronously
    let request = new XMLHttpRequest()
    request.open('GET', path, true)
    request.responseType = 'arraybuffer'

    request.onload = function () {
      // Asynchronously decode the audio file data in request.response
      void getAudioContext()?.decodeAudioData(
        request.response as ArrayBuffer,
        (buffer) => {
          // if (!buffer) {
          //   reject(new Error(`error decoding file data: ${path}`))
          //   return
          // }
          cache.set(path, buffer)
          resolve(buffer)
        },
        (error) => {
          reject(error)
          console.error('decodeAudioData error', error)
        }
      )
    }

    request.onerror = function () {
      reject(new Error('XHR error'))
    }

    request.send()
  })
}

const init = () => {
  if (settingState.setting['player.soundEffect.panner.enable']) startPanner()
  setPannerSoundR(settingState.setting['player.soundEffect.panner.soundR'] / 10)
  setPannerSpeed(settingState.setting['player.soundEffect.panner.speed'])
  if (freqs.some((v) => settingState.setting[`player.soundEffect.biquadFilter.hz${v}`] != 0)) {
    const bfs = getBiquadFilter()
    for (const item of freqs) {
      bfs!.get(`hz${item}`)!.gain.value = settingState.setting[`player.soundEffect.biquadFilter.hz${item}`]
    }
  }
  if (settingState.setting['player.soundEffect.convolution.fileName']) {
    void loadBuffer(settingState.setting['player.soundEffect.convolution.fileName']).then((buffer) => {
      setConvolver(
        buffer,
        settingState.setting['player.soundEffect.convolution.mainGain'] / 10,
        settingState.setting['player.soundEffect.convolution.sendGain'] / 10
      )
    })
  }
  if (settingState.setting['player.soundEffect.pitchShifter.playbackRate'] != 1) {
    setPitchShifter(settingState.setting['player.soundEffect.pitchShifter.playbackRate'])
  }
}
type SEType = {
  [K in keyof AnyListen.AppSetting as K extends `player.soundEffect.${string}` ? K : never]: (
    val: AnyListen.AppSetting[K]
  ) => void
}
const applySettings: SEType = {
  'player.soundEffect.convolution.fileName'(fileName) {
    setTimeout(() => {
      if (fileName) {
        void loadBuffer(fileName).then((buffer) => {
          setConvolver(
            buffer,
            settingState.setting['player.soundEffect.convolution.mainGain'] / 10,
            settingState.setting['player.soundEffect.convolution.sendGain'] / 10
          )
        })
      } else {
        setConvolver(null, 0, 0)
      }
    })
  },
  'player.soundEffect.convolution.mainGain'(mainGain) {
    if (!settingState.setting['player.soundEffect.convolution.fileName']) return
    setConvolverMainGain(mainGain / 10)
  },
  'player.soundEffect.convolution.sendGain'(sendGain) {
    if (!settingState.setting['player.soundEffect.convolution.fileName']) return
    setConvolverSendGain(sendGain / 10)
  },
  'player.soundEffect.biquadFilter.hz31'(hz31) {
    const bfs = getBiquadFilter()
    bfs!.get('hz31')!.gain.value = hz31
  },
  'player.soundEffect.biquadFilter.hz62'(hz62) {
    const bfs = getBiquadFilter()
    bfs!.get('hz62')!.gain.value = hz62
  },
  'player.soundEffect.biquadFilter.hz125'(hz125) {
    const bfs = getBiquadFilter()
    bfs!.get('hz125')!.gain.value = hz125
  },
  'player.soundEffect.biquadFilter.hz250'(hz250) {
    const bfs = getBiquadFilter()
    bfs!.get('hz250')!.gain.value = hz250
  },
  'player.soundEffect.biquadFilter.hz500'(hz500) {
    const bfs = getBiquadFilter()
    bfs!.get('hz500')!.gain.value = hz500
  },
  'player.soundEffect.biquadFilter.hz1000'(hz1000) {
    const bfs = getBiquadFilter()
    bfs!.get('hz1000')!.gain.value = hz1000
  },
  'player.soundEffect.biquadFilter.hz2000'(hz2000) {
    const bfs = getBiquadFilter()
    bfs!.get('hz2000')!.gain.value = hz2000
  },
  'player.soundEffect.biquadFilter.hz4000'(hz4000) {
    const bfs = getBiquadFilter()
    bfs!.get('hz4000')!.gain.value = hz4000
  },
  'player.soundEffect.biquadFilter.hz8000'(hz8000) {
    const bfs = getBiquadFilter()
    bfs!.get('hz8000')!.gain.value = hz8000
  },
  'player.soundEffect.biquadFilter.hz16000'(hz16000) {
    const bfs = getBiquadFilter()
    bfs!.get('hz16000')!.gain.value = hz16000
  },
  'player.soundEffect.panner.enable'(enable) {
    if (enable) {
      startPanner()
    } else {
      stopPanner()
    }
  },
  'player.soundEffect.panner.soundR'(soundR) {
    setPannerSoundR(soundR / 10)
  },
  'player.soundEffect.panner.speed'(speed) {
    setPannerSpeed(speed)
  },
  'player.soundEffect.pitchShifter.playbackRate'(playbackRate) {
    setPitchShifter(playbackRate)
  },
}

let unregistered = createUnsubscriptionSet()
export const initSoundEffect = () => {
  onRelease(unregistered.clear.bind(unregistered))
  onPlayerCreated(() => {
    unregistered.register((unregistered) => {
      unregistered.add(
        settingEvent.on('updated', (keys, settings) => {
          for (const key of keys) {
            if (key.startsWith('player.soundEffect.')) {
              // @ts-expect-error
              applySettings[key as keyof SEType](settings[key])
            }
          }
        })
      )
    })

    init()
  })
}
