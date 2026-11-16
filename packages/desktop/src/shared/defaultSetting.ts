import defaultSetting from '@any-listen/common/defaultSetting'
// import os from 'node:os'
// import path from 'node:path'

if (import.meta.env.VITE_IS_WINDOWS) {
  defaultSetting['tray.themeId'] = -1
  defaultSetting['playDetail.coverStyle'] = 'square'
  // defaultSetting['desktopLyric.isLockScreen'] = true
} else {
  defaultSetting['player.isPlayAwlrc'] = false
  if (import.meta.env.VITE_IS_MAC) {
    defaultSetting['tray.themeId'] = 0
  }
  if (import.meta.env.VITE_IS_MAC || import.meta.env.VITE_IS_LINUX) {
    // The in-app rounded corners & shadow are drawn inside a transparent margin.
    // On Linux the compositor does not draw a window shadow behind a transparent
    // window, so that margin shows the desktop/window behind it as a transparent
    // ring around the window. Default to a native opaque window there instead.
    defaultSetting['common.transparentWindow'] = false
  }
}

// defaultSetting['download.savePath'] = path.join(os.homedir(), 'Desktop')

export default defaultSetting
