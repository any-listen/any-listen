<script lang="ts">
  import ControlBtnsDesktop from './ControlBtnsDesktop.svelte'
  import ControlBtnsWeb from './ControlBtnsWeb.svelte'
</script>

<!-- <div class="container"> -->
<div class="btns">
  {#if import.meta.env.VITE_IS_DESKTOP}
    <ControlBtnsDesktop />
  {/if}
  {#if import.meta.env.VITE_IS_WEB}
    <ControlBtnsWeb />
  {/if}
</div>

<!-- </div> -->

<style lang="less">
  .container {
    position: relative;
    width: 100%;
    transition: opacity @transition-normal;
  }

  .btns {
    display: flex;
    flex-flow: row wrap;
    align-items: center;

    :global {
      .btn {
        min-height: 38px;
        padding: 0 10px;
        color: #fff;
        cursor: pointer;
        outline: none;
        background: none;
        border: none;
        transition: opacity @transition-normal;

        &:hover {
          opacity: 0.7;
        }
      }
    }
  }
</style>
