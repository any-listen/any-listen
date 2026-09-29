<script lang="ts">
  let {
    command,
    active = false,
    onpick,
  }: {
    command: AnyListen.Extension.Command
    active?: boolean
    onpick: (command: string) => void
  } = $props()
</script>

<div
  role="presentation"
  class={['list-item', { active }]}
  onclick={() => {
    onpick(command.fullCommand)
  }}
>
  <div class="text-content">
    <span class="name" aria-label={command.name}>{command.name}</span>
    {#if command.description}
      <span class="desc" aria-label={command.description}>{command.description}</span>
    {/if}
  </div>
  <div class="label" aria-label={command.fullCommand}>
    <span>{command.fullCommand}</span>
  </div>
</div>

<style lang="less">
  .list-item {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 8px 10px;
    color: var(--color-font);
    text-align: left;
    cursor: pointer;
    border-radius: @radius-border;
    transition: background-color 0.2s ease;
    &:hover {
      background-color: var(--color-primary-background-hover);
    }
    &.active {
      background-color: var(--color-primary-background-active);
    }
  }
  .text-content {
    display: flex;
    flex: auto;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    overflow: hidden;
  }
  .name,
  .desc {
    .mixin-ellipsis-1;
  }
  .name {
    font-size: 13px;
  }
  .desc {
    font-size: 12px;
    color: var(--color-font-label);
  }
  .label {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 30%;
    max-width: 45%;
    height: 100%;
    font-size: 12px;
    color: var(--color-font-label);

    span {
      .mixin-ellipsis-1;
    }
  }
</style>
