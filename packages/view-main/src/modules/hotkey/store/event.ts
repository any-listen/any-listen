import _Event, { type EventType } from '@any-listen/web/Event'

class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  configInit(config: AnyListen.HotKey.HotKeyConfigAll) {
    this.emitEvent('configInit', config)
  }

  configUpdated(config: AnyListen.HotKey.Config) {
    this.emitEvent('configUpdated', config)
  }

  enableUpdated(config: AnyListen.HotKey.Enable) {
    this.emitEvent('enableUpdated', config)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const hotkeyEvent = new Event() as EventType<Event>
