import _Event, { type EventType } from '@any-listen/nodejs/Event'

class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  ready_to_show() {
    this.emitEvent('ready_to_show')
  }

  inited() {
    this.emitEvent('inited')
  }

  show() {
    this.emitEvent('show')
  }

  hide() {
    this.emitEvent('hide')
  }

  focus() {
    this.emitEvent('focus')
  }

  blur() {
    this.emitEvent('blur')
  }

  close() {
    this.emitEvent('close')
  }

  fullscreen(isFullscreen: boolean) {
    this.emitEvent('fullscreen', isFullscreen)
  }
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const winMainEvent = new Event() as EventType<Event>
