import _Event, { type EventType } from '@any-listen/nodejs/Event'
import type { DBSeriveTypes } from '../worker/utils'

let dbService: DBSeriveTypes

export class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  dislike_changed() {
    this.emit('dislike_changed')
  }

  /**
   * 覆盖整个列表数据
   * @param dislikeData 列表数据
   * @param isRemote 是否属于远程操作
   */
  async dislike_data_overwrite(dislikeData: AnyListen.Dislike.DislikeRules, isRemote = false) {
    await dbService.dislikeInfoOverwrite(dislikeData)
    this.emit('dislike_data_overwrite', dislikeData, isRemote)
    this.dislike_changed()
  }

  /**
   * 批量添加歌曲到列表
   * @param dislikeId 列表id
   * @param musicInfos 添加的歌曲信息
   * @param addMusicLocationType 添加在到列表的位置
   * @param isRemote 是否属于远程操作
   */
  async dislike_music_add(musicInfo: AnyListen.Dislike.DislikeMusicInfo[], isRemote = false) {
    // const changedIds =
    await dbService.dislikeInfoAdd(musicInfo)
    // await checkUpdateDislike(changedIds)
    this.emit('dislike_music_add', musicInfo, isRemote)
    this.dislike_changed()
  }

  /**
   * 清空列表内的歌曲
   * @param ids 列表Id
   * @param isRemote 是否属于远程操作
   */
  async dislike_music_clear(isRemote = false) {
    // const changedIds =
    await dbService.dislikeInfoOverwrite('')
    // await checkUpdateDislike(changedIds)
    this.emit('dislike_music_clear', isRemote)
    this.dislike_changed()
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const dislikeListEvent = new Event() as EventType<Event>

export const initDislikeListEvent = (_dbService: DBSeriveTypes) => {
  dbService = _dbService
}
