<script lang="ts">
  import Tab from '@/components/base/Tab.svelte'
  import { viewIcons, viewTypes } from './shared'
  import { i18n } from '@/plugins/i18n'
  import HeaderActions from './HeaderActions.svelte'
  let { activeview }: { activeview: (typeof viewTypes)[number] } = $props()
  const typeList = $derived(
    viewTypes.map((t) => {
      return { id: t, href: `/extenstion?type=${t}`, label: i18n.t(`extension__type_${t}`), icon: viewIcons[t] }
    })
  )
</script>

<header class="header">
  <Tab list={typeList} itemkey="id" itemlabel="label" itemicon="icon" value={activeview} tagname="a" href="href" />
  <HeaderActions />
</header>

<style lang="less">
  .header {
    display: flex;
    flex: none;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
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
