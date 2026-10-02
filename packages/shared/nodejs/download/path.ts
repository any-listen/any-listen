import fs from 'node:fs/promises'
import path from 'node:path'

import { filterFileName } from '@any-listen/common/utils'

import { normalizePath } from '..'

export const buildDownloadName = (name: string) => {
  name = filterFileName(name)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .replace(/[. ]+$/, '')
  // Leave room for the extension and keep multi-byte names below filesystem limits.
  let result = ''
  for (const character of name) {
    if (Buffer.byteLength(result + character) > 200) break
    result += character
  }
  result = result.replace(/[. ]+$/, '')
  if (!result || result === '.' || result === '..') result = 'music'
  if (/^(?:con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(result)) result = `_${result}`
  return result
}

export const isPathInside = (root: string, target: string) => {
  const relative = path.relative(root, target)
  return !relative || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`))
}

// Resolve existing ancestors too, so validation also works before mkdir.
export const resolveRealPath = async (filePath: string): Promise<string> => {
  try {
    return await fs.realpath(filePath)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
    const parent = path.dirname(filePath)
    if (parent === filePath) throw err
    return path.join(await resolveRealPath(parent), path.basename(filePath))
  }
}

export const prepareDownloadDirectory = async (directory: string, checkPath: (directory: string) => Promise<void>) => {
  directory = normalizePath(directory)
  if (!path.isAbsolute(directory) || directory.length > 1024) throw new Error('Invalid download directory')
  directory = path.resolve(directory)
  await checkPath(directory)
  await fs.mkdir(directory, { recursive: true })
  const realPath = await fs.realpath(directory)
  await checkPath(directory)
  return realPath
}
