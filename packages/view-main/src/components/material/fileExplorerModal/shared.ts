export interface File extends AnyListen.FileSystem.File {
  id: string
  musicFile: boolean
}
export interface FileExplorerOptions {
  title: string
  defaultPath?: string
  filters?: string[]
  openFile?: boolean
  openDir?: boolean
  multi?: boolean
  onReadRootDir: (refresh?: boolean) => Promise<AnyListen.FileSystem.File[]>
  onReadDir: (path: string, refresh?: boolean) => Promise<AnyListen.FileSystem.File[]>
}

// const sep = appState.os == 'windows' ? '\\' : '/'
const sepRxp = /\\|\//
export const getSep = (path: string) => {
  return sepRxp.exec(path)?.[0] ?? '\\'
}

export const formatPath = (path: string) => {
  const sep = getSep(path)
  path = path.replace(/\\|\//g, sep)
  while (path.length > 1 && path.endsWith(sep)) {
    path = path.substring(0, path.length - 1)
  }
  return path
}
export const getParentDir = (dir: string, rootDirs: AnyListen.FileSystem.File[]) => {
  const sep = getSep(dir)
  const index = formatPath(dir).lastIndexOf(sep)
  if (index === -1 || dir == sep) return ''
  let parent = dir.substring(0, index)
  let parentDir = parent + sep
  if (rootDirs.some((d) => parentDir.startsWith(d.name))) {
    return parent || sep
  }
  return ''
}
export const buildFilesPath = (curDir: string, files: AnyListen.FileSystem.File[]) => {
  if (!curDir) return files.map((f) => f.name)
  const sep = getSep(curDir)
  if (curDir.endsWith(sep)) curDir = curDir.substring(0, curDir.length - 1)
  return files.map((f) => curDir + sep + f.name)
}
