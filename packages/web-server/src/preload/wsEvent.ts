import WebEvent, { type EventType } from '@any-listen/web/Event'

import type { IPCSocket } from './ws'

class Event extends WebEvent {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  connected(socket: IPCSocket) {
    this.emitEvent('connected', socket)
  }

  disconnected() {
    this.emitEvent('disconnected')
  }

  logout() {
    this.emitEvent('logout')
  }
}

type EventMethods = Omit<Event, keyof WebEvent | 'emitEvent'>

export const wsEvent = new Event() as EventType<Event>
