import WebEvent, { type EventType } from '@any-listen/web/Event'

import type { InitState } from './state'

class Event extends WebEvent {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  crash(message: string) {
    this.emitEvent('crash', message)
  }

  listChanged(isChanged = false) {
    this.emitEvent('listChanged', isChanged)
  }

  statusChanged(status: InitState['status']) {
    this.emitEvent('statusChanged', status)
  }

  resourceListUpdated(list: InitState['resourceList']) {
    this.emitEvent('resourceListUpdated', list)
  }

  onlineExtensionListUpdated(list: InitState['onlineExtensionList']) {
    this.emitEvent('onlineExtensionListUpdated', list)
  }

  extenstionSettingUpdated(setting: AnyListen.IPCExtension.EventExtensionSettingUpdated) {
    this.emitEvent('extenstionSettingUpdated', setting)
  }

  logOutput(info: AnyListen.LogInfo) {
    this.emitEvent('logOutput', info)
  }
}

type EventMethods = Omit<Event, keyof WebEvent | 'emitEvent'>

export const extensionEvent = new Event() as EventType<Event>
