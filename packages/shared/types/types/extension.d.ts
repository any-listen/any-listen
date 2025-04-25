declare global {
  namespace AnyListen {
    namespace Extension {
      type Grant = 'internet' | 'player' | 'music_list'
      type ResourceAction =
        | 'tipSearch'
        | 'hotSearch'
        | 'musicSearch'
        | 'musicPic'
        | 'musicLyric'
        | 'musicUrl'
        | 'songlistSearch'
        | 'songlist'
        | 'leaderboard'
        | 'albumSearch'
        | 'album'
        | 'singerSearch'
        | 'singer'
        | 'musicPicSearch'
        | 'lyricSearch'
        | 'lyricDetail'
      interface SettingBase {
        field: string
        name: string
        description: string
      }
      interface SettingInput extends SettingBase {
        type: 'input'
        textarea?: boolean
        default: string
      }
      interface SettingBoolean extends SettingBase {
        type: 'boolean'
        default: boolean
      }
      interface SettingSelection extends SettingBase {
        type: 'selection'
        default: string
        enum: string[]
        enumName: string[]
      }
      type SettingValue<T extends SettingItems> = T & { value?: T['default'] }
      type SettingItems = SettingInput | SettingBoolean | SettingSelection

      type SettingValueItem = SettingValue<SettingInput> | SettingValue<SettingBoolean> | SettingValue<SettingSelection>

      interface Manifest {
        id: string
        name: string
        description: string
        icon: string
        version: string
        targetEngine: string
        author: string
        homepage: string
        license: string
        categories: string[]
        tags: string[]
        main: string
        publicKey: string
        grant: Grant[]
        contributes: {
          resource?: Array<{
            id: string
            name: string
            resource: ResourceAction[]
          }>
          settings?: SettingItems[]
        }
      }
      interface Setting {
        id: Manifest['id']
        name: Manifest['name']
        enabled: boolean
        installedTimestamp: number
        updatedTimestamp: number
        removed: boolean
      }
      interface ExtensionSetting {
        id: string
        name: string
        settingItems: SettingValueItem[]
      }
      // interface Resource {
      //   id: string
      //   name: string
      //   resource: ResourceAction[]
      //   extensionId: string
      // }
      type ResourceList = Partial<
        Record<
          ResourceAction,
          Array<{
            id: string
            name: string
            extensionId: string
          }>
        >
      >
      type ExtensionI18nMessages = Record<string, string>
      // type ResourceMap = Map<string, {}>
      interface Extension extends Setting {
        description: Manifest['description']
        icon: Manifest['icon']
        version: Manifest['version']
        targetEngine: Manifest['targetEngine']
        author: Manifest['author']
        homepage: Manifest['homepage']
        license: Manifest['license']
        categories: Manifest['categories']
        tags: Manifest['tags']
        grant: Manifest['grant']
        contributes: Manifest['contributes']
        publicKey: Manifest['publicKey']
        directory: string
        dataDirectory: string
        enter: string
        loadTimestamp: number
        loaded: boolean
        errorMessage?: string
        requiredReload?: boolean
        i18nMessages: Record<string, string>
      }

      interface OnlineExtension extends Manifest {
        installed: boolean
        enabled: boolean
        latest: boolean
      }
    }
  }
}

export {}
