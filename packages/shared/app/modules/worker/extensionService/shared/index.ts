/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { EXTENSION } from '@any-listen/common/constants'
import { generateId, isUrl, throttle } from '@any-listen/common/utils'
import {
  basename,
  checkFile,
  checkPath,
  copyFile,
  createDir,
  dirname,
  extname,
  getFileStats,
  isAbsolute,
  joinPath,
  removePath,
  renamePath,
  toSha256,
} from '@any-listen/nodejs'
import { simpleDownload } from '@any-listen/nodejs/download'
import { readLastLines } from '@any-listen/nodejs/logs'
import { eachMirror } from '@any-listen/nodejs/mirrorReuqest'
import { verifySignature } from '@any-listen/nodejs/sign'
import fs from 'node:fs'
import path from 'node:path'
import { extensionEvent } from '../event'
import { loadExtension as loadExtensionByInternalExtension } from '../internalExtension'
import { extensionState } from '../state'
import { createVmConetxt, destroyContext, runExtension, setupVmContext } from '../vm'
import { sendConfigUpdatedEvent } from '../vm/hostContext/preloadFuncs'
import { getConfig, saveConfig, unloadConfig } from './configStore'

const FILE_EXT_NAME = `.${EXTENSION.pkgExtName}`
const FILE_EXT_NAME_EXP = new RegExp(`\\.${EXTENSION.pkgExtName}$`, 'i')
const GRANTS: AnyListen.Extension.Grant[] = ['music_list', 'player', 'internet']
const RESOURCE: AnyListen.Extension.ResourceAction[] = [
  'tipSearch',
  'hotSearch',
  'musicSearch',
  'musicPic',
  'musicLyric',
  'musicUrl',
  'musicPicSearch',
  'songlistSearch',
  'songlist',
  'leaderboard',
  'albumSearch',
  'album',
  'singerSearch',
  'singer',
  'lyricSearch',
  'lyricDetail',
]
const availableIcons = ['.png', '.jpg', '.jpeg', '.webp', '.svg']

const buildPath = async (extensionPath: string, _path: string) => {
  if (isAbsolute(_path)) throw new Error(`path not a relative path: ${_path}`)
  const enterFilePath = joinPath(extensionPath, _path)
  if (!enterFilePath.startsWith(extensionPath + path.sep)) throw new Error('main path illegal')
  if (!(await checkFile(enterFilePath))) return ''
  return enterFilePath
}

export const formatManifest = (manifest: AnyListen.Extension.Manifest) => {
  if (manifest.id != null) manifest.id = String(manifest.id)
  if (!manifest.id) throw new Error('Manifest id not defined')
  if (/[^\w-_.]/.test(manifest.id)) throw new Error('Manifest ID Invalid')

  if (manifest.name != null) manifest.name = String(manifest.name)
  if (!manifest.name) throw new Error('Manifest name not defined')

  if (manifest.description != null) manifest.description = String(manifest.description)
  if (manifest.icon != null) manifest.icon = String(manifest.icon)
  if (manifest.main != null) manifest.main = String(manifest.main)

  if (manifest.version != null) manifest.version = String(manifest.version)
  if (manifest.target_engine != null) manifest.target_engine = String(manifest.target_engine)
  if (manifest.author != null) manifest.author = String(manifest.author)
  if (manifest.homepage != null) manifest.homepage = String(manifest.homepage)
  if (manifest.license != null) manifest.license = String(manifest.license)
  if (Array.isArray(manifest.categories)) {
    manifest.categories = manifest.categories.map((categorie) => String(categorie))
  } else manifest.categories = []
  if (Array.isArray(manifest.tags)) {
    manifest.tags = manifest.tags.map((tag) => String(tag))
  } else manifest.tags = []
  if (Array.isArray(manifest.grant)) {
    manifest.grant = manifest.grant.filter((grant) => GRANTS.includes(grant))
  } else manifest.grant = []
  if (typeof manifest.contributes == 'object') {
    const contributes: AnyListen.Extension.Manifest['contributes'] = {}
    if (Array.isArray(manifest.contributes.resource)) {
      contributes.resource = manifest.contributes.resource.map((resource) => {
        return {
          id: String(resource.id),
          name: String(resource.name),
          resource: resource.resource.filter((r) => RESOURCE.includes(r)),
        }
      })
    }
    if (Array.isArray(manifest.contributes.settings)) {
      contributes.settings = manifest.contributes.settings
        .map((s) => {
          switch (s.type) {
            case 'input':
              return {
                field: String(s.field),
                name: String(s.name),
                description: String(s.description),
                type: s.type,
                textarea: Boolean(s.textarea),
                default: String(s.default),
              }
            case 'boolean':
              return {
                field: String(s.field),
                name: String(s.name),
                description: String(s.description),
                type: s.type,
                default: Boolean(s.default),
              }
            case 'selection':
              return {
                field: String(s.field),
                name: String(s.name),
                description: String(s.description),
                type: s.type,
                default: String(s.default),
                enum: s.enum.map((e) => String(e)),
                enumName: s.enumName.map((e) => String(e)),
              }
            // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
            default:
              // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
              let neverValue: never = s
              // throw new Error(`Unknown setting type: ${s.type}`)
              // @ts-expect-error
              console.log(`Unknown setting type: ${s.type}`)
              return null
          }
        })
        .filter((s) => s != null)
    }
    if (Array.isArray(manifest.contributes.listProviders)) {
      contributes.listProviders = manifest.contributes.listProviders.map((p) => {
        p.id = String(p.id)
        p.name = String(p.name)
        p.description = String(p.description)
        p.form = p.form
          .map((s) => {
            switch (s.type) {
              case 'input':
                return {
                  field: String(s.field),
                  name: String(s.name),
                  description: String(s.description),
                  type: s.type,
                  textarea: Boolean(s.textarea),
                  default: String(s.default),
                }
              case 'boolean':
                return {
                  field: String(s.field),
                  name: String(s.name),
                  description: String(s.description),
                  type: s.type,
                  default: Boolean(s.default),
                }
              case 'selection':
                return {
                  field: String(s.field),
                  name: String(s.name),
                  description: String(s.description),
                  type: s.type,
                  default: String(s.default),
                  enum: s.enum.map((e) => String(e)),
                  enumName: s.enumName.map((e) => String(e)),
                }
              // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
              default:
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-case-declarations
                let neverValue: never = s
                // throw new Error(`Unknown setting type: ${s.type}`)
                // @ts-expect-error
                console.log(`Unknown setting type: ${s.type}`)
                return null
            }
          })
          .filter((s) => s != null)

        return {
          id: String(p.id),
          name: String(p.name),
          description: String(p.description),
          form: p.form,
        }
      })
    }
    manifest.contributes = contributes
  } else manifest.contributes = {}
}

const verifyManifest = async (extensionPath: string, manifest: AnyListen.Extension.Manifest) => {
  formatManifest(manifest)
  manifest.icon = manifest.icon ? await buildPath(extensionPath, manifest.icon).catch(() => '') : ''
  if (manifest.icon) {
    if (availableIcons.includes(path.extname(manifest.icon).toLowerCase())) {
      manifest.icon = await extensionState.remoteFuncs.createExtensionIconPublicPath(manifest.icon)
    } else {
      manifest.icon = ''
    }
  }
  manifest.main = await buildPath(extensionPath, manifest.main)
  if (!manifest.main) throw new Error('Main enter not defined')
  return manifest
}

export const parseExtension = async (extensionPath: string): Promise<AnyListen.Extension.Extension | null> => {
  const manifest = await fs.promises
    .readFile(joinPath(extensionPath, EXTENSION.mainifestName))
    .then(async (buf) => {
      const manifest = JSON.parse(buf.toString('utf-8')) as AnyListen.Extension.Manifest
      return verifyManifest(extensionPath, manifest)
    })
    .catch((err) => {
      console.log(err)
      return null
    })
  if (!manifest) return null
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    icon: manifest.icon,
    version: manifest.version,
    target_engine: manifest.target_engine,
    author: manifest.author,
    homepage: manifest.homepage,
    license: manifest.license,
    categories: manifest.categories!,
    tags: manifest.tags!,
    grant: manifest.grant!,
    contributes: manifest.contributes!,

    directory: extensionPath,
    i18nMessages: await buildExtensionI18nMessage(extensionPath),
    dataDirectory: joinPath(extensionState.dataDir, manifest.id),
    enter: manifest.main,
    enabled: true,
    installedTimestamp: Date.now(),
    updatedTimestamp: 0,
    loaded: false,
    loadTimestamp: 0,
    removed: false,
    publicKey: manifest.publicKey ?? '',
    internal: false,
  }
}

export const saveExtensionsSetting = async (extensions: AnyListen.Extension.Extension[]) => {
  return fs.promises.writeFile(
    extensionState.configFilePath,
    JSON.stringify(
      extensions.map(
        (ext) =>
          ({
            id: ext.id,
            name: ext.name,
            enabled: ext.enabled,
            installedTimestamp: ext.installedTimestamp,
            updatedTimestamp: ext.updatedTimestamp,
            removed: ext.removed,
          }) satisfies AnyListen.Extension.Setting
      ) as AnyListen.Extension.Setting[]
    )
  )
}

export const removeExtensions = async (extensions: AnyListen.Extension.Extension[]) => {
  while (extensions.length) {
    const ext = extensions.shift()!
    await unloadConfig(ext)
    await Promise.all([removePath(ext.directory).catch(() => {}), removePath(ext.dataDirectory).catch(() => {})])
  }
}

export const loadExtension = async (extension: AnyListen.Extension.Extension) => {
  extensionEvent.loading(extension.id)
  extension.errorMessage = ''
  extension.loaded = false
  let runTotalTime: number
  try {
    if (extension.internal) {
      runTotalTime = await loadExtensionByInternalExtension(extension)
    } else {
      const vmState = await createVmConetxt(extension, extensionState.preloadScript)
      await setupVmContext(vmState)
      runTotalTime = await runExtension(vmState.vmContext, vmState.extension)
    }
  } catch (err) {
    console.error('load extension error: ', err)
    extension.errorMessage = (err as Error).message
    extensionEvent.loadError(extension.id, (err as Error).message)
    return
  }
  extension.loadTimestamp = runTotalTime
  extension.loaded = true
  extensionEvent.loaded(extension.id, runTotalTime)
  // if (errorMessage) extension.errorMessage = errorMessage
}

export const stopRunExtension = async (extension: AnyListen.Extension.Extension) => {
  if (extension.internal) throw new Error('Internal extensions cannot be stopped')
  extensionEvent.stoping(extension.id)
  await destroyContext(extension.id)
  extension.loaded = false
  extensionEvent.stopped(extension.id)
  return false
}

const downloadExtensionFile = async (url: string, bundlePath: string) => {
  return eachMirror(null, url, url, async (url: string) => {
    await simpleDownload(url, bundlePath).catch(async (err) => {
      await removePath(bundlePath)
      throw err
    })
  })
}

export const downloadExtension = async (url: string, manifest?: AnyListen.Extension.Manifest) => {
  if (!isUrl(url)) {
    const stats = await getFileStats(url)
    if (!stats) throw new Error(`Invalid extension path: ${url}`)
    if (stats.isFile()) {
      if (await checkFile(url)) {
        if (extensionState.tempDir == dirname(url)) return url
        const tempPath = joinPath(extensionState.tempDir, basename(url))
        await copyFile(url, tempPath)
        return tempPath
      }
    } else if (await checkPath(url)) {
      if (extensionState.tempDir == dirname(url)) return url
      const tempPath = joinPath(extensionState.tempDir, basename(url))
      await copyFile(url, tempPath)
      return tempPath
    }
    throw new Error(`Unable to read the path: ${url}`)
  }

  const bundlePath = joinPath(extensionState.tempDir, `${toSha256(manifest?.id ?? generateId())}${FILE_EXT_NAME}`)
  await downloadExtensionFile(url, bundlePath)
  return bundlePath
}

const verifyExtension = async (unpackDir: string) => {
  const sigFilePath = joinPath(unpackDir, EXTENSION.signFileName)
  let extBundleFilePath = joinPath(unpackDir, EXTENSION.extBundleFileName)
  const pubKey = await Promise.all([
    fs.promises
      .readFile(sigFilePath)
      .then(async (buf) => {
        const [sign, pubKey] = buf.toString('utf-8').split('\n')
        return [sign, pubKey] as const
      })
      .catch((err) => {
        console.log(err)
        return null
      }),
    fs.promises.readFile(extBundleFilePath).catch((err) => {
      console.log(err)
      extBundleFilePath = ''
      return null
    }),
  ]).then(async ([signInfo, extData]) => {
    if (signInfo && extData) {
      if (!verifySignature(extData, `${EXTENSION.publicKeyHeader}${signInfo[1]}${EXTENSION.publicKeyFooter}`, signInfo[0])) {
        throw new Error('Verification failed')
      }
      return signInfo[1]
    }
    return ''
  })
  let extDir: string
  if (extBundleFilePath) {
    extDir = extBundleFilePath.replace(new RegExp(`${path.extname(EXTENSION.extBundleFileName).replaceAll('.', '\\.')}$`), '')
    await createDir(extDir)
    const { unpack } = await import('@any-listen/nodejs/tar')
    await unpack(extBundleFilePath, extDir).catch(async (err: Error) => {
      await removePath(extDir)
      throw err
    })
  } else extDir = unpackDir
  const ext = await parseExtension(extDir)
  if (!ext) throw new Error('Invalid Extension')
  const mainifestPath = joinPath(extDir, EXTENSION.mainifestName)
  const manifest = JSON.parse((await fs.promises.readFile(mainifestPath)).toString('utf-8')) as Record<string, string>
  manifest.publicKey = pubKey
  await fs.promises.writeFile(mainifestPath, JSON.stringify(manifest))
  return extDir
}

export const unpackExtension = async (bundlePath: string) => {
  if (extname(bundlePath).toLowerCase() != FILE_EXT_NAME) {
    if ((await getFileStats(bundlePath))?.isDirectory()) {
      return verifyExtension(bundlePath)
    }
    throw new Error(`Unknown file type: ${bundlePath}`)
  }

  const targetDir = bundlePath.replace(FILE_EXT_NAME_EXP, '')
  if (await checkFile(targetDir)) await removePath(targetDir)
  await createDir(targetDir)
  const { unpack } = await import('@any-listen/nodejs/tar')
  await unpack(bundlePath, targetDir).catch(async (err: Error) => {
    await removePath(targetDir)
    throw err
  })

  return verifyExtension(targetDir)
}

export const backupExtension = async (extensionDir: string) => {
  const newPath = joinPath(extensionState.tempDir, `${basename(extensionDir)}.bak`)
  await removePath(newPath).catch(() => {})
  if (!(await renamePath(extensionDir, newPath))) {
    throw new Error(`Could not rename extension: ${extensionDir}`)
  }
  return newPath
}

export const restoreExtension = async (extensionDir: string) => {
  const newPath = joinPath(extensionState.extensionDir, basename(extensionDir.replace(/\.bak$/, '')))
  await removePath(newPath).catch(() => {})
  if (!(await renamePath(extensionDir, newPath))) {
    throw new Error(`Could not rename extension: ${extensionDir}`)
  }
  return newPath
}

export const mvExtension = async (tempExtension: AnyListen.Extension.Extension) => {
  if (dirname(tempExtension.directory) == extensionState.extensionDir) return tempExtension.directory
  const newPath = joinPath(extensionState.extensionDir, `${tempExtension.id}_${tempExtension.version}`)
  if (!(await renamePath(tempExtension.directory, newPath))) {
    throw new Error(`Could not rename extension: ${tempExtension.directory}`)
  }
  return newPath
}

const readMessageFile = async (filePath: string): Promise<Record<string, string>> => {
  return fs.promises
    .readFile(filePath)
    .then((data) => {
      const messages = JSON.parse(data.toString('utf-8')) as Record<string, unknown>
      for (const [key, val] of Object.entries(messages)) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        if (typeof val != 'string') delete messages[key]
      }
      return messages as Record<string, string>
    })
    .catch(() => ({}))
}
export const buildExtensionI18nMessage = async (extensionDir: string) => {
  let fallbackPath = joinPath(extensionDir, 'i18n/en-us.json')
  let targetPath = joinPath(extensionDir, `i18n/${extensionState.locale}.json`)
  const [fallbackMessage, targetMessage] = await Promise.all([readMessageFile(fallbackPath), readMessageFile(targetPath)])
  return { ...fallbackMessage, ...targetMessage }
}

export const updateResourceList = () => {
  const resourceList: AnyListen.Extension.ResourceList = {
    resources: {},
    listProvider: [],
  }
  for (const ext of extensionState.extensions) {
    if (!ext.loaded) continue
    if (ext.contributes.resource) {
      for (const res of ext.contributes.resource) {
        for (const action of res.resource) {
          let list = resourceList.resources[action]
          if (!list) {
            list = []
            resourceList.resources[action] = list
          }
          list.push({
            extensionId: ext.id,
            id: res.id,
            name: res.name,
          })
        }
      }
    }
    if (ext.contributes.listProviders) {
      for (const provider of ext.contributes.listProviders) {
        resourceList.listProvider.push({
          extensionId: ext.id,
          id: provider.id,
          name: provider.name,
          description: provider.description,
          form: provider.form,
        })
      }
    }
  }
  extensionState.resourceList = resourceList
  extensionEvent.resourceUpdated(resourceList)
}
export const updateResourceListThrottle = throttle(updateResourceList, 500)

export const buildExtensionSettings = async () => {
  if (extensionState.extensionSettings) return extensionState.extensionSettings

  const list: AnyListen.Extension.ExtensionSetting[] = []
  for (const ext of extensionState.extensions) {
    if (!ext.contributes.settings) continue
    const extSetting: AnyListen.Extension.ExtensionSetting = {
      id: ext.id,
      name: ext.name,
      internal: ext.internal,
      settingItems: [],
    }
    const configs = await getConfig(ext)
    for (const item of ext.contributes.settings) {
      extSetting.settingItems.push({
        ...item,
        // @ts-expect-error
        value: configs[item.field] ?? item.default,
      })
    }
    list.push(extSetting)
  }
  extensionState.extensionSettings = list
  return list
}

export const updateExtensionSettings = async (id: string, config: Record<string, any>) => {
  const targetExt = extensionState.extensions.find((ext) => ext.id == id)
  if (!targetExt) throw new Error('extension not found')
  // TODO: verify config key and value
  const configs = await getConfig(targetExt)
  const newConfig = { ...configs, ...config }
  await saveConfig(targetExt, newConfig)
  const targetSetting = extensionState.extensionSettings?.find((s) => s.id == targetExt.id)
  if (targetSetting) {
    for (const [key, value] of Object.entries(config)) {
      targetSetting.settingItems.find((item) => item.field == key)!.value = value
    }
  }
  extensionEvent.extenstionSettingUpdated(id, Object.keys(config), config)
  if (targetExt.loaded && !targetExt.internal) {
    sendConfigUpdatedEvent(id, Object.keys(config), config)
  }
}

export const getExtensionLastLogs = async (extId?: string): Promise<AnyListen.IPCExtension.LastLog[]> => {
  if (extId == null) {
    // TODO limit
    return (
      await Promise.all(
        extensionState.extensions
          .filter((ext) => ext.enabled)
          .map(async (ext) => {
            return {
              logs: await readLastLines(joinPath(ext.dataDirectory, EXTENSION.logFileName), 100),
              id: ext.id,
              name: ext.name,
            }
          })
      )
    ).filter((log) => log.logs)
  }
  const ext = extensionState.extensions.find((ext) => ext.id == extId)
  if (!ext) throw new Error('extension not found')
  return [
    {
      logs: await readLastLines(joinPath(ext.dataDirectory, EXTENSION.logFileName), 100),
      id: ext.id,
      name: ext.name,
    },
  ]
}
