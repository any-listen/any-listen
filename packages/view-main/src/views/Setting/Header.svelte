<script lang="ts">
  import Tab from '@/components/base/Tab.svelte'
  import { i18n } from '@/plugins/i18n'
  import { type ViewType, viewTypes } from './shared'
  import { useSettingValue } from '@/modules/setting/reactive.svelte'
  import { replace } from '@/plugins/routes'

  const { activeview }: { activeview: ViewType } = $props()
  let langId = useSettingValue('common.langId')
  const viewList = $derived.by(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    langId.val
    return viewTypes.map((t) => {
      // return { id: t, label: i18n.t(`settings__type_logs`) }
      return { id: t, label: i18n.t(`settings__type_${t}`) }
    })
  })
</script>

<header class="header">
  <Tab
    list={viewList}
    itemkey="id"
    itemlabel="label"
    value={activeview}
    onchange={(val) => {
      void replace(`/settings?type=${val}`)
    }}
  />
  <div id="online-header-right"></div>
</header>

<style lang="less">
  .header {
    flex: none;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    // padding: 8px 0;
    // background-color: var(--color-primary-light-400-alpha-800);
    // border-radius: @radius-border;

    // h2 {
    //   font-size: 18px;
    //   padding: 0 15px;
    // }
  }
</style>
