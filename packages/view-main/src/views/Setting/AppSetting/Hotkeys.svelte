<script lang="ts">
  import { onMount } from 'svelte'
  import type { HOTKEY_Type } from '@any-listen/common/hotKey'
  import { getHotKey, getHotkeyStatus, hotkeyConfigAction } from '@/shared/ipc/hotkey'
  import { hotkeyState } from '@/modules/hotkey/store/state'
  import { appState } from '@/modules/app/store/state'
  import { t } from '@/plugins/i18n'

  type Scope = 'local' | 'global'
  const names = ['player_toggle_play', 'player_prev', 'player_next', 'player_volume_up', 'player_volume_down', 'player_volume_mute', 'player_music_love', 'player_music_unlove', 'player_music_dislike', 'win_lyric_toggle_visible', 'win_lyric_toggle_lock', 'win_lyric_toggle_always_top'] as const satisfies readonly HOTKEY_Type[]
  let config = $state<AnyListen.HotKey.HotKeyConfigAll<HOTKEY_Type>>({ local: { enable: false, keys: {} }, global: { enable: false, keys: {} } })
  let failed = $state<string[]>([])
  let editing = $state('')
  let busy = $state(true)
  let error = $state('')
  let alive = true
  let editVersion = 0
  let suspension: Promise<boolean> = Promise.resolve(true)
  const keyFor = (scope: Scope, name: HOTKEY_Type) => Object.keys(config[scope].keys).find((key) => config[scope].keys[key] === name) ?? ''
  const format = (key: string) => key.replace('mod', appState.os === 'mac' ? 'Command' : 'Ctrl').replace('arrowleft', '←').replace('arrowright', '→').replace('arrowup', '↑').replace('arrowdown', '↓').split('+').map((part) => part.length <= 1 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)).join(' + ')
  const refreshStatus = async () => {
    const status = await getHotkeyStatus()
    failed = Array.from(status).filter(([, value]) => !value.status).map(([key]) => key)
  }
  const finish = async () => {
    const version = ++editVersion
    editing = ''
    try {
      await suspension
      if (version !== editVersion) return
      await hotkeyConfigAction({ action: 'tempDisable', data: false })
      await refreshStatus()
    } finally { if (version === editVersion) hotkeyState.isEditingHotKey = false }
  }
  const applyConfig = (value: typeof config) => { config = value; hotkeyState.config = value }
  const save = async (next: typeof config) => {
    busy = true
    error = ''
    try {
      await hotkeyConfigAction({ action: 'config', data: next })
      applyConfig(next)
      await refreshStatus()
    } catch (err) { error = String(err) }
    finally { busy = false }
  }
  const begin = (scope: Scope, name: HOTKEY_Type) => {
    ++editVersion
    hotkeyState.isEditingHotKey = true
    editing = `${scope  }:${  name}`
    error = ''
    suspension = hotkeyConfigAction({ action: 'tempDisable', data: true })
    void suspension.catch((err: unknown) => { error = String(err) })
  }
  const changeKey = async (scope: Scope, name: HOTKEY_Type, key: string) => {
    const other: Scope = scope === 'local' ? 'global' : 'local'
    if (key && ((config[scope].keys[key] && config[scope].keys[key] !== name) || config[other].keys[key])) {
      error = $t('hotkeys.conflict')
      return
    }
    await suspension
    const next = JSON.parse(JSON.stringify(config)) as typeof config
    next[scope].keys = Object.fromEntries(Object.entries(next[scope].keys).filter(([, action]) => action !== name))
    if (key) next[scope].keys[key] = name
    await save(next)
  }
  const record = async (event: KeyboardEvent, scope: Scope, name: HOTKEY_Type) => {
    if (event.key === 'Tab') return
    event.preventDefault()
    event.stopPropagation()
    if (busy || event.repeat || !editing) return
    if (event.key === 'Escape') { (event.target as HTMLInputElement).blur(); return }
    if (['Control', 'Alt', 'Meta', 'Shift'].includes(event.key)) return
    let key = ''
    if (!['Backspace', 'Delete'].includes(event.key)) {
      const parts: string[] = []
      if (event.ctrlKey) parts.push(appState.os === 'mac' ? 'ctrl' : 'mod')
      if (event.shiftKey) parts.push('shift')
      if (event.altKey) parts.push('alt')
      if (event.metaKey) parts.push(appState.os === 'mac' ? 'mod' : 'meta')
      parts.push(event.key === ' ' ? 'space' : (event.code.startsWith('Numpad') ? event.code.replace(/^Numpad(\w{1,3})\w*$/i, 'num$1') : event.key).toLowerCase())
      key = parts.join('+')
      if (key.endsWith('++')) { error = $t('hotkeys.invalid'); return }
    }
    await changeKey(scope, name, key)
  }
  onMount(() => {
    void getHotKey().then(async (value) => { if (alive) { config = value; await refreshStatus() } }).catch((err: unknown) => { error = String(err) }).finally(() => { busy = false })
    return () => { alive = false; void finish().catch(console.error) }
  })
</script>

<div class="hotkeys">
  <p>{$t('hotkeys.help')}</p>
  {#if error}<p role="alert" class="error">{error}</p>{/if}
  {#each ['local', 'global'] as rawScope (rawScope)}
    {@const scope = rawScope as Scope}
    <section>
      <h3>{$t(scope === 'local' ? 'hotkeys.local' : 'hotkeys.global')}</h3>
      <label class="enable"><input type="checkbox" checked={config[scope].enable} disabled={busy || !!editing} onchange={(event) => { const next = JSON.parse(JSON.stringify(config)) as typeof config; next[scope].enable = event.currentTarget.checked; void save(next) }} /> {$t('hotkeys.enable')}</label>
      <div class="grid">
        {#each names as name (name)}
          {@const key = keyFor(scope, name)}
          <label class="item">
            <span>{$t(`hotkeys.${name}`)}</span>
            <input aria-label={`${$t(scope === 'local' ? 'hotkeys.local' : 'hotkeys.global')} ${$t(`hotkeys.${name}`)}`} readonly disabled={!config[scope].enable} value={format(key)} placeholder={editing === `${scope  }:${  name}` ? $t('hotkeys.record') : $t('hotkeys.unset')} onfocus={() => begin(scope, name)} onblur={() => { void finish().catch((err: unknown) => { error = String(err) }) }} onkeydown={(event) => { void record(event, scope, name).catch((err: unknown) => { error = String(err) }) }} />
            {#if scope === 'global' && config.global.enable && key && failed.includes(key) && !editing}<small class="error">{$t('hotkeys.failed')}</small>{/if}
          </label>
        {/each}
      </div>
    </section>
  {/each}
</div>
<style lang="less">
  .hotkeys { padding: 0 0 20px; width: 100%; }
  p { line-height: 1.6; opacity: .8; margin-bottom: 16px; }
  section { margin-bottom: 28px; }
  h3 { margin-bottom: 12px; font-size: 16px; }
  .enable { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 18px 24px; }
  .item { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
  .item input {
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 5px 8px;
    font-size: 14px;
    color: var(--color-button-font);
    outline: none;
    background-color: var(--color-primary-background);
    border: none;
    border-radius: @form-radius;
    transition: background-color 0.2s ease;

    &:hover, &:focus { background-color: var(--color-primary-background-hover) !important; }
    &:active { background-color: var(--color-primary-background-active) !important; }
  }
  input[type="checkbox"] { accent-color: var(--color-primary); }
  input:disabled { opacity: .4; }
  .error { color: #e66b6b; }
</style>
