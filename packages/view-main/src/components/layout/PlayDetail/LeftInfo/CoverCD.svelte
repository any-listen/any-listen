<script lang="ts">
  import Image from '@/components/base/Image.svelte'
  import { musicInfo, playerPlaying } from '@/modules/player/reactive.svelte'
  import { onVisibilityChange } from '@any-listen/web'
  import { onMount } from 'svelte'

  // let { introend }: { introend: boolean } = $props()

  let pic = $derived($musicInfo.pic)
  let visible = $state(true)

  onMount(() => {
    return onVisibilityChange((hidden) => {
      visible = !hidden
    })
  })
</script>

<div class="cover">
  <span class="top-dot"></span>
  <span class="bottom-dot"></span>

  <svg class="cover-cd" class:playing={$playerPlaying && visible} viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <mask id="play-detail-cd-hole">
        <rect width="100" height="100" fill="white" />
        <circle cx="50" cy="50" r="11.6" fill="black" />
      </mask>
    </defs>

    <circle cx="50" cy="50" r="50" fill="var(--color-primary-light-300)" mask="url(#play-detail-cd-hole)" />
    <foreignObject style="mix-blend-mode: multiply" x="2" y="2" width="96" height="96" mask="url(#play-detail-cd-hole)">
      <Image src={pic} />
    </foreignObject>
    <circle
      cx="50"
      cy="50"
      r="20"
      style="mix-blend-mode: multiply"
      fill="var(--color-primary-light-300-alpha-600)"
      mask="url(#play-detail-cd-hole)"
    />
    <circle
      cx="50"
      cy="50"
      r="11"
      fill="none"
      stroke="var(--color-primary-light-200)"
      stroke-width="1.2"
      style="mix-blend-mode: exclusion"
      filter="drop-shadow(0 0 1 rgba(0,0,0,0.5))"
    />
    <circle cx="50" cy="50" r="11.6" fill="none" stroke="var(--color-primary-light-200)" stroke-width="0.4" />
  </svg>
</div>

<style lang="less">
  .cover {
    position: relative;
    flex: none;
    width: var(--content-width);
    aspect-ratio: 1 / 1;
    padding: 5%;
    contain: strict;
    background-color: var(--color-primary-light-300-alpha-800);
    border-radius: 6px;
    box-shadow: 0 0 6px var(--color-primary-alpha-500);
    // box-shadow: 0 0 6px var(--color-primary-alpha-500);
    // border-radius: 6px;
    opacity: 0.8;
    backdrop-filter: blur(4px);

    .mixin-dot(@color: var(--color-primary-light-300-alpha-800)) {
      .mixin-after();

      width: 7%;
      aspect-ratio: 1 / 1;
      background-color: @color;
      border-radius: 50%;
      box-shadow: inset 0 0 4px var(--color-primary-dark-300-alpha-800);
    }

    .top-dot {
      &::before {
        top: 5%;
        left: 5%;
        .mixin-dot();
      }
      &::after {
        top: 5%;
        right: 5%;
        .mixin-dot();
      }
    }
    .bottom-dot {
      &::before {
        bottom: 5%;
        left: 5%;
        .mixin-dot();
      }
      &::after {
        right: 5%;
        bottom: 5%;
        .mixin-dot();
      }
    }
  }
  .cover-cd {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow: 0 0 4px var(--color-primary-alpha-200);
    animation: spin 120s linear infinite;
    animation-play-state: paused; /* 默认暂停 */

    &.playing {
      animation-play-state: running;
    }

    :global(.pic) {
      border-radius: 50%;
      box-shadow: none;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
