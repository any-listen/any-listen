import defaultSetting from '@any-listen/common/defaultSetting'
import { isMac, isWin } from '@any-listen/nodejs/index'
import os from 'node:os'
import path from 'node:path'

if (isWin) {
  defaultSetting['desktopLyric.isLockScreen'] = true
} else {
  defaultSetting['player.isPlayAwlrc'] = false
  if (isMac) {
    defaultSetting['common.controlBtnPosition'] = 'right'
  }
}

defaultSetting['download.savePath'] = path.join(os.homedir(), 'Desktop')

export default defaultSetting
