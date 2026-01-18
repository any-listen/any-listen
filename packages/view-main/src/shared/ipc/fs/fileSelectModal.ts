import { showFileExplorerModal } from '@/components/material/fileExplorerModal'
import { readDir, readRootDir } from './fs'

export const showFileSelectModal: AnyListen.IPC.ServerIPC['showOpenDialog'] = async (options) => {
  const filters = options.filters?.map((f) => f.extensions).flat()
  const openDir = options.properties?.includes('openDirectory')
  return showFileExplorerModal({
    title: options.title,
    defaultPath: options.defaultPath,
    filters,
    openFile: options.properties?.includes('openFile'),
    openDir,
    multi: options.properties?.includes('multiSelections'),
    onReadRootDir: async (refresh) => {
      return readRootDir(refresh)
    },
    onReadDir: async (path, refresh) => {
      return readDir(path, filters, openDir)
    },
  })
}
