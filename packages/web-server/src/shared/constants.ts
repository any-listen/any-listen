export const ENV_PARAMS = [
  'PORT',
  'BIND_IP',
  'CONFIG_PATH',
  'LOG_PATH',
  'DATA_PATH',
  'PROXY_HEADER',
  'LOGIN_PWD',
  'ALLOW_PUBLIC_DIR',
  'EXTENSION_GH_MIRROR_HOSTS',
  'HTTP_PROXY',
  // 'AnyListen_USER_',
] as const

export const SPLIT_CHAR = {
  DISLIKE_NAME: '@',
  DISLIKE_NAME_ALIAS: '#',
} as const

export const File = {
  serverInfoJSON: 'serverInfo.json',
  clientInfoJSON: 'clientInfo.json',
} as const

export const PUBLIC_RESOURCE_PATH = '/public/medias'
