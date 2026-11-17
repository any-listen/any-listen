import { CANCELED_ERROR_MSG } from '@any-listen/common/constants'

import { filterRules } from './shared'

const mergeList = (sourceListData: string, targetListData: string): string => {
  return Array.from(filterRules(`${sourceListData}\n${targetListData}`)).join('\n')
}

const handleMergeListData = async (
  remoteListData: string,
  getListMergeMode: () => Promise<AnyListen.Dislike.MergeMode>,
  getLocalListData: () => Promise<string>
): Promise<[string, boolean, boolean]> => {
  // 合并弹窗是用户交互，等多久都合法；原 120s 检查只在用户答复后才会执行，
  // 没人答复时 await 挂起它反而不会触发，只会把用户刚选好的模式整个作废
  const mode = await getListMergeMode()
  if (mode == 'cancel') throw new Error(CANCELED_ERROR_MSG)
  let listData: string
  let requiredUpdateLocalListData = true
  let requiredUpdateRemoteListData = true
  switch (mode) {
    case 'merge_local_remote':
      listData = mergeList(await getLocalListData(), remoteListData)
      break
    case 'merge_remote_local':
      listData = mergeList(remoteListData, await getLocalListData())
      break
    case 'overwrite_local_remote':
      listData = await getLocalListData()
      requiredUpdateLocalListData = false
      break
    case 'overwrite_remote_local':
      listData = remoteListData
      requiredUpdateRemoteListData = false
      break
    // case 'none': return null
    // case 'cancel':
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    default:
      throw new Error(CANCELED_ERROR_MSG)
  }
  return [listData, requiredUpdateLocalListData, requiredUpdateRemoteListData]
}

const checkListDataEmpty = (listData: string): boolean => {
  return !listData.length
}
export const mergeFullData = async (
  localListData: string,
  remoteListData: string,
  getListMergeMode: () => Promise<AnyListen.Dislike.MergeMode>,
  getLocalListData: () => Promise<string>
): Promise<[mergedData: string, requiredUpdateLocalListData: boolean, requiredUpdateRemoteListData: boolean]> => {
  if (checkListDataEmpty(localListData)) {
    if (checkListDataEmpty(remoteListData)) {
      return [localListData, false, false]
    }
    return [remoteListData, true, false]
  }
  if (checkListDataEmpty(remoteListData)) {
    return [localListData, false, true]
  }
  return handleMergeListData(remoteListData, getListMergeMode, getLocalListData)
}
