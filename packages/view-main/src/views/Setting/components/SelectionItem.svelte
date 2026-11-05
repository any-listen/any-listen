<script lang="ts" generics="T extends string | number">
  import Selection from '@/components/base/Selection.svelte'
  import TitleContent from './TitleContent.svelte'
  let {
    name,
    desc,
    value,
    list,
    disabled = false,
    onchange,
  }: {
    name: string
    desc?: string
    value: T
    list: Array<{ label: string; value: T }>
    disabled?: boolean
    onchange: (value: T) => void
  } = $props()
</script>

<TitleContent {name} {desc}>
  <div class="settings-item-selection">
    <Selection {value} {list} itemkey="value" itemname="label" {disabled} {onchange} />
  </div>
</TitleContent>

<style lang="less">
  .settings-item-selection {
    // :global {
    //   .select {
    //     // margin-top: 5px;
    //     // font-size: 14px;
    //   }
    // }
    margin-left: 16px;
  }
</style>
