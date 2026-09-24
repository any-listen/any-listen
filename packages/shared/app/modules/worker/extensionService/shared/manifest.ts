/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import path from 'node:path'

import { checkFile, extname, isAbsolute, joinPath } from '@any-listen/nodejs'

import { extensionState } from '../state'
const GRANTS: AnyListen.Extension.Grant[] = ['music_list', 'player', 'internet', 'isolate_context']
const RESOURCE: AnyListen.Extension.ResourceAction[] = [
  'tipSearch',
  'hotSearch',
  'musicSearch',
  'musicPic',
  'musicLyric',
  'musicUrl',
  'musicPicSearch',
  'musicComment',
  'songlistSearch',
  'songlist',
  'topSongs',
  'albumSearch',
  'album',
  'singerSearch',
  'singer',
  'lyricSearch',
  'lyricDetail',
]
const availableIcons = ['.png', '.jpg', '.jpeg', '.webp', '.svg']

const MANIFEST_STRING_LIMIT = {
  id: 64,
  name: 128,
  description: 1024,
  readme: 10240,
  icon: 260,
  main: 260,
  version: 32,
  target_engine: 64,
  author: 128,
  homepage: 512,
  license: 64,
  publicKey: 8192,
  categoriesItem: 64,
  tagsItem: 64,
  resourceId: 64,
  resourceName: 128,
  command: 128,
  commandName: 128,
  commandDescription: 512,
  listProviderId: 64,
  listProviderName: 128,
  listProviderDescription: 1024,
  formField: 64,
  formName: 128,
  formDescription: 1024,
  formDefault: 1024,
  formEnumItem: 128,
  formEnumNameItem: 128,
  formEnumConfigFiled: 64,
  formEnumFiled: 64,
  formEnumNameFiled: 64,
  formEnumDescriptionFiled: 256,
  formActionCommand: 128,
  formActionCommandName: 128,
} as const

const trimStringLength = (value: string, maxLength: number) => {
  if (value.length > maxLength) throw new Error(`String exceeds max length of ${maxLength}: ${value}`)
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

const trimOptionalString = (value: string | undefined, maxLength: number) => {
  if (value == null) return value
  return trimStringLength(value, maxLength)
}

const trimFormStringFields = (form: AnyListen.Extension.FormItems | AnyListen.Extension.ListProviderFormItems) => {
  switch (form.type) {
    case 'input':
      form.field = trimStringLength(form.field, MANIFEST_STRING_LIMIT.formField)
      form.name = trimStringLength(form.name, MANIFEST_STRING_LIMIT.formName)
      form.description = trimStringLength(form.description, MANIFEST_STRING_LIMIT.formDescription)
      form.default = trimOptionalString(form.default, MANIFEST_STRING_LIMIT.formDefault)
      break
    case 'boolean':
      form.field = trimStringLength(form.field, MANIFEST_STRING_LIMIT.formField)
      form.name = trimStringLength(form.name, MANIFEST_STRING_LIMIT.formName)
      form.description = trimStringLength(form.description, MANIFEST_STRING_LIMIT.formDescription)
      break
    case 'selection':
      form.field = trimStringLength(form.field, MANIFEST_STRING_LIMIT.formField)
      form.name = trimStringLength(form.name, MANIFEST_STRING_LIMIT.formName)
      form.description = trimStringLength(form.description, MANIFEST_STRING_LIMIT.formDescription)
      form.default = trimOptionalString(form.default, MANIFEST_STRING_LIMIT.formDefault)
      form.enum = form.enum.map((item) => trimStringLength(item, MANIFEST_STRING_LIMIT.formEnumItem))
      form.enumName = form.enumName.map((item) => trimStringLength(item, MANIFEST_STRING_LIMIT.formEnumNameItem))
      break
    case 'configCheckbox':
      form.field = trimStringLength(form.field, MANIFEST_STRING_LIMIT.formField)
      form.name = trimStringLength(form.name, MANIFEST_STRING_LIMIT.formName)
      form.description = trimStringLength(form.description, MANIFEST_STRING_LIMIT.formDescription)
      form.default = trimOptionalString(form.default, MANIFEST_STRING_LIMIT.formDefault)
      form.enumConfigFiled = trimStringLength(form.enumConfigFiled, MANIFEST_STRING_LIMIT.formEnumConfigFiled)
      form.enumFiled = trimStringLength(form.enumFiled, MANIFEST_STRING_LIMIT.formEnumFiled)
      form.enumNameFiled = trimStringLength(form.enumNameFiled, MANIFEST_STRING_LIMIT.formEnumNameFiled)
      form.enumDescriptionFiled = trimOptionalString(form.enumDescriptionFiled, MANIFEST_STRING_LIMIT.formEnumDescriptionFiled)
      if (Array.isArray(form.actionCommands)) {
        form.actionCommands = form.actionCommands.map((item) => trimStringLength(item, MANIFEST_STRING_LIMIT.formActionCommand))
      }
      if (Array.isArray(form.actionCommandNames)) {
        form.actionCommandNames = form.actionCommandNames.map((item) =>
          trimStringLength(item, MANIFEST_STRING_LIMIT.formActionCommandName)
        )
      }
      break
    case 'configCheckboxMultiple':
      form.field = trimStringLength(form.field, MANIFEST_STRING_LIMIT.formField)
      form.name = trimStringLength(form.name, MANIFEST_STRING_LIMIT.formName)
      form.description = trimStringLength(form.description, MANIFEST_STRING_LIMIT.formDescription)
      form.default = form.default?.map((item) => trimStringLength(item, MANIFEST_STRING_LIMIT.formDefault))
      form.enumConfigFiled = trimStringLength(form.enumConfigFiled, MANIFEST_STRING_LIMIT.formEnumConfigFiled)
      form.enumFiled = trimStringLength(form.enumFiled, MANIFEST_STRING_LIMIT.formEnumFiled)
      form.enumNameFiled = trimStringLength(form.enumNameFiled, MANIFEST_STRING_LIMIT.formEnumNameFiled)
      form.enumDescriptionFiled = trimOptionalString(form.enumDescriptionFiled, MANIFEST_STRING_LIMIT.formEnumDescriptionFiled)
      if (Array.isArray(form.actionCommands)) {
        form.actionCommands = form.actionCommands.map((item) => trimStringLength(item, MANIFEST_STRING_LIMIT.formActionCommand))
      }
      if (Array.isArray(form.actionCommandNames)) {
        form.actionCommandNames = form.actionCommandNames.map((item) =>
          trimStringLength(item, MANIFEST_STRING_LIMIT.formActionCommandName)
        )
      }
      break
    case 'lazzyParseMeta':
      break
  }
}

const trimManifestStringFields = (manifest: AnyListen.Extension.Manifest) => {
  manifest.id = trimStringLength(manifest.id, MANIFEST_STRING_LIMIT.id)
  manifest.name = trimStringLength(manifest.name, MANIFEST_STRING_LIMIT.name)
  manifest.description = trimOptionalString(manifest.description, MANIFEST_STRING_LIMIT.description)
  manifest.readme = trimOptionalString(manifest.readme, MANIFEST_STRING_LIMIT.readme)
  manifest.icon = trimOptionalString(manifest.icon, MANIFEST_STRING_LIMIT.icon)
  manifest.main = trimStringLength(manifest.main, MANIFEST_STRING_LIMIT.main)
  manifest.version = trimStringLength(manifest.version, MANIFEST_STRING_LIMIT.version)
  manifest.target_engine = trimOptionalString(manifest.target_engine, MANIFEST_STRING_LIMIT.target_engine)
  manifest.author = trimOptionalString(manifest.author, MANIFEST_STRING_LIMIT.author)
  manifest.homepage = trimOptionalString(manifest.homepage, MANIFEST_STRING_LIMIT.homepage)
  manifest.license = trimOptionalString(manifest.license, MANIFEST_STRING_LIMIT.license)

  manifest.categories = (manifest.categories ?? []).map((item) => trimStringLength(item, MANIFEST_STRING_LIMIT.categoriesItem))
  manifest.tags = (manifest.tags ?? []).map((item) => trimStringLength(item, MANIFEST_STRING_LIMIT.tagsItem))

  const contributes = manifest.contributes
  if (!contributes) return

  if (contributes.resource) {
    contributes.resource.forEach((item) => {
      item.id = trimStringLength(item.id, MANIFEST_STRING_LIMIT.resourceId)
      item.name = trimStringLength(item.name, MANIFEST_STRING_LIMIT.resourceName)
    })
  }

  if (contributes.commands) {
    contributes.commands.forEach((item) => {
      item.command = trimStringLength(item.command, MANIFEST_STRING_LIMIT.command)
      item.name = trimStringLength(item.name, MANIFEST_STRING_LIMIT.commandName)
      item.description = trimOptionalString(item.description, MANIFEST_STRING_LIMIT.commandDescription)
    })
  }

  if (contributes.settings) {
    contributes.settings.forEach((item) => {
      trimFormStringFields(item)
    })
  }

  if (contributes.listProviders) {
    contributes.listProviders.forEach((item) => {
      item.id = trimStringLength(item.id, MANIFEST_STRING_LIMIT.listProviderId)
      item.name = trimStringLength(item.name, MANIFEST_STRING_LIMIT.listProviderName)
      item.description = trimStringLength(item.description, MANIFEST_STRING_LIMIT.listProviderDescription)
      item.form.forEach((form) => {
        trimFormStringFields(form)
      })
    })
  }
}
// t('extension.resource_musicComment')

const buildPath = async (extensionPath: string, _path: string) => {
  if (isAbsolute(_path)) throw new Error(`path not a relative path: ${_path}`)
  const enterFilePath = joinPath(extensionPath, _path)
  if (!enterFilePath.startsWith(extensionPath + path.sep)) throw new Error('main path illegal')
  if (!(await checkFile(enterFilePath))) return ''
  return enterFilePath
}

type Contributes = NonNullable<AnyListen.Extension.Manifest['contributes']>

const parseResource = (resource: NonNullable<Contributes['resource']>): NonNullable<Contributes['resource']> => {
  return resource.map((resource) => {
    return {
      id: String(resource.id),
      name: String(resource.name),
      resource: resource.resource.filter((r) => RESOURCE.includes(r)),
    }
  })
}
const parseSettings = (settings: NonNullable<Contributes['settings']>): NonNullable<Contributes['settings']> => {
  return settings
    .map((s) => {
      switch (s.type) {
        case 'input':
          return {
            type: s.type,
            field: String(s.field),
            name: String(s.name),
            description: String(s.description),
            textarea: Boolean(s.textarea),
            default: s.default == null ? undefined : String(s.default),
          } satisfies AnyListen.Extension.FormInput
        case 'boolean':
          return {
            type: s.type,
            field: String(s.field),
            name: String(s.name),
            description: String(s.description),
            default: s.default == null ? undefined : Boolean(s.default),
          } satisfies AnyListen.Extension.FormBoolean
        case 'selection':
          return {
            type: s.type,
            field: String(s.field),
            name: String(s.name),
            description: String(s.description),
            default: s.default == null ? undefined : String(s.default),
            enum: s.enum.map((e) => String(e)),
            enumName: s.enumName.map((e) => String(e)),
          } satisfies AnyListen.Extension.FormSelection
        case 'configCheckbox':
          return {
            type: s.type,
            field: String(s.field),
            name: String(s.name),
            description: String(s.description),
            default: s.default == null ? undefined : String(s.default),
            enumConfigFiled: String(s.enumConfigFiled),
            enumFiled: String(s.enumFiled),
            enumNameFiled: String(s.enumNameFiled),
            enumDescriptionFiled: s.enumDescriptionFiled ? String(s.enumDescriptionFiled) : undefined,
            removeable: s.removeable ? Boolean(s.removeable) : undefined,
            actionCommands: Array.isArray(s.actionCommands) ? s.actionCommands.map((c) => String(c)) : undefined,
            actionCommandNames: Array.isArray(s.actionCommandNames) ? s.actionCommandNames.map((c) => String(c)) : undefined,
          } satisfies AnyListen.Extension.FormConfigCheckbox
        case 'configCheckboxMultiple':
          return {
            type: s.type,
            field: String(s.field),
            name: String(s.name),
            description: String(s.description),
            default: s.default == null ? undefined : s.default.map((d) => String(d)),
            max: typeof s.max === 'number' ? Math.max(s.max, 0) : undefined,
            enumConfigFiled: String(s.enumConfigFiled),
            enumFiled: String(s.enumFiled),
            enumNameFiled: String(s.enumNameFiled),
            enumDescriptionFiled: s.enumDescriptionFiled ? String(s.enumDescriptionFiled) : undefined,
            removeable: s.removeable ? Boolean(s.removeable) : undefined,
            actionCommands: s.actionCommands == null ? undefined : s.actionCommands.map((c) => String(c)),
            actionCommandNames: s.actionCommandNames == null ? undefined : s.actionCommandNames.map((c) => String(c)),
          } satisfies AnyListen.Extension.FormConfigCheckboxMultiple

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
const parseListProviders = (
  listProviders: NonNullable<Contributes['listProviders']>
): NonNullable<Contributes['listProviders']> => {
  return listProviders.map((p) => {
    p.id = String(p.id)
    p.name = String(p.name)
    p.description = String(p.description)
    if (p.fileSortable != null) p.fileSortable = Boolean(p.fileSortable)
    p.form = p.form
      .map((s) => {
        switch (s.type) {
          case 'input':
            return {
              type: s.type,
              field: String(s.field),
              name: String(s.name),
              description: String(s.description),
              textarea: Boolean(s.textarea),
              default: s.default == null ? undefined : String(s.default),
            } satisfies AnyListen.Extension.FormInput
          case 'boolean':
            return {
              type: s.type,
              field: String(s.field),
              name: String(s.name),
              description: String(s.description),
              default: s.default == null ? undefined : Boolean(s.default),
            } satisfies AnyListen.Extension.FormBoolean
          case 'selection':
            return {
              type: s.type,
              field: String(s.field),
              name: String(s.name),
              description: String(s.description),
              default: s.default == null ? undefined : String(s.default),
              enum: s.enum.map((e) => String(e)),
              enumName: s.enumName.map((e) => String(e)),
            } satisfies AnyListen.Extension.FormSelection
          case 'configCheckbox':
            return {
              type: s.type,
              field: String(s.field),
              name: String(s.name),
              description: String(s.description),
              default: s.default == null ? undefined : String(s.default),
              enumConfigFiled: String(s.enumConfigFiled),
              enumFiled: String(s.enumFiled),
              enumNameFiled: String(s.enumNameFiled),
              enumDescriptionFiled: s.enumDescriptionFiled ? String(s.enumDescriptionFiled) : undefined,
              removeable: s.removeable ? Boolean(s.removeable) : undefined,
              actionCommands: Array.isArray(s.actionCommands) ? s.actionCommands.map((c) => String(c)) : undefined,
              actionCommandNames: Array.isArray(s.actionCommandNames) ? s.actionCommandNames.map((c) => String(c)) : undefined,
            } satisfies AnyListen.Extension.FormConfigCheckbox
          case 'configCheckboxMultiple':
            return {
              type: s.type,
              field: String(s.field),
              name: String(s.name),
              description: String(s.description),
              default: s.default == null ? undefined : s.default.map((d) => String(d)),
              max: typeof s.max === 'number' ? Math.max(s.max, 0) : undefined,
              enumConfigFiled: String(s.enumConfigFiled),
              enumFiled: String(s.enumFiled),
              enumNameFiled: String(s.enumNameFiled),
              enumDescriptionFiled: s.enumDescriptionFiled ? String(s.enumDescriptionFiled) : undefined,
              removeable: s.removeable ? Boolean(s.removeable) : undefined,
              actionCommands: Array.isArray(s.actionCommands) ? s.actionCommands.map((c) => String(c)) : undefined,
              actionCommandNames: Array.isArray(s.actionCommandNames) ? s.actionCommandNames.map((c) => String(c)) : undefined,
            } satisfies AnyListen.Extension.FormConfigCheckboxMultiple
          case 'lazzyParseMeta':
            return {
              type: s.type,
              default: s.default == null ? undefined : Boolean(s.default),
            } satisfies AnyListen.Extension.FormLazzyParseMeta
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
      id: p.id,
      name: p.name,
      description: p.description,
      fileSortable: p.fileSortable,
      form: p.form,
    }
  })
}
const parseCommands = (commands: NonNullable<Contributes['commands']>): NonNullable<Contributes['commands']> => {
  return commands.map((c) => {
    return {
      command: String(c.command),
      name: String(c.name),
      description: String(c.description),
      hidden: c.hidden ? Boolean(c.hidden) : false,
    }
  })
}

const parseContributes = (rawContributes: AnyListen.Extension.Manifest['contributes']): Contributes => {
  if (typeof rawContributes != 'object') return {}
  const contributes: Contributes = {}

  if (Array.isArray(rawContributes.resource)) contributes.resource = parseResource(rawContributes.resource)

  if (Array.isArray(rawContributes.settings)) {
    contributes.settings = parseSettings(rawContributes.settings)
  }
  if (Array.isArray(rawContributes.listProviders)) {
    contributes.listProviders = parseListProviders(rawContributes.listProviders)
  }
  if (Array.isArray(rawContributes.commands)) {
    contributes.commands = parseCommands(rawContributes.commands)
  }
  return contributes
}

export const formatManifest = (manifest: AnyListen.Extension.Manifest) => {
  if (manifest.id != null) manifest.id = String(manifest.id)
  if (!manifest.id) throw new Error('Manifest id not defined')
  if (/[^\w-_.]/.test(manifest.id)) throw new Error('Manifest ID Invalid')

  if (manifest.name != null) manifest.name = String(manifest.name)
  if (!manifest.name) throw new Error('Manifest name not defined')

  if (manifest.description != null) manifest.description = String(manifest.description)
  if (manifest.readme != null) manifest.readme = String(manifest.readme)
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
  manifest.contributes = parseContributes(manifest.contributes)
}

export const verifyManifest = async (extensionPath: string, manifest: AnyListen.Extension.Manifest) => {
  formatManifest(manifest)
  trimManifestStringFields(manifest)
  manifest.icon = manifest.icon ? await buildPath(extensionPath, manifest.icon).catch(() => '') : ''
  if (manifest.icon) {
    if (availableIcons.includes(extname(manifest.icon))) {
      manifest.icon = await extensionState.remoteFuncs.createExtensionIconPublicPath(extensionPath, manifest.icon)
    } else {
      manifest.icon = ''
    }
  }
  manifest.main = await buildPath(extensionPath, manifest.main)
  if (!manifest.main) throw new Error('Main enter not defined')
  return manifest
}
