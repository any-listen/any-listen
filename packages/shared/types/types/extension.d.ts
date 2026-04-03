declare global {
  namespace AnyListen {
    namespace Extension {
      type Grant = 'internet' | 'player' | 'music_list' | 'isolate_context'
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

      interface FormBase {
        field: string
        name: string
        description: string
      }
      interface FormInput extends FormBase {
        type: 'input'
        textarea?: boolean
        default?: string
      }
      interface FormBoolean extends FormBase {
        type: 'boolean'
        default?: boolean
      }
      interface FormSelection extends FormBase {
        type: 'selection'
        default?: string
        enum: string[]
        enumName: string[]
      }
      interface FormConfigCheckbox extends FormBase {
        type: 'configCheckbox'
        default?: string
        enumConfigFiled: string
        enumFiled: string
        enumNameFiled: string
        enumDescriptionFiled?: string
        removeable?: boolean
        actionCommands?: string[]
        actionCommandNames?: string[]
      }
      interface FormConfigCheckboxMultiple extends FormBase {
        type: 'configCheckboxMultiple'
        default?: string[]
        enumConfigFiled: string
        enumFiled: string
        enumNameFiled: string
        enumDescriptionFiled?: string
        removeable?: boolean
        actionCommands?: string[]
        actionCommandNames?: string[]
      }
      interface FormLazzyParseMeta {
        type: 'lazzyParseMeta'
        default?: boolean
      }
      type FormValue<T extends FormItems> = T & { value?: T['default'] }
      type FormConfigValue<T extends FormConfigCheckbox | FormConfigCheckboxMultiple> = T & {
        enum: ConfigEnum[]
        value?: T['default']
      }
      interface ConfigEnum {
        value: string
        name: string
        raw: unknown
        description?: string
      }
      type FormValueItem =
        | FormValue<FormInput>
        | FormValue<FormBoolean>
        | FormValue<FormSelection>
        | FormConfigValue<FormConfigCheckbox>
        | FormConfigValue<FormConfigCheckboxMultiple>
      type FormItems = FormInput | FormBoolean | FormSelection | FormConfigCheckbox | FormConfigCheckboxMultiple
      type ListProviderFormValueItem = FormValueItem | (FormLazzyParseMeta & { value?: boolean })
      type ListProviderFormItems = FormItems | FormLazzyParseMeta
      interface ListProvider {
        id: string
        name: string
        description: string
        fileSortable?: boolean
        form: ListProviderFormItems[]
      }

      interface Command {
        extensionId: string
        extensionName: string
        fullCommand: string
        command: string
        name: string
        description?: string
        hidden?: boolean
      }

      interface Manifest {
        id: string
        name: string
        description?: string
        icon?: string
        version: string
        target_engine?: string
        author?: string
        homepage?: string
        license?: string
        categories?: string[]
        tags?: string[]
        main: string
        publicKey: string
        grant?: Grant[]
        contributes?: {
          resource?: Array<{
            id: string
            name: string
            resource: ResourceAction[]
          }>
          listProviders?: ListProvider[]
          settings?: FormItems[]
          commands?: Array<{
            command: string
            name: string
            description?: string
            hidden?: boolean
          }>
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
        internal: boolean
        settingItems: FormValueItem[]
      }
      // interface Resource {
      //   id: string
      //   name: string
      //   resource: ResourceAction[]
      //   extensionId: string
      // }
      interface ListProviderResource extends ListProvider {
        extensionId: string
      }
      interface ResourceList {
        resources: Partial<
          Record<
            ResourceAction,
            Array<{
              id: string
              name: string
              extensionId: string
            }>
          >
        >
        listProvider: ListProviderResource[]
        commands: Command[]
      }
      type ExtensionI18nMessages = Record<string, string>
      // type ResourceMap = Map<string, {}>
      interface Extension extends Setting {
        description: Manifest['description']
        icon: Manifest['icon']
        version: Manifest['version']
        target_engine: Manifest['target_engine']
        author: Manifest['author']
        homepage: Manifest['homepage']
        license: Manifest['license']
        categories: NonNullable<Manifest['categories']>
        tags: NonNullable<Manifest['tags']>
        grant: NonNullable<Manifest['grant']>
        contributes: NonNullable<Manifest['contributes']>
        publicKey: Manifest['publicKey']
        directory: string
        dataDirectory: string
        enter: string
        loadTimestamp: number
        loaded: boolean
        errorMessage?: string
        requiredReload?: boolean
        i18nMessages: Record<string, string>
        internal: boolean
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
