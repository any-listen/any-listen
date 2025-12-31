import _Event from './Event'
// if (typeof globalThis.AbortController === 'undefined') {
//   const SECRET = {}

//   globalThis.AbortSignal = (function () {
//     function AbortSignal(secret) {
//       if (secret !== SECRET) {
//         throw new TypeError('Illegal constructor.')
//       }
//       EventTarget.call(this)
//       this._aborted = false
//     }

//     AbortSignal.prototype = Object.create(EventTarget.prototype)
//     AbortSignal.prototype.constructor = AbortSignal

//     Object.defineProperty(AbortSignal.prototype, 'onabort', {
//       get() {
//         return this._onabort
//       },
//       set(callback) {
//         const existing = this._onabort
//         if (existing) {
//           this.removeEventListener('abort', existing)
//         }
//         this._onabort = callback
//         this.addEventListener('abort', callback)
//       },
//     })

//     Object.defineProperty(AbortSignal.prototype, 'aborted', {
//       get() {
//         return this._aborted
//       },
//     })

//     return AbortSignal
//   })()

//   globalThis.AbortController = (function () {
//     function AbortController() {
//       this._signal = new AbortSignal(SECRET)
//     }

//     AbortController.prototype = Object.create(Object.prototype)

//     Object.defineProperty(AbortController.prototype, 'signal', {
//       get() {
//         return this._signal
//       },
//     })

//     AbortController.prototype.abort = function () {
//       const signal = this.signal
//       if (!signal.aborted) {
//         signal._aborted = true
//         signal.dispatchEvent(new Event('abort'))
//       }
//     }

//     return AbortController
//   })()
// }

const SECRET = Symbol('AbortControllerSecret')
export class AbortSignal extends _Event {
  _aborted: boolean
  _onabort?: () => void
  constructor(secret: symbol) {
    if (secret !== SECRET) throw new TypeError('Illegal constructor.')
    super()
    this._aborted = false
  }

  get onabort() {
    return this._onabort
  }

  set onabort(callback: (() => void) | undefined) {
    const existing = this._onabort
    if (existing) this.off('abort', existing)
    if (callback) {
      this._onabort = callback
      this.on('abort', callback)
    }
  }

  get aborted() {
    return this._aborted
  }
}

export class AbortController {
  _signal: AbortSignal
  constructor() {
    this._signal = new AbortSignal(SECRET)
  }

  get signal() {
    return this._signal
  }

  abort() {
    const signal = this.signal
    if (!signal.aborted) {
      signal._aborted = true
      signal.emit('abort')
    }
  }
}
