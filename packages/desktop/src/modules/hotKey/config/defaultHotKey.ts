import type { VIEW_MAIN_COMMANDS, MAIN_COMMANDS } from '@any-listen/common/command'

type LocalCommands = (typeof VIEW_MAIN_COMMANDS)[number] | (typeof MAIN_COMMANDS)[number]
const local: AnyListen.HotKey.HotKeyConfig = {
  enable: true,
  keys: {
    'mod+f5': 'playToggle',
    'mod+arrowleft': 'previous',
    'mod+arrowright': 'next',
    f1: 'focusSearchInput',
  } satisfies Record<string, LocalCommands>,
}

const global: AnyListen.HotKey.HotKeyConfig = {
  enable: false,
  keys: {
    'mod+alt+f5': 'playToggle',
    'mod+alt+arrowleft': 'previous',
    'mod+alt+arrowright': 'next',
    'mod+alt+arrowup': 'volumeUp',
    'mod+alt+arrowdown': 'volumeDown',
    'mod+alt+0': 'desktopLyric.showToggle',
    'mod+alt+-': 'desktopLyric.lockToggle',
    'mod+alt+=': 'desktopLyric.alwaysOnTopToggle',
  } satisfies Record<string, LocalCommands>,
}

export default {
  local,
  global,
}
