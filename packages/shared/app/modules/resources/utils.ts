// import { state } from './shared'

import { resourceState } from './shared'

export const TRY_QUALITYS_LIST = ['flac24bit', 'flac', '320k'] as const
// type TryQualityType = (typeof TRY_QUALITYS_LIST)[number]
// export const getPlayQuality = (
//   playQuality: AnyListen.Music.Quality,
//   musicInfo: AnyListen.Music.MusicInfoOnline
// ): AnyListen.Music.Quality => {
//   let type: AnyListen.Music.Quality = '128k'
//   if (TRY_QUALITYS_LIST.includes(playQuality as TryQualityType)) {
//     let list = state.resources.musicUrl[musicInfo.source]

//     let t = TRY_QUALITYS_LIST.slice(TRY_QUALITYS_LIST.indexOf(playQuality as TryQualityType)).find(
//       (q) => musicInfo.meta._qualitys[q] && list?.includes(q)
//     )

//     if (t) type = t
//   }
//   return type
// }

export const buildExtSourceId = (source: string, extensionId: string) => `${extensionId}__${source}`
export const getExtSource = <T extends AnyListen.Extension.ResourceAction>(
  action: T,
  exclude: string[] = [],
  source?: string
) => {
  return (resourceState.resources[action] ?? []).find(
    (r) => (!source || r.id == source) && !exclude.includes(buildExtSourceId(r.extensionId, r.id))
  )
}

const httpRxp = /^(?:https?:\/\/|\/\w+)/
const httpRxpWebServer = /^(?:https?:\/\/|\/?\w+)/
export const allowedUrl = (url: string) => {
  if (import.meta.env.VITE_IS_DESKTOP) return httpRxp.test(url)
  return httpRxpWebServer.test(url)
}
