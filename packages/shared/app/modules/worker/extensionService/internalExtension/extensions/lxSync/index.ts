import { extensionEvent } from '../../../event'
import type { ExtensionContext, ExtensionHostContext } from '../type'
import { LxSyncClient } from './client'
import type { SyncClientStatus, SyncClientStatusInfo } from './client'
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
        field: 'enabled',
        name: 't(exts.lx-sync.form.enabled.name)',
        description: 't(exts.lx-sync.form.enabled.description)',
        type: 'boolean',
        default: false,
      },
      {
        field: 'serverUrl',
        name: 't(exts.lx-sync.form.serverUrl.name)',
        description: 't(exts.lx-sync.form.serverUrl.description)',
        type: 'input',
        default: '',
        disabledWhen: { field: 'enabled', value: true },
      },
      {
        field: 'authCode',
        name: 't(exts.lx-sync.form.authCode.name)',
        description: 't(exts.lx-sync.form.authCode.description)',
        type: 'input',
        default: '',
        disabledWhen: { field: 'enabled', value: true },
      },
      {
        field: 'deviceName',
        name: 't(exts.lx-sync.form.deviceName.name)',
        description: 't(exts.lx-sync.form.deviceName.description)',
        type: 'input',
        default: '',
        disabledWhen: { field: 'enabled', value: true },
      },
      {
        field: 'syncMode',
        name: 't(exts.lx-sync.form.syncMode.name)',
        description: 't(exts.lx-sync.form.syncMode.description)',
        type: 'selection',
        default: 'merge_local_remote',
        disabledWhen: { field: 'enabled', value: true },
        enum: ['merge_local_remote', 'merge_remote_local', 'overwrite_local_remote', 'overwrite_remote_local'],
        enumName: [
          't(exts.lx-sync.form.syncMode.merge_local_remote)',
          't(exts.lx-sync.form.syncMode.merge_remote_local)',
          't(exts.lx-sync.form.syncMode.overwrite_local_remote)',
          't(exts.lx-sync.form.syncMode.overwrite_remote_local)',
        ],
      },
      {
        field: 'autoSyncInterval',
        name: 't(exts.lx-sync.form.autoSyncInterval.name)',
        description: 't(exts.lx-sync.form.autoSyncInterval.description)',
        type: 'input',
        default: '30',
        disabledWhen: { field: 'enabled', value: true },
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
  enabled: boolean
  serverUrl: string
  authCode: string
  deviceName: string
  syncMode: LxSyncMode
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
/** Name of the connected sync server, used in the status messages */
let serverName = ''
/** Last reported client status, used to detect transitions worth notifying about */
let lastStatus: SyncClientStatus = 'idle'
/** Reason of the last reported error, avoids repeating the same dialog */
let lastErrorReason = ''

/** How often local list changes are pushed to the sync server */
const LOCAL_UPLOAD_INTERVAL = 15_000

/** Config fields that require a new connection when they change */
const CONNECTION_FIELDS = ['serverUrl', 'authCode', 'deviceName', 'syncMode']

const getConfig = async (): Promise<SyncConfig> => {
  const configs = await hostContext.getConfigs<[boolean?, string?, string?, string?, string?, string?, boolean?]>([
    'enabled',
    'serverUrl',
    'authCode',
    'deviceName',
    'syncMode',
    'autoSyncInterval',
    // Pre-0.0.2 switch, kept so existing installs do not silently reconnect differently
    'autoSync',
  ])
  const [enabled, serverUrl, authCode, deviceName, syncMode, autoSyncInterval, legacyAutoSync] = configs
  return {
    enabled: enabled ?? legacyAutoSync ?? false,
    serverUrl: (serverUrl ?? '').trim(),
    authCode: (authCode ?? '').trim(),
    deviceName: (deviceName ?? '').trim() || DEFAULT_DEVICE_NAME,
    syncMode: (syncMode as LxSyncMode | undefined) ?? 'merge_local_remote',
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

const t = (key: string, params?: Record<string, string>): string =>
  // The host types the translation keys as a literal union of the built-in messages, the extension own keys are not part of it
  (hostContext.i18n.t as unknown as (key: string, params?: Record<string, string>) => string)(`exts.lx-sync.${key}`, params)

/**
 * Collect the error codes of the whole cause chain.
 * `fetch()` only reports a generic `TypeError: fetch failed`, the real reason (`ECONNREFUSED`,
 * `ENOTFOUND`, ...) sits on `cause`, and a host with both IPv4 and IPv6 reports an `AggregateError`.
 */
const collectErrorCodes = (error: unknown): string[] => {
  const codes: string[] = []
  const pending: unknown[] = [error]
  for (let depth = 0; pending.length && depth < 10; depth++) {
    const current = pending.shift()
    if (!current || typeof current != 'object') continue
    const { code, cause, errors } = current as { code?: unknown; cause?: unknown; errors?: unknown }
    if (typeof code == 'string' && !codes.includes(code)) codes.push(code)
    if (cause) pending.push(cause)
    if (Array.isArray(errors)) pending.push(...(errors as unknown[]))
  }
  return codes
}

/** Translate an unknown error into a message the user can act on */
const describeError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error)
  const codes = collectErrorCodes(error)
  if (codes.includes('ECONNREFUSED')) return t('err.refused')
  if (codes.includes('ENOTFOUND') || codes.includes('EAI_AGAIN')) return t('err.dns')
  if (codes.includes('ETIMEDOUT') || codes.includes('UND_ERR_CONNECT_TIMEOUT')) return t('err.timeout')
  if (message.includes('Invalid server response')) return t('err.invalid_response', { detail: message })
  if (message.includes('Failed to get server id')) return t('err.invalid_server_id')
  if (message.includes('Unsupported server protocol')) return t('err.unsupported_protocol')
  if (message.includes('This IP has been blocked')) return t('err.blocked_ip')
  if (message.includes('Authentication failed')) return t('err.auth_failed')
  if (message.includes('Connection code is required')) return t('err.auth_code_required')
  if (message.includes('Please configure the sync server url')) return t('err.url_required')
  if (message.includes('Websocket is not connected')) return t('err.connection_lost')
  return t('err.unknown', { detail: message })
}

/** Show a dialog that stays open until the user closes it */
const showDialog = async (type: 'info' | 'error', title: string, message: string) => {
  try {
    await hostContext.showMessage(message, {
      type,
      title,
      modal: true,
      buttons: [{ text: t('button.ok') }],
    })
  } catch (error) {
    hostContext.logcat.warn('[lx-sync] failed to show the message dialog', error)
  }
}

const handleStatusChange = (info: SyncClientStatusInfo) => {
  const previous = lastStatus
  lastStatus = info.status
  hostContext.logcat.info(`[lx-sync] status: ${info.status}${info.message ? ` - ${info.message}` : ''}`)
  if (info.status != 'connected') return
  lastErrorReason = ''
  // Every session goes connecting -> connected -> syncing -> connected, so only notify on a real (re)connect
  if (previous != 'syncing') {
    void showDialog('info', t('notify.connected.title'), t('notify.connected.message', { name: serverName || '-' }))
  }
}

const handleClientError = (error: Error) => {
  hostContext.logcat.error('[lx-sync]', error)
  lastStatus = 'error'
  const reason = describeError(error)
  hostContext.logcat.warn(`[lx-sync] error reason: ${reason}`)
  // While the client retries with a backoff, do not repeat the same dialog over and over
  if (reason == lastErrorReason) return
  lastErrorReason = reason
  void showDialog('error', t('notify.failed.title'), t('notify.failed.message', { reason }))
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
    handleStatusChange(info)
  },
  onError(error: Error) {
    handleClientError(error)
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
    if (!config.authCode) throw new Error('Connection code is required for the first sync')
    const result = await auth(urlInfo, { deviceName: config.deviceName, authCode: config.authCode })
    keyInfo = result.keyInfo
    await saveKeyInfo(keyInfo)
    hostContext.logcat.info(`[lx-sync] authenticated with "${keyInfo.serverName}"`)
  }

  serverName = keyInfo.serverName

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
  if (!config.enabled || config.autoSyncInterval <= 0) return
  autoSyncTimer = setInterval(
    () => {
      void syncNow('periodic').catch((error: unknown) => {
        handleClientError(error instanceof Error ? error : new Error(String(error)))
      })
    },
    config.autoSyncInterval * 60 * 1000
  )
  autoSyncTimer.unref()
}

/** Disconnect and stop every timer, keeping the local data untouched */
const stopSync = (reason: string) => {
  if (autoSyncTimer) clearInterval(autoSyncTimer)
  autoSyncTimer = undefined
  client?.stop()
  client = undefined
  syncedListData = undefined
  syncedDislikeRules = undefined
  lastStatus = 'idle'
  lastErrorReason = ''
  serverName = ''
  hostContext.logcat.info(`[lx-sync] sync stopped (${reason})`)
}

/** Apply the settings the user just changed, without a restart */
const applyConfigChange = async (keys: string[]) => {
  const config = await getConfig()
  if (!config.enabled) {
    stopSync('disabled')
    return
  }
  const needsReconnect = !client || keys.some((key) => CONNECTION_FIELDS.includes(key))
  scheduleAutoSync(config)
  if (!needsReconnect) return
  lastErrorReason = ''
  hostContext.logcat.info(`[lx-sync] settings changed (${keys.join(', ') || 'none'}), reconnecting`)
  await syncNow('config changed').catch((error: unknown) => {
    handleClientError(error instanceof Error ? error : new Error(String(error)))
  })
}

export const setup = async (
  _extension: AnyListen.Extension.Extension,
  _hostContext: ExtensionHostContext
): Promise<ExtensionContext> => {
  hostContext = _hostContext
  const [storedEnabled] = await hostContext.getConfigs<[boolean?]>(['enabled'])
  const config = await getConfig()
  // Installs created before the enable switch keep their state in the old `autoSync` flag,
  // persist the migrated value so the settings page shows the switch in the right position
  if (storedEnabled == undefined && config.enabled) {
    // Written before the change listener is registered, so this does not trigger a reconnect
    await hostContext.setConfigs({ enabled: true })
  }
  hostContext.logcat.info(
    `[lx-sync] extension loaded, enabled: ${config.enabled}, server url: ${config.serverUrl || '(not set)'}`
  )
  scheduleUpload()

  // Settings are applied immediately, so enabling or disabling does not need a restart
  extensionEvent.on('extenstionSettingUpdated', (id: string, keys: string[]) => {
    if (id != pkg.id) return
    void applyConfigChange(keys).catch((error: unknown) => {
      hostContext.logcat.warn('[lx-sync] applying settings failed', error)
    })
  })

  if (config.enabled) {
    scheduleAutoSync(config)
    void syncNow('startup').catch((error: unknown) => {
      handleClientError(error instanceof Error ? error : new Error(String(error)))
    })
  }

  return {
    executeCommand: async (command) => {
      switch (command) {
        case 'sync-now': {
          const currentConfig = await getConfig()
          if (!currentConfig.enabled) return 'sync is disabled'
          await syncNow('command')
          return 'ok'
        }
        case 'sync-status':
          return [
            client?.status ?? 'not connected',
            serverName ? `server: ${serverName}` : '',
            lastErrorReason ? `last error: ${lastErrorReason}` : '',
          ]
            .filter(Boolean)
            .join(' | ')
      }
    },
  }
}
