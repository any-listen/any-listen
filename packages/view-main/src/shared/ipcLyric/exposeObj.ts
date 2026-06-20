import { playerState } from '@/modules/player/store/state'
import { updateSetting } from '@/modules/setting/store/action'
import { settingState } from '@/modules/setting/store/state'
import { themeState } from '@/modules/theme/store/state'
import { getCurrentTime } from '@/plugins/player'

import { playerActionEvent } from '../ipc/player/event'

export const exposeObj: AnyListen.IPCWinMainActions.IPCWinMainActions = {
  async getSetting() {
    return settingState.setting
  },
  async setSetting(setting) {
    await updateSetting(setting)
  },
  async getThemeSetting() {
    return themeState.theme
  },
  async getPlayerCurrentTime() {
    return getCurrentTime()
  },
  async getPlayerInfo() {
    return {
      musicInfo: playerState.musicInfo,
      playerPlaying: playerState.playerPlaying,
      playing: playerState.playing,
      statusText: playerState.statusText,
      loadErrorPicUrl: playerState.loadErrorPicUrl,
      progress: playerState.progress,
      playbackRate: playerState.playbackRate,
    }
  },
  async playerAction(action) {
    playerActionEvent.emit(action)
  },
}
