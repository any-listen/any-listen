import _Event, { type EventType } from '@any-listen/nodejs/Event'

export class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  logOutput(type: AnyListen.LogType, log: string) {
    this.emit('logOutput', type, log)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const appLogEvent = new Event() as EventType<Event>
