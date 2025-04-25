import _Event, { type EventType } from '@any-listen/nodejs/Event'
import type { DBSeriveTypes } from '../worker/utils'

let dbService: DBSeriveTypes

export class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  playerAction(action: AnyListen.IPCPlayer.ActionPlayer) {
    this.emitEvent('playerAction', action)
  }

  async playListAction(action: AnyListen.IPCPlayer.PlayListAction): Promise<void> {
    switch (action.action) {
      case 'set':
        await Promise.all([
          dbService.playListOverride(action.data.list),
          dbService.saveMetadataPlayListInfo(action.data.listId, action.data.isOnline),
        ])
        break
      case 'add':
        await dbService.playListAdd(action.data.pos, action.data.musics)
        break
      case 'update':
        await dbService.playListUpdate(action.data)
        break
      case 'remove':
        await dbService.playListRemove(action.data)
        break
      case 'played':
        await dbService.playListUpdatePlayed(true, action.data)
        break
      case 'unplayed':
        await dbService.playListUpdatePlayed(false, action.data)
        break
      case 'unplayedAll':
        await dbService.playListUpdatePlayedAll(false)
        break
      case 'posUpdate': {
        await dbService.playListUpdatePosition(action.data.pos, action.data.musics)
        break
      }
      // default:
      //   // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
      //   let unknownAction: never = action
    }
    this.emitEvent('playListAction', action)
  }

  async playHistoryListAction(action: AnyListen.IPCPlayer.PlayHistoryListAction): Promise<void> {
    switch (action.action) {
      case 'setList':
        await dbService.setMetadataPlayHistoryList(action.data)
        break
      case 'addList':
        await dbService.addMetadataPlayHistoryList(action.data)
        break
      case 'removeIdx':
        await dbService.removeMetadataPlayHistoryList(action.data)
        break
      // default:
      //   // eslint-disable-next-line no-case-declarations, @typescript-eslint/no-unused-vars
      //   let unknownAction: never = action
    }
    this.emitEvent('playHistoryListAction', action)
  }

  playerEvent(event: AnyListen.IPCPlayer.PlayerEvent) {
    this.emitEvent('playerEvent', event)
  }

  musicChanged(index: number, historyIndex: number) {
    this.emitEvent('musicChanged', index, historyIndex)
  }

  musicInfoUpdated(info: AnyListen.Player.MusicInfo) {
    this.emitEvent('musicInfoUpdated', info)
  }

  playInfoUpdated(info: AnyListen.Player.PlayInfo) {
    this.emitEvent('playInfoUpdated', info)
  }

  progress(progress: AnyListen.IPCPlayer.Progress) {
    this.emitEvent('progress', progress)
  }

  playbackRate(playbackRate: number) {
    this.emitEvent('playbackRate', playbackRate)
  }

  status(status: AnyListen.IPCPlayer.Status) {
    this.emitEvent('status', status)
  }

  statusText(status: string) {
    this.emitEvent('statusText', status)
  }

  collectStatus(status: boolean) {
    this.emitEvent('collectStatus', status)
  }

  picUpdated(url: string | null) {
    this.emitEvent('picUpdated', url)
  }

  lyricUpdated(info: AnyListen.Music.LyricInfo) {
    this.emitEvent('lyricUpdated', info)
  }

  lyricOffsetUpdated(offset: number) {
    this.emitEvent('lyricOffsetUpdated', offset)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const playerEvent = new Event() as EventType<Event>

export const initPlayerEvent = (_dbService: DBSeriveTypes) => {
  dbService = _dbService
}
