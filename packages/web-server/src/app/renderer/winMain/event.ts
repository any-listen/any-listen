import _Event, { type EventType } from '@any-listen/nodejs/Event'

import type { ServerSocket } from '@/modules/ipc/websocket'

class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  new_instance(socket: ServerSocket) {
    this.emitEvent('new_instance', socket)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const winMainEvent = new Event() as EventType<Event>
