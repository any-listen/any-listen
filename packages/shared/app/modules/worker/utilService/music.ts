import { isValidLyric } from '@any-listen/common/tools'
import { parseLyrics } from '@any-listen/nodejs/lrcTool'

import {
  createLocalMusicInfo,
  getLocalMusicFileLyric,
  getLocalMusicFilePic,
  parseLocalMusicInfoMetadata,
  removeMusicFile,
} from './shared/music'

interface PicBuffer {
  format: string
  data: Uint8Array
}
export const getMusicFilePic = async (filePath: string): Promise<string | PicBuffer> => {
  const picture = await getLocalMusicFilePic(filePath)
  if (!picture) return ''
  if (typeof picture == 'string') return picture
  const [type, ext] = picture.format.split('/')
  if (type != 'image') return ''
  return {
    format: ext,
    data: picture.data,
  }
}

export const getMusicFileLyric = async (
  filePath: string
): Promise<Pick<AnyListen.Music.LyricInfo, 'awlyric' | 'lyric' | 'rlyric' | 'tlyric'> | null> => {
  const lyric = await getLocalMusicFileLyric(filePath)
  if (!lyric || (!isValidLyric(lyric) && !/(?:^|\n)\[awlrc:\w+/.test(lyric))) return null
  return parseLyrics(lyric)
}

/**
 * 创建本地列表音乐信息
 * @param filePaths 文件路径
 * @param parseMetadata 是否解析元数据
 */
export const createLocalMusicInfos = async (
  filePaths: string[],
  parseMetadata: boolean
): Promise<AnyListen.Music.MusicInfoLocal[]> => {
  const list: AnyListen.Music.MusicInfoLocal[] = []
  for await (const path of filePaths) {
    const musicInfo = await createLocalMusicInfo(path, parseMetadata)
    if (!musicInfo) continue
    list.push(musicInfo)
  }

  return list
}

export const parseLocalMusicInfosMetadata = async (msuicInfos: AnyListen.Music.MusicInfoLocal[]) => {
  const list: AnyListen.Music.MusicInfoLocal[] = []
  for await (const info of msuicInfos) {
    const metaInfo = await parseLocalMusicInfoMetadata(info.meta.filePath)
    if (!metaInfo) continue
    const { meta, ...base } = metaInfo
    list.push({
      ...info,
      ...base,
      meta: {
        ...info.meta,
        ...meta,
      },
    })
  }

  return list
}

export const removeMusicFiles = async (paths: string[]) => {
  for (const path of paths) {
    await removeMusicFile(path)
  }
}

export { parseLocalMusicInfoMetadata } from './shared/music'

export { scanFolderMusics, stopFolderMusicsScan } from './scanMusics'
