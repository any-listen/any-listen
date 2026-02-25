import { initResources as initResourcesModule } from '@any-listen/app/modules/resources'

import { workers } from '@/worker'

export const initResources = async () => {
  initResourcesModule(workers.extensionService)
}

export { getMusicLyric, getMusicLyricByExtensionSource } from '@any-listen/app/modules/resources/musicLyric'
export { getMusicPic, getMusicPicByExtensionSource } from '@any-listen/app/modules/resources/musicPic'
export { getMusicUrl, getMusicUrlByExtensionSource } from '@any-listen/app/modules/resources/musicUrl'
