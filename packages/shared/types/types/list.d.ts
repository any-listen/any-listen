declare namespace AnyListen {
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
}
