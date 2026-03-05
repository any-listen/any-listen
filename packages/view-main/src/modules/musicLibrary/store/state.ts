import { LIST_IDS } from '@any-listen/common/constants'

export interface InitState {
  defaultList: AnyListen.List.MyDefaultListInfo
  loveList: AnyListen.List.MyLoveListInfo
  lastPlayList: AnyListen.List.MyLastPlayListInfo
  userLists: AnyListen.List.UserListInfo[]
  userListsMap: Map<string | null, AnyListen.List.UserListInfo[]>
  allMusicList: Map<string, AnyListen.Music.MusicInfo[]>
  userListInited: boolean
  fetchingListStatus: Record<string, boolean>
  listCoverMap: Map<string, string | null | undefined>
}

export const musicLibraryState: InitState = {
  userListInited: false,
  defaultList: {
    id: LIST_IDS.DEFAULT,
    name: LIST_IDS.DEFAULT,
    type: 'default',
    parentId: null,
    meta: {
      pic: '',
      songCount: 0,
      createTime: 0,
      updateTime: 0,
      posTime: 0,
      playCount: 0,
      desc: '',
      // playTime: 0,
    },
  },
  loveList: {
    id: LIST_IDS.LOVE,
    name: LIST_IDS.LOVE,
    type: 'default',
    parentId: null,
    meta: {
      pic: '',
      songCount: 0,
      createTime: 0,
      updateTime: 0,
      posTime: 0,
      playCount: 0,
      desc: '',
      // playTime: 0,
    },
  },
  lastPlayList: {
    id: LIST_IDS.LAST_PLAYED,
    name: LIST_IDS.LAST_PLAYED,
    type: 'default',
    parentId: null,
    meta: {
      pic: '',
      songCount: 0,
      createTime: 0,
      updateTime: 0,
      posTime: 0,
      playCount: 0,
      desc: '',
      // playTime: 0,
    },
  },
  userLists: [],
  userListsMap: new Map(),
  allMusicList: new Map(),
  fetchingListStatus: {},
  listCoverMap: new Map(),
}
