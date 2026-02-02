import type { KeyInfo } from './ws'

const KEY_NAME = 'IPC_CLIENT_KEY_'
const getId = (serverId: string) => `${KEY_NAME}${serverId}`
export const getAuthKey = async (serverId: string) => {
  const info = localStorage.getItem(getId(serverId))
  return info ? (JSON.parse(info) as KeyInfo) : null
}
export const setAuthKey = async (serverId: string, keyInfo: KeyInfo) => {
  localStorage.setItem(getId(serverId), JSON.stringify(keyInfo))
}
export const removeAuthKey = async (serverId: string) => {
  localStorage.removeItem(getId(serverId))
}
