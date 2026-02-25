import os from 'node:os'
import path from 'node:path'

import { NATIVE_VERSION } from '@any-listen/common/constants'
import {
  basename,
  checkAndCreateDir,
  checkFile,
  getNativeName,
  removeFileIgnoreError,
  removePath,
  renamePath,
} from '@any-listen/nodejs'
import { simpleDownload } from '@any-listen/nodejs/download'

const nativeName = getNativeName()
const nativeLibPath = path.join(__dirname, `../native/${nativeName}`)
const tempDir = path.join(os.tmpdir(), `any_listen_native_lib`)

const downloadNativeLib = async (filePath: string) => {
  if (await checkFile(filePath)) return
  const fileNmae = basename(filePath)
  const url = `https://github.com/any-listen/any-listen-web-server-native-lib/releases/download/v${NATIVE_VERSION}/${fileNmae}`
  const tempFilePath = `${filePath}.tmp`
  await removeFileIgnoreError(tempFilePath).catch(() => {})
  console.log('\nDownloading native lib from:', url)
  console.log('Save to:', filePath)
  console.log('\nPlease wait, it may take a while')
  console.log('If the download is slow, please try manually download it from the url')
  let preProgress = 0
  await simpleDownload(url, tempFilePath, {
    onProgress: (progress) => {
      if (progress.progress == 100) {
        console.log(`Download progress: ${progress.progress}%`)
      } else {
        const curP = Math.trunc(progress.progress / 10)
        if (curP != preProgress) {
          console.log(`Download progress: ${progress.progress}% - ${progress.speed}/s`)
          preProgress = curP
        }
      }
    },
  })
  await renamePath(tempFilePath, filePath)
}

const unpackNativeLib = async (filePath: string) => {
  const { unpack } = await import('@any-listen/nodejs/tar')
  await checkAndCreateDir(nativeLibPath)
  await unpack(filePath, nativeLibPath).catch(async () => {
    await removePath(nativeLibPath)
  })
}

export const envPrepare = async () => {
  if (await checkFile(nativeLibPath)) return
  console.log('Native lib not found, will download it')

  await checkAndCreateDir(tempDir)
  const filePath = path.join(tempDir, `${nativeName.replace(/_\d+$/, '')}.tar.gz`)
  await downloadNativeLib(filePath)
  await unpackNativeLib(filePath)
  console.log('Native lib prepare done')
}
