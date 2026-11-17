import { _locale, i18n } from './i18n'

// const tack = (val: any) => {
//   return val
// }
// export const useI18n = () => {
//   let val = $state(i18n.locale)
//   tack(val)

//   return {
//     get t() {
//       return i18n.getMessage.bind(i18n)
//     },
//   }
// }

const tack = (val: any) => {
  return val
}
export const useI18n = () => {
  let val = $state(i18n.locale)

  // 退订跟随调用组件的 effect 作用域，避免每次挂载都往 locale store 上挂一个永久订阅
  $effect(() => {
    const unsub = _locale.subscribe((v) => {
      val = v
    })
    return unsub
  })
  return {
    get t() {
      tack(val)
      return i18n.getMessage.bind(i18n)
    },
  }
}
