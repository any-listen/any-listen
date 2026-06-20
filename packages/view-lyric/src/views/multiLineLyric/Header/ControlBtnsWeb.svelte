<script lang="ts">
  import { t } from '@/plugins/i18n'
  // import { link, location } from '@/plugins/routes'
  // import { isFullscreen } from '@/store'
</script>

<div class="control"></div>

<style lang="less">
  .control {
    display: flex;
    flex: none;
    align-self: flex-start;
    height: 30px;

    .btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 30px;
      // outline: none;
      padding: 1px;
      color: var(--color-font-label);
      cursor: pointer;
      background: none;
      border: none;
      transition: background-color 0.2s ease-in-out;
      // &.active {
      //   background-color: var(--color-button-background-hover);
      // }
      &:hover {
        background-color: var(--color-button-background-hover);
        // &.min {
        //   background-color: var(--color-button-background-hover);
        // }
        &.close {
          background-color: var(--color-btn-close);
        }
      }
    }
  }

  // .svg {
  //   height: 16px;
  // }
</style>
