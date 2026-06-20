<script lang="ts">
  import Header from './Header/Header.svelte'
  import Main from './Main/Main.svelte'
</script>

<div class="container">
  <Header />
  <Main />
</div>

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
