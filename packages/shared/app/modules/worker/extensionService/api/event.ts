import _Event, { type EventType } from '@any-listen/nodejs/Event'

export class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  extensionLoadEnd() {
    this.emitEvent('extensionLoadEnd')
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const extensionAPIEvent = new Event() as EventType<Event>
