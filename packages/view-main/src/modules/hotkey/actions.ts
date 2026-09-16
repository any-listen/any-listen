import type { HOTKEY_Type } from '@any-listen/common/hotKey'

import * as player from '@/modules/player/actions'
import { playerState } from '@/modules/player/store/state'
import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'

import { hotkeyEvent } from './store/event'

export const registerHotkeyActions = () => {
  const toggleSetting = async (key: 'desktopLyric.enable' | 'desktopLyric.isLock' | 'desktopLyric.isAlwaysOnTop') =>
    updateSetting({ [key]: !settingState.setting[key] })
  const actions: Partial<Record<HOTKEY_Type, () => unknown>> = {
    player_toggle_play: player.togglePlay,
    player_prev: player.skipPrev,
    player_next: player.skipNext,
    player_volume_up: () => {
      player.setVolume(Math.min(1, playerState.volume + 0.05))
    },
    player_volume_down: () => {
      player.setVolume(Math.max(0, playerState.volume - 0.05))
    },
    player_volume_mute: () => {
      player.setVolumeMute(!playerState.volumeMute)
    },
    player_music_love: player.collectMusic,
    player_music_unlove: player.uncollectMusic,
    player_music_dislike: player.dislikeMusic,
    win_lyric_toggle_visible: async () => toggleSetting('desktopLyric.enable'),
    win_lyric_toggle_lock: async () => toggleSetting('desktopLyric.isLock'),
    win_lyric_toggle_always_top: async () => toggleSetting('desktopLyric.isAlwaysOnTop'),
  }
  const off = Object.entries(actions).map(([name, action]) =>
    hotkeyEvent.on(name as HOTKEY_Type, () => {
      void Promise.resolve().then(action).catch(console.error)
    })
  )
  return () => {
    for (const unsubscribe of off) unsubscribe()
  }
}
