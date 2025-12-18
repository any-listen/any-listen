import { MEDIA_FILE_TYPES, PIC_FILE_TYPES } from '@any-listen/common/constants'

const ALLOWED_EXT = [...MEDIA_FILE_TYPES, ...PIC_FILE_TYPES].map((i) => `.${i}`)

export const checkAllowedExt = (ext: string) => {
  return ALLOWED_EXT.includes(ext)
}

const RANGE_REGEX = /bytes=(?:\d*)-(?:\d*)/
export const parseRange = (range?: string) => {
  if (!range) return undefined
  const matches = RANGE_REGEX.exec(range)
  if (!matches) return null
  let start: number | undefined
  if (matches[1]) {
    start = parseInt(matches[1], 10)
    if (isNaN(start) || start < 0) return null
  }
  let end: number | undefined
  if (matches[2]) {
    end = parseInt(matches[2], 10)
    if (isNaN(end) || (start && end < start)) return null
  }

  return { start, end }
}
