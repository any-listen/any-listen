import fs from 'node:fs/promises'
import path from 'node:path'

import { MEDIA_FILE_TYPES, PIC_FILE_TYPES } from '@any-listen/common/constants'
import { buildPublicPath } from '@any-listen/common/tools'
import { extname, joinPath, normalizePath, toSha256 } from '@any-listen/nodejs'

import { appState } from '@/app/app/state'
import { PUBLIC_RESOURCE_PATH } from '@/shared/constants'

const devHost = 'http://localhost:9500'

export const checkAllowPath = (filePath: string) => {
  if (!filePath.length || filePath.length > 1024) return false
  if (!filePath.endsWith(path.sep)) filePath += path.sep
  filePath = normalizePath(filePath)
  return global.anylisten.config.allowPublicDir.some((p) => filePath.startsWith(p))
}
const checkAllowPathError = (filePath: string) => {
  if (checkAllowPath(filePath)) return
  throw new Error(`Not allow path: ${filePath}`)
}

export const createExtensionIconPublicPath = (filePath: string) => {
  const extName = extname(filePath).substring(1)
  const fileName = `${toSha256(filePath)}.${extName}`
  global.anylisten.publicStaticPaths.set(fileName, filePath)
  if (import.meta.env.DEV) return `${devHost}${PUBLIC_RESOURCE_PATH}/${fileName}`
  return buildPublicPath(PUBLIC_RESOURCE_PATH, fileName)
}
export const removeExtensionIconPublicPath = (filePath: string) => {
  const extName = extname(filePath).substring(1)
  const fileName = `${toSha256(filePath)}.${extName}`
  global.anylisten.publicStaticPaths.delete(fileName)
}

export const createMediaPublicPath = async (filePath: string) => {
  const extName = extname(filePath).substring(1) as (typeof MEDIA_FILE_TYPES)[number]
  if (MEDIA_FILE_TYPES.includes(extName)) {
    const fileName = `${toSha256(filePath)}.${extName}`
    global.anylisten.publicStaticPaths.set(fileName, filePath)
    if (import.meta.env.DEV) return `${devHost}${PUBLIC_RESOURCE_PATH}/${fileName}`
    return buildPublicPath(PUBLIC_RESOURCE_PATH, fileName)
  }
}

export const createPicFilePublicPath = async (rawPath: string, format: string, file: Uint8Array) => {
  if (PIC_FILE_TYPES.includes(format as (typeof PIC_FILE_TYPES)[number])) {
    const fileName = `${toSha256(rawPath)}.${format}`
    const filePath = joinPath(appState.tempDataPath, fileName)
    try {
      // TODO clear temp file
      await fs.writeFile(filePath, file)
      global.anylisten.publicStaticPaths.set(fileName, filePath)
      if (import.meta.env.DEV) return `${devHost}${PUBLIC_RESOURCE_PATH}/${fileName}`
      return buildPublicPath(PUBLIC_RESOURCE_PATH, fileName)
    } catch (err) {
      console.log(err)
    }
  }
  return null
}

export const createPicPublicPath = async (rawPath: string, filePath: string) => {
  checkAllowPathError(filePath)
  const format = extname(filePath).substring(1)
  if (PIC_FILE_TYPES.includes(format as (typeof PIC_FILE_TYPES)[number])) {
    const fileName = `${toSha256(rawPath)}.${format}`
    global.anylisten.publicStaticPaths.set(fileName, filePath)
    if (import.meta.env.DEV) return `${devHost}${PUBLIC_RESOURCE_PATH}/${fileName}`
    return buildPublicPath(PUBLIC_RESOURCE_PATH, fileName)
  }
  return null
}

const readRootDir = async () => {
  return global.anylisten.config.allowPublicDir.map((p) => ({
    name: p.length == 1 ? p : p.substring(0, p.length - 1),
    isFile: false,
  }))
}
const readDir = async (filePath: string, isDirOnly = false, fileFilter: string[] = []): Promise<AnyListen.FileSystem.File[]> => {
  checkAllowPathError(filePath)
  return fs.readdir(filePath, { withFileTypes: true }).then((files) => {
    let result = files.map((file) => {
      return {
        name: file.name,
        isFile: file.isFile(),
      }
    })
    if (isDirOnly) result = result.filter((file) => !file.isFile)
    else if (fileFilter.length) {
      fileFilter = fileFilter.filter((n) => n.trim())
      result = result.filter((file) => !file.isFile || fileFilter.includes(extname(file.name).substring(1)))
    }
    return result
  })
}

const rename = async (filePath: string, newPath: string) => {
  checkAllowPathError(filePath)
  checkAllowPathError(newPath)
  await fs.rename(filePath, newPath)
}

export const fileSystemAction = async <T extends keyof AnyListen.FileSystem.Actions>(
  action: AnyListen.FileSystem.Actions[T][0]
): Promise<AnyListen.FileSystem.Actions[T][1]> => {
  switch (action.action) {
    case 'read_root_dir':
      return readRootDir()
    case 'read_dir':
      return readDir(action.data.path, action.data.isDirOnly, action.data.fileFilter)
    case 'rename':
      await rename(action.data.path, action.data.newPath)
    // default:
    //   break
  }
}
