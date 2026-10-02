import { ipc } from '../ipc'

export const downloadMusic: AnyListen.IPC.ServerIPC['downloadMusic'] = async (musics, options) =>
  ipc.downloadMusic(musics, options)

export const getDownloadSnapshot: AnyListen.IPC.ServerIPC['getDownloadSnapshot'] = async () => ipc.getDownloadSnapshot()
export const startDownloadTasks: AnyListen.IPC.ServerIPC['startDownloadTasks'] = async (ids) => ipc.startDownloadTasks(ids)
export const pauseDownloadTasks: AnyListen.IPC.ServerIPC['pauseDownloadTasks'] = async (ids) => ipc.pauseDownloadTasks(ids)
export const removeDownloadTasks: AnyListen.IPC.ServerIPC['removeDownloadTasks'] = async (ids) => ipc.removeDownloadTasks(ids)
export const getDownloadMusicInfos: AnyListen.IPC.ServerIPC['getDownloadMusicInfos'] = async (ids) =>
  ipc.getDownloadMusicInfos(ids)
