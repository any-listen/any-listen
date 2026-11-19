import { appState } from '@/modules/app/store/state'

const isMac = appState.os == 'mac'

const downKeys = new Set<string>()

export type KeyActionType = AnyListen.KeyDownEevent['type']
export type Keys = AnyListen.KeyDownEevent['keys']
export type Key = AnyListen.KeyDownEevent['key']
export type EventKey = AnyListen.KeyDownEevent['eventKey']
export type Event = AnyListen.KeyDownEevent['event']

export type Modifiers = 'ctrl' | 'shift' | 'alt' | 'meta' | 'mod'
export type KeyAction = 'down' | 'up'

const handleEvent = (type: KeyActionType, event: KeyboardEvent, keys: Keys, isEditing: boolean) => {
  let eventKey = event.key
  if (isMac) {
    let index = keys.indexOf('meta')
    if (index > -1) keys.splice(index, 1, 'mod')
    if (eventKey == 'Meta') eventKey = 'mod'
  } else {
    let index = keys.indexOf('ctrl')
    if (index > -1) keys.splice(index, 1, 'mod')
    if (eventKey == 'Control') eventKey = 'mod'
  }
  let key = keys.join('+')

  switch (type) {
    case 'down':
      downKeys.add(key)
      break
    case 'up':
      downKeys.delete(key)
      break
  }
  handleSendEvent(key, eventKey, type, event, keys, isEditing)
}

// 修饰键处理
const modifierOrder = ['ctrl', 'shift', 'alt', 'meta']

const eventModifiers = (event: KeyboardEvent): string[] => {
  let modifiers: string[] = []
  if (event.ctrlKey) modifiers.push('ctrl')
  if (event.shiftKey) modifiers.push('shift')
  if (event.altKey) modifiers.push('alt')
  if (event.metaKey) modifiers.push('meta')

  return modifiers
}

// 是否忽略事件（表单元素等默认忽略）
const assertStopCallback = (element: HTMLElement) => {
  // if the element has the class "keybind" then no need to stop
  if (element.classList.contains('key-bind')) return false

  // stop for input, select, and textarea
  switch (element.tagName) {
    case 'INPUT':
    case 'SELECT':
    case 'TEXTAREA':
      return true
    default:
      return !!element.isContentEditable
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  // if (assertStopCallback(event.target)) return
  if (!event.code) return
  // event.preventDefault()
  let keys = eventModifiers(event)
  switch (event.key) {
    case 'Control':
    case 'Alt':
    case 'Meta':
    case 'Shift':
      break
    case ' ':
      keys.push('space')
      break
    default:
      keys.push((event.code.includes('Numpad') ? event.code.replace(/^Numpad(\w{1,3})\w*$/i, 'num$1') : event.key).toLowerCase())
      break
  }
  handleEvent('down', event, keys, event.target ? assertStopCallback(event.target as HTMLElement) : false)
}

const handleKeyUp = (event: KeyboardEvent) => {
  // if (assertStopCallback(event.target)) return
  if (!event.code) return
  event.preventDefault()
  let keys = eventModifiers(event)
  switch (event.key) {
    case 'Control':
    case 'Shift':
    case 'Alt':
    case 'Meta':
      // 修饰键自身的 keyup 不再出现在 eventModifiers 里，补回后需按规范序排列，
      // 让 up 事件的键名与按下时一致（如 ctrl+shift 期间松开 ctrl 不能变成 shift+mod）
      keys.push(event.key == 'Control' ? 'ctrl' : event.key.toLowerCase())
      keys.sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b))
      break
    case ' ':
      keys.push('space')
      break
    default:
      keys.push((event.code.includes('Numpad') ? event.code.replace(/^Numpad(\w{1,3})\w*$/i, 'num$1') : event.key).toLowerCase())
      break
  }
  handleEvent('up', event, keys, event.target ? assertStopCallback(event.target as HTMLElement) : false)
}

type HandleSendEvent = (key: Key, eventKey: EventKey, type: KeyActionType, event: Event, keys: Keys, isEditing: boolean) => void
let handleSendEvent: HandleSendEvent

const bindKey = (handle: HandleSendEvent = () => {}) => {
  handleSendEvent = handle
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
}

const unbindKey = () => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
}

const clearDownKeys = () => {
  let keys = Array.from(downKeys)
  for (let i = keys.length - 1; i > -1; i--) {
    handleSendEvent(keys[i], keys[i], 'up', null, [keys[i]], false)
  }
  downKeys.clear()
}

export default {
  bindKey,
  unbindKey,
  clearDownKeys,
}
