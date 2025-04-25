import _Event, { type EventType2 } from '@any-listen/nodejs/Event'

export class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  extensionEvent(action: AnyListen.IPCExtension.EventExtension) {
    this.emit('extensionEvent', action)
  }

  crash(message: string) {
    this.emitEvent('crash', message)
    this.extensionEvent({ action: 'crash', data: message })
  }

  error(message: string) {
    this.emitEvent('error', message)
    this.extensionEvent({ action: 'error', data: message })
  }

  loadListStart() {
    this.emitEvent('loadListStart')
    this.extensionEvent({ action: 'loadListStart' })
  }

  loadListEnd() {
    this.emitEvent('loadListEnd')
    this.extensionEvent({ action: 'loadListEnd' })
  }

  starting() {
    this.emitEvent('starting')
    this.extensionEvent({ action: 'starting' })
  }

  started() {
    this.emitEvent('started')
    this.extensionEvent({ action: 'started' })
  }

  loading(id: string) {
    this.emitEvent('loading', id)
    this.extensionEvent({ action: 'loading', data: id })
  }

  loadError(id: string, message: string) {
    this.emitEvent('loadError', id, message)
    this.extensionEvent({ action: 'loadError', data: { id, message } })
  }

  enabled(id: string, enabled: boolean) {
    this.emitEvent('enabled', id)
    this.extensionEvent({ action: 'enabled', data: { id, enabled } })
  }

  loaded(id: string, loadTimestamp: number) {
    this.emitEvent('loaded', id, loadTimestamp)
    this.extensionEvent({ action: 'loaded', data: { id, loadTimestamp } })
  }

  stoping(id: string) {
    this.emitEvent('stoping', id)
    this.extensionEvent({ action: 'stoping', data: id })
  }

  stoped(id: string) {
    this.emitEvent('stoped', id)
    this.extensionEvent({ action: 'stoped', data: id })
  }

  listAdd(extension: AnyListen.Extension.Extension) {
    this.emitEvent('listAdd', extension)
    this.extensionEvent({ action: 'listAdd', data: extension })
  }

  listRemove(id: string) {
    this.emitEvent('listRemove', id)
    this.extensionEvent({ action: 'listRemove', data: id })
  }

  listUpdate(extension: AnyListen.Extension.Extension) {
    this.emitEvent('listUpdate', extension)
    this.extensionEvent({ action: 'listUpdate', data: extension })
  }

  listSet(extensions: AnyListen.Extension.Extension[]) {
    this.emitEvent('listSet', extensions)
    this.extensionEvent({ action: 'listSet', data: extensions })
  }

  logOutput(info: AnyListen.LogInfo) {
    this.emitEvent('logOutput', info)
    this.extensionEvent({ action: 'logOutput', data: info })
  }

  resourceUpdated(list: AnyListen.Extension.ResourceList) {
    this.emitEvent('resourceUpdated', list)
    this.extensionEvent({ action: 'resourceUpdated', data: list })
  }

  extenstionSettingUpdated(extId: string, keys: string[], setting: Record<string, any>) {
    this.emitEvent('extenstionSettingUpdated', extId, keys, setting)
    this.extensionEvent({ action: 'extenstionSettingUpdated', data: { id: extId, keys, setting } })
  }

  musicListAction(action: AnyListen.IPCList.ActionList) {
    this.emitEvent('musicListAction', action)
  }

  playerEvent(event: AnyListen.IPCPlayer.PlayerEvent) {
    this.emitEvent('playerEvent', event)
  }

  playListAction(action: AnyListen.IPCPlayer.PlayListAction) {
    this.emitEvent('playListAction', action)
  }

  playHistoryListAction(action: AnyListen.IPCPlayer.PlayHistoryListAction) {
    this.emitEvent('playHistoryListAction', action)
  }

  // clientConnected(id: string) {
  //   this.emitEvent('clientConnected', id)
  // }

  // clientDisconnected(id: string) {
  //   this.emitEvent('clientDisconnected', id)
  // }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const extensionEvent = new Event() as EventType2<Event>
