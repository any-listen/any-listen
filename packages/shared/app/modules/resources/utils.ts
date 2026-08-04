// import { state } from './shared'

import { VIRTUAL_PROTOCOL } from '@any-listen/common/tools'

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

export const getSourceAllExtSourceIds = <T extends AnyListen.Extension.ResourceAction>(action: T, source: string) => {
  const list = resourceState.resources[action] ?? []
  return list.filter((r) => r.id == source).map((r) => buildExtSourceId(r.extensionId, r.id))
}

/**
 * @description 获取资源来源的扩展信息
 * @param action 资源行为，如 musicSearch、lyricSearch 等
 * @param exclude 排除的来源，格式为 extensionId__source
 * @param source 指定来源 source 字段
 * @returns 来源信息，包含 extensionId、source、name 等字段
 * @example
 * getExtSource('musicSearch', [], 'netease') // 获取 source 字段为 netease 的音乐搜索资源来源信息
 * getExtSource('lyricSearch', ['ext1__source1']) // 获取 lyricSearch 资源来源信息，排除 ext1__source1
 * getExtSource('musicSearch') // 获取任意一个 musicSearch 资源来源信息
 */
export const getExtSource = <T extends AnyListen.Extension.ResourceAction>(
  action: T,
  exclude: string[] = [],
  source?: string
) => {
  return (resourceState.resources[action] ?? []).find(
    (r) => (!source || r.id == source) && !exclude.includes(buildExtSourceId(r.extensionId, r.id))
  )
}

const httpRxp = /^(?:(?:https?|file):\/\/\S+|(?:\.{0,2})\/(?!\/)\S*)$/
const httpRxpWebServer = /^(?:https?:\/\/\S+|(?:\.{0,2})\/(?!\/)\S*)$/
const proxyUrlRxp = new RegExp(`^${VIRTUAL_PROTOCOL}`)
export const allowedUrl = (url: string) => {
  if (import.meta.env.VITE_IS_DESKTOP) return httpRxp.test(url) || proxyUrlRxp.test(url)
  return httpRxpWebServer.test(url) || proxyUrlRxp.test(url)
}
