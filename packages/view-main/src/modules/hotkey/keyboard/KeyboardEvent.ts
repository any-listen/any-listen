// import mitt from 'mitt'
// import type { Emitter } from 'mitt'

import type { KeyAction, Modifiers } from './keyBind'

const nextTick = typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type KeyName = `${Modifiers}+${string}_${KeyAction}` | `${string}_${KeyAction}` | string
type KeyEvent = AnyListen.KeyDownEevent & {
  stopPropagation: () => void
}
export default class KeyboardEvent {
  listeners: Map<KeyName, Array<[(event: KeyEvent) => unknown, boolean]>>
  anyKeyListeners: Array<(event: AnyListen.KeyDownEevent) => void>
  constructor() {
    this.listeners = new Map()
    this.anyKeyListeners = []
  }

  on(eventName: KeyName, listener: (event: KeyEvent) => unknown, capture = false) {
    let targetListeners = this.listeners.get(eventName)
    if (!targetListeners) this.listeners.set(eventName, (targetListeners = []))
    targetListeners.push([listener, capture])
    return () => {
      this.off(eventName, listener)
    }
  }

  off(eventName: KeyName, listener: (event: KeyEvent) => unknown) {
    let targetListeners = this.listeners.get(eventName)
    if (!targetListeners) return
    const index = targetListeners.findIndex((m) => m[0] === listener)
    if (index < 0) return
    targetListeners.splice(index, 1)
  }

  async emit(eventName: KeyName, event: AnyListen.KeyDownEevent) {
    // console.log(eventName, event)
    return new Promise<boolean>((resolve) => {
      nextTick(() => {
        let targetListeners = this.listeners.get(eventName)
        resolve(false)
        if (!targetListeners) return
        let captures: Array<(event: KeyEvent) => unknown> = []
        let isStop = false
        for (const [listener, capture] of targetListeners) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (isStop) return
          if (capture) {
            listener({
              ...event,
              // eslint-disable-next-line no-loop-func
              stopPropagation() {
                event.event?.stopPropagation()
                isStop = true
                resolve(true)
              },
            })
            continue
          }
          captures.push(listener)
        }
        if (captures.length) {
          for (const listener of captures) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (isStop) return
            listener({
              ...event,
              // eslint-disable-next-line no-loop-func
              stopPropagation() {
                event.event?.stopPropagation()
                isStop = true
                resolve(true)
              },
            })
          }
        }
        resolve(false)
      })
    })
  }

  offAll(eventName: KeyName) {
    let targetListeners = this.listeners.get(eventName)
    if (!targetListeners) return
    this.listeners.delete(eventName)
  }

  onAnyKey(listener: (event: AnyListen.KeyDownEevent) => unknown) {
    this.anyKeyListeners.push(listener)
    return () => {
      this.offAnyKey(listener)
    }
  }

  offAnyKey(listener: (event: AnyListen.KeyDownEevent) => unknown) {
    const index = this.anyKeyListeners.indexOf(listener)
    if (index < 0) return
    this.anyKeyListeners.splice(index, 1)
  }

  offAnyKeyAll() {
    this.anyKeyListeners = []
  }

  emitAnyKey(event: AnyListen.KeyDownEevent) {
    nextTick(() => {
      for (const listener of this.anyKeyListeners) {
        listener(event)
      }
    })
  }
}
