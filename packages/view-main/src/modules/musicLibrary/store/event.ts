import _Event, { type EventType } from '@any-listen/web/Event'

class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  userListInited() {
    this.emitEvent('userListInited')
  }

  anyListChanged(ids: string[]) {
    this.emitEvent('anyListChanged', ids)
  }

  listSubListChanged(ids: AnyListen.List.ParentId[]) {
    if (!ids.length) return
    this.emitEvent('listSubListChanged', ids)
  }

  listChanged(ids: string[]) {
    if (!ids.length) return
    this.emitEvent('listChanged', ids)
  }

  listMusicChanged(ids: string[]) {
    if (!ids.length) return
    this.emitEvent('listMusicChanged', ids)
  }

  listMusicUpdated(updateInfo: Map<string, AnyListen.Music.MusicInfo[]>) {
    if (!updateInfo.size) return
    this.emitEvent('listMusicUpdated', updateInfo)
  }

  listMusicRemovedBefore(listId: string, musicIds: string[]) {
    if (!musicIds.length) return
    this.emitEvent('listMusicRemovedBefore', listId, musicIds)
  }

  fetchingListStatusUpdated(id: string, val: boolean) {
    this.emitEvent('fetchingListStatusUpdated', id, val)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const musicLibraryEvent = new Event() as EventType<Event>
