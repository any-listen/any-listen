import { parseLyrics } from '@any-listen/nodejs/lrcTool'

import { getWebDAVOptionsByMusicInfo } from './utils'
import { getMusicLyric, getMusicPic, getMusicUrl } from './webdav'

export const resourceActions: Partial<AnyListen.IPCExtension.ResourceAction> = {
  async musicUrl({ musicInfo }) {
    const options = await getWebDAVOptionsByMusicInfo(musicInfo)
    const url = await getMusicUrl(options, options.path)
    return {
      quality: musicInfo.meta.bitrateLabel || '',
      url,
    }
  },
  async musicLyric({ musicInfo }) {
    const options = await getWebDAVOptionsByMusicInfo(musicInfo)
    const lyric = await getMusicLyric(options, options.path)
    if (!lyric) throw new Error('no lyric')
    return {
      name: musicInfo.name,
      singer: musicInfo.singer,
      interval: musicInfo.interval,
      ...parseLyrics(lyric),
    }
  },
  async musicPic({ musicInfo }) {
    const options = await getWebDAVOptionsByMusicInfo(musicInfo)
    const pic = await getMusicPic(options, options.path)
    if (!pic) throw new Error('no pic')
    return pic
  },
}
