import _Event, { type EventType } from '@any-listen/web/Event'

class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  inited() {
    this.emitEvent('inited')
  }

  updated(keys: Array<keyof AnyListen.AppSetting>, setting: Partial<AnyListen.AppSetting>) {
    this.emitEvent('updated', keys, setting)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const settingEvent = new Event() as EventType<Event>
