import { findMusic as findMusicByExt } from './search/music/actions'
import { buildExtSourceId, getExtSource } from './utils'

export const findMusic = async <T>(
  info: {
    name: string
    singer: string
    albumName: string
    interval: string | null
  },
  handler: (info: AnyListen.Music.MusicInfoOnline) => Promise<T>,
  excludeList: string[] = []
): Promise<T> => {
  const source = getExtSource('musicSearch', excludeList)
  if (!source) throw new Error('Get url failed, no source')
  const music = await findMusicByExt({ extensionId: source.extensionId, source: source.id, ...info })
  if (music) {
    try {
      return await handler(music)
    } catch (e) {
      console.error(e)
    }
  }
  excludeList.push(buildExtSourceId(source.extensionId, source.id))
  return findMusic(info, handler, excludeList)
}

export const findMusicByLocal = async <T>(
  musicInfo: AnyListen.Music.MusicInfoLocal,
  handler: (info: AnyListen.Music.MusicInfoOnline) => Promise<T>
) => {
  try {
    return await findMusic<T>(
      {
        name: musicInfo.name,
        singer: musicInfo.singer,
        albumName: musicInfo.meta.albumName,
        interval: musicInfo.interval,
      },
      handler
    )
  } catch {}
  if (musicInfo.name.includes('-')) {
    const [name, singer] = musicInfo.name.split('-').map((val) => val.trim())
    try {
      return await findMusic<T>(
        {
          name,
          singer,
          albumName: musicInfo.meta.albumName,
          interval: musicInfo.interval,
        },
        handler
      )
    } catch {}
    try {
      return await findMusic<T>(
        {
          name: singer,
          singer: name,
          albumName: musicInfo.meta.albumName,
          interval: musicInfo.interval,
        },
        handler
      )
    } catch {}
  }
  let fileName = musicInfo.meta.filePath.split(/\/|\\/).at(-1)
  if (fileName) {
    fileName = fileName.substring(0, fileName.lastIndexOf('.'))
    if (fileName != musicInfo.name) {
      if (fileName.includes('-')) {
        const [name, singer] = fileName.split('-').map((val) => val.trim())
        try {
          return await findMusic<T>(
            {
              name,
              singer,
              albumName: musicInfo.meta.albumName,
              interval: musicInfo.interval,
            },
            handler
          )
        } catch {}
        try {
          return await findMusic<T>(
            {
              name: singer,
              singer: name,
              albumName: musicInfo.meta.albumName,
              interval: musicInfo.interval,
            },
            handler
          )
        } catch {}
      } else {
        try {
          return await findMusic<T>(
            {
              name: fileName,
              singer: '',
              albumName: musicInfo.meta.albumName,
              interval: musicInfo.interval,
            },
            handler
          )
        } catch {}
      }
    }
  }

  throw new Error('source not found')
}
