type WithUndefined<T extends readonly unknown[]> = {
  [K in keyof T]: T[K] | undefined
}
declare namespace AnyListen {
  interface IPCActionBase<A> {
    action: A
  }
  interface IPCActionData<A, D> extends IPCActionBase<A> {
    data: D
  }
  type IPCAction<A, D = undefined> = D extends undefined ? IPCActionBase<A> : IPCActionData<A, D>
  type AddMusicLocationType = 'top' | 'bottom'

  namespace Player {
    interface MusicInfo {
      id: string | null
      pic: string | null | undefined
      lrc: string | null
      tlrc: string | null
      rlrc: string | null
      awlrc: string | null
      rawlrc: string | null
      // url: string | null
      name: string
      singer: string
      album: string
      collect: boolean
    }

    interface PlayMusicInfo {
      /**
       * 当前信息唯一ID
       */
      itemId: string
      /**
       * 当前播放歌曲的列表 id
       */
      musicInfo: Music.MusicInfo
      /**
       * 当前播放歌曲的列表 id
       */
      listId: string
      /**
       * 是否在线列表
       */
      isOnline: boolean
      /**
       * 是否属于 “稍后播放”
       */
      playLater: boolean
      /**
       * 是否已播放
       */
      played: boolean
    }

    interface PlayInfo {
      duration: number
      index: number
      listId: string | null
      isOnline: boolean
      historyIndex: number
    }

    interface TempPlayListItem {
      /**
       * 播放列表id
       */
      listId: string
      /**
       * 歌曲信息
       */
      musicInfo: Music.MusicInfo
      /**
       * 是否添加到列表顶部
       */
      isTop?: boolean
    }

    interface SavedPlayInfo {
      time: number
      maxTime: number
      index: number
      historyIndex: number
    }
  }

  namespace Music {
    type Source = string
    type Quality = '128k' | '320k' | 'flac' | 'flac24bit' | '192k' | 'wav' | 'dobly' | 'master'
    type FileType = 'mp3' | 'flac' | 'wav' | 'm4a'

    type MusicQualityType = Partial<
      Record<
        string,
        {
          sizeStr: string | null
          [key: string]: string | null
        }
      >
    >

    interface MusicInfoMetaBase {
      musicId: string // 歌曲ID
      albumName: string // 歌曲专辑名称
      year?: number // 歌曲年份
      picUrl?: string | null // 歌曲图片链接
      createTime: number
      updateTime: number
      posTime: number
    }

    interface MusicInfoMeta_online extends MusicInfoMetaBase {
      source: Source // 源
      qualitys?: MusicQualityType
      filePath?: string
      ext?: string
      bitrateLabel?: string | null
      sizeStr?: string
      [key: string]: string | number | boolean | null | undefined | object
    }

    interface MusicInfoMeta_local extends MusicInfoMetaBase {
      filePath: string
      ext: string
      bitrateLabel: string | null
      sizeStr: string
    }

    interface MusicInfoBase<IsLocal extends boolean> {
      id: string
      name: string // 歌曲名
      singer: string // 艺术家名
      interval: string | null // 格式化后的歌曲时长，例：03:55
      isLocal: IsLocal
      meta: MusicInfoMetaBase
    }

    interface MusicInfoLocal extends MusicInfoBase<true> {
      meta: MusicInfoMeta_local
    }

    interface MusicInfoOnline extends MusicInfoBase<false> {
      meta: MusicInfoMeta_online
    }

    type MusicInfo = MusicInfoLocal | MusicInfoOnline

    interface LyricInfo {
      // 歌曲歌词
      lyric: string
      // 翻译歌词
      tlyric?: string | null
      // 罗马音歌词
      rlyric?: string | null
      // 逐字歌词
      awlyric?: string | null
      name: string
      singer: string
      interval: string | null

      rawlrcInfo?: {
        // 歌曲歌词
        lyric: string
        // 翻译歌词
        tlyric?: string | null
        // 罗马音歌词
        rlyric?: string | null
        // 逐字歌词
        awlyric?: string | null
      }
    }
  }
  namespace List {
    interface UserListInfoBaseMeta {
      playCount: number
      createTime: number
      updateTime: number
      posTime: number
      desc: string
    }
    type ParentId = string | null
    interface UserListInfoByGeneralMeta extends UserListInfoBaseMeta {}
    interface UserListInfoByLocalMeta extends UserListInfoBaseMeta {
      deviceId: string
      path: string
      includeSubDir: boolean
      enabledRemove?: boolean
    }
    interface UserListInfoByOnlineMeta extends UserListInfoBaseMeta {
      extensionId: string
      source: string
      syncId: string
      syncTime: number
      picUrl: string | null
    }
    interface UserListInfoByRemoteMeta extends UserListInfoBaseMeta {
      extensionId: string
      source: string
      syncTime: number
      [key: string]: unknown
    }

    interface UserListInfoMetas {
      general: UserListInfoByGeneralMeta
      local: UserListInfoByLocalMeta
      online: UserListInfoByOnlineMeta
      remote: UserListInfoByRemoteMeta
    }
    interface UserListInfoType<Type extends keyof UserListInfoMetas> {
      id: string
      parentId: ParentId
      name: string
      type: Type
      meta: UserListInfoMetas[Type]
    }

    type UserListType = keyof UserListInfoMetas

    type GeneralListInfo = UserListInfoType<'general'>
    type LocalListInfo = UserListInfoType<'local'>
    type OnlineListInfo = UserListInfoType<'online'>
    type RemoteListInfo = UserListInfoType<'remote'>
    type UserListInfo = GeneralListInfo | LocalListInfo | OnlineListInfo | RemoteListInfo

    interface MyDefaultListInfo extends Omit<GeneralListInfo, 'type'> {
      id: 'default'
      name: 'default'
      type: 'default'
    }

    interface MyLoveListInfo extends Omit<GeneralListInfo, 'type'> {
      id: 'love'
      name: 'love'
      type: 'default'
    }

    interface MyLastPlayListInfo extends Omit<GeneralListInfo, 'type'> {
      id: 'last_played'
      name: 'last_played'
      type: 'default'
    }

    type MyListInfo = MyDefaultListInfo | MyLoveListInfo | MyLastPlayListInfo | UserListInfo

    interface MyAllList {
      defaultList: MyDefaultListInfo
      loveList: MyLoveListInfo
      lastPlayList: MyLastPlayListInfo
      userList: UserListInfo[]
    }

    type SearchHistoryList = string[]
    type ListPositionInfo = Record<string, number>
    type ListUpdateInfo = Record<
      string,
      {
        updateTime: number
        isAutoUpdate: boolean
      }
    >

    // type ListSaveType = 'myList' | 'downloadList'
    // type ListSaveInfo = {
    //   type: 'myList'
    //   data: Partial<MyAllList>
    // } | {
    //   type: 'downloadList'
    //   data: AnyListen.Download.ListItem[]
    // }

    // interface ListActionAdd {
    //   position: number
    //   listInfos: UserListInfo[]
    // }
    // type ListActionRemove = string[]
    // type ListActionUpdate = UserListInfo[]
    // interface ListActionUpdatePosition {
    //   /**
    //    * 列表id
    //    */
    //   ids: string[]
    //   /**
    //    * 位置
    //    */
    //   position: number
    // }

    // interface ListActionMusicAdd {
    //   id: string
    //   musicInfos: AnyListen.Music.MusicInfo[]
    //   addMusicLocationType: AnyListen.AddMusicLocationType
    // }

    // interface ListActionMusicMove {
    //   fromId: string
    //   toId: string
    //   musicInfos: AnyListen.Music.MusicInfo[]
    //   addMusicLocationType: AnyListen.AddMusicLocationType
    // }

    // interface ListActionCheckMusicExistList {
    //   listId: string
    //   musicInfoId: string
    // }

    // interface ListActionMusicRemove {
    //   listId: string
    //   ids: string[]
    // }

    // type ListActionMusicUpdate = Array<{
    //   id: string
    //   musicInfo: AnyListen.Music.MusicInfo
    // }>

    // interface ListActionMusicUpdatePosition {
    //   listId: string
    //   position: number
    //   ids: string[]
    // }

    // interface ListActionMusicOverwrite {
    //   listId: string
    //   musicInfos: AnyListen.Music.MusicInfo[]
    // }

    // type ListActionMusicClear = string[]

    interface MyDefaultListInfoFull extends MyDefaultListInfo {
      list: Music.MusicInfo[]
    }
    interface MyLoveListInfoFull extends MyLoveListInfo {
      list: Music.MusicInfo[]
    }
    interface MyLastPlayListFull extends MyLastPlayListInfo {
      list: Music.MusicInfo[]
    }
    interface UserListInfoGeneralFull extends UserListInfoType<'general'> {
      list: Music.MusicInfo[]
    }
    interface UserListInfoLocalFull extends UserListInfoType<'local'> {
      list: Music.MusicInfo[]
    }
    interface UserListInfoOnlineFull extends UserListInfoType<'online'> {
      list: Music.MusicInfo[]
    }

    interface ListDataFull {
      defaultList: MyDefaultListInfoFull
      loveList: MyLoveListInfoFull
      lastPlayList: MyLastPlayListFull
      userList: Array<UserListInfoGeneralFull | UserListInfoLocalFull | UserListInfoOnlineFull>
    }
  }
  namespace IPCList {
    type ListActionDataOverwrite = List.ListDataFull
    interface ListActionAdd {
      position: number
      listInfos: List.UserListInfo[]
    }
    type ListActionRemove = string[]
    type ListActionUpdate = List.UserListInfo[]
    interface ListActionMove {
      /**
       * 目标列表id
       */
      id: List.ParentId
      /**
       * 列表id
       */
      ids: string[]
      /**
       * 位置
       */
      position: number
    }
    interface ListActionUpdatePosition {
      /**
       * 列表id
       */
      ids: string[]
      /**
       * 位置
       */
      position: number
    }
    interface ListActionUpdatePlayCount {
      id: string
      count?: number
    }
    // interface ListActionUpdatePlayTime {
    //   id: string
    //   name: string
    //   singer: string
    //   time: number
    // }

    interface ListActionMusicAdd {
      id: string
      musicInfos: Music.MusicInfo[]
      addMusicLocationType: AddMusicLocationType
    }

    interface ListActionMusicMove {
      fromId: string
      toId: string
      musicInfos: Music.MusicInfo[]
      addMusicLocationType: AddMusicLocationType
    }

    interface ListActionCheckMusicExistList {
      listId: string
      musicInfoId: string
    }

    interface ListActionMusicRemove {
      listId: string
      ids: string[]
      sync?: boolean
    }

    type ListActionMusicUpdate = Array<{
      id: string
      musicInfo: Music.MusicInfo
    }>

    interface ListActionMusicUpdatePosition {
      listId: string
      position: number
      ids: string[]
    }

    interface ListActionMusicOverwrite {
      listId: string
      musicInfos: Music.MusicInfo[]
    }

    type ListActionMusicClear = string[]
    interface ListInfo {
      lastSyncDate?: number
      snapshotKey: string
    }

    type ActionList =
      | IPCAction<'list_data_overwrite', ListActionDataOverwrite>
      | IPCAction<'list_create', ListActionAdd>
      | IPCAction<'list_remove', ListActionRemove>
      | IPCAction<'list_update', ListActionUpdate>
      | IPCAction<'list_move', ListActionMove>
      | IPCAction<'list_update_position', ListActionUpdatePosition>
      // | IPCAction<'list_update_play_count', ListActionUpdatePlayCount>
      // | IPCAction<'list_update_play_time', ListActionUpdatePlayTime>
      | IPCAction<'list_music_add', ListActionMusicAdd>
      | IPCAction<'list_music_move', ListActionMusicMove>
      | IPCAction<'list_music_remove', ListActionMusicRemove>
      | IPCAction<'list_music_update', ListActionMusicUpdate>
      | IPCAction<'list_music_update_position', ListActionMusicUpdatePosition>
      | IPCAction<'list_music_overwrite', ListActionMusicOverwrite>
      | IPCAction<'list_music_clear', ListActionMusicClear>

    type ListData = List.ListDataFull
    type SyncMode =
      | 'merge_local_remote'
      | 'merge_remote_local'
      | 'overwrite_local_remote'
      | 'overwrite_remote_local'
      | 'overwrite_local_remote_full'
      | 'overwrite_remote_local_full'
      // | 'none'
      | 'cancel'
  }
  namespace IPCPlayer {
    type ActionPlayer =
      | IPCAction<'prev'>
      | IPCAction<'next'>
      | IPCAction<'pause'>
      | IPCAction<'stop'>
      | IPCAction<'play'>
      | IPCAction<'toggle'>
      | IPCAction<'skip', string>
      | IPCAction<'seek', number>
      | IPCAction<'collectStatus', boolean>

    interface PlayerActionSet {
      listId: string | null
      list: Player.PlayMusicInfo[]
      isOnline: boolean
      isSync?: boolean
    }
    interface PlayerActionAdd {
      musics: Player.PlayMusicInfo[]
      pos: number
    }
    type PlayerActionUpdate = Player.PlayMusicInfo[]
    type PlayerActionRemove = string[]
    type PlayerActionPlayed = string[]
    type PlayerActionUnplayed = string[]
    interface PlayerActionPosUpdate {
      musics: string[]
      pos: number
    }
    type PlayListAction =
      | IPCAction<'set', PlayerActionSet>
      | IPCAction<'add', PlayerActionAdd>
      | IPCAction<'remove', PlayerActionRemove>
      | IPCAction<'update', PlayerActionUpdate>
      | IPCAction<'played', PlayerActionPlayed>
      | IPCAction<'unplayed', PlayerActionUnplayed>
      | IPCAction<'unplayedAll'>
      | IPCAction<'posUpdate', PlayerActionPosUpdate>

    interface PlayHistoryListItem {
      id: string
      time: number
    }
    type PlayHistoryListActionSet = PlayHistoryListItem[]
    type PlayHistoryListActionAdd = PlayHistoryListItem[]
    type PlayHistoryListActionRemove = number[]
    type PlayHistoryListAction =
      | IPCAction<'setList', PlayHistoryListActionSet>
      | IPCAction<'addList', PlayHistoryListActionAdd>
      | IPCAction<'removeIdx', number[]>

    interface Progress {
      nowPlayTime: number
      maxPlayTime: number
      progress: number
      nowPlayTimeStr: string
      maxPlayTimeStr: string
    }

    type PlayerStatus = 'playing' | 'paused' | 'stopped' | 'loading' | 'buffering' | 'ended' | 'error'

    /** 播放器实时状态 / 用户期望的播放状态 */
    type Status = [PlayerStatus, boolean]
    type PlayerEvent =
      | IPCAction<'musicChanged', { index: number; historyIndex: number }>
      | IPCAction<'musicInfoUpdated', Partial<Player.MusicInfo>>
      | IPCAction<'playInfoUpdated', Partial<Player.PlayInfo>>
      | IPCAction<'progress', Progress>
      | IPCAction<'playbackRate', number>
      | IPCAction<'status', Status>
      | IPCAction<'statusText', string>
      | IPCAction<'lyricText', string>
      | IPCAction<'picUpdated', string | null>
      | IPCAction<'lyricUpdated', Music.LyricInfo>
      | IPCAction<'lyricOffsetUpdated', number>

    interface SavedPlayInfo {
      time: number
      maxTime: number
      index: number
      historyIndex: number
    }
    interface PlayInfo {
      info: SavedPlayInfo
      list: Player.PlayMusicInfo[]
      listId: string | null
      isOnline: boolean
      historyList: PlayHistoryListItem[]
      isCollect: boolean
    }
  }
}

interface IPCActionBase<A> {
  action: A
}
interface IPCActionData<A, D> extends IPCActionBase<A> {
  data: D
}
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
export interface ListCommonResult<T> {
  list: T[]
  total: number
  page: number
  limit: number
  // source: string
}
interface MusicCommonParams extends CommonParams {
  musicInfo: AnyListen.Music.MusicInfoOnline
}
interface MusicUrlParams extends MusicCommonParams {
  quality?: string
  type?: AnyListen.Music.FileType
}
interface MusicUrlInfo {
  url: string
  quality: string
}

interface SongListItem {
  play_count: string
  id: string
  author: string
  name: string
  time?: string
  img: string
  // grade: basic.favorcnt / 10,
  desc: string | null
  total?: string
}

interface CommonItem {
  id: string
  name: string
}
type TagItem = CommonItem
interface TagGroupItem {
  name: string
  list: CommonItem[]
}

type BoardItem = CommonItem

declare global {
  namespace AnyListen_API {
    type Locale =
      | 'ar-sa'
      | 'cs-cz'
      | 'da-dk'
      | 'de-de'
      | 'el-gr'
      | 'en-au'
      | 'en-gb'
      | 'en-ie'
      | 'en-us'
      | 'en-za'
      | 'es-es'
      | 'es-mx'
      | 'fi-fi'
      | 'fr-ca'
      | 'fr-fr'
      | 'he-il'
      | 'hi-in'
      | 'hu-hu'
      | 'id-id'
      | 'it-it'
      | 'ja-jp'
      | 'ko-kr'
      | 'nl-be'
      | 'nl-nl'
      | 'no-no'
      | 'pl-pl'
      | 'pt-br'
      | 'pt-pt'
      | 'ro-ro'
      | 'ru-ru'
      | 'sk-sk'
      | 'sv-se'
      | 'th-th'
      | 'tr-tr'
      | 'zh-cn'
      | 'zh-hk'
      | 'zh-tw'

    type Platform = 'mac' | 'linux' | 'windows' | 'android' | 'ios'
    type Architecture = 'arm' | 'arm64' | 'x86' | 'x64'
    type ClientType = 'desktop' | 'web' | 'mobile'
    type Quality = '128k' | '320k' | 'flac' | 'flac24bit' | '192k' | 'wav' | 'dobly' | 'master'

    type ParamsData = Record<string, string | number | null | undefined | boolean>
    interface RequestOptions {
      method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH'
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

    type BufferFormat = 'binary' | 'base64' | 'hex' | 'utf-8' | 'utf8'
    interface BufferToStringTypes {
      binary: number[] | Uint8Array
      base64: string
      hex: string
      utf8: string
      'utf-8': string
    }

    type AES_MODE = 'CBC_128_PKCS7Padding' | 'ECB_128_NoPadding'
    type RSA_PADDING = 'RSA_PKCS1_OAEP_PADDING' | 'RSA_NO_PADDING'

    interface MessageButton {
      /** A short title like 'Retry', 'Open Log' etc. */
      text: string
      link?: string
    }
    interface MessageDialogOptions {
      signal?: unknown
      textSelect?: boolean
      type?: 'info' | 'warning' | 'error'
      /** Human-readable detail message that is rendered less prominent. Note that detail is only shown for modal messages. */
      detail?: string
      /** Indicates that this message should be modal. */
      modal?: boolean
      buttons?: MessageButton[]
    }

    interface FormItemBase<V> {
      /** An optional string that represents the title of the form. */
      title?: string
      /** The text to display underneath the form. */
      description?: string
      /** The value to pre-fill in the form. */
      value?: V
    }
    interface InputOptions extends FormItemBase<string> {
      type: 'input'
      /** Controls if a password input is shown. Password input hides the typed text. */
      password?: boolean
      /** An optional string to show as placeholder in the input box to guide the user what to type. */
      placeholder?: string
    }
    interface BoolOptions extends FormItemBase<boolean> {
      type: 'boolean'
    }
    interface EnumItem<T> {
      name: string
      value: T
    }
    interface RadioOptions<T extends string | number = string> extends FormItemBase<T> {
      type: 'radio'
      enum?: Array<EnumItem<T>>
    }
    interface SelectionOptions<T extends string | number = string> extends FormItemBase<T> {
      type: 'selection'
      enum: Array<EnumItem<T>>
    }
    // interface FormDialogOptions {
    //   signal?: unknown
    //   /** An optional string that represents the title of the form dialog. */
    //   title?: string
    //   /** An optional string that represents the description of the form dialog. */
    //   description?: string
    //   /** The form items */
    //   items: Array<InputOptions | BoolOptions | RadioOptions | SelectionOptions>
    //   /** An optional function that will be called to validate input and to give a hint to the user. */
    //   validateInput?: (index: number, value: string) => null | undefined | string
    // }
    interface InputDialogOptions {
      signal?: unknown
      /** Controls if a password input is shown. Password input hides the typed text. */
      password?: boolean
      /** An optional string to show as placeholder in the input box to guide the user what to type. */
      placeholder?: string
      /** The text to display underneath the input box. */
      prompt?: string
      /** An optional string that represents the title of the input box. */
      title?: string
      /** The value to pre-fill in the input box. */
      value?: string
      /** An optional function that will be called to validate input and to give a hint to the user. */
      validateInput?: (value: string) => Promise<null | undefined | string>
    }

    interface OpenDialogOptions {
      signal?: unknown
      /** The resource the dialog shows when opened. */
      defaultPath?: string
      /** A human-readable string for the open button. */
      openLabel?: string
      /** Allow to select files, defaults to `true`. */
      canSelectFiles?: boolean
      /** Allow to select folders, defaults to `false`. */
      canSelectFolders?: boolean
      /** Allow to select many files or folders. */
      canSelectMany?: boolean
      /**
       *  A set of file filters that are used by the dialog. Each entry is a human-readable label,
       * like "TypeScript", and an array of extensions, for example:
       * ```ts
       * {
       *   'Images': ['png', 'jpg'],
       *   'TypeScript': ['ts', 'tsx']
       * }
       * ```
       */
      filters?: Record<string, string[]>
      /**
       * Dialog title.
       *
       * This parameter might be ignored, as not all operating systems display a title on open dialogs
       * (for example, macOS).
       */
      title?: string
    }

    interface SaveDialogOptions {
      signal?: unknown
      /** The resource the dialog shows when opened. */
      defaultPath?: string
      /** A human-readable string for the save button. */
      saveLabel?: string
      /**
       * A set of file filters that are used by the dialog. Each entry is a human-readable label,
       * like "TypeScript", and an array of extensions, for example:
       * ```ts
       * {
       *   'Images': ['png', 'jpg'],
       *   'TypeScript': ['ts', 'tsx']
       * }
       * ```
       */
      filters?: Record<string, string[]>
      /**
       * Dialog title.
       *
       * This parameter might be ignored, as not all operating systems display a title on save dialogs
       * (for example, macOS).
       */
      title?: string
    }

    /** 环境相关 */
    interface Env {
      /** 客户端类型 */
      readonly clientType: ClientType
      /** 扩展系统版本号 */
      readonly version: string
      /** 运行平台 */
      readonly platform: Platform
      /** 架构 */
      readonly arch: Architecture
      /** 语言 */
      readonly locale: Locale
      /** 扩展公钥 */
      readonly publicKey: string
      /** 扩展版本号 */
      readonly extensionVersion: string

      readonly onLocaleChanged: (callback: (locale: Locale) => void) => () => void
    }
    /** 应用相关 */
    interface App {
      showMessage: (message: string, options?: MessageDialogOptions) => Promise<number>
      // TODO
      // showFormDialog: (options: FormDialogOptions) => Promise<string | undefined>
      showInputBox: (options: InputDialogOptions) => Promise<string | undefined>
      // showInput: (options: InputDialogOptions) => Promise<string | undefined>
      showOpenDialog: (options: OpenDialogOptions) => Promise<string | string[] | undefined>
      showSaveDialog: (options: SaveDialogOptions) => Promise<string | undefined>
      // getConnectedClient: () => Promise<string[]>
    }
    interface MusicList {
      getAllUserLists: () => Promise<AnyListen.List.MyAllList>
      getListMusics: (listId: string) => Promise<AnyListen.Music.MusicInfo[]>
      listAction: (action: AnyListen.IPCList.ActionList) => Promise<void>
      onListAction: (handler: (action: AnyListen.IPCList.ActionList) => unknown) => () => void
    }
    interface PlayInfo {
      info: {
        time: number
        maxTime: number
        index: number
        historyIndex: number
      }
      list: Array<{
        /**
         * 当前信息唯一ID
         */
        itemId: string
        /**
         * 当前播放歌曲的列表 id
         */
        musicInfo: AnyListen.Music.MusicInfo
        /**
         * 当前播放歌曲的列表 id
         */
        listId: string
        /**
         * 是否在线列表
         */
        isOnline: boolean
        /**
         * 是否属于 “稍后播放”
         */
        playLater: boolean
        /**
         * 是否已播放
         */
        played: boolean
      }>
      listId: string | null
      historyList: Array<{
        id: string
        time: number
      }>
    }
    interface Player {
      /** 获取播放信息 */
      getPlayInfo: () => Promise<PlayInfo>
      playListAction: (action: AnyListen.IPCPlayer.PlayListAction) => Promise<void>
      playerAction: (action: AnyListen.IPCPlayer.ActionPlayer) => Promise<void>
      playHistoryListAction: (action: AnyListen.IPCPlayer.PlayHistoryListAction) => Promise<void>
      onPlayerEvent: (callback: (event: AnyListen.IPCPlayer.PlayerEvent) => unknown) => () => void
      onPlayListEvent: (callback: (action: AnyListen.IPCPlayer.PlayListAction) => unknown) => () => void
      onPlayHistoryEvent: (callback: (action: AnyListen.IPCPlayer.PlayHistoryListAction) => unknown) => () => void
    }
    interface MusicUrlInfo {
      url: string
      quality: string
    }

    type BuildListProviderActionCommonParams<D> = CommonParams & {
      data: D
    }
    type ListProviderActionParams = BuildListProviderActionCommonParams<AnyListen.List.RemoteListInfo>
    interface ListProviderAction {
      createList: (params: ListProviderActionParams) => Promise<void>
      updateList: (params: ListProviderActionParams) => Promise<void>
      deleteList: (params: ListProviderActionParams) => Promise<void>
      getListMusicIds: (params: ListProviderActionParams) => Promise<string[]>
      getMusicInfoByIds: (
        params: BuildListProviderActionCommonParams<{
          list: AnyListen.List.RemoteListInfo
          ids: string[]
        }>
      ) => Promise<{
        musics: AnyListen.Music.MusicInfoOnline[]
        waitingParseMetadata?: boolean
      }>
      parseMusicInfoMetadata: (
        params: BuildListProviderActionCommonParams<AnyListen.Music.MusicInfoOnline>
      ) => Promise<AnyListen.Music.MusicInfoOnline>
    }

    interface ResourceAction {
      // ('tipSearch' | 'hotSearch', CommonParams) => Promise<string[]>
      musicSearch: (params: SearchParams) => Promise<ListCommonResult<AnyListen.Music.MusicInfoOnline>>
      musicPic: (params: MusicCommonParams) => Promise<string>
      musicUrl: (params: MusicUrlParams) => Promise<MusicUrlInfo>
      musicLyric: (params: MusicCommonParams) => Promise<AnyListen.Music.LyricInfo>
      musicPicSearch: (params: PicSearchParams) => Promise<string[]>
      lyricSearch: (params: LyricSearchParams) => Promise<LyricSearchResult[]>
      lyricDetail: (params: LyricDetailParams) => Promise<AnyListen.Music.LyricInfo>
      // songlistSearch: (params: SearchParams) => Promise<ListCommonResult<AnyListen.Resource.SongListItem>>
      // songlistSorts: (params: CommonParams) => Promise<AnyListen.Resource.TagItem[]>
      // songlistTags: (params: CommonParams) => Promise<AnyListen.Resource.TagGroupItem[]>
      // songlist: (params: SonglistListParams) => Promise<ListCommonResult<AnyListen.Resource.SongListItem>>
      // songlistDetail: (params: ListDetailParams) => Promise<ListCommonResult<Music.MusicInfoOnline>>
      // leaderboard: (params: CommonParams) => Promise<AnyListen.Resource.TagGroupItem[]>
      // leaderboardDate: (params: SonglistListParams) => Promise<ListCommonResult<Music.MusicInfoOnline>>
      // leaderboardDetail: (params: SonglistListParams) => Promise<ListCommonResult<Music.MusicInfoOnline>>
    }

    interface BackupDataAction {
      getListMD5: () => Promise<string | null>
      getListData: () => Promise<string | null>
      setListData: (data: string, md5: string) => Promise<void>
      getDislikeMD5: () => Promise<string | null>
      getDislikeData: () => Promise<string | null>
      setDislikeData: (data: string, md5: string) => Promise<void>
    }
    interface Logcat {
      debug: (...args: unknown[]) => void
      info: (...args: unknown[]) => void
      warn: (...args: unknown[]) => void
      error: (...args: unknown[]) => void
    }
    interface Storage {
      getItem: <T>(key: string) => Promise<T>
      getItems: <T extends unknown[]>(keys: string[]) => Promise<T>
      setItem: (key: string, value: unknown) => Promise<void>
      setItems: <T extends Array<[string, unknown]>>(datas: T) => Promise<void>
      removeItem: (key: string) => Promise<void>
      removeItems: (keys: string[]) => Promise<void>
      clearItems: () => Promise<void>
    }
    interface Buffer {
      from: (input: string | number[], encoding?: BufferFormat) => Uint8Array
      bufToString: <T extends BufferFormat>(buf: number[] | Uint8Array, format: T) => BufferToStringTypes[T]
    }
    interface Crypto {
      aesEncrypt: (mode: AES_MODE, data: Uint8Array | string, key: Uint8Array | string, iv: Uint8Array | string) => string
      rsaEncrypt: (mode: RSA_PADDING, data: Uint8Array, key: Uint8Array) => string
      randomBytes: (size: number) => Uint8Array
      md5: (b64Data: string) => string
    }
    interface Iconv {
      decode: (data: Uint8Array | Uint16Array, encoding: string) => string
      encode: (data: string, encoding: string) => Uint8Array
    }
    interface Configuration {
      getConfigs: <T extends unknown[] = []>(keys: string[]) => Promise<WithUndefined<T>>
      setConfigs: (datas: Array<[string, string]>) => Promise<void>
      onConfigChanged: (callback: (keys: string[], configuration: Record<string, unknown>) => void) => () => void
    }
    interface MusicUtils {
      createProxyUrl: (url: string, options: RequestOptions, enabledCache?: boolean) => Promise<string>
      writeProxyCache: (fileName: string, data: Uint8Array) => Promise<string>
    }
    interface API {
      env: Env
      app: App
      musicList: MusicList
      player: Player
      musicUtils: MusicUtils
      /** http 请求 */
      request: <Resp = unknown>(url: string, options?: RequestOptions) => Promise<Response<Resp>>
      t: (key: string, data?: Record<string, string | number | null | undefined>) => string
      logcat: Logcat
      storage: Storage
      configuration: Configuration
      registerResourceAction: (actions: Partial<ResourceAction>) => void
      // TODO
      backup: {
        runBackup: (opts: { backupData?: Array<'list' | 'dislike'> }) => Promise<void>
        registerDataAction: (actions: BackupDataAction) => void
      }
      utils: {
        buffer: Buffer
        crypto: Crypto
        iconv: Iconv
      }
    }
  }
}

export {}
