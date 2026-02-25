import { isWin, sleep } from '@any-listen/nodejs/index'
import { autoUpdater } from 'electron-updater'

import { appActions, appEvent } from '@/app'
import { log } from '@/shared/log'

import type { Update } from './update'

autoUpdater.logger = log
autoUpdater.autoDownload = false
// autoUpdater.forceDevUpdateConfig = true

// log.info('App starting...')

// TODO
function sendStatusToWindow(text: string) {
  log.info(text)
  // ipcMain.send('message', text)
}

let update: Update

export const initUpdate = (_update: Update) => {
  update = _update
  appEvent.on('proxy_changed', (host, port, electronProxy) => {
    void autoUpdater.netSession.setProxy(electronProxy)
  })
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...')
  })
  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.')
  })
  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.')
  })
  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater.')
    update.emit('error', err)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`
    logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`
    logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`
    sendStatusToWindow(logMessage)
    update.emit('download_progress', progressObj)
  })
  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded.')
    update.emit('update_downloaded')
  })
}

export const checkUpdate = async (allowPrerelease: boolean) => {
  // 由于集合安装包中不包含win arm版，这将会导致arm版更新失败
  if (!isWin || !process.arch.includes('arm')) {
    autoUpdater.allowPrerelease = allowPrerelease
    await autoUpdater.checkForUpdates()
  } else {
    update.emit('error', new Error('Windows ARM is not supported'))
  }
}

export const downloadUpdate = async () => {
  if (!autoUpdater.isUpdaterActive()) {
    update.emit('error', new Error('No update available'))
    return
  }
  update.emit('download_progress', { percent: 0, bytesPerSecond: 0, total: 0, transferred: 0, delta: 0 })
  await autoUpdater.downloadUpdate().catch((err: Error) => {
    update.emit('error', err)
  })
}

export const restartUpdate = async () => {
  appActions.setSkipTrayQuit(true)

  await sleep(1000)
  autoUpdater.quitAndInstall(true, true)
  await sleep(3000)
}
