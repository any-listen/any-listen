<script lang="ts">
  import Image from '@/components/base/Image.svelte'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { i18n, t } from '@/plugins/i18n'
  import { extensionList, useExtensionLatestVersion } from '@/modules/extension/reactive.svelte'
  import Btn from '@/components/base/Btn.svelte'
  import {
    disableExtension,
    enableExtension,
    uninstallExtension,
    getOnlineExtensionDetail,
  } from '@/modules/extension/store/actions'
  import Modal from '@/components/material/Modal.svelte'
  import { installOrUpdate } from './shared'
  import Aside from './Aside.svelte'
  import { tooltip } from '../tooltips/attach.svelte'
  import Loading from '@/components/base/Loading.svelte'
  import Tab from '@/components/base/Tab.svelte'
  import Readme from './Readme.svelte'
  import Contributes from './Contributes.svelte'
  import { generateIdSimple } from '@/shared'
  // import Content from './Contributes.svelte'

  let { onafterleave }: { onafterleave: () => void } = $props()

  let visible = $state(false)
  let ext: AnyListen.Extension.Extension | AnyListen.IPCExtension.RemoteOnlineDetail | null = $state.raw(null)
  let loadStats = $state({ loading: false, error: false, errorMessage: '' })

  let localExt = $derived($extensionList.find((e) => e.id == ext?.id))
  let latest = $derived.by(() => {
    if (!ext) return { val: false }
    return useExtensionLatestVersion(ext.id)
  })
  let info = $derived.by(() => {
    if (!ext) return null
    const version = /^\d/.test(ext.version) ? `v${ext.version}` : ext.version
    const grants = ext.grant?.map((g) => ({ id: g, icon: `ext_grant_${g}`, label: i18n.t(`extension__grant_${g}`) })) ?? []
    return { version, grants }
  })

  const tabList = $derived([
    { id: 'readme', label: $t('extension.detail_tab_readme') },
    { id: 'contributes', label: $t('extension.detail_tab_contributes') },
  ] as const)
  let tabValue = $state<(typeof tabList)[number]['id']>('readme')

  const closeModal = () => {
    visible = false
  }

  const handleInstall = async () => {
    if (!ext) return
    await installOrUpdate(ext)
  }

  const handleToggleEnable = () => {
    if (!ext) return
    if (localExt?.enabled) {
      void disableExtension(ext.id)
    } else {
      void enableExtension(ext.id)
    }
  }

  const handleUninstall = () => {
    if (!ext) return
    void uninstallExtension(ext.id)
    closeModal()
  }

  let extId: string | null = null
  let loadKey: string
  const loadExtensionDetail = async () => {
    if (!extId) return
    const key = generateIdSimple()
    loadKey = key
    loadStats = { loading: true, error: false, errorMessage: '' }
    try {
      const detail = await getOnlineExtensionDetail(extId)
      if (key != loadKey) return
      ext = detail
      loadStats.loading = false
    } catch (err) {
      console.log(err)
      if (key != loadKey) return
      loadStats = { loading: false, error: true, errorMessage: (err as Error).message }
    }
  }
  export const show = (_ext: AnyListen.Extension.Extension | AnyListen.IPCExtension.OnlineListItem) => {
    if ('internal' in _ext) {
      ext = _ext
      extId = null
      loadStats = { loading: false, error: false, errorMessage: '' }
    } else {
      ext = {
        ..._ext,
        grant: _ext.grant ?? [],
        contributes: {},
        main: '',
      } satisfies AnyListen.IPCExtension.RemoteOnlineDetail
      extId = _ext.id
      void loadExtensionDetail()
    }
    visible = true
  }
</script>

<Modal bind:visible teleport="#root" bgclose maxheight="84%" width="80%" {onafterleave} onclose={closeModal}>
  {#if ext}
    <main class="main">
      <div class="header">
        <div class="header__icon">
          <Image src={ext.icon} />
        </div>
        <div class="header__info">
          <h2 class="header__title" class:disabled={!localExt?.enabled}>{ext.name}</h2>
          <div class="header__meta">
            {#if ext.author}
              <span class="author">{ext.author}</span>
            {/if}
            <span class="version">{info!.version}</span>
            {#if localExt}
              <span style="flex: none;">
                {#if localExt.enabled}
                  <span class="status status--enabled">{$t('extension__type_enabled')}</span>
                {:else}
                  <span class="status status--disabled">{$t('extension__type_disabled')}</span>
                {/if}
              </span>
            {/if}
            {#if localExt?.errorMessage}
              <span
                class="error"
                aria-label={$t('extension.load_error', { msg: localExt.errorMessage })}
                data-ignore-tip
                {@attach tooltip()}
              >
                <SvgIcon name="warning" />
                <span>{localExt.errorMessage}</span>
              </span>
            {/if}
          </div>
        </div>
        <div class="header__action">
          {#if localExt}
            {#if !latest.val}
              <Btn onclick={handleInstall}>{$t('extension__action_update')}</Btn>
            {/if}
            <Btn onclick={handleToggleEnable}>
              {localExt.enabled ? $t('extension__action_disable') : $t('extension__action_enable')}
            </Btn>
            <Btn onclick={handleUninstall}>{$t('extension__action_uninstall')}</Btn>
          {:else}
            <Btn onclick={handleInstall}>{$t('extension__action_install')}</Btn>
          {/if}
        </div>
      </div>
      <div class="main">
        <div class="left">
          <Tab list={tabList} itemkey="id" itemlabel="label" bind:value={tabValue} />
          <div class="content">
            {#if tabValue == 'readme'}
              <Readme {ext} />
            {:else if tabValue == 'contributes'}
              <Contributes {ext} />
            {/if}
          </div>
          <Loading {...loadStats} onreload={loadExtensionDetail} />
        </div>
        <Aside {ext} {localExt} />
      </div>
    </main>
  {/if}
</Modal>

<style lang="less">
  main.main {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    // width: 80%;
    min-height: 0;
    padding: 0 15px 15px;
  }

  .header {
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    gap: 14px;
    align-items: center;
    padding: 15px 4px 12px;

    &__icon {
      flex: none;
      width: 56px;
      height: 56px;
      overflow: hidden;
      border-radius: 10px;
    }

    &__info {
      display: flex;
      flex: auto;
      flex-flow: column nowrap;
      // gap: 5px;
      min-width: 0;
    }

    &__title {
      margin: 0;
      font-size: 16px;
      color: var(--color-font);

      &.disabled {
        opacity: 0.5;
      }
    }

    &__meta {
      display: flex;
      flex-flow: row nowrap;
      // gap: 8px;
      align-items: center;
      color: var(--color-font-label);

      > span {
        font-size: 13px;
        &::before {
          margin: 0 10px;
          font-size: 1.2em;
          color: var(--color-font-label);
          content: '·';
          opacity: 0.5;
        }

        &:first-child::before {
          margin: 0;
          content: '';
        }
      }

      .status {
        flex: none;
        padding: 1px 6px;
        font-size: 12px;
        border-radius: 4px;
        &--enabled {
          color: var(--color-primary);
          background: var(--color-primary-light-100-alpha-800);
        }

        &--disabled {
          color: var(--color-font-label);
          background: var(--color-primary-dark-200-alpha-900);
        }
      }

      .error {
        display: flex;
        flex: auto;
        flex-flow: row nowrap;
        gap: 4px;
        align-items: center;
        min-width: 0;
        color: var(--color-font-error);
        :global(svg) {
          flex: none;
          width: 18px;
          height: 18px;
        }
        > span {
          .mixin-ellipsis-1();

          flex: auto;
          padding: 2px 0;
          font-size: 12px;
        }
      }
    }

    &__action {
      display: flex;
      flex: none;
      flex-direction: row;
      gap: 10px;
      margin: 14px 0 15px auto;

      :global(.btn) {
        min-width: 70px;
      }
    }
  }

  div.main {
    display: flex;
    flex-flow: row nowrap;
    min-height: 0;
  }
  .left {
    position: relative;
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-width: 0;
    border-right: 1px solid var(--color-border);
  }
  .content {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    min-height: 0;
    margin-top: 15px;
    overflow: hidden;
  }

  // .description {
  //   margin: 0;
  //   font-size: 0.9em;
  //   line-height: 1.5;
  //   color: var(--color-font-label);
  //   overflow-wrap: anywhere;
  // }
</style>
