// import { onLogout } from '@/modules/app/shared'
import { settingEvent } from './store/event'

export const onSettingChanged = <T extends keyof AnyListen.AppSetting>(
  key: T,
  handler: (value: AnyListen.AppSetting[T]) => void
) => {
  return settingEvent.on('updated', (keys, setting) => {
    if (keys.includes(key)) handler(setting[key]!)
  })
}

// export const onSettingChangedIsLogined = <T extends keyof AnyListen.AppSetting>(key: T, handler: (value: AnyListen.AppSetting[T]) => void) => {
//   const unsubscribe = () => {
//     if (unsubSetting) {
//       unsubSetting()
//       unsubLogout!()
//       unsubSetting = null
//       unsubLogout = null
//     }
//   }
//   let unsubSetting: (() => void) | null = settingEvent.on('updated', (keys, setting) => {
//     if (keys.includes(key)) handler(setting[key]!)
//   })
//   let unsubLogout: (() => void) | null = onLogoutOnec(() => {
//     if (unsubSetting) {
//       unsubSetting()
//       unsubSetting = null
//       unsubLogout = null
//     }
//   })

//   return unsubscribe
// }
