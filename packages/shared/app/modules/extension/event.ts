import _Event, { type EventType } from '@any-listen/nodejs/Event'

import type { ExtensionSeriveTypes } from '../worker/utils'
import { extensionState } from './state'

export class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  setup(service: ExtensionSeriveTypes) {
    this.emitEvent('setup', service)
  }

  extensionEvent(event: AnyListen.IPCExtension.EventExtension) {
    switch (event.action) {
      case 'crash':
        extensionState.crashMessage = event.data
        break
      case 'loadListStart':
        extensionState.crashMessage &&= null
        break
      default:
        break
    }
    this.emitEvent('extensionEvent', event)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const extensionEvent = new Event() as EventType<Event>
