import { verifyOnlineMusicArray } from './resource'

let actions: Partial<AnyListen.IPCExtension.ListProviderAction>
export const registerResourceAction = (_actions: Partial<AnyListen_API.ListProviderAction>) => {
  actions = _actions
}

const verifyMusicIdArray = (ids: string[]) => {
  if (!Array.isArray(ids)) throw new Error('ids is not an array')
  for (const id of ids) {
    if (typeof id !== 'string') throw new Error('id is not a string')
    if (!id) throw new Error('id is empty')
    if (id.length > 128) throw new Error('id is too long')
  }
  return ids
}

type LPA = AnyListen.IPCExtension.ListProviderAction
const actionHandles: LPA = {
  createList: async (params) => {
    await actions.createList!(params)
  },
  deleteList: async (params) => {
    await actions.deleteList!(params)
  },
  updateList: async (params) => {
    await actions.updateList!(params)
  },
  removeListMusics: async (params) => {
    return actions.removeListMusics!(params)
  },
  getListMusicIds: async (params) => {
    return verifyMusicIdArray(await actions.getListMusicIds!(params))
  },
  getMusicInfoByIds: async (params) => {
    const source = params.source
    const result = await actions.getMusicInfoByIds!(params)
    return {
      musics: verifyOnlineMusicArray(result.musics, 'music info', source),
      waitingParseMetadata: result.waitingParseMetadata === true,
    }
  },
  parseMusicInfoMetadata: async (params) => {
    return verifyOnlineMusicArray([params.data], 'parse music metadata', params.source)[0] || null
  },
}

export const onListProviderAction = async <T extends keyof LPA>(
  action: T,
  params: Parameters<LPA[T]>[0]
): Promise<Awaited<ReturnType<LPA[T]>>> => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!actions) throw new Error('list provider action not registered')
  if (!actions[action]) throw new Error(`list provider action ${action} not registered`)
  // @ts-expect-error
  return actionHandles[action](params) as Awaited<ReturnType<LPA[T]>>
}
