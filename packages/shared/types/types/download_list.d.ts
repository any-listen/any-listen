import type { Message } from '@any-listen/i18n'

// interface DownloadList {

// }

declare global {
  namespace AnyListen {
    namespace DBService {
      interface DownloadMusicInfo {
        id: string
        isComplate: 0 | 1
        status: Download.DownloadTaskStatus
        statusText: string
        progress_downloaded: number
        progress_total: number
        url: string | null
        quality: string
        ext: Download.FileExt
        fileName: string
        filePath: string
        taskMeta: string
        musicInfo: string
        position: number
      }
    }

    namespace Download {
      type DownloadTaskStatus = 'run' | 'waiting' | 'pause' | 'error' | 'completed'

      type FileExt = Music.FileType | 'ape'

      type Settings = Pick<
        AppSetting,
        | 'download.skipExistFile'
        | 'download.isDownloadLrc'
        | 'download.isDownloadLxLrc'
        | 'download.isDownloadTLrc'
        | 'download.isDownloadRLrc'
        | 'download.lrcFormat'
      >
      interface SubmitOptions {
        quality?: string
        listName?: string
      }
      interface TaskMeta {
        requestedQuality: string
        settings: Settings
      }
      interface Snapshot {
        revision: number
        list: ListItem[]
      }
      type ListAction = { revision: number } & (
        | { action: 'add'; data: ListItem[]; position: AddMusicLocationType }
        | { action: 'update'; data: ListItem[] }
        | { action: 'remove'; data: string[] }
        | { action: 'clear' }
      )

      interface SubmitResult {
        taskIds: string[]
        skipped: Array<{ musicId: string; reason: string }>
      }

      interface ProgressInfo {
        progress: number
        speed: string
        downloaded: number
        total: number
        writeQueue: number
      }

      interface DownloadTaskActionBase<A> {
        action: A
      }
      interface DownloadTaskActionData<A, D> extends DownloadTaskActionBase<A> {
        data: D
      }
      type DownloadTaskAction<A, D = undefined> = D extends undefined ? DownloadTaskActionBase<A> : DownloadTaskActionData<A, D>

      type DownloadTaskActions =
        | DownloadTaskAction<'start'>
        | DownloadTaskAction<'complete'>
        | DownloadTaskAction<'refreshUrl'>
        | DownloadTaskAction<'statusText', string>
        | DownloadTaskAction<'progress', ProgressInfo>
        | DownloadTaskAction<
            'error',
            {
              error?: keyof Message
              message?: string
            }
          >

      interface ListItem {
        id: string
        isComplate: boolean
        status: DownloadTaskStatus
        statusText: string
        downloaded: number
        total: number
        writeQueue: number
        progress: number
        speed: string
        metadata: {
          task?: TaskMeta
          musicInfo: Music.MusicInfoOnline
          url: string | null
          quality: string
          ext: FileExt
          fileName: string
          filePath: string
        }
      }

      interface saveDownloadMusicInfo {
        list: ListItem[]
        addMusicLocationType: AddMusicLocationType
      }
    }
  }
}
