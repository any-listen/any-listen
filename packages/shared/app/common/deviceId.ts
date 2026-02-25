import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'

import { DEVICE_ID_NAME } from '@any-listen/common/constants'
let deviceId = ''

export const initDeviceId = async (dataPath: string) => {
  const filePath = `${dataPath}/${DEVICE_ID_NAME}`
  try {
    deviceId = (await fs.readFile(filePath, 'utf-8')).toString().trim()
    if (deviceId) return deviceId
  } catch {}
  deviceId = randomUUID()
  try {
    await fs.writeFile(filePath, deviceId, 'utf-8')
  } catch {}
  return deviceId
}

export const getDeviceId = () => {
  if (!deviceId) throw new Error('Device ID not initialized')
  return deviceId
}
