import { showFileExplorerModal, showFileSaveModal as showFileSaveModalApi } from '@/components/material/fileExplorerModal'

import { createDir, readDir, readRootDir } from './fs'

export const showFileSelectModal = async (
  options: AnyListen.OpenDialogOptions,
  key?: string
): Promise<AnyListen.OpenDialogResult> => {
  const filters = options.filters?.map((f) => f.extensions).flat()
  const openDir = options.properties?.includes('openDirectory')
  return showFileExplorerModal({
    key,
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

export const showFileSaveModal = async (
  options: AnyListen.SaveDialogOptions,
  key?: string
): Promise<AnyListen.SaveDialogResult> => {
  const filters = options.filters?.map((f) => f.extensions).flat()
  return showFileSaveModalApi({
    key,
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
