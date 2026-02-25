import { MAX_NATIVE_CALL_DATA_SIZE } from '@/constants'
import { checkLength } from '@/shared'

import { hostContext } from './state'

export const hostCallActions = <T extends keyof AnyListen.ExtensionVM.HostCallActions>(
  action: T,
  data: AnyListen.ExtensionVM.HostCallActions[T]
) => {
  const dataStr = JSON.stringify(data)
  // console.log('hostCall', action, data)
  checkLength(dataStr, MAX_NATIVE_CALL_DATA_SIZE)
  hostContext.hostCall(hostContext.key, action, dataStr)
}
