import { services } from './shared'
import { findMusic, findMusicByLocal } from './tools'
import { allowedUrl, buildExtSourceId, getExtSource } from './utils'

export const getMusicUrlByExtensionSource = async ({
  extensionId,
  source,
  musicInfo,
  quality,
  type,
}: {
  extensionId: string
  source: string
  musicInfo: AnyListen.Music.MusicInfo
  quality?: AnyListen.Music.Quality
  type?: AnyListen.Music.FileType
}): Promise<AnyListen.IPCExtension.MusicUrlInfo> => {
  return services.extensionSerive
    .resourceAction('musicUrl', {
      extensionId,
      source,
      musicInfo,
      quality,
      type,
    })
    .then((result) => {
      console.log(result)
      if (!result.url) throw new Error('Get music pic failed')
      if (!allowedUrl(result.url)) throw new Error('Get music pic failed, url not allowed')
      return result
    })
}

const handleGetMusicUrl = async (
  {
    musicInfo,
    quality,
    type,
  }: {
    musicInfo: AnyListen.Music.MusicInfoOnline
    quality?: AnyListen.Music.Quality
    type?: AnyListen.Music.FileType
  },
  excludeList: string[] = []
): Promise<AnyListen.IPCExtension.MusicUrlInfo> => {
  const source = getExtSource('musicUrl', excludeList, musicInfo.meta.source)
  if (!source) throw new Error('Get url failed, no source')
  return getMusicUrlByExtensionSource({
    extensionId: source.extensionId,
    source: source.id,
    musicInfo,
    quality,
    type,
  }).catch(async (e) => {
    console.error(e)
    excludeList.push(buildExtSourceId(source.extensionId, source.id))
    return handleGetMusicUrl({ musicInfo, quality, type }, excludeList)
  })
}

export const getMusicUrl = async (data: {
  musicInfo: AnyListen.Music.MusicInfo
  quality?: AnyListen.Music.Quality
  type?: AnyListen.Music.FileType
}): Promise<AnyListen.IPCExtension.MusicUrlInfo> => {
  if (data.musicInfo.isLocal) {
    return findMusicByLocal(data.musicInfo, async (info) => {
      return handleGetMusicUrl({
        musicInfo: info,
        quality: data.quality,
        type: data.type,
      })
    })
  }
  try {
    return await handleGetMusicUrl({
      musicInfo: data.musicInfo,
      quality: data.quality,
      type: data.type,
    })
  } catch {}
  return findMusic(
    {
      name: data.musicInfo.name,
      singer: data.musicInfo.singer,
      albumName: data.musicInfo.meta.albumName,
      interval: data.musicInfo.interval,
    },
    async (info) => {
      return handleGetMusicUrl({
        musicInfo: info,
        quality: data.quality,
        type: data.type,
      })
    }
  )
}
