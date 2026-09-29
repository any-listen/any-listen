import { VIEW_MAIN_COMMANDS, MAIN_COMMANDS } from '@any-listen/common/command'
import { onMount } from 'svelte'

import { i18n, type Message } from '@/plugins/i18n'

import { extI18n, extI18nMessageChangedEvent } from '../extension/i18n'
import { resourceList } from '../extension/reactive.svelte'
import { extensionState } from '../extension/store/state'

const allCommands = [...VIEW_MAIN_COMMANDS, ...MAIN_COMMANDS]
const excludedCommands: typeof allCommands = ['run', 'focusSearchInput']

const visibleCommands = [...allCommands.filter((cmd) => !excludedCommands.includes(cmd))]

export const useCommands = (all?: boolean) => {
  let list = $state.raw<AnyListen.Extension.Command[]>([])

  onMount(() => {
    const buildCommands = (resourceList: AnyListen.Extension.ResourceList): AnyListen.Extension.Command[] => {
      let cmds: AnyListen.Extension.Command[] = [
        ...(all ? allCommands : visibleCommands).map((cmd) => {
          const tKey = `command.${cmd}.desc`
          const desc = i18n.t(tKey as keyof Message)
          // i18n.t('command.desktopLyric.showToggle')
          return {
            extensionId: '',
            extensionName: '',
            fullCommand: cmd,
            command: cmd,
            name: i18n.t(`command.${cmd}`),
            description: desc === tKey ? undefined : desc,
          } satisfies AnyListen.Extension.Command
        }),
        ...resourceList.commands
          .filter((c) => !c.hidden)
          .map((cmd) => {
            return {
              ...cmd,
              command: `Extension: ${cmd.command}`,
              name: i18n.t('command.space.extension') + extI18n.t(cmd.extensionId, cmd.name),
              description: cmd.description ? extI18n.t(cmd.extensionId, cmd.description) : undefined,
              extensionName: extI18n.t(cmd.extensionId, cmd.extensionName),
            }
          }),
      ]
      return cmds
    }
    const unsub = resourceList.subscribe((res) => {
      list = buildCommands(res)
    })
    const unsub2 = extI18nMessageChangedEvent.on(() => {
      list = buildCommands(extensionState.resourceList)
    })

    return () => {
      unsub()
      unsub2()
    }
  })

  return {
    get val() {
      return list
    },
  }
}
