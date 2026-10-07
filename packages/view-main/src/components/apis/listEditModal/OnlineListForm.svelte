<script lang="ts">
  import { t } from '@/plugins/i18n'
  import { createUserList, editUserList } from './shared'
  import Input from '@/components/base/Input.svelte'
  import FormItem from './FormItem.svelte'
  import { resourceList } from '@/modules/extension/reactive.svelte'
  import { extT } from '@/modules/extension/i18n'
  import Checkbox from '@/components/base/Checkbox.svelte'

  let {
    item,
    targetId,
  }: {
    item?: AnyListen.List.OnlineListInfo | null
    targetId?: AnyListen.List.ParentId
  } = $props()

  const initData: AnyListen.List.OnlineListInfo = {
    id: '',
    name: '',
    parentId: null,
    type: 'online',
    meta: {
      createTime: 0,
      updateTime: 0,
      desc: '',
      playCount: 0,
      posTime: 0,
      extensionId: '',
      source: '',
      syncId: '',
      autoSync: false,
      syncTime: 0,
      pic: '',
      songCount: 0,
      sourceType: 'songlist',
    },
  }
  let listInfo = $state<AnyListen.List.OnlineListInfo>({
    ...initData,
    meta: { ...initData.meta },
  })

  let sourceName = $derived.by(() => {
    if (!listInfo.meta.source || !listInfo.meta.extensionId) return ''
    const ext = $resourceList.resources.songlist?.find((e) => e.id == listInfo.meta.source)
    if (!ext) return listInfo.meta.source
    return $extT(ext.extensionId, ext.name)
  })

  export const verify = () => {
    const name = listInfo.name.trim()
    if (!name.length || name.length > 30) {
      return false
    }
    return true
  }
  export const reset = () => {
    listInfo = {
      ...initData,
      meta: { ...initData.meta },
    }
  }
  export const submit = async () => {
    if (!verify()) return
    const info = $state.snapshot(listInfo)
    if (item) {
      await editUserList(info)
    } else {
      await createUserList({ ...info, parentId: targetId || null })
    }
  }

  $effect(() => {
    if (!item) return
    listInfo = {
      ...item,
      meta: { ...item.meta },
    }
  })
</script>

<main class="main">
  <Input autofocus placeholder={$t('edit_list_modal__form_list_name')} bind:value={listInfo.name} />
  <FormItem>
    <Checkbox
      id="auto_sync"
      checked={listInfo.meta.autoSync ?? false}
      onchange={(checked) => {
        listInfo.meta.autoSync = checked
      }}
      label={$t('edit_list_modal.online_list_form.auto_sync')}
    />
    <p class="tip">{$t('edit_list_modal.online_list_form.auto_sync_tip')}</p>
  </FormItem>
  <FormItem label={$t('edit_list_modal.online_list_form.source_type')}>
    <p>{$t(`edit_list_modal.online_list_form.source_type_${listInfo.meta.sourceType}`)}</p>
  </FormItem>
  <FormItem label={$t('edit_list_modal.online_list_form.source')}>
    <p>{sourceName}</p>
  </FormItem>
  <FormItem label={$t('edit_list_modal.online_list_form.sync_id')}>
    <p class="path code select">{listInfo.meta.syncId}</p>
  </FormItem>
</main>

<style lang="less">
  .main {
    display: flex;
    // flex: auto;
    // padding: 0 15px;
    // width: 320px;
    flex-flow: column nowrap;
    // min-height: 0;
    // max-height: 100%;
    // overflow: hidden;
    gap: 8px;
    p {
      font-size: 14px;
    }
  }
  .path {
    padding-right: 8px;
    font-size: 13px;
    // color: var(--color-primary);
  }
  .tip {
    // padding-left: 19px;
    font-size: 12px;
    opacity: 0.7;
  }
</style>
