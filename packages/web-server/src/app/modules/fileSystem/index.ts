import { appState } from '@/app/app/state'
import { MEDIA_FILE_TYPES, PIC_FILE_TYPES } from '@any-listen/common/constants'
import { extname, joinPath, toSha256 } from '@any-listen/nodejs'
import fs from 'node:fs/promises'
import path from 'node:path'

const devHost = 'http://localhost:9500/'

export const checkAllowPath = (filePath: string) => {
  if (!filePath.endsWith(path.sep)) filePath += path.sep
  return global.anylisten.config.allowPublicDir.some((p) => filePath.startsWith(p))
}

export const createMediaPublicPath = async (filePath: string) => {
  const extName = extname(filePath).substring(1) as (typeof MEDIA_FILE_TYPES)[number]
  if (MEDIA_FILE_TYPES.includes(extName)) {
    const fileName = `${toSha256(filePath)}.${extName}`
    global.anylisten.publicStaticPaths.set(fileName, filePath)
    if (import.meta.env.DEV) return `${devHost}public/medias/${fileName}`
    return `public/medias/${fileName}`
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
      if (import.meta.env.DEV) return `${devHost}public/medias/${fileName}`
      return `public/medias/${fileName}`
    } catch (err) {
      console.log(err)
    }
  }
  return null
}

export const createPicPublicPath = async (rawPath: string, filePath: string) => {
  if (!checkAllowPath(filePath)) throw new Error(`Not allow path: ${filePath}`)
  const format = extname(filePath).substring(1)
  if (PIC_FILE_TYPES.includes(format as (typeof PIC_FILE_TYPES)[number])) {
    const fileName = `${toSha256(rawPath)}.${format}`
    global.anylisten.publicStaticPaths.set(fileName, filePath)
    if (import.meta.env.DEV) return `${devHost}public/medias/${fileName}`
    return `public/medias/${fileName}`
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
  if (!checkAllowPath(filePath)) throw new Error(`Not allow path: ${filePath}`)
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
  if (!checkAllowPath(filePath)) throw new Error(`Not allow path: ${filePath}`)
  if (!checkAllowPath(newPath)) throw new Error(`Not allow path: ${newPath}`)
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
