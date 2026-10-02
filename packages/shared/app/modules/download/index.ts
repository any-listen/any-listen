import { logger } from '../../common'
import { createDownloadService, type Options } from './service'

let service: ReturnType<typeof createDownloadService>
const listeners = new Set<(action: AnyListen.Download.ListAction) => void | Promise<void>>()

export const initDownload = async (options: Omit<Options, 'onAction' | 'onError'>) => {
  service = createDownloadService({
    ...options,
    onError: (err) => logger.error('Download error', err),
    onAction(action) {
      for (const listener of listeners) {
        void Promise.resolve()
          .then(() => listener(action))
          .catch((err: unknown) => {
            logger.error('Download event error', err)
          })
      }
    },
  })
  await service.init()
}

export const onDownloadListAction = (listener: (action: AnyListen.Download.ListAction) => void | Promise<void>) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export const getDownloadSnapshot = async () => service.getDownloadSnapshot()
export const downloadMusic = async (musicInfos: AnyListen.Music.MusicInfo[], options?: AnyListen.Download.SubmitOptions) =>
  service.downloadMusic(musicInfos, options)
export const startDownloadTasks = async (ids: string[]) => service.startDownloadTasks(ids)
export const pauseDownloadTasks = async (ids: string[]) => service.pauseDownloadTasks(ids)
export const removeDownloadTasks = async (ids: string[]) => service.removeDownloadTasks(ids)
export const getDownloadMusicInfos = async (ids: string[]) => service.getDownloadMusicInfos(ids)
export const downloadSettingsChanged = () => service.settingsChanged()
