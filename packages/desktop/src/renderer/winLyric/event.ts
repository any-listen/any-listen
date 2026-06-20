import _Event, { type EventType } from '@any-listen/nodejs/Event'

class Event extends _Event {
  emitEvent<K extends keyof EventMethods>(eventName: K, ...args: unknown[]) {
    this.emit(eventName, ...args)
  }

  created(browserWindow: Electron.BrowserWindow) {
    this.emitEvent('created', browserWindow)
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
}

type EventMethods = Omit<Event, keyof _Event | 'emitEvent'>

export const winLyricEvent = new Event() as EventType<Event>
