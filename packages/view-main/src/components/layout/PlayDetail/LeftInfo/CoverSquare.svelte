<script lang="ts">
  import Image from '@/components/base/Image.svelte'
  import { musicInfo } from '@/modules/player/reactive.svelte'

  // let { introend }: { introend: boolean } = $props()

  let pic = $derived($musicInfo.pic)
</script>

<div class="cover">
  <Image src={pic} />
</div>

<style lang="less">
  .cover {
    position: relative;
    flex: none;
    width: var(--content-width);
    aspect-ratio: 1 / 1;
    // box-shadow: 0 0 6px var(--color-primary-alpha-500);
    // border-radius: 6px;
    contain: strict;
    background-color: var(--color-primary-light-300-alpha-800);
    border: 1px solid var(--color-primary-alpha-800);
    border-radius: 6px;
    box-shadow: 0 0 6px var(--color-primary-dark-200-alpha-600);
    // opacity: 0.8;
    // backdrop-filter: blur(4px);

    :global {
      .pic {
        width: 100%;
        height: 100%;
        object-fit: cover;
        // border-radius: 50%;
        // mask-image: radial-gradient(circle, transparent 0%, transparent 16%, black 16%);
        &.empty-pic {
          background-color: var(--color-primary-light-300-alpha-700);
        }
      }
    }
  }
</style>
