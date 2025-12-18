import { generateId, isUrl } from '@any-listen/common/utils'
import { hostContext } from './shared'
import type { WebDAVClientOptions } from './webdav'

const getServers = async () => {
  let config = (await hostContext.getConfigs<[string]>(['servers']))[0] || ''
  const randomStr = generateId()
  return config
    .trim()
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      line = line.trim()
      line = line.replaceAll('\\,', randomStr)
      let [_url = '', _username = '', _password = ''] = line.split(',').map((part) => part.replaceAll(randomStr, ',').trim())
      if (_url.endsWith('/')) _url = _url.slice(0, -1)
      return {
        url: _url,
        username: _username,
        password: _password,
      }
    })
}
const saveServers = async (servers: Array<{ url: string; username: string; password: string }>) => {
  const config = servers
    .map((server) => {
      const url = server.url.replaceAll(',', '\\,')
      const username = server.username.replaceAll(',', '\\,')
      const password = server.password.replaceAll(',', '\\,')
      return `${url}, ${username}${password ? `, ${password}` : ''}`
    })
    .join('\n')
  await hostContext.setConfigs({ servers: config })
}
const getPassword = async (url: string, username: string) => {
  const servers = await getServers()
  return servers.find((server) => server.url === url && server.username === username)?.password || ''
}

export const getEnabledCache = async () => {
  const enabledCache = (await hostContext.getConfigs<[boolean]>(['enabledCache']))[0]
  return enabledCache == true
}

export const savePassword = async (url: string, username: string, password: string) => {
  const servers = await getServers()
  const server = servers.find((server) => server.url === url && server.username === username)
  if (server) {
    server.password = password
  } else {
    servers.push({ url, username, password })
  }
  await saveServers(servers)
  void hostContext.showMessage(hostContext.i18n.t('exts.webdav.form.message.save_password_success'))
}

export const verifyForm = async (
  listInfo: AnyListen.List.UserListInfoByRemoteMeta | AnyListen.Music.MusicInfoOnline['meta']
): Promise<WebDAVClientOptions> => {
  if (typeof listInfo.url !== 'string' || !isUrl(listInfo.url)) {
    throw new Error(hostContext.i18n.t('exts.webdav.form.error.invalid_url'))
  }
  if (listInfo.url.endsWith('/')) {
    listInfo.url = listInfo.url.slice(0, -1)
  }
  return {
    url: listInfo.url as string,
    username: (listInfo.username as string) || '',
    password: (listInfo.password as string) || '',
    path: '',
  }
}

export const getWebDAVOptionsByListInfo = async (listInfo: AnyListen.List.UserListInfoByRemoteMeta) => {
  const options = await verifyForm(listInfo)
  options.password = await getPassword(options.url, options.username)
  options.path = (listInfo.directory as string) || '/'
  return options
}

export const getWebDAVOptionsByMusicInfo = async (musicInfo: AnyListen.Music.MusicInfoOnline) => {
  const options = await verifyForm(musicInfo.meta)
  if (!musicInfo.meta.path || typeof musicInfo.meta.path !== 'string') throw new Error('no path in musicInfo.meta')
  options.password = await getPassword(options.url, options.username)
  options.path = musicInfo.meta.path
  return options
}
