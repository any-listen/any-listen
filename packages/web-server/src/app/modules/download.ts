import { getSettings, t } from '@any-listen/app/common'
import { downloadSettingsChanged, initDownload as initDownloadService } from '@any-listen/app/modules/download'
import { buildRealPublicPath } from '@any-listen/common/tools'

import { appEvent, appState } from '@/app/app'
import { workers } from '@/app/worker'

import { checkDownloadPath } from './fileSystem'
import { getLyricInfo, getMusicUrl } from './music/online'

export const initDownload = async () => {
  await initDownloadService({
    dbService: workers.dbService,
    getSettings,
    getMusicUrl,
    getLyricInfo,
    createLocalMusicInfos: (paths) => workers.utilService.createLocalMusicInfos(paths, appState.machineId, true),
    translate: t,
    checkPath: checkDownloadPath,
    resolveUrl: (url) => new URL(buildRealPublicPath(url, global.anylisten.serverHost), global.anylisten.serverHost).href,
  })
  appEvent.on('updated_config', () => downloadSettingsChanged())
}
