import { settingEvent } from '../setting/store/event'
import { appEvent } from './store/event'

export const useAppAeady = () => {
  let appAeady = $state.raw(false)

  const unsubscribe = settingEvent.on('inited', () => {
    appAeady = true
  })
  const unsubscribe2 = appEvent.on('winMainIPCDisconnected', () => {
    appAeady = false
  })

  $effect(() => {
    return () => {
      unsubscribe()
      unsubscribe2()
    }
  })

  return {
    get appAeady() {
      return appAeady
    },
  }
}
