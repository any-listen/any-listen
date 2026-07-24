import { MEDIA_FILE_TYPES, MEDIA_FILE_TYPES_LOCAL } from '@any-listen/common/constants'
import { singerFormat } from '@any-listen/common/tools'
import { formatPlayTime, isLikelyGarbage, sizeFormate } from '@any-listen/common/utils'
import type { IAudioMetadata } from 'music-metadata'

import { basename, checkFile, extname, getFileStats } from '.'

const bitrateFormat = (formate: IAudioMetadata['format']) => {
  if (formate.lossless) {
    if (formate.bitsPerSample) return `${formate.bitsPerSample}bit`
  }
  if (formate.bitrate) return `${Math.trunc(formate.bitrate / 1000)}k`
  return ''
}
type IComment = NonNullable<IAudioMetadata['common']['comment']> extends Array<infer U> ? U : never
export const getMetadataLyric = (metadata: IAudioMetadata | null) => {
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
 * get artist for wav file
 * https://github.com/any-listen/any-listen/issues/132
 * @param metadata
 * @returns
 */
const getWavFileArtist = (metadata: IAudioMetadata) => {
  if (!metadata.common.artists?.length) return ''
  if (metadata.common.artists.length > 1) {
    const { exif, ...infos } = metadata.native
    const artists: string[] = []
    for (const info of Object.values(infos)) {
      for (const ust of info) {
        if (ust.id === 'IART') {
          if (typeof ust.value == 'string') artists.push(ust.value)
        } else if (ust.id === 'TPE1') {
          if (typeof ust.value == 'string') artists.push(ust.value)
        }
      }
    }
    if (artists.length) return singerFormat(artists.join(';'))
  } else if (metadata.common.artist) return singerFormat(metadata.common.artist)
  return ''
}
const getArtist = (ext: string, metadata: IAudioMetadata) => {
  if (ext === 'wav') return getWavFileArtist(metadata)
  return metadata.common.artists?.length ? singerFormat(metadata.common.artists.join(';')) : ''
}

export interface FileMetadata {
  unparsed: boolean
  name: string
  singer: string
  interval: string | null
  albumName: string
  sizeStr: string
  ext: string
  bitrateLabel: string
  year: number
  trackNo: number | null
  discNo: number | null
}

/**
 * 解析音频文件的元数据
 */
export const parseBufferMetadata = async (buffer: Buffer, mimeType: string, ext: string) => {
  const { parseBuffer, selectCover } = await import('music-metadata')
  const metadata = await parseBuffer(buffer, mimeType, { skipPostHeaders: true, duration: false })
  // console.log(metadata)
  let name = (metadata.common.title || '').trim()
  const isLikelyNameGarbage = isLikelyGarbage(name)
  if (isLikelyNameGarbage) name = ''
  let singer = isLikelyNameGarbage ? '' : getArtist(ext, metadata)
  let albumName = isLikelyNameGarbage ? '' : (metadata.common.album?.trim() ?? '')
  let interval = metadata.format.duration && metadata.format.duration > 2 ? formatPlayTime(metadata.format.duration) : null

  return {
    name,
    singer,
    interval,
    albumName,
    bitrateLabel: bitrateFormat(metadata.format),
    year: metadata.common.year ?? 0,
    trackNo: metadata.common.track.no,
    discNo: metadata.common.disk.no,
    pic: selectCover(metadata.common.picture) || null,
    lyric: getMetadataLyric(metadata),
  }
}

export const parseFileMetadata = async (path: string): Promise<FileMetadata | null> => {
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
  let singer = isLikelyNameGarbage ? '' : getArtist(ext.replace(/^\./, ''), metadata)
  let interval = metadata.format.duration && metadata.format.duration > 2 ? formatPlayTime(metadata.format.duration) : null
  let albumName = isLikelyNameGarbage ? '' : (metadata.common.album?.trim() ?? '')

  let sizeStr = sizeFormate((await getFileStats(path))?.size ?? 0)

  return {
    unparsed: false,
    name,
    singer,
    interval,
    albumName,
    sizeStr,
    ext: ext.replace(/^\./, ''),
    bitrateLabel: bitrateFormat(metadata.format),
    year: metadata.common.year ?? 0,
    trackNo: metadata.common.track.no,
    discNo: metadata.common.disk.no,
  }
}

const musicExtensions = MEDIA_FILE_TYPES.map((ext) => `.${ext}`)
const localMusicExtensions = MEDIA_FILE_TYPES_LOCAL.map((ext) => `.${ext}`)
export const isMusicFile = (filePath: string, isLocal?: boolean): boolean => {
  return (isLocal ? localMusicExtensions : musicExtensions).includes(extname(filePath))
}
