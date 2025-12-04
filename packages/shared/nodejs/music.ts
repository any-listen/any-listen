import { MEDIA_FILE_TYPES } from '@any-listen/common/constants'
import { singerFormat } from '@any-listen/common/tools'
import { formatPlayTime, isLikelyGarbage, sizeFormate } from '@any-listen/common/utils'
import type { IAudioMetadata } from 'music-metadata'
import type { IComment } from 'music-metadata/lib/type'
import { basename, checkFile, extname, getFileStats } from './index'

export const bitrateFormat = (formate: IAudioMetadata['format']) => {
  if (formate.lossless) {
    if (formate.bitsPerSample) return `${formate.bitsPerSample}bit`
  }
  if (formate.bitrate) return `${Math.trunc(formate.bitrate / 1000)}k`
  return ''
}

const getMetadataLyric = (metadata: IAudioMetadata | null) => {
  if (!metadata) return null
  // let lyricInfo = metadata.common.lyrics?.[0]
  // console.log(lyricInfo)
  // if (lyricInfo) {
  //   let lyric: string | undefined
  //   if (typeof lyricInfo == 'object') lyric = lyricInfo.text
  //   else if (typeof lyricInfo == 'string') lyric = lyricInfo
  //   if (lyric && lyric.length > 10) {
  //     return lyric
  //   }
  // }
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

/**
 * 解析音频文件的元数据
 */
export const parseBufferMetadata = async (buffer: Buffer, mimeType: string) => {
  const { parseBuffer, selectCover } = await import('music-metadata')
  const metadata = await parseBuffer(buffer, mimeType, { skipPostHeaders: true, duration: false })
  // console.log(metadata)
  let name = (metadata.common.title || '').trim()
  const isLikelyNameGarbage = isLikelyGarbage(name)
  if (isLikelyNameGarbage) name = ''
  let singer = isLikelyNameGarbage ? '' : metadata.common.artists?.length ? singerFormat(metadata.common.artists.join(';')) : ''
  let albumName = isLikelyNameGarbage ? '' : (metadata.common.album?.trim() ?? '')
  let interval = metadata.format.duration && metadata.format.duration > 2 ? formatPlayTime(metadata.format.duration) : null

  return {
    name,
    singer,
    interval,
    albumName,
    bitrateLabel: bitrateFormat(metadata.format),
    year: metadata.common.year ?? 0,
    pic: selectCover(metadata.common.picture) || null,
    lyric: getMetadataLyric(metadata),
  }
}

export const parseFileMetadata = async (path: string) => {
  if (!(await checkFile(path))) return null
  const { parseFile } = await import('music-metadata')

  let metadata
  try {
    metadata = await parseFile(path, {
      skipCovers: true,
    })
  } catch (err) {
    console.log(`Error parsing file metadata: ${path}`)
    console.error(err)
    return null
  }

  let ext = extname(path)
  let name = (metadata.common.title || '').trim()
  const isLikelyNameGarbage = isLikelyGarbage(name)
  if (isLikelyNameGarbage) name = ''
  name ||= basename(path, ext)
  let singer = isLikelyNameGarbage ? '' : metadata.common.artists?.length ? singerFormat(metadata.common.artists.join(';')) : ''
  let interval = metadata.format.duration && metadata.format.duration > 2 ? formatPlayTime(metadata.format.duration) : null
  let albumName = isLikelyNameGarbage ? '' : (metadata.common.album?.trim() ?? '')

  let sizeStr = sizeFormate((await getFileStats(path))?.size ?? 0)

  return {
    name,
    singer,
    interval,
    albumName,
    sizeStr,
    ext: ext.replace(/^\./, ''),
    bitrateLabel: bitrateFormat(metadata.format),
    year: metadata.common.year ?? 0,
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
  // 尝试读取文件内图片
  const metadata = await getFileMetadata(path)
  if (!metadata) return null
  const { selectCover } = await import('music-metadata')
  const pic = selectCover(metadata.common.picture)
  return pic || null
}

export const getFileLyric = async (path: string) => {
  const metadata = await getFileMetadata(path)
  const lyric = getMetadataLyric(metadata)
  if (lyric && isLikelyGarbage(lyric)) return null
  return lyric
}

const musicExtensions = MEDIA_FILE_TYPES.map((ext) => `.${ext}`)
export const isMusicFile = (filePath: string): boolean => {
  return musicExtensions.includes(extname(filePath).toLowerCase())
}
