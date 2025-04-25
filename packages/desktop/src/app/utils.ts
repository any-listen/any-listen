// import { URL_SCHEME_RXP } from '@any-listen/common/constants'

// export const parseEnvParams = (): { cmdParams: AnyListen.CmdParams; deeplink: string | null } => {
//   const cmdParams: AnyListen.CmdParams = {}
//   let deeplink = null
//   const rx = /^-\w+/
//   for (let param of process.argv) {
//     if (URL_SCHEME_RXP.test(param)) {
//       deeplink = param
//     }

//     if (!rx.test(param)) continue
//     param = param.substring(1)
//     let index = param.indexOf('=')
//     if (index < 0) {
//       // @ts-expect-error
//       cmdParams[param] = true
//     } else {
//       // @ts-expect-error
//       cmdParams[param.substring(0, index)] = param.substring(index + 1)
//     }
//   }
//   return {
//     cmdParams,
//     deeplink,
//   }
// }
