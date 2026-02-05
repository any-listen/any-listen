import { isLikelyGarbage } from '@any-listen/common/utils'
import {
  checkFile,
  dirname,
  extname,
  getFileStats,
  joinPath,
  removeFile as nodeRemoveFile,
  readFile,
  sleep,
} from '@any-listen/nodejs'
import { decodeString } from '@any-listen/nodejs/char'
import { buildFileMetadata, getFileLyric, getFilePic } from '@any-listen/nodejs/music'

let removeFile = nodeRemoveFile
export const setRemoveFile = (func: (filePath: string) => Promise<void>) => {
  removeFile = func
}

export const checkDownloadFileAvailable = async (musicInfo: AnyListen.Download.ListItem, savePath: string): Promise<boolean> => {
  return (
    musicInfo.isComplate &&
    !musicInfo.metadata.fileName.endsWith('.ape') &&
    ((await checkFile(musicInfo.metadata.filePath)) || (await checkFile(joinPath(savePath, musicInfo.metadata.fileName))))
  )
}

export const checkLocalFileAvailable = async (musicInfo: AnyListen.Music.MusicInfoLocal): Promise<boolean> => {
  return checkFile(musicInfo.meta.filePath)
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
    if (await checkFile(musicInfo.metadata.filePath)) return musicInfo.metadata.filePath
    const path = joinPath(savePath, musicInfo.metadata.fileName)
    if (await checkFile(path)) return path
  }
  return ''
}

export const getLocalFilePath = async (musicInfo: AnyListen.Music.MusicInfoLocal): Promise<string> => {
  return (await checkFile(musicInfo.meta.filePath)) ? musicInfo.meta.filePath : ''
}

export const removeMusicFile = async (path: string) => {
  if (!path) return
  try {
    await removeFile(path)
  } catch (err) {
    console.error(`Remove file error: ${path}`, err)
    await sleep(500)
    try {
      await removeFile(path)
    } catch (err) {
      console.error(`Remove file error retry failed: ${path}`, err)
    }
  }
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

/**
 * 创建本地音乐信息对象
 * @param path 文件路径
 * @param parseMetadata 是否解析元数据
 * @returns
 */
export const createLocalMusicInfo = async (
  path: string,
  parseMetadata: boolean
): Promise<AnyListen.Music.MusicInfoLocal | null> => {
  let result = await buildFileMetadata(path, parseMetadata)
  if (!result) return null
  const { unparsed, name, singer, interval, albumName, sizeStr, ext, bitrateLabel, year } = result

  const now = Date.now()

  return {
    id: path,
    name,
    singer,
    isLocal: true,
    interval,
    meta: {
      musicId: path,
      unparsed,
      albumName,
      filePath: path,
      picUrl: '',
      ext,
      bitrateLabel,
      sizeStr,
      year,
      createTime: now,
      updateTime: now,
      posTime: now,
    },
  } satisfies AnyListen.Music.MusicInfoLocal
}
export const parseLocalMusicInfoMetadata = async (path: string) => {
  let result = await buildFileMetadata(path, true)
  if (!result) return null
  const { name, singer, interval, albumName, sizeStr, ext, bitrateLabel, year } = result
  return {
    name,
    singer,
    interval,
    meta: {
      unparsed: false,
      albumName,
      ext,
      bitrateLabel,
      sizeStr,
      year,
      updateTime: Date.now(),
    },
  }
}

const tryPicExt = ['.jpg', '.jpeg', '.png'] as const
/**
 * 获取歌曲文件封面图片
 * @param path 路径
 */
export const getLocalMusicFilePic = async (path: string) => {
  const filePath = new RegExp(`\\${extname(path)}$`)
  for await (const ext of tryPicExt) {
    const picPath = path.replace(filePath, ext)
    if (await checkFile(picPath)) return picPath
  }
  // 尝试读取文件内图片
  const pic = await getFilePic(path)
  if (pic) return pic

  // 尝试读取同目录下的cover.jpg
  let coverPath = joinPath(dirname(path), 'cover')
  for await (const ext of tryPicExt) {
    const picPath = coverPath + ext
    if (await checkFile(picPath)) return picPath
  }
  coverPath = joinPath(dirname(path), 'Cover')
  for await (const ext of tryPicExt) {
    const picPath = coverPath + ext
    if (await checkFile(picPath)) return picPath
  }
  return null
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
    const lrc = await decodeString(lrcBuf)
    if (lrc && !isLikelyGarbage(lrc)) return lrc
  }

  // 尝试读取文件内歌词
  return getFileLyric(path)
}
