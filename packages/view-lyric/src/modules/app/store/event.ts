import WebEvent, { type EventType } from '@any-listen/web/Event'

class Event extends WebEvent {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  connected() {
    this.emitEvent('connected')
  }

  connectFailed(message: string) {
    this.emitEvent('connectFailed', message)
  }

  desconnected() {
    this.emitEvent('desconnected')
  }

  visible(visible: boolean) {
    this.emitEvent('visible', visible)
  }

  focus() {
    this.emitEvent('focus')
  }

  blur() {
    this.emitEvent('blur')
  }

  drag(end?: boolean) {
    this.emitEvent('drag', end)
  }

  winMainIPCConnected() {
    this.emitEvent('winMainIPCConnected')
  }

  winMainIPCDisconnected() {
    this.emitEvent('winMainIPCDisconnected')
  }
}

type EventMethods = Omit<Event, keyof WebEvent | 'emitEvent'>

export const appEvent = new Event() as EventType<Event>
