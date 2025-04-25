import type { HOTKEY_Type } from '@any-listen/common/hotKey'

const local: AnyListen.HotKey.HotKeyConfig<HOTKEY_Type> = {
  enable: true,
  keys: {
    'mod+f5': 'player_toggle_play',
    'mod+arrowleft': 'player_prev',
    'mod+arrowright': 'player_next',
    f1: 'view_main_focus_search_input',
  },
}

const global: AnyListen.HotKey.HotKeyConfig<HOTKEY_Type> = {
  enable: false,
  keys: {
    // MediaPlayPause: {
    //   type: HOTKEY_PLAYER.toggle_play.type,
    //   name: '',
    //   action: HOTKEY_PLAYER.toggle_play.action,
    // },
    // MediaPreviousTrack: {
    //   type: HOTKEY_PLAYER.prev.type,
    //   name: '',
    //   action: HOTKEY_PLAYER.prev.action,
    // },
    // MediaNextTrack: {
    //   type: HOTKEY_PLAYER.next.type,
    //   name: '',
    //   action: HOTKEY_PLAYER.next.action,
    // },
    'mod+alt+f5': 'player_toggle_play',
    'mod+alt+arrowleft': 'player_prev',
    'mod+alt+arrowright': 'player_next',
    'mod+alt+arrowup': 'player_volume_up',
    'mod+alt+arrowdown': 'player_volume_down',
    'mod+alt+0': 'win_lyric_toggle_visible',
    'mod+alt+-': 'win_lyric_toggle_lock',
    'mod+alt+=': 'win_lyric_toggle_always_top',
  },
}

export default {
  local,
  global,
}
