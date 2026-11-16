import { _locale as locale, i18n } from './i18n'

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
  let val = $derived($locale)
  return {
    get t() {
      tack(val)
      return i18n.getMessage.bind(i18n)
    },
  }
}
