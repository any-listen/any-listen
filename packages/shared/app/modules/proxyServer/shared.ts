import fs from 'node:fs/promises'

import { MEDIA_FILE_TYPES, PIC_FILE_TYPES } from '@any-listen/common/constants'
import { joinPath } from '@any-listen/nodejs'

import { proxyServerState } from './state'

const ALLOWED_EXT = [...MEDIA_FILE_TYPES, ...PIC_FILE_TYPES].map((i) => `.${i}`)
export const TEMP_FILE_EXT = '.tmp'

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

export const getCacheSize = async () => {
  const dir = proxyServerState.cacheDir
  let totalSize = 0
  const files = await fs.readdir(dir)
  for (const file of files) {
    if (file.endsWith(TEMP_FILE_EXT)) continue
    const filePath = joinPath(dir, file)
    const stat = await fs.stat(filePath)
    if (stat.isFile()) {
      totalSize += stat.size
    }
  }
  return totalSize
}

export const clearCache = async () => {
  const dir = proxyServerState.cacheDir
  const files = await fs.readdir(dir)
  for (const file of files) {
    if (file.endsWith(TEMP_FILE_EXT)) continue
    const filePath = joinPath(dir, file)
    const stat = await fs.stat(filePath)
    if (stat.isFile()) {
      await fs.unlink(filePath)
    } else {
      await fs.rm(filePath, { recursive: true })
    }
  }
}
