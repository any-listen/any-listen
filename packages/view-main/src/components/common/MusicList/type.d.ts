export interface MenuSelectInfo {
  listName?: string
  listId: string
  musicInfo: AnyListen.Music.MusicInfo
  selectedList: AnyListen.Music.MusicInfo[]
  onRemoveAllSelected: () => void
}

interface ListInfoBase<T extends 'default' | AnyListen.List.UserListType> {
  id: string
  name: string
  pic?: string
  desc?: string
  playCount?: number
  createTime?: string
  picIcon?: string
  saveable?: boolean
  type: T
  getSortTimeFn?: () => ((list: AnyListen.Music.MusicInfo[], type: AnyListen.List.SortFileType) => Promise<string[]>) | null
}

interface ListInfoLocal extends ListInfoBase<'local'> {
  listMeta: {
    deviceId: string
  }
}

interface ListInfoRemote extends ListInfoBase<'remote'> {
  listMeta: {
    extensionId: string
    source: string
    [key: string]: unknown
  }
}
interface ListInfoOnline extends ListInfoBase<'online'> {
  listMeta: {
    extensionId: string
    source: string
    [key: string]: unknown
  }
}

export type ListInfo = ListInfoBase<'default' | 'general'> | ListInfoLocal | ListInfoRemote | ListInfoOnline
