import { DEFAULT_LANG } from '@any-listen/common/constants'
import { messages } from '@any-listen/i18n'
import { joinPath } from '@any-listen/nodejs'

import { formatManifest } from '../../shared'
import { extensionState } from '../../state'
import type { ExtensionContext, ExtensionHostContext } from './type'
import * as webdav from './webdav'

export const extensions: Array<{
  setup: (extension: AnyListen.Extension.Extension, content: ExtensionHostContext) => Promise<ExtensionContext>
  pkg: AnyListen.Extension.Manifest
}> = [webdav]

type Extension = (typeof extensions)[number]

const filterExtI18nMessages = (extId: string, messages: Record<string, string>) => {
  return Object.fromEntries(Object.entries(messages).filter(([key]) => key.startsWith(`exts.${extId.split('.')[1]}`)))
}

export const buildExtensionI18nMessage = (extId: string) => {
  const fallbackMessages = messages[DEFAULT_LANG]
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  let targetPath = messages[extensionState.locale as keyof typeof messages] ?? {}
  return filterExtI18nMessages(extId, { ...fallbackMessages, ...targetPath })
}

const parseExtension = (ext: Extension): AnyListen.Extension.Extension => {
  const manifest = ext.pkg
  formatManifest(manifest)
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

    directory: '',
    i18nMessages: buildExtensionI18nMessage(manifest.id),
    dataDirectory: joinPath(extensionState.dataDir, manifest.id),
    enter: '',
    enabled: true,
    installedTimestamp: 0,
    updatedTimestamp: 0,
    loaded: false,
    loadTimestamp: 0,
    removed: false,
    publicKey: '',
    internal: true,
  }
}

export const getExtensionList = async () => {
  return extensions.map(parseExtension)
}
