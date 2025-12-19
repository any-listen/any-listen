type WithUndefined<T extends readonly unknown[]> = {
  [K in keyof T]: T[K] | undefined
}

declare namespace AnyListen {
  namespace IPCExtension {
    interface EventExtensionLoadError {
      id: string
      message: string
    }
    interface EventExtensionEnabled {
      id: string
      enabled: boolean
    }
    interface EventExtensionLoaded {
      id: string
      loadTimestamp: number
    }
    interface EventExtensionSettingUpdated {
      id: string
      keys: string[]
      setting: Record<string, unknown>
    }
    type EventExtension =
      | IPCAction<'loadListStart'>
      | IPCAction<'loadListEnd'>
      | IPCAction<'starting'>
      | IPCAction<'started'>
      | IPCAction<'crash', string>
      | IPCAction<'error', string>
      | IPCAction<'loading', string>
      | IPCAction<'enabled', EventExtensionEnabled>
      | IPCAction<'loadError', EventExtensionLoadError>
      | IPCAction<'loaded', EventExtensionLoaded>
      | IPCAction<'stoping', string>
      | IPCAction<'stopped', string>
      | IPCAction<'listAdd', Extension.Extension>
      | IPCAction<'listRemove', string>
      | IPCAction<'listUpdate', Extension.Extension>
      | IPCAction<'listSet', Extension.Extension[]>
      | IPCAction<'logOutput', LogInfo>
      | IPCAction<'resourceUpdated', Extension.ResourceList>
      | IPCAction<'extenstionSettingUpdated', EventExtensionSettingUpdated>

    interface CommonParams {
      extensionId: string
      source: string
    }
    interface CommonListParams extends CommonParams {
      page: number
      limit: number
    }
    interface LyricSearchParams extends CommonParams {
      name: string
      artist?: string
      interval?: number
    }
    interface LyricSearchResult {
      id: string
      name: string
      artist?: string
      interval?: number
      lyric?: string
    }
    interface LyricDetailParams extends CommonParams {
      id: string
    }
    interface PicSearchParams extends CommonParams {
      name: string
      artist?: string
    }
    interface SearchParams extends CommonListParams {
      name: string
      artist?: string
    }
    interface ListDetailParams extends CommonListParams {
      id: string
    }
    interface SonglistListParams extends CommonListParams {
      sort: string
      tag: string
    }
    interface ListCommonResult<T> {
      list: T[]
      total: number
      page: number
      limit: number
      // source: string
    }
    interface MusicCommonParams extends CommonParams {
      musicInfo: Music.MusicInfoOnline
    }
    interface MusicUrlParams extends MusicCommonParams {
      quality?: string
      type?: Music.FileType
    }
    interface MusicUrlInfo {
      url: string
      quality: string
    }

    type BuildListProviderActionCommonParams<D> = CommonParams & {
      data: D
    }
    type ListProviderActionParams = BuildListProviderActionCommonParams<List.RemoteListInfo>
    interface ListProviderAction {
      createList: (params: ListProviderActionParams) => Promise<void>
      updateList: (params: ListProviderActionParams) => Promise<void>
      deleteList: (params: ListProviderActionParams) => Promise<void>
      removeListMusics: (
        params: BuildListProviderActionCommonParams<{
          list: List.RemoteListInfo
          musics: Music.MusicInfoOnline[]
        }>
      ) => Promise<void>
      /** 获取列表中的音乐文件 ID */
      getListMusicIds: (params: ListProviderActionParams) => Promise<string[]>
      /** 通过音乐文件 ID 获取音乐信息 */
      getMusicInfoByIds: (
        params: BuildListProviderActionCommonParams<{
          list: List.RemoteListInfo
          ids: string[]
        }>
      ) => Promise<{
        musics: Music.MusicInfoOnline[]
        waitingParseMetadata?: boolean
      }>
      /** 解析音乐信息元数据 */
      parseMusicInfoMetadata: (
        params: BuildListProviderActionCommonParams<Music.MusicInfoOnline>
      ) => Promise<Music.MusicInfoOnline>
    }
    interface ResourceAction {
      // tipSearch: (params: CommonParams) => Promise<string[]>
      // hotSearch: (params: CommonParams) => Promise<string[]>
      musicSearch: (params: SearchParams) => Promise<ListCommonResult<Music.MusicInfoOnline>>
      musicPic: (params: MusicCommonParams) => Promise<string>
      musicUrl: (params: MusicUrlParams) => Promise<MusicUrlInfo>
      musicLyric: (params: MusicCommonParams) => Promise<Music.LyricInfo>
      musicPicSearch: (params: PicSearchParams) => Promise<string[]>
      lyricSearch: (params: LyricSearchParams) => Promise<LyricSearchResult[]>
      lyricDetail: (params: LyricDetailParams) => Promise<Music.LyricInfo>
      // songlistSearch: (params: SearchParams) => Promise<ListCommonResult<Resource.SongListItem>>
      // songlistSorts: (params: CommonParams) => Promise<Resource.TagItem[]>
      // songlistTags: (params: CommonParams) => Promise<Resource.TagGroupItem[]>
      // songlist: (params: SonglistListParams) => Promise<ListCommonResult<Resource.SongListItem>>
      // songlistDetail: (params: ListDetailParams) => Promise<ListCommonResult<Music.MusicInfoOnline>>
      // leaderboard: (params: CommonParams) => Promise<Resource.TagGroupItem[]>
      // leaderboardDate: (params: SonglistListParams) => Promise<ListCommonResult<Music.MusicInfoOnline>>
      // leaderboardDetail: (params: SonglistListParams) => Promise<ListCommonResult<Music.MusicInfoOnline>>
    }
    // type ResourceAction = IPCActionFunc<'tipSearch', string, string[]>
    // | IPCActionFunc<'hotSearch', string, string[]>
    // | IPCActionFunc<'musicSearch', SearchParams, ListCommonResult<AnyListen.Music.MusicInfoOnline>>
    // | IPCActionFunc<'musicPic', MusicCommonParams, string>
    // | IPCActionFunc<'musicUrl', MusicCommonParams, string>
    // | IPCActionFunc<'lyricSearch', MusicCommonParams, AnyListen.Music.LyricInfo[]>
    // | IPCActionFunc<'lyric', MusicCommonParams, AnyListen.Music.LyricInfo>
    // | IPCActionFunc<'songListSearch', SearchParams, ListCommonResult<AnyListen.Resource.SongListItem>>
    // | IPCActionFunc<'songListSorts', string, AnyListen.Resource.TagItem[]>
    // | IPCActionFunc<'songListTags', string, AnyListen.Resource.TagGroupItem[]>
    // | IPCActionFunc<'songList', SonglistListParams, ListCommonResult<AnyListen.Resource.SongListItem>>
    // | IPCActionFunc<'songListDetail', ListDetailParams, ListCommonResult<AnyListen.Music.MusicInfoOnline>>
    // | IPCActionFunc<'leaderboard', string, AnyListen.Resource.TagGroupItem[]>
    // | IPCActionFunc<'leaderboardDate', SonglistListParams, ListCommonResult<AnyListen.Music.MusicInfoOnline>>
    // | IPCActionFunc<'leaderboardDetail', SonglistListParams, ListCommonResult<AnyListen.Music.MusicInfoOnline>>
    // | IPCActionFunc<'albumSearch', SearchParams, ListCommonResult<AnyListen.Resource.SongListItem>>
    // | IPCActionFunc<'albumSinger', SonglistListParams, ListCommonResult<AnyListen.Resource.SongListItem>>
    // | IPCActionFunc<'albumDetail', ListDetailParams, ListCommonResult<AnyListen.Music.MusicInfoOnline>>

    interface OnlineListFilterOptions {
      page: number
      limit: number
    }
    interface OnlineListItem {
      id: Extension.Manifest['id']
      name: Extension.Manifest['name']
      description: Extension.Manifest['description']
      version: Extension.Manifest['version']
      author: Extension.Manifest['author']
      grant: Extension.Manifest['grant']
      license: Extension.Manifest['license']
      target_engine: Extension.Manifest['target_engine']
      categories: Extension.Manifest['categories']
      tags: Extension.Manifest['tags']
      // update_time: Extension.Manifest['update_time']
      homepage: Extension.Manifest['homepage']
      icon: Extension.Manifest['icon']
      publicKey: Extension.Manifest['publicKey']
      download_url: string
    }
    interface OnlineDetail {
      id: Extension.Manifest['id']
      name: Extension.Manifest['name']
      description: Extension.Manifest['description']
      icon: Extension.Manifest['icon']
      version: Extension.Manifest['version']
      author: Extension.Manifest['author']
      homepage: Extension.Manifest['homepage']
      license: Extension.Manifest['license']
      categories: Extension.Manifest['categories']
      tags: Extension.Manifest['tags']
      grant: Extension.Manifest['grant']
      contributes: Extension.Manifest['contributes']
      publicKey: Extension.Manifest['publicKey']
      download_url: string
    }

    interface OnlineListResult {
      limit: number
      page: number
      total: number
      list: OnlineListItem[]
    }
    type OnlineTagResult = Array<{ id: string; name: string }>
    type OnlineCategorieResult = Array<{ id: string; name: string }>
    interface LastLog {
      id: string
      name: string
      logs: string
    }
    type ServerActions = WarpPromiseRecord<{
      getExtensionErrorMessage: () => string | null
      getExtensionList: () => Extension.Extension[]
      getOnlineExtensionList: (options: OnlineListFilterOptions) => OnlineListResult
      getOnlineExtensionDetail: (id: string) => OnlineDetail | null
      getOnlineTags: () => OnlineTagResult
      getOnlineCategories: () => OnlineCategorieResult
      resetOnlineData: () => void
      downloadAndParseExtension: (url: string, manifest?: Extension.Manifest) => Extension.Extension
      installExtension: (tempExtension: Extension.Extension) => Extension.Extension
      updateExtension: (tempExtension: Extension.Extension) => Extension.Extension
      startExtension: (id: string) => void
      enableExtension: (id: string) => void
      disableExtension: (id: string) => void
      restartExtension: (id: string) => void
      uninstallExtension: (id: string) => void
      restartExtensionHost: () => void
      getResourceList: () => Extension.ResourceList
      getExtensionLastLogs: (id?: string) => LastLog[]
      clearExtensionLogs: (id?: string) => void
      getAllExtensionSettings: () => Promise<Extension.ExtensionSetting[]>
      updateExtensionSettings: (extId: string, config: Record<string, any>) => Promise<void>
      resourceAction: <T extends keyof ResourceAction>(
        action: T,
        params: Parameters<ResourceAction[T]>[0]
      ) => Promise<Awaited<ReturnType<ResourceAction[T]>>>
      listProviderAction: <T extends keyof ListProviderAction>(
        action: T,
        params: Parameters<ListProviderAction[T]>[0]
      ) => Promise<Awaited<ReturnType<ListProviderAction[T]>>>
    }>
    type ServerIPCActions<Socket = undefined> = IPC.WarpIPCHandlerActions<Socket, ServerActions>

    type ClientActions = WarpPromiseRecord<{
      extensionEvent: (action: EventExtension) => void
    }>
    type ClientIPCActions<Socket = undefined> = IPC.WarpIPCHandlerActions<Socket, ClientActions>

    // main process funcs, exposed to extension worker
    interface MainIPCActions {
      onExtensionEvent: (action: EventExtension) => Promise<void>
      // getConnectedClients: () => Promise<string[]>
      // showMessage: (message: string) => Promise<string[]>
      createProxyUrl: (url: string, reqOptions: unknown, enabledCache?: boolean) => Promise<string>
      checkProxyCache: (url: string) => Promise<boolean>
      writeProxyCache: (fileName: string, data: Uint8Array) => Promise<string>

      getAllUserLists: () => Promise<List.MyAllList>
      getListMusics: (listId: string) => Promise<Music.MusicInfo[]>
      musicListAction: (action: IPCList.ActionList) => Promise<void>
      createExtensionIconPublicPath: (filePath: string) => Promise<string>
      removeExtensionIconPublicPath: (filePath: string) => Promise<void>

      getPlayInfo: () => Promise<IPCPlayer.PlayInfo>
      playListAction: (action: IPCPlayer.PlayListAction) => Promise<void>
      playHistoryListAction: (action: IPCPlayer.PlayHistoryListAction) => Promise<void>
      playerAction: (action: IPCPlayer.ActionPlayer) => Promise<void>

      /** 显示消息弹窗 */
      showMessageBox: (key: string, extensionId: string, options: IPCCommon.MessageDialogOptions) => Promise<number>
      showInputBox: (
        key: string,
        extensionId: string,
        options: Omit<IPCCommon.InputDialogOptions, 'validateInput'>,
        validateInput: IPCCommon.InputDialogOptions['validateInput']
      ) => Promise<string>
      showOpenBox: (key: string, extensionId: string, options: IPCCommon.OpenDialogOptions) => Promise<unknown>
      showSaveBox: (key: string, extensionId: string, options: IPCCommon.SaveDialogOptions) => Promise<unknown>
      closeMessageBox: (key: string) => Promise<void>
    }

    interface RequestOptions {
      method?:
        | 'GET'
        | 'HEAD'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'OPTIONS'
        | 'PATCH'
        | 'PROPFIND'
        | 'COPY'
        | 'MOVE'
        | 'MKCOL'
        | 'PROPPATCH'
        | 'QUOTA'
      query?: Record<string, string | number | null | undefined | boolean>
      headers?: Record<string, string | string[]>
      timeout?: number
      maxRedirect?: number
      signal?: AbortController['signal']
      json?: Record<string, unknown>
      form?: Record<string, string | number | null | undefined | boolean>
      binary?: Uint8Array
      text?: string
      formdata?: Record<string, string | Uint8Array>
      xml?: string
      needRaw?: boolean
    }
    interface Response<Resp> {
      statusCode?: number
      // statusMessage?: string
      headers: Record<string, string | string[] | undefined>
      raw: Uint8Array
      body: Resp
    }
    interface RespCallback<Resp> {
      (error: null, response: Response<Resp>): void
      (error: Error, response: null): void
    }

    // extension worker funcs, exposed to extension vm
    interface PreloadIPCActions {
      showMessageBox: (key: string, options: IPCCommon.MessageDialogOptions) => Promise<number>
      showInputBox: (key: string, options: IPCCommon.InputDialogOptions) => Promise<string | undefined>
      showOpenBox: (key: string, options: IPCCommon.OpenDialogOptions) => Promise<unknown>
      showSaveBox: (key: string, options: IPCCommon.SaveDialogOptions) => Promise<unknown>
      closeMessageBox: (key: string) => void

      request: <Resp = unknown>(url: string, options?: RequestOptions) => Promise<Response<Resp>>
      getItems: (keys: string[]) => Promise<string[]>
      setItems: <T extends Array<[string, string]>>(datas: T) => Promise<void>
      removeItems: (keys: string[]) => Promise<void>
      clearItems: () => Promise<void>
      getConfigs: <T extends unknown[] = []>(keys: string[]) => Promise<WithUndefined<T>>
      setConfigs: (datas: Array<[string, string]>) => Promise<void>
      // getConnectedClients: () => Promise<string[]>

      getPlayInfo: () => Promise<IPCPlayer.PlayInfo>
      playListAction: (action: IPCPlayer.PlayListAction) => Promise<void>
      playerAction: (action: IPCPlayer.ActionPlayer) => Promise<void>
      playHistoryListAction: (action: IPCPlayer.PlayHistoryListAction) => Promise<void>

      getAllUserLists: () => Promise<List.MyAllList>
      getListMusics: (listId: string) => Promise<Music.MusicInfo[]>
      listAction: (action: IPCList.ActionList) => Promise<void>

      createProxyUrl: (url: string, options: RequestOptions, enabledCache?: boolean) => Promise<string>
      writeProxyCache: (fileName: string, data: Uint8Array) => Promise<string>
    }

    // extension vm funcs, exposed to extension worker
    interface ExtensionIPCActions {
      updateLocale: (locale: Locale) => void
      updateI18nMessage: (message: Record<string, string>) => void
      musicListAction: (action: IPCList.ActionList) => void
      playerEvent: (event: IPCPlayer.PlayerEvent) => void
      playListAction: (action: IPCPlayer.PlayListAction) => void
      playHistoryListAction: (action: IPCPlayer.PlayHistoryListAction) => void
      configurationChanged: (keys: string[], config: Record<string, any>) => void
      // clientConnectAction: (id: string, isConnected: boolean) => void
      resourceAction: <T extends keyof ResourceAction>(
        action: T,
        params: Parameters<ResourceAction[T]>[0]
      ) => Promise<Awaited<ReturnType<ResourceAction[T]>>>
      listProviderAction: <T extends keyof ListProviderAction>(
        action: T,
        params: Parameters<ListProviderAction[T]>[0]
      ) => Promise<Awaited<ReturnType<ListProviderAction[T]>>>
    }
  }
}
