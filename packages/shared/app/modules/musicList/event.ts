import { LIST_IDS } from '@any-listen/common/constants'
import _Event, { type EventType } from '@any-listen/nodejs/Event'

import { verifyListCreate, verifyListDelete, verifyListUpdate, verifyMusicRemove } from '../extension/listProvider'
import type { DBSeriveTypes } from '../worker/utils'
import {
  verifyLocalListCreate,
  verifyLocalListDelete,
  verifyLocalListMusicRemove,
  verifyLocalListUpdate,
} from './localListProvider'

let dbService: DBSeriveTypes

// import {
//   // getAllUserList as getAllUserListByDB,
//   createUserLists,
//   removeUserLists,
//   updateUserLists,
//   updateUserListsPosition,
//   musicsAdd,
//   musicsMove,
//   musicsRemove,
//   musicsUpdate,
//   musicsClear,
//   musicsPositionUpdate,
//   musicOverwrite,
// } from '@/workers/dbService/modules/list'

export class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  list_changed() {
    this.emitEvent('list_changed')
  }

  list_music_changed(ids: string[]) {
    this.emitEvent('list_music_changed', ids)
  }

  /**
   * 覆盖整个列表数据
   * @param listData 列表数据
   * @param isRemote 是否属于远程操作
   */
  async list_data_overwrite(listData: AnyListen.List.ListDataFull, isRemote = false) {
    await dbService.listDataOverwrite(listData)
    this.emitEvent('list_data_overwrite', listData, isRemote)
    this.list_changed()
  }

  /**
   * 批量创建列表
   * @param position 列表位置
   * @param lists 列表信息
   * @param isRemote 是否属于远程操作
   */
  async list_create(position: number, lists: AnyListen.List.UserListInfo[], isRemote = false) {
    for (const list of lists) {
      switch (list.type) {
        case 'local':
          await verifyLocalListCreate(list)
          break
        case 'remote':
          await verifyListCreate(list)
          break
        default:
          break
      }
    }
    await dbService.createUserLists(position, lists)
    this.emitEvent('list_create', position, lists, isRemote)
    this.list_changed()
  }

  /**
   * 批量删除列表及列表内歌曲
   * @param ids 列表ids
   * @param isRemote 是否属于远程操作
   */
  async list_remove(ids: string[], isRemote = false) {
    const userList = (await dbService.getAllUserLists()).userList
    for (const id of ids) {
      const targetList = userList.find((l) => l.id === id)
      if (targetList) {
        switch (targetList.type) {
          case 'local':
            await verifyLocalListDelete(targetList)
            break
          case 'remote':
            await verifyListDelete(targetList)
            break
          default:
            break
        }
      }
    }
    await dbService.removeUserLists(ids)
    this.emitEvent('list_remove', ids, isRemote)
    this.list_changed()
  }

  /**
   * 批量更新列表信息
   * @param lists 列表信息
   * @param isRemote 是否属于远程操作
   */
  async list_update(lists: AnyListen.List.UserListInfo[], isRemote = false) {
    for (const list of lists) {
      switch (list.type) {
        case 'local':
          await verifyLocalListUpdate(list)
          break
        case 'remote':
          await verifyListUpdate(list)
          break
        default:
          break
      }
    }
    await dbService.updateUserLists(lists)
    this.emitEvent('list_update', lists, isRemote)
    this.list_changed()
  }

  /**
   * 批量移动列表
   * @param id 目标列表id
   * @param position 列表位置
   * @param lists 列表信息
   * @param isRemote 是否属于远程操作
   */
  async list_move(id: string | null, position: number, ids: string[], isRemote = false) {
    await dbService.moveUserList(id, position, ids)
    this.emitEvent('list_update', id, position, ids, isRemote)
    this.list_changed()
  }

  /**
   * 批量更新列表位置
   * @param position 列表位置
   * @param ids 列表ids
   * @param isRemote 是否属于远程操作
   */
  async list_update_position(position: number, ids: string[], isRemote = false) {
    await dbService.updateUserListsPosition(position, ids)
    this.emitEvent('list_update_position', position, ids, isRemote)
    this.list_changed()
  }

  // /**
  //  * 更新播次数
  //  * @param position 列表位置
  //  * @param id 列表id
  //  * @param name 歌曲name
  //  * @param singer 歌曲singer
  //  * @param count 播放次数
  //  * @param isRemote 是否属于远程操作
  //  */
  // async list_update_play_count(id: string, name: string, singer: string, count?: number, isRemote = false) {
  //   await Promise.all([dbService.updateMetadataPlayCount(count),
  //     count == null ? dbService.playCountAdd({ name, singer })
  //       : dbService.playCountOverwrite({ name, singer, count })])
  //   this.emitEvent('list_update_play_count', id, name, singer, isRemote)
  //   this.list_changed()
  // }

  // /**
  //  * 批量更新播放时长
  //  * @param position 播放时长
  //  * @param id 列表id
  //  * @param name 歌曲name
  //  * @param singer 歌曲singer
  //  * @param time 歌曲time
  //  * @param isRemote 是否属于远程操作
  //  */
  // async list_update_play_time(id: string, name: string, singer: string, time: number, isAdd: boolean, isRemote = false) {
  //   await Promise.all([dbService.updateMetadataPlayTime(time, isAdd),
  //     isAdd ? dbService.playTimeAdd({ name, singer, time })
  //       : dbService.playTimeOverwrite({ name, singer, time })])
  //   this.emitEvent('list_update_play_time', id, name, singer, time, isAdd, isRemote)
  //   this.list_changed()
  // }

  /**
   * 覆盖列表内歌曲
   * @param listId 列表id
   * @param musicInfos 音乐信息
   * @param isRemote 是否属于远程操作
   */
  async list_music_overwrite(listId: string, musicInfos: AnyListen.Music.MusicInfo[], isRemote = false) {
    await dbService.musicOverwrite(listId, musicInfos)
    this.emitEvent('list_music_overwrite', listId, musicInfos, isRemote)
    this.list_music_changed([listId])
    this.list_changed()
  }

  /**
   * 批量添加歌曲到列表
   * @param listId 列表id
   * @param musicInfos 添加的歌曲信息
   * @param addMusicLocationType 添加在到列表的位置
   * @param isRemote 是否属于远程操作
   */
  async list_music_add(
    listId: string,
    musicInfos: AnyListen.Music.MusicInfo[],
    addMusicLocationType: AnyListen.AddMusicLocationType,
    isRemote = false
  ) {
    await dbService.musicsAdd(listId, musicInfos, addMusicLocationType)
    this.emitEvent('list_music_add', listId, musicInfos, addMusicLocationType, isRemote)
    this.list_music_changed([listId])
    this.list_changed()
  }

  /**
   * 批量移动歌曲
   * @param fromId 源列表id
   * @param toId 目标列表id
   * @param musicInfos 移动的歌曲信息
   * @param addMusicLocationType 添加在到列表的位置
   * @param isRemote 是否属于远程操作
   */
  async list_music_move(
    fromId: string,
    toId: string,
    musicInfos: AnyListen.Music.MusicInfo[],
    addMusicLocationType: AnyListen.AddMusicLocationType,
    isRemote = false
  ) {
    await dbService.musicsMove(fromId, toId, musicInfos, addMusicLocationType)
    this.emitEvent('list_music_move', fromId, toId, musicInfos, addMusicLocationType, isRemote)
    this.list_music_changed([fromId, toId])
    this.list_changed()
  }

  /**
   * 批量移除歌曲
   * @param listId
   * @param listId 列表Id
   * @param ids 要删除歌曲的id
   * @param isSync 是否为同步操作
   * @param isRemote 是否属于远程操作
   */
  async list_music_remove(listId: string, ids: string[], isSync = false, isRemote = false) {
    if (!isSync && !isRemote) {
      switch (listId) {
        case LIST_IDS.DEFAULT:
        case LIST_IDS.LOVE:
        case LIST_IDS.LAST_PLAYED:
          break
        default: {
          const listInfo = await dbService.getUserListById(listId)
          if (!listInfo) throw new Error('list not found')
          switch (listInfo.type) {
            case 'local':
              await verifyLocalListMusicRemove(
                listInfo,
                (await dbService.getListMusicsByIds(listId, ids)) as AnyListen.Music.MusicInfoLocal[]
              )
              break
            case 'remote':
              await verifyMusicRemove(
                listInfo,
                (await dbService.getListMusicsByIds(listId, ids)) as AnyListen.Music.MusicInfoOnline[]
              )
              break
            default:
              break
          }
        }
      }
    }
    await dbService.musicsRemove(listId, ids)
    this.emitEvent('list_music_remove', listId, ids, isRemote)
    this.list_music_changed([listId])
    this.list_changed()
  }

  /**
   * 批量更新歌曲信息
   * @param musicInfos 歌曲&列表信息
   * @param isRemote 是否属于远程操作
   */
  async list_music_update(musicInfos: AnyListen.IPCList.ListActionMusicUpdate, isRemote = false) {
    await dbService.musicsUpdate(musicInfos)
    this.emitEvent('list_music_update', musicInfos, isRemote)
    this.list_changed()
    const updatedInfo = await dbService.musicsUpdateLastPlayedList(musicInfos)
    if (!updatedInfo.length) return
    this.emitEvent('list_music_update', updatedInfo, isRemote)
    this.list_changed()
  }

  /**
   * 本地更新歌曲图片
   * @param listId
   * @param musicId
   * @param pic
   */
  async list_music_update_pic(listId: string, musicInfo: AnyListen.Music.MusicInfo) {
    const newInfo = await dbService.musicPicUpdate(listId, musicInfo.id, musicInfo.meta.picUrl || '')
    const info: AnyListen.IPCList.ListActionMusicUpdate = [{ id: listId, musicInfo: newInfo || musicInfo }]
    this.emitEvent('list_music_update_pic', info, false)
    this.list_changed()
    this.emitEvent('listAction', { action: 'list_music_update', data: info })
  }

  /**
   * 本地更新歌曲基础信息
   * @param listId
   * @param musicInfo
   */
  async list_music_base_info_update(listId: string, musicInfos: AnyListen.Music.MusicInfo[]) {
    const newInfos = await dbService.musicBaseInfosUpdate(listId, musicInfos)
    const info: AnyListen.IPCList.ListActionMusicUpdate = newInfos.map((musicInfo) => ({ id: listId, musicInfo }))
    this.emitEvent('list_music_update', info, false)
    this.list_changed()
    this.emitEvent('listAction', { action: 'list_music_update', data: info })
  }

  /**
   * 清空列表内的歌曲
   * @param ids 列表Id
   * @param isRemote 是否属于远程操作
   */
  async list_music_clear(ids: string[], isRemote = false) {
    await dbService.musicsClear(ids)
    this.emitEvent('list_music_clear', ids, isRemote)
    this.list_music_changed(ids)
    this.list_changed()
  }

  /**
   * 批量更新歌曲位置
   * @param listId 列表ID
   * @param position 新位置
   * @param ids 歌曲id
   * @param isRemote 是否属于远程操作
   */
  async list_music_update_position(listId: string, position: number, ids: string[], isRemote = false) {
    await dbService.musicsPositionUpdate(listId, position, ids)
    this.emitEvent('list_music_update_position', listId, position, ids, isRemote)
    this.list_changed()
  }

  /**
   * 列表操作
   * @param action
   */
  async listAction(action: AnyListen.IPCList.ActionList) {
    switch (action.action) {
      case 'list_data_overwrite':
        await this.list_data_overwrite(action.data)
        break
      case 'list_create':
        await this.list_create(action.data.position, action.data.listInfos)
        break
      case 'list_remove':
        await this.list_remove(action.data)
        break
      case 'list_move':
        await this.list_move(action.data.id, action.data.position, action.data.ids)
        break
      case 'list_update':
        await this.list_update(action.data)
        break
      case 'list_update_position':
        await this.list_update_position(action.data.position, action.data.ids)
        break
      // case 'list_update_play_count':
      //   await this.list_update_play_count(action.data.id, action.data.count)
      //   break
      // case 'list_update_play_time':
      //   await this.list_update_play_time(action.data)
      //   break
      case 'list_music_add':
        await this.list_music_add(action.data.id, action.data.musicInfos, action.data.addMusicLocationType)
        break
      case 'list_music_move':
        await this.list_music_move(action.data.fromId, action.data.toId, action.data.musicInfos, action.data.addMusicLocationType)
        break
      case 'list_music_remove':
        await this.list_music_remove(action.data.listId, action.data.ids, action.data.sync)
        break
      case 'list_music_update':
        await this.list_music_update(action.data)
        break
      case 'list_music_update_position':
        await this.list_music_update_position(action.data.listId, action.data.position, action.data.ids)
        break
      case 'list_music_overwrite':
        await this.list_music_overwrite(action.data.listId, action.data.musicInfos)
        break
      case 'list_music_clear':
        await this.list_music_clear(action.data)
        break
    }
    this.emitEvent('listAction', action)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const musicListEvent = new Event() as EventType<Event>

export const initMusicListEvent = (_dbService: DBSeriveTypes) => {
  dbService = _dbService
}
