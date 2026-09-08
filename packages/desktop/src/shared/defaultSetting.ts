import defaultSetting from '@any-listen/common/defaultSetting'
// import os from 'node:os'
// import path from 'node:path'

if (import.meta.env.VITE_IS_WINDOWS) {
  defaultSetting['playDetail.coverStyle'] = 'square'
  // defaultSetting['desktopLyric.isLockScreen'] = true
} else {
  defaultSetting['player.isPlayAwlrc'] = false
  if (import.meta.env.VITE_IS_MAC) {
    defaultSetting['tray.themeId'] = 0
    defaultSetting['common.transparentWindow'] = false
  }
}

// defaultSetting['download.savePath'] = path.join(os.homedir(), 'Desktop')

export default defaultSetting
