import path from 'node:path'
import os from 'node:os'
import { isMac, isWin } from '@any-listen/nodejs/index'
import defaultSetting from '@any-listen/common/defaultSetting'

if (isMac) {
  // TODO
  // defaultSetting['common.controlBtnPosition'] = 'right'
} else if (isWin) {
  defaultSetting['player.isPlayAwlrc'] = true
  defaultSetting['desktopLyric.isLockScreen'] = true
}

defaultSetting['download.savePath'] = path.join(os.homedir(), 'Desktop')

export default defaultSetting
