<script>
  import Btn from '@/components/base/Btn.svelte'
  import Input from '@/components/base/Input.svelte'
  import { connectIPC } from '@/modules'
  import { appEvent } from '@/modules/app/store/event'
  import { t } from '@/plugins/i18n'
  import { onMount } from 'svelte'

  let value = $state('')
  let errorMessage = $state('')

  const handleSubmit = () => {
    errorMessage = ''
    connectIPC(value)
  }
  onMount(() => {
    return appEvent.on('connectFailed', (message) => {
      errorMessage = message
    })
  })
</script>

<div class="view-container container">
  <div class="login-content">
    <h2 class="login-title">Any Listen</h2>
    <form
      class="login-form"
      onsubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
    >
      <Input type="password" placeholder={$t('login_label')} bind:value />
      <Btn rawtype="submit">{$t('submit')}</Btn>
    </form>
    <p class="login-tip-message">{errorMessage}</p>
  </div>
</div>

<style lang="less">
  .container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .login-content {
    display: flex;
    flex-direction: column;
    max-width: 350px;
    // align-items: center;
    // justify-content: center;
  }
  .login-title {
    font-size: 20px;
    color: var(--color-primary-dark-300-alpha-200);
    text-align: center;
  }
  .login-form {
    margin-top: 26px;
    display: flex;
    flex-direction: row;
    width: 100%;
    // align-items: center;
    // justify-content: center;

    :global {
      .btn {
        height: 30px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        flex: none;
      }
      .input {
        height: 30px;
        flex: auto;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }
  .login-tip-message {
    margin-top: 10px;
    font-size: 14px;
    color: var(--color-font-label);
  }
</style>
