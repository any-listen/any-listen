import { showFileExplorerModal, showFileSaveModal as showFileSaveModalApi } from '@/components/material/fileExplorerModal'

import { createDir, readDir, readRootDir } from './fs'

export const showFileSelectModal: AnyListen.IPC.ServerIPC['showOpenDialog'] = async (options) => {
  const filters = options.filters?.map((f) => f.extensions).flat()
  const openDir = options.properties?.includes('openDirectory')
  return showFileExplorerModal({
    modalTitle: options.modalTitle,
    title: options.title,
    defaultPath: options.defaultPath,
    filters,
    openFile: options.properties?.includes('openFile'),
    openDir,
    multi: options.properties?.includes('multiSelections'),
    confirmText: options.buttonLabel,
    onReadRootDir: async (refresh) => {
      return readRootDir(refresh)
    },
    onReadDir: async (path, refresh) => {
      return readDir(path, filters, openDir)
    },
  })
}

export const showFileSaveModal: AnyListen.IPC.ServerIPC['showSaveDialog'] = async (options) => {
  const filters = options.filters?.map((f) => f.extensions).flat()
  return showFileSaveModalApi({
    modalTitle: options.modalTitle,
    title: options.title,
    defaultPath: options.defaultPath,
    defaultFileName: options.defaultFileName,
    filters,
    confirmText: options.buttonLabel,
    selectFolder: options.selectFolder,
    onReadRootDir: async (refresh) => {
      return readRootDir(refresh)
    },
    onReadDir: async (path, refresh) => {
      return readDir(path, filters, !!options.selectFolder)
    },
    onCreateDir: async (path, name) => {
      return createDir(path, name)
    },
  })
}
