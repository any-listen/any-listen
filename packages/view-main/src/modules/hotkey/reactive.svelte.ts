import { onMount } from 'svelte'

import { useCommands } from '../command/reactive.svelte'
import { hotkeyEvent } from './store/event'
import { hotkeyState } from './store/state'

export const useConfig = (type: 'local' | 'global') => {
  let keyConfig = $state.raw(hotkeyState.config[type].keys)
  let commands = useCommands(true)

  let config = $derived.by(() => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const cmds = new Map(commands.val.map((cmd) => [cmd.fullCommand, cmd]))
    return Object.entries(keyConfig).map(([key, cmd]) => [key, cmds.get(cmd)] as const)
  })

  onMount(() => {
    keyConfig = hotkeyState.config[type].keys
    return hotkeyEvent.on('configUpdated', (cfg) => {
      if (cfg.type != type) return
      keyConfig = cfg.config
    })
  })

  return {
    get val() {
      return config
    },
  }
}

export const useEnabled = (type: 'local' | 'global') => {
  let enabled = $state.raw(hotkeyState.config[type].enable)

  onMount(() => {
    enabled = hotkeyState.config[type].enable
    return hotkeyEvent.on('enableUpdated', (cfg) => {
      if (cfg.type != type) return
      enabled = cfg.enable
    })
  })

  return {
    get val() {
      return enabled
    },
  }
}
