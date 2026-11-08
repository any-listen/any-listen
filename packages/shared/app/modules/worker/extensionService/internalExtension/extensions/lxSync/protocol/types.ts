/** Types of the LX Music sync protocol (subset used by this extension) */

export type LxSource = 'kw' | 'wy' | 'kg' | 'tx' | 'mg' | 'local'

export interface LxMusicQuality {
  type: string
  size: string | null
}

export interface LxMusicMetaBase {
  songId: string | number
  albumName: string
  picUrl?: string | null
  filePath?: string
  ext?: string
}

export interface LxMusicInfo {
  id: string
  name: string
  singer: string
  source: LxSource
  interval: string | null
  meta: LxMusicMetaBase
  qualitys?: LxMusicQuality[]
  albumId?: string
}

export interface LxUserListInfo {
  id: string
  name: string
  source?: string
  sourceListId?: string
  locationUpdateTime: number | null
}

export interface LxUserListInfoFull extends LxUserListInfo {
  list: LxMusicInfo[]
}

export interface LxListData {
  defaultList: LxMusicInfo[]
  loveList: LxMusicInfo[]
  userList: LxUserListInfoFull[]
}

export type LxSyncMode =
  | 'merge_local_remote'
  | 'merge_remote_local'
  | 'overwrite_local_remote'
  | 'overwrite_remote_local'
  | 'overwrite_local_remote_full'
  | 'overwrite_remote_local_full'
  | 'cancel'

export type LxAddMusicLocationType = 'top' | 'bottom'

export type LxListAction =
  | { action: 'list_data_overwrite'; data: LxListData }
  | { action: 'list_create'; data: { position: number; listInfos: LxUserListInfo[] } }
  | { action: 'list_remove'; data: string[] }
  | { action: 'list_update'; data: LxUserListInfo[] }
  | { action: 'list_update_position'; data: { ids: string[]; position: number } }
  | { action: 'list_music_add'; data: { id: string; musicInfos: LxMusicInfo[]; addMusicLocationType: LxAddMusicLocationType } }
  | {
      action: 'list_music_move'
      data: {
        fromId: string
        toId: string
        musicInfos: LxMusicInfo[]
        addMusicLocationType: LxAddMusicLocationType
      }
    }
  | { action: 'list_music_remove'; data: { listId: string; ids: string[] } }
  | { action: 'list_music_update'; data: Array<{ id: string; musicInfo: LxMusicInfo }> }
  | { action: 'list_music_update_position'; data: { listId: string; position: number; ids: string[] } }
  | { action: 'list_music_overwrite'; data: { listId: string; musicInfos: LxMusicInfo[] } }
  | { action: 'list_music_clear'; data: string[] }

export type LxDislikeRules = string

export interface LxDislikeMusicInfo {
  name: string
  singer: string
}

export type LxDislikeAction =
  | { action: 'dislike_data_overwrite'; data: LxDislikeRules }
  | { action: 'dislike_music_add'; data: LxDislikeMusicInfo[] }
  | { action: 'dislike_music_clear' }

export interface LxEnabledListFeature {
  skipSnapshot: boolean
}

export interface LxEnabledFeatures {
  list?: LxEnabledListFeature
  dislike?: Record<string, never>
}

export const LIST_IDS = {
  DEFAULT: 'default',
  LOVE: 'love',
} as const
