<script lang="ts">
  import Image from '@/components/base/Image.svelte'
  import SvgIcon from '@/components/base/SvgIcon.svelte'
  import { i18n } from '@/plugins/i18n'
  import { extT } from '@/modules/extension/i18n'
  import ActionBtn from './ActionBtn.svelte'
  import { tooltip } from '@/components/apis/tooltips'

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
      <h3>{$extT(ext.id, ext.name)}</h3>
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
            <span aria-label={grant.label} data-ignore-tip use:tooltip><SvgIcon name={grant.icon} /></span>
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
      {/if}
    </div>
    <div class="right">
      <ActionBtn {ext} />
    </div>
  </div>
</li>

<style lang="less">
  .list-item {
    flex: 1;
    min-width: 300px;
    max-width: 440px;
    height: 100px;
    display: flex;
    flex-flow: column nowrap;
    padding: 10px;
    border-radius: @radius-border;
    gap: 6px;
    background-color: var(--color-primary-light-200-alpha-900);
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
    flex: auto;
    min-height: 0;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 10px;

    .left {
      height: 100%;
      aspect-ratio: 1;
      flex: none;
    }
    .right {
      flex: auto;
      height: 100%;
      min-width: 0;
      display: flex;
      flex-flow: column nowrap;
      gap: 2px;
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
        color: var(--color-font-label);
        .mixin-ellipsis-2();
        font-size: 12px;
      }
    }
  }
  .footer {
    flex: none;
    display: flex;
    gap: 10px;
    flex-flow: row nowrap;
    justify-content: space-between;
    .left {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      gap: 10px;
      min-width: 0;
      .grant {
        flex: none;
        display: flex;
        flex-flow: row nowrap;
        color: var(--color-primary-alpha-600);
        gap: 8px;
      }
      .author {
        color: var(--color-font-label);
        font-size: 12px;
        .auto-hidden();
      }
      .label {
        flex: none;
        max-width: 120px;
        color: var(--color-font-label);
        font-size: 12px;
        .auto-hidden();
      }
      .load-time {
        flex: none;
        color: var(--color-font-label);
        font-size: 12px;
      }
    }
    .right {
      flex: none;
      display: flex;
      flex-flow: row nowrap;
      font-size: 16px;
    }
  }
</style>
