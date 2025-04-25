<script lang="ts" generics="T">
  import Radio from '@/components/base/Radio.svelte'
  let {
    id,
    name,
    desc,
    value,
    checked,
    onselect,
  }: {
    id: string
    name: string
    desc?: string
    checked: boolean
    value: T
    onselect: (checked: T) => void
  } = $props()
  // let id = $derived(`${name}_${desc}_${f}`)

  let val = $state(false)

  $effect(() => {
    val = checked
  })
</script>

<div class="settings-item-radio">
  <Radio label={name} {value} {id} checked={val} {onselect} />
  {#if desc}
    <p class="settings-item-desc">{desc}</p>
  {/if}
</div>

<style lang="less">
  .settings-item-radio {
    display: inline-flex;
    margin-right: 12px;
    :global {
      .radio {
        font-size: 14px;
      }
    }
  }
  // .settings-item-title {
  //   font-size: 15px;
  // }
  .settings-item-desc {
    font-size: 12px;
    margin-top: -3px;
    margin-bottom: 6px;
    opacity: 0.7;
  }
</style>
