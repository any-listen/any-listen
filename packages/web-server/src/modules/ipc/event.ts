import _Event, { type EventType } from '@any-listen/nodejs/Event'

import type { ServerSocket } from './websocket'

class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  new_socket(socket: ServerSocket) {
    this.emitEvent('new_socket', socket)
  }

  remove_session(clientId: string) {
    this.emitEvent('remove_session', clientId)
  }

  new_socket_inited(socket: ServerSocket) {
    this.emitEvent('new_socket_inited', socket)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const socketEvent = new Event() as EventType<Event>
