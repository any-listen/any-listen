<script lang="ts">
  import Cover from './Cover.svelte'
  import Info from './Info.svelte'
  // let { introend }: { introend: boolean } = $props()
</script>

<div class="left-info">
  <Cover />
  <Info />
</div>

<style lang="less">
  .left-info {
    flex: none;
    width: 50%;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    padding: 14px 15px 14px 20px;
    contain: strict;
    // transition: flex-basis @transition-normal;

    --content-with: 72%;
  }
</style>
