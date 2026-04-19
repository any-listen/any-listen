import { EXTENSION } from '@any-listen/common/constants'

export const constants: AnyListen_API.Constants = {
  storageDir: EXTENSION.storageDirPrefix,
  extensionDir: EXTENSION.extensionDirPrefix,
} as const
