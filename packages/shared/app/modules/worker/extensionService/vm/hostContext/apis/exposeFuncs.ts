import { createCommand } from '../../../extensionApis/command'
import { createCommon } from '../../../extensionApis/common'
import { createConfigurationStore } from '../../../extensionApis/configuration'
import { createMusicList } from '../../../extensionApis/musicList'
import { createMusicUtils } from '../../../extensionApis/musicUtils'
import { createPlayer } from '../../../extensionApis/player'
import { createRequest } from '../../../extensionApis/request'
import { createStore } from '../../../extensionApis/storage'
import { createUtils } from '../../../extensionApis/utils'
import { createIsolateFuncs } from './isolateContext'
// import { extensionState } from '../../../state'

export const createExposeObject = (extension: AnyListen.Extension.Extension) => {
  return {
    ...createCommon(extension),
    ...createRequest(extension),
    ...createStore(extension.dataDirectory),
    ...createConfigurationStore(extension),
    ...createMusicList(extension),
    ...createPlayer(extension),
    ...createMusicUtils(extension),
    ...createIsolateFuncs(extension),
    ...createCommand(extension),
    ...createUtils(extension),
    // async getConnectedClients() {
    //   return extensionState.remoteFuncs.getConnectedClients()
    // },
  } satisfies AnyListen.IPCExtension.PreloadIPCActions
}
