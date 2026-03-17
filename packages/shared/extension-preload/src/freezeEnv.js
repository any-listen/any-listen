export const freezeEnv = (extensionAPI) => {
  const freezeObject = (obj) => {
    if (typeof obj != 'object') return
    Object.freeze(obj)
    for (const subObj of Object.values(obj)) freezeObject(subObj)
  }
  freezeObject(extensionAPI)
  const _toString = Function.prototype.toString

  Function.prototype.toString = function () {
    const desc = Object.getOwnPropertyDescriptor(this, 'name')
    if (!desc || desc.configurable) {
      return _toString.call(this)
    }
    return `function ${this.name || ''}() { [native code] }`
  }

  globalThis.eval = function () {
    throw new Error('eval is not available')
  }
  // @ts-expect-error
  globalThis.Function = function () {
    throw new Error('Function is not available')
  }
  const excludes = [Function.prototype.toString, Function.prototype.toLocaleString, Object.prototype.toString]
  const freezeObjectProperty = (obj, freezedObj = new Set()) => {
    if (obj == null) return
    switch (typeof obj) {
      case 'object':
      case 'function':
        if (freezedObj.has(obj)) return
        // Object.freeze(obj)
        freezedObj.add(obj)
        for (const [name, { ...config }] of Object.entries(Object.getOwnPropertyDescriptors(obj))) {
          if (!excludes.includes(config.value)) {
            config.writable &&= false
            config.configurable &&= false
            Object.defineProperty(obj, name, config)
          }
          freezeObjectProperty(config.value, freezedObj)
        }
    }
  }
  freezeObjectProperty(globalThis)
}
