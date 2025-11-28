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

  release() {
    this.emitEvent('release')
  }

  fullscreen(isFullscreen: boolean) {
    this.emitEvent('fullscreen', isFullscreen)
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

  scrollListTo(listId: string, musicId: string) {
    this.emitEvent('scrollListTo', listId, musicId)
  }
}

type EventMethods = Omit<Event, keyof WebEvent | 'emitEvent'>

export const appEvent = new Event() as EventType<Event>
