import { formatPlayTime, sizeFormate } from '@any-listen/common/utils'
import { basename, checkPath, extname, getFileStats, joinPath, readFile } from '@any-listen/nodejs'
import type { IAudioMetadata } from 'music-metadata'
import type { IComment } from 'music-metadata/lib/type'

export const checkDownloadFileAvailable = async (musicInfo: AnyListen.Download.ListItem, savePath: string): Promise<boolean> => {
  return (
    musicInfo.isComplate &&
    !musicInfo.metadata.fileName.endsWith('.ape') &&
    ((await checkPath(musicInfo.metadata.filePath)) || (await checkPath(joinPath(savePath, musicInfo.metadata.fileName))))
  )
}

export const checkLocalFileAvailable = async (musicInfo: AnyListen.Music.MusicInfoLocal): Promise<boolean> => {
  return checkPath(musicInfo.meta.filePath)
}

/**
 * 检查音乐文件是否存在
 * @param musicInfo
 * @param savePath
 */
export const checkMusicFileAvailable = async (musicInfo: AnyListen.Music.MusicInfo, savePath: string): Promise<boolean> => {
  // if ('progress' in musicInfo) {
  //   return checkDownloadFileAvailable(musicInfo, savePath)
  // } else
  if (musicInfo.isLocal) {
    return checkLocalFileAvailable(musicInfo)
  }
  return true
}

export const getDownloadFilePath = async (musicInfo: AnyListen.Download.ListItem, savePath: string): Promise<string> => {
  if (musicInfo.isComplate && !musicInfo.metadata.fileName.endsWith('.ape')) {
    if (await checkPath(musicInfo.metadata.filePath)) return musicInfo.metadata.filePath
    const path = joinPath(savePath, musicInfo.metadata.fileName)
    if (await checkPath(path)) return path
  }
  return ''
}

export const getLocalFilePath = async (musicInfo: AnyListen.Music.MusicInfoLocal): Promise<string> => {
  return (await checkPath(musicInfo.meta.filePath)) ? musicInfo.meta.filePath : ''
}

/**
 * 获取音乐文件路径
 * @param musicInfo
 * @param savePath
 * @returns
 */
export const getMusicFilePath = async (musicInfo: AnyListen.Music.MusicInfo, savePath: string): Promise<string> => {
  // if ('progress' in musicInfo) {
  //   return getDownloadFilePath(musicInfo, savePath)
  // } else
  if (musicInfo.isLocal) {
    return getLocalFilePath(musicInfo)
  }
  return ''
}

const bitrateFormat = (formate: IAudioMetadata['format']) => {
  if (formate.lossless) {
    if (formate.bitsPerSample) return `${formate.bitsPerSample}bit`
  }
  if (formate.bitrate) return `${Math.trunc(formate.bitrate / 1000)}k`
  return ''
}

/**
 * 创建本地音乐信息对象
 * @param path 文件路径
 * @returns
 */
export const createLocalMusicInfo = async (path: string): Promise<AnyListen.Music.MusicInfoLocal | null> => {
  if (!(await checkPath(path))) return null
  const { parseFile } = await import('music-metadata')

  let metadata
  try {
    metadata = await parseFile(path, {
      skipCovers: true,
    })
  } catch (err) {
    console.log(err)
    return null
  }

  let ext = extname(path)
  let name = (metadata.common.title || basename(path, ext)).trim()
  let singer = metadata.common.artists?.length ? metadata.common.artists.map((a) => a.trim()).join('、') : ''
  let interval = metadata.format.duration ? formatPlayTime(metadata.format.duration) : ''
  let albumName = metadata.common.album?.trim() ?? ''

  let size = sizeFormate((await getFileStats(path))?.size ?? 0)

  const now = Date.now()

  return {
    id: path,
    name,
    singer,
    isLocal: true,
    interval,
    meta: {
      musicId: path,
      albumName,
      filePath: path,
      picUrl: '',
      ext: ext.replace(/^\./, ''),
      bitrateLabel: bitrateFormat(metadata.format),
      size,
      year: metadata.common.year ?? 0,
      createTime: now,
      updateTime: now,
      posTime: now,
    },
  } satisfies AnyListen.Music.MusicInfoLocal
}

let prevFileInfo: {
  path: string
  promise: Promise<IAudioMetadata | null>
} = {
  path: '',
  promise: Promise.resolve(null),
}
const getFileMetadata = async (path: string) => {
  if (prevFileInfo.path == path) return prevFileInfo.promise
  prevFileInfo.path = path
  return (prevFileInfo.promise = checkPath(path).then(async (isExist) => {
    return isExist
      ? import('music-metadata')
          .then(async ({ parseFile }) => parseFile(path))
          .catch((err) => {
            console.log(err)
            return null
          })
      : null
  }))
}
/**
 * 获取歌曲文件封面图片
 * @param path 路径
 */
export const getLocalMusicFilePic = async (path: string) => {
  const filePath = new RegExp(`\\${extname(path)}$`)
  let picPath = path.replace(filePath, '.jpg')
  let stats = await getFileStats(picPath)
  if (stats) return picPath
  picPath = path.replace(filePath, '.png')
  stats = await getFileStats(picPath)
  if (stats) return picPath
  const metadata = await getFileMetadata(path)
  if (!metadata) return null
  const { selectCover } = await import('music-metadata')
  return selectCover(metadata.common.picture)
}

// const timeExp = /^\[([\d:.]*)\]{1}/
/**
 * 解析歌词文件，分离可能存在的翻译、罗马音歌词
 * @param lrc 歌词内容
 * @returns
 */
// export const parseLyric = (lrc: string): AnyListen.Music.LyricInfo => {
//   const lines = lrc.split(/\r\n|\r|\n/)
//   const lyrics: string[][] = []
//   const map = new Map<string, number>()

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim()
//     let result = timeExp.exec(line)
//     if (result) {
//       const index = map.get(result[1]) ?? 0
//       if (!lyrics[index]) lyrics[index] = []
//       lyrics[index].push(line)
//       map.set(result[1], index + 1)
//     } else {
//       if (!lyrics[0]) lyrics[0] = []
//       lyrics[0].push(line)
//     }
//   }
//   const lyricInfo: AnyListen.Music.LyricInfo = {
//     lyric: lyrics[0].join('\n'),
//     tlyric: '',
//   }
//   if (lyrics[1]) lyricInfo.tlyric = lyrics[1].join('\n')
//   if (lyrics[2]) lyricInfo.rlyric = lyrics[2].join('\n')

//   return lyricInfo
// }

/**
 * 获取歌曲文件歌词
 * @param path 路径
 */
export const getLocalMusicFileLyric = async (path: string): Promise<string | null> => {
  // 尝试读取同目录下的同名lrc文件
  const lrcPath = path.replace(new RegExp(`\\${extname(path)}$`), '.lrc')
  const stats = await getFileStats(lrcPath)
  // console.log(lrcPath, stats)
  if (stats && stats.size < 1024 * 1024 * 10) {
    const lrcBuf = await readFile(lrcPath)
    const { detect } = await import('jschardet')
    const { confidence, encoding } = detect(lrcBuf)
    console.log('lrc file encoding', confidence, encoding)
    if (confidence > 0.8) {
      const iconv = await import('iconv-lite')
      if (iconv.encodingExists(encoding)) {
        const lrc = iconv.decode(lrcBuf, encoding)
        if (lrc) return lrc
      }
    }
  }

  // 尝试读取文件内歌词
  const metadata = await getFileMetadata(path)
  // console.log(metadata?.common)
  if (!metadata) return null
  let lyricInfo = metadata.common.lyrics?.[0]
  if (lyricInfo) {
    let lyric: string | undefined
    if (typeof lyricInfo == 'object') lyric = lyricInfo.text
    else if (typeof lyricInfo == 'string') lyric = lyricInfo
    if (lyric && lyric.length > 10) {
      return lyric
    }
  }
  // console.log(metadata)
  for (const info of Object.values(metadata.native)) {
    for (const ust of info) {
      switch (ust.id) {
        case 'LYRICS': {
          const value = typeof ust.value == 'string' ? ust.value : (ust as IComment).text
          if (value && value.length > 10) return value
          break
        }
        case 'USLT': {
          const value = ust.value as IComment
          if (value.text && value.text.length > 10) return value.text
          break
        }
      }
    }
  }
  return null
}
