import { isLikelyGarbage, sizeFormate } from '@any-listen/common/utils'
import type { IAudioMetadata } from 'music-metadata'

import { basename, checkFile, extname, getFileStats } from './index'
import { getMetadataLyric, parseFileMetadata, type FileMetadata } from './music-metadata'
import { buildStrmFileMetadata, getStrmFileLyric, getStrmFilePic } from './strm'

export { parseBufferMetadata, isMusicFile } from './music-metadata'

export const buildFileMetadata = async (path: string, parseMetadata = true): Promise<FileMetadata | null> => {
  if (path.endsWith('.strm')) return buildStrmFileMetadata(path, parseMetadata)

  if (parseMetadata) return parseFileMetadata(path)
  const ext = extname(path)
  const name = basename(path, ext)
  return {
    unparsed: true,
    name,
    singer: '',
    interval: null,
    albumName: '',
    sizeStr: sizeFormate((await getFileStats(path))?.size ?? 0),
    ext: ext.replace(/^\./, ''),
    bitrateLabel: '',
    year: 0,
    trackNo: null,
    discNo: null,
  }
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
  return (prevFileInfo.promise = checkFile(path).then(async (isExist) => {
    return isExist
      ? import('music-metadata')
          .then(async ({ parseFile }) => parseFile(path))
          .catch(() => {
            // console.log(err)
            return null
          })
      : null
  }))
}

export const getFilePic = async (path: string) => {
  if (path.endsWith('.strm')) return getStrmFilePic(path)
  // 尝试读取文件内图片
  const metadata = await getFileMetadata(path)
  if (!metadata) return null
  const { selectCover } = await import('music-metadata')
  const pic = selectCover(metadata.common.picture)
  return pic || null
}

export const getFileLyric = async (path: string) => {
  if (path.endsWith('.strm')) return getStrmFileLyric(path)

  const metadata = await getFileMetadata(path)
  const lyric = getMetadataLyric(metadata)
  if (lyric && isLikelyGarbage(lyric)) return null
  return lyric
}

export { getStrmFileUrl } from './strm'
