<script lang="ts">
  import Image from '@/components/base/Image.svelte'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { i18n, t } from '@/plugins/i18n'
  import { extT } from '@/modules/extension/i18n'
  import ActionBtn from './ActionBtn.svelte'
  import { tooltip } from '@/components/apis/tooltips/attach.svelte'

  let { ext }: { ext: AnyListen.Extension.Extension } = $props()
  let version = $derived(/^\d/.test(ext.version) ? `v${ext.version}` : ext.version)
  let grants = $derived(ext.grant.map((g) => ({ id: g, icon: `ext_grant_${g}`, label: i18n.t(`extension__grant_${g}`) })))
</script>

<li class="list-item" class:disabled={!ext.enabled}>
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
      <p class="label">{version}</p>
      {#if ext.author}
        <p class="author">{ext.author}</p>
      {/if}
      {#if ext.loaded}
        <p class="load-time">
          {ext.loadTimestamp}ms
        </p>
      {:else if ext.errorMessage}
        <p
          class="load-error"
          aria-label={$t('extension.load_error', { msg: ext.errorMessage })}
          data-ignore-tip
          {@attach tooltip()}
        >
          <SvgIcon name="error" />
          <span>{ext.errorMessage}</span>
        </p>
      {/if}
    </div>
    <div class="right">
      <ActionBtn {ext} />
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
      .load-time {
        flex: none;
        font-size: 12px;
        color: var(--color-font-label);
      }
      .load-error {
        flex-grow: 0;
        flex-shrink: 1;
        color: var(--color-font-error);
        .mixin-ellipsis-1();
        span {
          font-size: 12px;
        }
      }
    }
    .right {
      display: flex;
      flex: none;
      flex-flow: row nowrap;
      font-size: 16px;
    }
  }
</style>
