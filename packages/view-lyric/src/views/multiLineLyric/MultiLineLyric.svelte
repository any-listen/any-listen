<script lang="ts">
  import useWindowSize from '@/shared/compositions/useWindowSize'
  import Header from './Header/Header.svelte'
  import Main from './Main/Main.svelte'
</script>

<div class="container">
  <Header />
  <Main />
</div>
{#if import.meta.env.VITE_IS_DESKTOP && !import.meta.env.VITE_IS_WINDOWS}
  {@const { handleMouseDown, handleTouchDown } = useWindowSize()}
  <div
    role="presentation"
    class="resize resize-left"
    onmousedown={(event) => handleMouseDown('left', event)}
    ontouchstart={(event) => handleTouchDown('left', event)}
  ></div>
  <div
    role="presentation"
    class="resize resize-top"
    onmousedown={(event) => handleMouseDown('top', event)}
    ontouchstart={(event) => handleTouchDown('top', event)}
  ></div>
  <div
    role="presentation"
    class="resize resize-right"
    onmousedown={(event) => handleMouseDown('right', event)}
    ontouchstart={(event) => handleTouchDown('right', event)}
  ></div>
  <div
    role="presentation"
    class="resize resize-bottom"
    onmousedown={(event) => handleMouseDown('bottom', event)}
    ontouchstart={(event) => handleTouchDown('bottom', event)}
  ></div>
  <div
    role="presentation"
    class="resize resize-top-left"
    onmousedown={(event) => handleMouseDown('top-left', event)}
    ontouchstart={(event) => handleTouchDown('top-left', event)}
  ></div>
  <div
    role="presentation"
    class="resize resize-top-right"
    onmousedown={(event) => handleMouseDown('top-right', event)}
    ontouchstart={(event) => handleTouchDown('top-right', event)}
  ></div>
  <div
    role="presentation"
    class="resize resize-bottom-left"
    onmousedown={(event) => handleMouseDown('bottom-left', event)}
    ontouchstart={(event) => handleTouchDown('bottom-left', event)}
  ></div>
  <div
    role="presentation"
    class="resize resize-bottom-right"
    onmousedown={(event) => handleMouseDown('bottom-right', event)}
    ontouchstart={(event) => handleTouchDown('bottom-right', event)}
  ></div>
{/if}

<style lang="less">
  .container {
    display: flex;
    // flex: auto;
    flex-flow: column nowrap;
    height: 100%;

    &:hover {
      > :global(.header) {
        opacity: 1;
      }
    }

    :global {
      > .header {
        opacity: 0;
        transition: opacity @transition-fast;
      }
    }
  }
</style>
