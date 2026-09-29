import _Event, { type EventType } from '@any-listen/nodejs/Event'

export class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  hot_key_down(key: string) {
    this.emitEvent('hot_key_down', key)
  }

  config_updated(config: AnyListen.HotKey.Config) {
    this.emitEvent('config_updated', config)
  }

  enable_chenged(config: AnyListen.HotKey.Enable) {
    this.emitEvent('enable_chenged', config)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const hotKeyEvent = new Event() as EventType<Event>
