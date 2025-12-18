import type { ExtensionContext, ExtensionHostContext } from '../type'
import { listProviderActions } from './listProviderAction'
import { resourceActions } from './resourceAction'
import { initHostContext } from './shared'
export const pkg: AnyListen.Extension.Manifest = {
  id: 'internal.webdav',
  name: 'WebDAV',
  version: '0.0.1',
  contributes: {
    settings: [
      {
        field: 'enabledCache',
        name: 't(exts.webdav.cache.name)',
        description: 't(exts.webdav.cache.description)',
        type: 'boolean',
        default: false,
      },
      {
        field: 'servers',
        name: 't(exts.webdav.servers.name)',
        description: 't(exts.webdav.servers.description)',
        textarea: true,
        type: 'input',
        default: '',
      },
      // {
      //   field: 'test3',
      //   name: 't(exts.webdav.test3.name)',
      //   description: 't(exts.webdav.test3.description)',
      //   type: 'boolean',
      //   default: false,
      // },
      // {
      //   field: 'test4',
      //   name: 't(exts.webdav.test4.name)',
      //   description: 't(exts.webdav.test4.description)',
      //   type: 'selection',
      //   default: 'right',
      //   enum: ['left', 'right'],
      //   enumName: ['t(exts.webdav.test4.left.description)', 't(exts.webdav.test4.right.description)'],
      // },
    ],
    listProviders: [
      {
        id: 'webdav',
        name: 't(exts.webdav.name)',
        description: 't(exts.webdav.description)',
        form: [
          {
            field: 'url',
            name: 't(exts.webdav.form.url.name)',
            description: 't(exts.webdav.form.url.description)',
            type: 'input',
            default: '',
          },
          {
            field: 'username',
            name: 't(exts.webdav.form.username.name)',
            description: 't(exts.webdav.form.username.description)',
            type: 'input',
            default: '',
          },
          {
            field: 'directory',
            name: 't(exts.webdav.form.directory.name)',
            description: 't(exts.webdav.form.directory.description)',
            type: 'input',
            default: '',
          },
          {
            field: 'includeSubDir',
            name: 't(exts.webdav.form.include_sub_dir.name)',
            description: 't(exts.webdav.form.include_sub_dir.description)',
            type: 'boolean',
            default: false,
          },
          {
            field: 'enabledRemove',
            name: 't(exts.webdav.form.enabled_remove.name)',
            description: 't(exts.webdav.form.enabled_remove.description)',
            type: 'boolean',
            default: false,
          },
        ],
      },
    ],
    resource: [
      {
        id: 'webdav',
        name: 't(exts.webdav.name)',
        resource: ['musicUrl', 'musicPic', 'musicLyric'],
      },
    ],
  },
  main: '',
  publicKey: '',
}

type LPA = AnyListen.IPCExtension.ListProviderAction
type RS = AnyListen.IPCExtension.ResourceAction
export const setup = async (
  extension: AnyListen.Extension.Extension,
  hostContext: ExtensionHostContext
): Promise<ExtensionContext> => {
  // console.log('run', env)
  initHostContext(hostContext)
  // hostContext.logcat.info(`Extension ${extension.id} setup`)
  return {
    resourceAction: async <T extends keyof RS>(action: T, params: Parameters<RS[T]>[0]): Promise<Awaited<ReturnType<RS[T]>>> => {
      if (!(action in resourceActions)) throw new Error(`action ${String(action)} not found`)
      // @ts-expect-error
      return resourceActions[action](params) as Awaited<ReturnType<RS[T]>>
    },
    listProviderAction: async <T extends keyof LPA>(
      action: T,
      params: Parameters<LPA[T]>[0]
    ): Promise<Awaited<ReturnType<LPA[T]>>> => {
      if (!(action in listProviderActions)) throw new Error(`action ${String(action)} not found`)
      // @ts-expect-error
      return listProviderActions[action](params) as Awaited<ReturnType<LPA[T]>>
    },
  }
}
