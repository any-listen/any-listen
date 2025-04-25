import { ipc } from '../ipc'

let rootDir: AnyListen.FileSystem.File[] = []

export const readRootDir = async (refresh?: boolean) => {
  if (!refresh && rootDir.length) return rootDir
  // eslint-disable-next-line require-atomic-updates
  rootDir = await ipc.fileSystemAction<'read_root_dir'>({
    action: 'read_root_dir',
  })
  return rootDir
}

export const readDir = async (path: string, fileFilter?: string[], isDirOnly?: boolean) => {
  return ipc.fileSystemAction<'read_dir'>({
    action: 'read_dir',
    data: {
      path,
      fileFilter,
      isDirOnly,
    },
  })
}

export const rename = async (path: string, newPath: string) => {
  return ipc.fileSystemAction<'rename'>({
    action: 'rename',
    data: {
      path,
      newPath,
    },
  })
}
