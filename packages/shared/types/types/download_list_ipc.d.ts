declare namespace AnyListen {
  namespace IPCDownload {
    type ServerActions = WarpPromiseRecord<{
      downloadMusic: (musicInfos: Music.MusicInfo[], options?: Download.SubmitOptions) => Download.SubmitResult
      getDownloadSnapshot: () => Download.Snapshot
      startDownloadTasks: (ids: string[]) => void
      pauseDownloadTasks: (ids: string[]) => void
      removeDownloadTasks: (ids: string[]) => void
      getDownloadMusicInfos: (ids: string[]) => Music.MusicInfoLocal[]
    }>
    type ClientActions = WarpPromiseRecord<{
      downloadListAction: (action: Download.ListAction) => void
    }>
  }
}
