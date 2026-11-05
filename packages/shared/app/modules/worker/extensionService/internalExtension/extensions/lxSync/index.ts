import type { ExtensionContext, ExtensionHostContext } from '../type'
import { LxSyncClient } from './client'
import type { SyncClientStatusInfo } from './client'
import {
  applyLxDislikeAction,
  applyLxListAction,
  diffLxListData,
  fromLxListData,
  readLocalDislikeRules,
  readLocalListData,
  toLxListData,
  writeLocalListData,
} from './mapping'
import type { ClientKeyInfo } from './protocol/auth'
import { auth, parseServerUrl } from './protocol/auth'
import { toMD5 } from './protocol/crypto'
import type { LxDislikeAction, LxDislikeRules, LxEnabledFeatures, LxListAction, LxListData, LxSyncMode } from './protocol/types'

const KEY_INFO_FILE = 'keyInfo.json'
const DEFAULT_DEVICE_NAME = 'any-listen'

export const pkg: AnyListen.Extension.Manifest = {
  id: 'internal.lx-sync',
  name: 't(exts.lx-sync.name)',
  description: 't(exts.lx-sync.description)',
  version: '0.0.1',
  main: '',
  publicKey: '',
  contributes: {
    settings: [
      {
        field: 'serverUrl',
        name: 't(exts.lx-sync.form.serverUrl.name)',
        description: 't(exts.lx-sync.form.serverUrl.description)',
        type: 'input',
        default: '',
      },
      {
        field: 'authCode',
        name: 't(exts.lx-sync.form.authCode.name)',
        description: 't(exts.lx-sync.form.authCode.description)',
        type: 'input',
        default: '',
      },
      {
        field: 'deviceName',
        name: 't(exts.lx-sync.form.deviceName.name)',
        description: 't(exts.lx-sync.form.deviceName.description)',
        type: 'input',
        default: '',
      },
      {
        field: 'syncMode',
        name: 't(exts.lx-sync.form.syncMode.name)',
        description: 't(exts.lx-sync.form.syncMode.description)',
        type: 'selection',
        default: 'merge_local_remote',
        enum: ['merge_local_remote', 'merge_remote_local', 'overwrite_local_remote', 'overwrite_remote_local'],
        enumName: [
          't(exts.lx-sync.form.syncMode.merge_local_remote)',
          't(exts.lx-sync.form.syncMode.merge_remote_local)',
          't(exts.lx-sync.form.syncMode.overwrite_local_remote)',
          't(exts.lx-sync.form.syncMode.overwrite_remote_local)',
        ],
      },
      {
        field: 'autoSync',
        name: 't(exts.lx-sync.form.autoSync.name)',
        description: 't(exts.lx-sync.form.autoSync.description)',
        type: 'boolean',
        default: true,
      },
      {
        field: 'autoSyncInterval',
        name: 't(exts.lx-sync.form.autoSyncInterval.name)',
        description: 't(exts.lx-sync.form.autoSyncInterval.description)',
        type: 'input',
        default: '30',
      },
    ],
    commands: [
      {
        command: 'sync-now',
        name: 't(exts.lx-sync.command.sync-now.name)',
        description: 't(exts.lx-sync.command.sync-now.description)',
      },
      {
        command: 'sync-status',
        name: 't(exts.lx-sync.command.sync-status.name)',
        description: 't(exts.lx-sync.command.sync-status.description)',
      },
    ],
  },
}

interface SyncConfig {
  serverUrl: string
  authCode: string
  deviceName: string
  syncMode: LxSyncMode
  autoSync: boolean
  autoSyncInterval: number
}

let hostContext: ExtensionHostContext
let client: LxSyncClient | undefined
let autoSyncTimer: ReturnType<typeof setInterval> | undefined
let uploadTimer: ReturnType<typeof setInterval> | undefined
let syncing = false
let uploading = false
/** Snapshot of the list data that the sync server already knows about */
let syncedListData: LxListData | undefined
/** Snapshot of the dislike rules that the sync server already knows about */
let syncedDislikeRules: string | undefined

/** How often local list changes are pushed to the sync server */
const LOCAL_UPLOAD_INTERVAL = 15_000

const getConfig = async (): Promise<SyncConfig> => {
  const configs = await hostContext.getConfigs<[string?, string?, string?, string?, boolean?, string?]>([
    'serverUrl',
    'authCode',
    'deviceName',
    'syncMode',
    'autoSync',
    'autoSyncInterval',
  ])
  const [serverUrl, authCode, deviceName, syncMode, autoSync, autoSyncInterval] = configs
  return {
    serverUrl: (serverUrl ?? '').trim(),
    authCode: (authCode ?? '').trim(),
    deviceName: (deviceName ?? '').trim() || DEFAULT_DEVICE_NAME,
    syncMode: (syncMode as LxSyncMode | undefined) ?? 'merge_local_remote',
    autoSync: autoSync ?? true,
    autoSyncInterval: Math.max(0, Number.parseInt(autoSyncInterval ?? '30', 10) || 0),
  }
}

const readKeyInfo = async (): Promise<ClientKeyInfo | undefined> => {
  if (!(await hostContext.fileExists(KEY_INFO_FILE))) return
  try {
    const data = await hostContext.readFile(KEY_INFO_FILE, 'utf-8')
    const info = JSON.parse(data) as ClientKeyInfo
    if (info.clientId && info.key) return info
  } catch {}
}

const saveKeyInfo = async (info: ClientKeyInfo) => {
  await hostContext.writeFile(KEY_INFO_FILE, JSON.stringify(info))
}

const removeKeyInfo = async () => {
  if (!(await hostContext.fileExists(KEY_INFO_FILE))) return
  await hostContext.removeFile(KEY_INFO_FILE)
}

const getLocalLxListData = async (): Promise<LxListData> => toLxListData(await readLocalListData())

/** Read the dislike rules (one rule per line) of this device */
const getLocalDislikeRules = async (): Promise<string> => readLocalDislikeRules()

/** Remember the current local list data as "known by the sync server" */
const markSynced = async () => {
  try {
    syncedListData = await getLocalLxListData()
  } catch (error) {
    hostContext.logcat.warn('[lx-sync] failed to snapshot local list data', error)
  }
}

/** Remember the current local dislike rules as "known by the sync server" */
const markDislikeSynced = async () => {
  try {
    syncedDislikeRules = await getLocalDislikeRules()
  } catch (error) {
    hostContext.logcat.warn('[lx-sync] failed to snapshot local dislike rules', error)
  }
}

/** Push the local list changes to the sync server */
const uploadLocalChanges = async () => {
  const currentClient = client
  if (uploading || syncing || currentClient?.status != 'connected') return
  // The first full sync has not finished yet, uploading now would push a stale list
  if (!syncedListData) return
  uploading = true
  try {
    const next = await getLocalLxListData()
    const actions = diffLxListData(syncedListData, next)
    for (const action of actions) {
      await currentClient.sendListAction(action)
      hostContext.logcat.info(`[lx-sync] uploaded local change: ${action.action}`)
    }
    if (actions.length) syncedListData = next

    const nextDislikeRules = await getLocalDislikeRules()
    if (syncedDislikeRules != undefined && syncedDislikeRules !== nextDislikeRules) {
      // The dislike list is a single rule string, so always overwrite it as a whole
      await currentClient.sendDislikeAction({ action: 'dislike_data_overwrite', data: nextDislikeRules })
      // eslint-disable-next-line require-atomic-updates -- the snapshot is only mutated from this single async task
      syncedDislikeRules = nextDislikeRules
      hostContext.logcat.info('[lx-sync] uploaded local change: dislike_data_overwrite')
    }
  } catch (error) {
    hostContext.logcat.warn('[lx-sync] upload local changes failed', error)
  } finally {
    // eslint-disable-next-line require-atomic-updates -- the flag is only mutated from this single async task
    uploading = false
  }
}

const scheduleUpload = () => {
  if (uploadTimer) clearInterval(uploadTimer)
  uploadTimer = setInterval(() => {
    void uploadLocalChanges()
  }, LOCAL_UPLOAD_INTERVAL)
  uploadTimer.unref()
}

const buildHandlers = (config: SyncConfig) => ({
  getEnabledFeatures(): LxEnabledFeatures {
    return { list: { skipSnapshot: false }, dislike: {} }
  },
  async getListData(): Promise<LxListData> {
    return getLocalLxListData()
  },
  async setListData(data: LxListData) {
    hostContext.logcat.info('[lx-sync] applying remote list data')
    await writeLocalListData(fromLxListData(data))
  },
  async getListMd5() {
    return toMD5(JSON.stringify(await getLocalLxListData()))
  },
  async getSyncMode(): Promise<LxSyncMode> {
    return config.syncMode
  },
  async listFinished() {
    hostContext.logcat.info('[lx-sync] list sync finished')
    await markSynced()
  },
  async onListAction(action: LxListAction) {
    hostContext.logcat.info('[lx-sync] received list action:', action.action)
    await applyLxListAction(action)
    // The remote change is already persisted on the sync server
    await markSynced()
  },
  async getDislikeData(): Promise<LxDislikeRules> {
    return getLocalDislikeRules()
  },
  async setDislikeData(rules: LxDislikeRules) {
    hostContext.logcat.info('[lx-sync] applying remote dislike rules')
    await applyLxDislikeAction({ action: 'dislike_data_overwrite', data: rules })
  },
  async getDislikeMd5() {
    // The sync server compares this with its own snapshot key (md5 of the trimmed rules)
    return toMD5(await getLocalDislikeRules())
  },
  async dislikeFinished() {
    hostContext.logcat.info('[lx-sync] dislike sync finished')
    await markDislikeSynced()
  },
  async onDislikeAction(action: LxDislikeAction) {
    hostContext.logcat.info('[lx-sync] received dislike action:', action.action)
    await applyLxDislikeAction(action)
    await markDislikeSynced()
  },
  async finished() {
    hostContext.logcat.info('[lx-sync] sync finished')
    await markSynced()
    await markDislikeSynced()
  },
  onStatusChange(info: SyncClientStatusInfo) {
    hostContext.logcat.info(`[lx-sync] status: ${info.status}${info.message ? ` - ${info.message}` : ''}`)
  },
  onError(error: Error) {
    hostContext.logcat.error('[lx-sync]', error)
  },
})

const connect = async () => {
  const config = await getConfig()
  if (!config.serverUrl) throw new Error('Please configure the sync server url first')
  const urlInfo = parseServerUrl(config.serverUrl)
  let keyInfo = await readKeyInfo()
  if (keyInfo) {
    try {
      await auth(urlInfo, { deviceName: config.deviceName, keyInfo })
    } catch (error) {
      // The cached key may be invalid (e.g. the server data was reset)
      hostContext.logcat.warn('[lx-sync] cached client key is invalid, re-authenticating', error)
      await removeKeyInfo()
      keyInfo = undefined
    }
  }
  if (!keyInfo) {
    if (!config.authCode) throw new Error('Please configure the connection code first')
    const result = await auth(urlInfo, { deviceName: config.deviceName, authCode: config.authCode })
    keyInfo = result.keyInfo
    await saveKeyInfo(keyInfo)
    hostContext.logcat.info(`[lx-sync] authenticated with "${keyInfo.serverName}"`)
  }

  client?.stop()
  syncedListData = undefined
  syncedDislikeRules = undefined
  client = new LxSyncClient({
    url: urlInfo,
    keyInfo,
    handlers: buildHandlers(config),
  })
  client.connect()
}

const syncNow = async (reason: string) => {
  if (syncing) return
  syncing = true
  try {
    hostContext.logcat.info(`[lx-sync] syncing (${reason})`)
    await connect()
  } finally {
    // eslint-disable-next-line require-atomic-updates -- the flag is only mutated from this single async task
    syncing = false
  }
}

const scheduleAutoSync = (config: SyncConfig) => {
  if (autoSyncTimer) clearInterval(autoSyncTimer)
  autoSyncTimer = undefined
  if (!config.autoSync || config.autoSyncInterval <= 0) return
  autoSyncTimer = setInterval(
    () => {
      void syncNow('periodic').catch((error: unknown) => {
        hostContext.logcat.warn('[lx-sync] periodic sync failed', error)
      })
    },
    config.autoSyncInterval * 60 * 1000
  )
  autoSyncTimer.unref()
}

export const setup = async (
  _extension: AnyListen.Extension.Extension,
  _hostContext: ExtensionHostContext
): Promise<ExtensionContext> => {
  hostContext = _hostContext
  const config = await getConfig()
  hostContext.logcat.info(`[lx-sync] extension loaded, server url: ${config.serverUrl || '(not set)'}`)
  scheduleAutoSync(config)
  scheduleUpload()

  if (config.autoSync && config.serverUrl) {
    void connect().catch((error: unknown) => {
      hostContext.logcat.warn('[lx-sync] initial connect failed', error)
    })
  }

  return {
    executeCommand: async (command) => {
      switch (command) {
        case 'sync-now':
          await syncNow('command')
          return 'ok'
        case 'sync-status':
          return client?.status ?? 'not connected'
      }
    },
  }
}
