import { getSettings, t } from '@any-listen/app/common'
import { downloadSettingsChanged, initDownload as initDownloadService } from '@any-listen/app/modules/download'
import { proxyServerState } from '@any-listen/app/modules/proxyServer'
import { buildRealPublicPath } from '@any-listen/common/tools'

import { appEvent, appState } from '@/app'
import { workers } from '@/worker'

import { getLyricInfo, getMusicUrl } from './music/online'

export const initDownload = async () => {
  await initDownloadService({
    dbService: workers.dbService,
    getSettings,
    getMusicUrl,
    getLyricInfo,
    createLocalMusicInfos: (paths) => workers.utilService.createLocalMusicInfos(paths, appState.machineId, true),
    translate: t,
    checkPath: async () => {},
    resolveUrl: (url) => new URL(buildRealPublicPath(url, proxyServerState.proxyHost), proxyServerState.proxyHost).href,
  })
  appEvent.on('updated_config', () => downloadSettingsChanged())
}
