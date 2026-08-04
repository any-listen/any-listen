import { services } from './shared'
import { findMusic } from './tools'
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
  musicInfo: AnyListen.Music.MusicInfoOnline
  quality?: string
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
      // console.log(result)
      if (!result.url) throw new Error('Get music url failed')
      if (!allowedUrl(result.url)) throw new Error('Get music url failed, url not allowed')
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
    quality?: string
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
  quality?: string
  type?: AnyListen.Music.FileType
}): Promise<AnyListen.IPCExtension.MusicUrlInfo> => {
  return findMusic(data.musicInfo, async (musicInfo) => {
    return handleGetMusicUrl({
      musicInfo,
      quality: data.quality,
      type: data.type,
    })
  })
}
