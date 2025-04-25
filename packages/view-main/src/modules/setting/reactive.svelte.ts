import { settingEvent } from './store/event'
import { settingState } from './store/state'
// import { readable } from 'svelte/store'

// export const setting = readable(settingState.setting, (set) => {
//   return settingEvent.on('updated', () => {
//     set(settingState.setting)
//   })
// })

export const useSetting = () => {
  let val = $state.raw(settingState.setting)

  $effect(() => {
    const unsub = settingEvent.on('updated', () => {
      val = settingState.setting
    })
    return unsub
  })

  return {
    get val() {
      return val
    },
  }
}

export const useSettingValue = <T extends keyof AnyListen.AppSetting>(key: T) => {
  let val = $state.raw(settingState.setting[key])

  $effect(() => {
    const unsub = settingEvent.on('updated', (keys) => {
      if (!keys.includes(key)) return
      val = settingState.setting[key]
    })
    return unsub
  })

  return {
    get val() {
      return val
    },
  }
}
