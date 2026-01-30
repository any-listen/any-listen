export const URL_SCHEME_RXP = /^anylisten:\/\//

export const NATIVE_VERSION = 7

export const DEV_SERVER_PORTS = {
  'view-main': 9200,
} as const

export const DB_NAME = 'anylisten.data.db'

export const SPLIT_CHAR = {
  DISLIKE_NAME: '@',
  DISLIKE_NAME_ALIAS: '#',
  LYRIC_TYPE: '|',
} as const

export const DEFAULT_LANG = 'en-us'
export const DEVICE_ID_NAME = 'deviceid'
export const STORE_NAMES = {
  APP_SETTINGS: 'config',
  DATA: 'data',
  LIST_SCROLL_POSITION: 'list_scroll_position',
  SYNC: 'sync',
  HOTKEY: 'hot_key',
  USER_API: 'user_api',
  LRC_RAW: 'lyrics',
  LRC_EDITED: 'lyrics_edited',
  THEME: 'theme',
  SOUND_EFFECT: 'sound_effect',
  EXTENSION: 'extension',
  PLAY_TIME: 'play_time',
} as const

export const APP_EVENT_NAMES = {
  viewMainName: 'view_main',
  winLyricName: 'win_lyric',
  trayName: 'tray',
  playerName: 'player',
} as const

export const DIRS = {
  musicPic: 'music_pic',
}

export const LIST_IDS = {
  DEFAULT: 'default',
  LOVE: 'love',
  LAST_PLAYED: 'last_played',
  DOWNLOAD: 'download',
  PLAY_LATER: null,
} as const

export const DATA_KEYS = {
  viewPrevState: 'viewPrevState',
  searchHistoryList: 'searchHistoryList',
  listScrollPosition: 'listScrollPosition',
  listPrevSelectId: 'listPrevSelectId',
  listUpdateInfo: 'listUpdateInfo',
  ignoreVersion: 'ignoreVersion',

  leaderboardSetting: 'leaderboardSetting',
  songlistSetting: 'songlistSetting',
  searchSetting: 'searchSetting',

  lastStartInfo: 'lastStartInfo',
} as const

export const DEFAULT_SETTING = {
  leaderboard: {
    source: 'kw',
    boardId: 'kw__16',
  },

  songList: {
    source: 'kw',
    sortId: 'new',
    tagId: '',
  },

  search: {
    temp_source: 'kw',
    source: 'all',
    type: 'music',
  },

  viewPrevState: {
    url: '/search',
    query: {},
  },
}

export const DOWNLOAD_STATUS = {
  RUN: 'run',
  WAITING: 'waiting',
  PAUSE: 'pause',
  ERROR: 'error',
  COMPLETED: 'completed',
} as const

export const QUALITYS = ['flac24bit', 'flac', 'wav', 'ape', '320k', '192k', '128k'] as const

export const MEDIA_FILE_TYPES = ['mp3', 'flac', 'ogg', 'oga', 'wav', 'm4a'] as const
export const PIC_FILE_TYPES = ['jpg', 'jpeg', 'gif', 'png'] as const

// https://developer.mozilla.org/zh-CN/docs/Web/API/CloseEvent#status_codes
export const IPC_CLOSE_CODE = {
  normal: 1000,
  logout: 4001,
  failed: 4100,
} as const
export const IPC_CODE = {
  helloMsg: 'Hello~::^-^::~v1~',
  idPrefix: 'OjppZDo6-',
  authMsg: 'anylisten auth::',
  msgAuthFailed: 'Auth failed',
  msgBlockedIp: 'Blocked IP',
  msgConnect: 'anylisten connect',

  authFailed: 'Auth failed',
  missingAuthCode: 'Missing auth code',
  getServiceIdFailed: 'Get service id failed',
  connectServiceFailed: 'Connect service failed',
  abnormalDisconnection: 'Abnormal disconnection',
  connecting: 'Connecting...',
  unknownServiceAddress: 'Unknown service address',
  lowServiceVersion: 'Web server version too low, please upgrade server to latest',
  highServiceVersion: 'Web server version too high, please upgrade app to latest',
} as const

export const EXTENSION_VM_IPC_FUNC_NAMES = [
  '__ext_host_call__set_timeout',
  '__ext_host_call__clear_timeout',
  '__ext_host_call__set_interval',
  '__ext_host_call__clear_interval',
  '__ext_host_call__utils_str2b64',
  '__ext_host_call__utils_b642buf',
  '__ext_host_call__utils_str2md5',
  '__ext_host_call__utils_aes_encrypt',
  '__ext_host_call__utils_rsa_encrypt',
  '__ext_host_call__utils_iconv_decode',
  '__ext_host_call__utils_iconv_encode',
] as const

export const EXTENSION = {
  pkgExtName: 'alix',
  extDirName: 'ext',
  tempDirName: 'temp',
  dataDirName: 'datas',
  configFileName: 'extensions.json',
  mainifestName: 'manifest.json',
  logFileName: 'output.log',
  signFileName: 'sig',
  extBundleFileName: 'ext.tgz',
  publicKeyHeader: '-----BEGIN PUBLIC KEY-----\n',
  publicKeyFooter: '\n-----END PUBLIC KEY-----',
} as const

export interface WindowSize {
  id: number
  name: string
  width: number
  height: number
}
export const windowSizeList: WindowSize[] = [
  {
    id: 0,
    name: 'smaller',
    width: 828,
    height: 550,
  },
  {
    id: 1,
    name: 'small',
    width: 920,
    height: 610,
  },
  {
    id: 2,
    name: 'medium',
    width: 1020,
    height: 670,
  },
  {
    id: 3,
    name: 'big',
    width: 1114,
    height: 728,
  },
  {
    id: 4,
    name: 'larger',
    width: 1202,
    height: 786,
  },
  {
    id: 5,
    name: 'oversized',
    width: 1385,
    height: 906,
  },
  {
    id: 6,
    name: 'huge',
    width: 1700,
    height: 1080,
  },
] as const

export const API_PREFIX = '/api'

/** singer name sep */
export const SINGERS_RXP = /[、&_;；/,，|]/

export const PROXY_SERVER_PATH = '/p_static'

export const CANCELED_ERROR_MSG = 'canceled'
