export interface HotkeyBinding {
  key: string
  fullCommand: string
  name: string
  description?: string
}

export const formatHotKeyName = (name: string) => {
  if (name.includes('arrow')) {
    name = name.replace(/arrow(left|right|up|down)/, (s) => {
      switch (s) {
        case 'arrowleft':
          return '←'
        case 'arrowright':
          return '→'
        case 'arrowup':
          return '↑'
        case 'arrowdown':
          return '↓'
        default:
          return s
      }
    })
  }
  if (name.includes('mod')) name = name.replace('mod', window.os == 'mac' ? 'Command' : 'Ctrl')
  name = name.replace(/(\+|^)[a-z]/g, (l) => l.toUpperCase())
  if (name.length > 1) name = name.replace(/\+/g, ' + ')
  return name
}
