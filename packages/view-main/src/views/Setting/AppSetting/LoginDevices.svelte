<script lang="ts">
  import TitleContent from '../components/TitleContent.svelte'
  import Btn from '@/components/base/Btn.svelte'
  import { getLoginDevices, removeLoginDevice } from '@/modules/app/store/action'
  import { t } from '@/plugins/i18n'
  import { dateFormat } from '@/shared'
  import { onMount } from 'svelte'

  let list = $state.raw<Array<AnyListen.LoginDevice & { isCurrent: boolean }>>([])

  const iniList = () => {
    void getLoginDevices().then(({ list: l, currentId }) => {
      list = l
        .map((item) => {
          return {
            ...item,
            isCurrent: item.clientId == currentId,
          }
        })
        .toReversed()
    })
  }

  const removeSession = async (id: string) => {
    await removeLoginDevice(id)
    const newList = [...list]
    newList.splice(
      newList.findIndex((l) => l.clientId == id),
      1
    )
    list = newList
    iniList()
  }
  onMount(() => {
    iniList()
  })
</script>

<TitleContent name={$t('settings__security_login_devices')}>
  <div class="settings-login-devices">
    {#each list as item (item.clientId)}
      <div class="list-item">
        <div class="content">
          <div class="sub-row">
            <div class="id">
              {item.clientId}
            </div>
            <div class="ip code">
              {item.ip}
            </div>
          </div>
          <div class="time">
            {$t('login_devices_last_active')}
            <time class="code" title={new Date(item.lastActive).toLocaleString()}>
              {dateFormat(item.lastActive, 'Y-M-D h:m:s')}
            </time>
          </div>
          <div class="time">
            {$t('login_devices_create_time')}
            <time class="code" title={new Date(item.timestamp).toLocaleString()}>
              {dateFormat(item.timestamp, 'Y-M-D h:m:s')}
            </time>
          </div>
          <div class="ua code">
            {item.userAgent}
          </div>
        </div>
        <div class="btns">
          {#if item.isCurrent}
            <span class="current-session">{$t('login_devices_current_device')}</span>
          {:else}
            <Btn
              onclick={async () => {
                await removeSession(item.clientId)
              }}>{$t('btn_remove')}</Btn
            >
          {/if}
        </div>
      </div>
    {/each}
  </div>
</TitleContent>

<style lang="less">
  .settings-login-devices {
    display: flex;
    flex-flow: column nowrap;
    gap: 16px;
    margin-left: 16px;
    font-size: 14px;
  }
  .list-item {
    display: flex;
    flex-flow: row nowrap;
    padding: 12px;
    background-color: var(--color-primary-light-300-alpha-900);
    border-radius: @radius-border;
  }
  .content {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    gap: 6px;
    min-width: 0;
  }
  .sub-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .id {
    font-size: 13px;
  }
  .ip {
    user-select: text;
  }
  .time {
    display: flex;
    flex-direction: row;
    color: var(--color-font-label);
    time {
      color: var(--color-font);
    }
  }
  .ua {
    font-size: 12px;
    color: var(--color-font-label);
    user-select: text;
  }
  .btns {
    flex: none;
    align-self: center;
    padding-left: 12px;
  }
  .current-session {
    color: var(--color-primary);
  }
</style>
