<script lang="ts">
  import Btn from '@/components/base/Btn.svelte'
  import Image from '@/components/base/Image.svelte'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { i18n, t } from '@/plugins/i18n'
  import ActionBtnOnline from './ActionBtnOnline.svelte'
  import { extT } from '@/modules/extension/i18n'
  import { downloadAndParseExtension, updateExtension, installExtension } from '@/modules/extension/store/actions'
  import { showNotify } from '@/components/apis/notify'
  import { tooltip } from '@/components/apis/tooltips/attach.svelte'

  let { ext }: { ext: AnyListen.IPCExtension.OnlineListItem } = $props()
  let version = $derived(
    !ext.installed || ext.currentVersion == ext.version ? `v${ext.version}` : `v${ext.currentVersion} → v${ext.version}`
  )
  let grants = $derived(ext.grant?.map((g) => ({ id: g, icon: `ext_grant_${g}`, label: i18n.t(`extension__grant_${g}`) })) ?? [])
  const handleInstall = async (ext: AnyListen.IPCExtension.OnlineListItem, installed?: boolean) => {
    // TODO
    try {
      const tempExt = await downloadAndParseExtension(ext.download_url)
      if (installed) {
        await updateExtension(tempExt)
      } else {
        await installExtension(tempExt)
      }
    } catch (error) {
      console.error('Failed to install extension:', error)
      // Show an error message to the user
      showNotify(i18n.t('extension.install_failed', { name: ext.name, err: (error as Error).message }))
      return
    }
    showNotify(i18n.t('extension.install_success', { name: ext.name }))
  }
</script>

<li class="list-item" class:disabled={ext.installed && !ext.enabled}>
  <div class="top">
    <div class="left">
      <Image src={ext.icon} />
    </div>
    <div class="right">
      <h3>{ext.name}</h3>
      {#if ext.description}
        <p class="label">{$extT(ext.id, ext.description)}</p>
      {/if}
    </div>
  </div>
  <div class="footer">
    <div class="left">
      {#if grants.length}
        <div class="grant">
          {#each grants as grant (grant.id)}
            <span aria-label={grant.label} data-ignore-tip {@attach tooltip()}><SvgIcon name={grant.icon} /></span>
          {/each}
        </div>
      {/if}
      <p class="label" aria-label={version}>
        {version}
      </p>
      {#if ext.author}
        <p class="author">{ext.author}</p>
      {/if}
    </div>
    <div class="right">
      {#if ext.installed}
        {#if ext.currentVersion != ext.version}
          <Btn
            min
            onclick={async () => {
              await handleInstall(ext, true)
            }}
          >
            {ext.latest ? $t('extension__action_downgrade') : $t('extension__action_update')}
          </Btn>
        {/if}
        <ActionBtnOnline {ext} />
      {:else}
        <Btn
          min
          onclick={async () => {
            await handleInstall(ext)
          }}
        >
          {$t('extension__action_install')}
        </Btn>
      {/if}
    </div>
  </div>
</li>

<style lang="less">
  .list-item {
    display: flex;
    flex: 1;
    flex-flow: column nowrap;
    gap: 6px;
    min-width: 300px;
    max-width: 440px;
    height: 100px;
    padding: 10px;
    background-color: var(--color-primary-light-200-alpha-900);
    border-radius: @radius-border;
    transition: opacity @transition-normal;

    &.disabled {
      opacity: 0.6;
    }
    &:hover {
      opacity: 0.8;
      // background-color: var(--color-primary-light-500-alpha-900);
    }
  }
  .top {
    display: flex;
    flex: auto;
    flex-flow: row nowrap;
    gap: 10px;
    align-items: center;
    min-height: 0;

    .left {
      flex: none;
      height: 100%;
      aspect-ratio: 1;
    }
    .right {
      display: flex;
      flex: auto;
      flex-flow: column nowrap;
      gap: 2px;
      min-width: 0;
      height: 100%;
      // justify-content: space-between;
      // .title {
      //   display: flex;
      //   flex-flow: row nowrap;
      //   // align-items: flex-end;
      //   gap: 5px;
      //   justify-content: space-between;
      h3 {
        .auto-hidden();

        font-size: 14px;
      }
      //   p {
      //     flex: none;
      //   }
      // }
      .label {
        font-size: 12px;
        color: var(--color-font-label);
        .mixin-ellipsis-2();
      }
    }
  }
  .footer {
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    gap: 10px;
    justify-content: space-between;
    .left {
      display: flex;
      flex-flow: row nowrap;
      gap: 10px;
      align-items: center;
      min-width: 0;
      .grant {
        display: flex;
        flex: none;
        flex-flow: row nowrap;
        gap: 8px;
        color: var(--color-primary-alpha-600);
      }
      .author {
        font-size: 12px;
        color: var(--color-font-label);
        .auto-hidden();
      }
      .label {
        flex: none;
        max-width: 120px;
        font-size: 12px;
        color: var(--color-font-label);
        .auto-hidden();
      }
      // .load-time {
      //   flex: none;
      //   color: var(--color-font-label);
      //   font-size: 13px;
      // }
    }
    .right {
      display: flex;
      flex: none;
      flex-flow: row nowrap;
      gap: 10px;
      font-size: 16px;
    }
  }
</style>
