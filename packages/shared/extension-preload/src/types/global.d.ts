import './api'

declare global {
  var setTimeout: <TArgs extends unknown[]>(callback: (...args: TArgs) => void, ms?: number, ...args: TArgs) => number
  var clearTimeout: (timeoutId: number) => void
  var setInterval: <TArgs extends unknown[]>(callback: (...args: TArgs) => void, ms?: number, ...args: TArgs) => number
  var clearInterval: (intervalId: number) => void

  var require: (moduleName: 'any-listen') => AnyListen_API.API
}

export {}
