<script lang="ts">
  import { t } from '@/plugins/i18n'
  import TitleContent from '../components/TitleContent.svelte'
  import Textarea from '@/components/base/Textarea.svelte'
  import Btn from '@/components/base/Btn.svelte'
  import { useDislikeListRuleCount } from '@/modules/dislikeList/reactive.svelte'
  import Modal from '@/components/material/Modal.svelte'
  import { dislikeListState } from '@/modules/dislikeList/store/state'
  import { overwirteInfo } from '@/modules/dislikeList/actions'

  let dislikedCount = useDislikeListRuleCount()

  let visible = $state(false)
  let rules = $state('')

  const handleShow = async () => {
    rules = dislikeListState.rules.length ? `${dislikeListState.rules}\n` : dislikeListState.rules
    visible = true
  }
  const handleSave = async () => {
    if (rules.trim() != dislikeListState.rules.trim()) {
      await overwirteInfo(rules)
    }
    visible = false
  }
</script>

<TitleContent name={$t('settings.other.dislike_list')}>
  <div class="settings-item-content">
    <div class="gap-top">
      <p class="p">{$t('settings.other.dislike_list_count')}{dislikedCount.val}</p>
      <p class="p">
        <Btn min onclick={handleShow}>
          {$t('settings.other.dislike_list_manage')}
        </Btn>
      </p>
    </div>
    <Modal bind:visible teleport="#view" height="80%" bgclose={false}>
      <div class="main">
        <h2>{$t('settings.other.dislike_list_title')}</h2>
        <div class="content">
          <Textarea
            id="settings.other.dislike_list_input"
            value={rules}
            onchange={(val) => {
              rules = val
            }}
            placeholder={$t('settings.other.dislike_list_input_tip')}
          />
        </div>
      </div>
      <div class="footer">
        <div class="tips">{$t('settings.other.dislike_list_tips')}</div>
        <Btn onclick={handleSave}>{$t('settings.other.dislike_list_save_btn')}</Btn>
      </div>
    </Modal>
  </div>
</TitleContent>

<style lang="less">
  .main {
    display: flex;
    flex: auto;
    flex-flow: column nowrap;
    justify-content: center;
    h2 {
      margin: 20px;
      font-size: 16px;
      line-height: 1.3;
      color: var(--color-font);
      text-align: center;
    }
  }

  .content {
    display: flex;
    flex: auto;
    // min-height: 100px;
    max-height: 100%;
    padding: 0 15px;

    :global {
      textarea {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        resize: none;
      }
    }
  }

  .footer {
    box-sizing: border-box;
    // padding: 2px 0;
    display: flex;
    flex: none;
    gap: 15px;
    align-items: center;
    justify-content: space-between;
    // width: @width;
    padding: 15px;

    :global {
      button {
        min-width: 80px;
      }
    }
  }
  .tips {
    // padding: 10px 15px;
    font-size: 12px;
    line-height: 1.25;
    color: var(--color-550);
    white-space: pre-wrap;
  }
</style>
