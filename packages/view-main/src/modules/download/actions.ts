import { LIST_IDS } from '@any-listen/common/constants'

import { showNotify } from '@/components/apis/notify'
import { showFileExplorerModal } from '@/components/material/fileExplorerModal'
import { playList, addPlayLaterMusic } from '@/modules/player/store/actions'
import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'
import { i18n } from '@/plugins/i18n'
import { push } from '@/plugins/routes'
import { showOpenDialog } from '@/shared/ipc/app'
import { openDirInExplorer } from '@/shared/ipc/app'
import {
  downloadMusic as submitDownload,
  startDownloadTasks,
  pauseDownloadTasks,
  removeDownloadTasks,
  getDownloadMusicInfos,
} from '@/shared/ipc/download'
import { readDir } from '@/shared/ipc/fs/fs'
import { readRootDir } from '@/shared/ipc/fs/fs'

export const selectDownloadDirectory = async (): Promise<string | undefined> => {
  try {
    if (import.meta.env.VITE_IS_WEB && !(await readRootDir(true)).length) {
      showNotify(i18n.t('download.no_allowed_directory'), 6)
      return
    }
    const result = await showOpenDialog({
      title: i18n.t('download.select_directory'),
      defaultPath: settingState.setting['download.savePath'] || undefined,
      properties: ['openDirectory', 'createDirectory'],
    })
    if (result.canceled || !result.filePaths.length) return
    const directory = result.filePaths[0]
    await updateSetting({ 'download.savePath': directory })
    return directory
  } catch (err) {
    showNotify(i18n.t('download.submit_failed', { error: err instanceof Error ? err.message : String(err) }), 6, true)
  }
}

export const downloadMusic = async (musicInfos: AnyListen.Music.MusicInfo[], options: AnyListen.Download.SubmitOptions = {}) => {
  const musics = musicInfos.filter((music): music is AnyListen.Music.MusicInfoOnline => !music.isLocal)
  if (!musics.length || !settingState.setting['download.enable']) return
  try {
    if (!settingState.setting['download.savePath'] && !(await selectDownloadDirectory())) return
    const result = await submitDownload(musics, options)
    if (result.skipped.length) showNotify(result.skipped.map((item) => item.reason).join('\n'), 6)
    await push('/download')
  } catch (err) {
    showNotify(i18n.t('download.submit_failed', { error: err instanceof Error ? err.message : String(err) }), 6, true)
  }
}

export const runDownloadAction = async (action: () => Promise<unknown>) => {
  try {
    await action()
  } catch (err) {
    showNotify(i18n.t('download.operation_failed', { error: err instanceof Error ? err.message : String(err) }), 6, true)
  }
}
export const startDownloads = (ids: string[]) => runDownloadAction(() => startDownloadTasks(ids))
export const pauseDownloads = (ids: string[]) => runDownloadAction(() => pauseDownloadTasks(ids))
export const removeDownloads = (ids: string[]) => runDownloadAction(() => removeDownloadTasks(ids))
export const playDownloads = (ids: string[], index = 0) =>
  runDownloadAction(async () => {
    const musics = await getDownloadMusicInfos(ids)
    await playList(LIST_IDS.DOWNLOAD, musics, index)
  })
export const playDownloadsLater = (ids: string[]) =>
  runDownloadAction(async () => {
    await addPlayLaterMusic(await getDownloadMusicInfos(ids), LIST_IDS.DOWNLOAD)
  })
const openDownloadLocation = (directory: string, filePath = directory) =>
  runDownloadAction(async () => {
    if (!import.meta.env.VITE_IS_WEB) {
      await openDirInExplorer(filePath)
      return
    }
    await showFileExplorerModal({
      title: i18n.t('download.locate'),
      defaultPath: directory,
      openFile: true,
      onReadRootDir: readRootDir,
      onReadDir: (path) => readDir(path),
    })
  })
export const locateDownloadDirectory = (directory: string) => openDownloadLocation(directory)
export const locateDownload = (item: AnyListen.Download.ListItem) =>
  openDownloadLocation(item.metadata.filePath.replace(/[\\/][^\\/]+$/, ''), item.metadata.filePath)
