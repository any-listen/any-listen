import { aesDecrypt, aesEncrypt, buildKeyFromAuthCode, cleanPublicKey, generateRsaKey, rsaDecrypt } from './crypto'

export const SYNC_CODE = {
  helloMsg: 'Hello~::^-^::~v4~',
  idPrefix: 'OjppZDo6',
  authMsg: 'lx-music auth::',
  msgAuthFailed: 'Auth failed',
  msgBlockedIp: 'Blocked IP',
  msgConnect: 'lx-music connect',
} as const

export interface ServerUrlInfo {
  url: URL
  httpProtocol: string
  wsProtocol: string
  hostPath: string
}

export interface ClientKeyInfo {
  clientId: string
  key: string
  serverName: string
}

export const parseServerUrl = (raw: string): ServerUrlInfo => {
  const url = new URL(raw.trim())
  if (url.protocol != 'http:' && url.protocol != 'https:') {
    throw new Error(`Unsupported server protocol: ${url.protocol}`)
  }
  return {
    url,
    httpProtocol: url.protocol,
    wsProtocol: url.protocol == 'https:' ? 'wss:' : 'ws:',
    hostPath: `${url.host}${url.pathname}`.replace(/\/+$/, ''),
  }
}

const httpGet = async (
  urlInfo: ServerUrlInfo,
  path: string,
  headers: Record<string, string> | undefined,
  signal: AbortSignal | undefined
) => {
  const res = await fetch(`${urlInfo.httpProtocol}//${urlInfo.hostPath}${path}`, { headers, signal })
  const text = await res.text()
  return { status: res.status, text }
}

export const hello = async (urlInfo: ServerUrlInfo, signal?: AbortSignal) => {
  const { text } = await httpGet(urlInfo, '/hello', undefined, signal)
  if (text != SYNC_CODE.helloMsg) throw new Error(`Invalid server response: ${text}`)
}

export const getServerId = async (urlInfo: ServerUrlInfo, signal?: AbortSignal) => {
  const { text } = await httpGet(urlInfo, '/id', undefined, signal)
  if (!text.startsWith(SYNC_CODE.idPrefix)) throw new Error(`Failed to get server id: ${text}`)
  return text.replace(SYNC_CODE.idPrefix, '')
}

export interface AuthOptions {
  deviceName: string
  /** Connection code, only required when there is no cached client key info */
  authCode?: string
  /** Cached client key info, skips the connection code flow */
  keyInfo?: ClientKeyInfo
  mobile?: boolean
}

const parseAuthError = (status: number, text: string) => {
  if (text == SYNC_CODE.msgBlockedIp) return new Error('This IP has been blocked by the sync server')
  if (text == SYNC_CODE.msgAuthFailed) return new Error('Authentication failed, check the connection code')
  return new Error(`Authentication failed (${status}): ${text}`)
}

/** Authenticate with the connection code and get a persistent client key info */
const authByCode = async (
  urlInfo: ServerUrlInfo,
  deviceName: string,
  authCode: string,
  mobile: boolean,
  signal?: AbortSignal
): Promise<ClientKeyInfo> => {
  const key = buildKeyFromAuthCode(authCode)
  const keys = await generateRsaKey()
  const publicKey = cleanPublicKey(keys.publicKey)
  const msg = aesEncrypt(
    [SYNC_CODE.authMsg, publicKey, deviceName, mobile ? 'lx_music_mobile' : 'lx_music_desktop'].join('\n'),
    key
  )
  const { status, text } = await httpGet(urlInfo, '/ah', { m: msg }, signal)
  if (status != 200 || text == SYNC_CODE.msgAuthFailed || text == SYNC_CODE.msgBlockedIp) {
    throw parseAuthError(status, text)
  }
  const raw = rsaDecrypt(Buffer.from(text, 'base64'), keys.privateKey).toString()
  const keyInfo = JSON.parse(raw) as ClientKeyInfo
  if (!keyInfo.clientId || !keyInfo.key) throw new Error('Invalid client key info returned by the server')
  return keyInfo
}

/** Authenticate with the cached client key info */
const authByKey = async (
  urlInfo: ServerUrlInfo,
  deviceName: string,
  keyInfo: ClientKeyInfo,
  signal?: AbortSignal
): Promise<void> => {
  const msg = aesEncrypt(SYNC_CODE.authMsg + deviceName, keyInfo.key)
  const { status, text } = await httpGet(urlInfo, '/ah', { i: keyInfo.clientId, m: msg }, signal)
  if (status != 200 || text == SYNC_CODE.msgAuthFailed || text == SYNC_CODE.msgBlockedIp) {
    throw parseAuthError(status, text)
  }
  if (aesDecrypt(text, keyInfo.key) != SYNC_CODE.helloMsg) throw new Error('Invalid auth response')
}

export interface AuthResult {
  keyInfo: ClientKeyInfo
  serverId: string
  /** Whether a new client key info was created (first connection with the connection code) */
  created: boolean
}

export const auth = async (urlInfo: ServerUrlInfo, options: AuthOptions, signal?: AbortSignal): Promise<AuthResult> => {
  await hello(urlInfo, signal)
  const serverId = await getServerId(urlInfo, signal)
  if (options.keyInfo) {
    await authByKey(urlInfo, options.deviceName, options.keyInfo, signal)
    return { keyInfo: options.keyInfo, serverId, created: false }
  }
  if (!options.authCode) throw new Error('Connection code is required for the first sync')
  return {
    keyInfo: await authByCode(urlInfo, options.deviceName, options.authCode, options.mobile ?? false, signal),
    serverId,
    created: true,
  }
}

export const buildSocketUrl = (urlInfo: ServerUrlInfo, keyInfo: ClientKeyInfo): string => {
  const t = aesEncrypt(SYNC_CODE.msgConnect, keyInfo.key)
  return `${urlInfo.wsProtocol}//${urlInfo.hostPath}/socket?i=${encodeURIComponent(keyInfo.clientId)}&t=${encodeURIComponent(t)}`
}
