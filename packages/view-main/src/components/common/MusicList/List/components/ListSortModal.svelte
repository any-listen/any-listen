<script lang="ts">
  import Modal from '@/components/material/Modal.svelte'
  import type { ListInfo } from '../../type'
  import { i18n, t } from '@/plugins/i18n'
  import Radio from '@/components/base/Radio.svelte'
  import type { SortFieldName, SortFieldType } from '@/worker/main/list'
  import Btn from '@/components/base/Btn.svelte'
  import { getListMusics, updateListMusicsPosition } from '@/modules/musicLibrary/actions'
  import { workers } from '@/worker'
  let {
    visible = $bindable(),
    listinfo,
  }: {
    visible: boolean
    listinfo: ListInfo
  } = $props()
  type FileSortFieldName = 'fileCreateTime' | 'fileUpdateTime' | 'fileSize'
  type ExtendedSortFieldName = SortFieldName | FileSortFieldName
  let sortField = $state<ExtendedSortFieldName | ''>('')
  let sortType = $state<SortFieldType | ''>('')
  let disabledSortFislds = $derived(sortType == 'random')
  let sortFileTime = $state.raw<
    ((list: AnyListen.Music.MusicInfo[], type: AnyListen.List.SortFileType) => Promise<string[]>) | null
  >(null)

  const handleSortFieldSelect = (val: ExtendedSortFieldName) => {
    sortField = val
  }
  const handleSortTypeSelect = (val: SortFieldType) => {
    sortType = val
  }
  const closeModal = () => {
    visible = false
  }
  const verify = $derived(!!sortType && (!!sortField || sortType == 'random'))
  const handleSort = async () => {
    if (!verify) return
    if (sortType != 'random') {
      switch (sortField) {
        case 'fileCreateTime':
        case 'fileUpdateTime':
        case 'fileSize': {
          const st = sortType == 'up' ? 'asc' : 'desc'
          const stMap: Record<FileSortFieldName, AnyListen.List.SortFileType> = {
            fileCreateTime: `ctime_${st}`,
            fileUpdateTime: `mtime_${st}`,
            fileSize: `size_${st}`,
          }
          let ids = await sortFileTime!([...(await getListMusics(listinfo.id))], stMap[sortField])
          void updateListMusicsPosition({ listId: listinfo.id, position: 0, ids })
          closeModal()
          return
        }
        default:
          break
      }
    }
    // if (!await dialog.confirm({
    //   message: t('list_sort_modal_tip_confirm'),
    //   cancelButtonText: t('cancel_button_text'),
    //   confirmButtonText: t('confirm_button_text'),
    // })) return

    let list = await workers.main.sortListMusicInfo(
      [...(await getListMusics(listinfo.id))],
      sortType as SortFieldType,
      sortField as SortFieldName,
      i18n.locale
    )
    console.log(sortType, sortField)

    void updateListMusicsPosition({ listId: listinfo.id, position: 0, ids: list.map((m) => m.id) })
    closeModal()
  }

  $effect(() => {
    if (!visible) return
    sortField = ''
    sortType = ''
    sortFileTime = listinfo.getSortTimeFn ? listinfo.getSortTimeFn() : null
  })
</script>

<Modal bind:visible teleport="#view" bgclose>
  <main class="main">
    <div class="header">
      <h2>{listinfo.name}</h2>
    </div>
    <section>
      <h3 class="title">{$t('list_sort_modal_by_field')}</h3>
      <ul class="list">
        <li class="list-item">
          <Radio
            id="list_sort_modal_field_name"
            checked={sortField == 'name'}
            name="list_sort_modal_field"
            arialabel={$t('list_sort_modal_by_name')}
            value="name"
            disabled={disabledSortFislds}
            onselect={handleSortFieldSelect}
            label={$t('list_sort_modal_by_name')}
          />
        </li>
        <li class="list-item">
          <Radio
            id="list_sort_modal_field_singer"
            checked={sortField == 'singer'}
            name="list_sort_modal_field"
            value="singer"
            disabled={disabledSortFislds}
            onselect={handleSortFieldSelect}
            label={$t('list_sort_modal_by_singer')}
          />
        </li>
        <li class="list-item">
          <Radio
            id="list_sort_modal_field_album"
            checked={sortField == 'albumName'}
            name="list_sort_modal_field"
            value="albumName"
            disabled={disabledSortFislds}
            onselect={handleSortFieldSelect}
            label={$t('list_sort_modal_by_album')}
          />
        </li>
        <li class="list-item">
          <Radio
            id="list_sort_modal_field_time"
            checked={sortField == 'interval'}
            name="list_sort_modal_field"
            value="interval"
            disabled={disabledSortFislds}
            onselect={handleSortFieldSelect}
            label={$t('list_sort_modal_by_time')}
          />
        </li>
        <li class="list-item">
          <Radio
            id="list_sort_modal_field_ctime"
            checked={sortField == 'createTime'}
            name="list_sort_modal_field"
            value="createTime"
            disabled={disabledSortFislds}
            onselect={handleSortFieldSelect}
            label={$t('list_sort_modal_by_create_time')}
          />
        </li>
        <li class="list-item">
          <Radio
            id="list_sort_modal_field_uptime"
            checked={sortField == 'updateTime'}
            name="list_sort_modal_field"
            value="updateTime"
            disabled={disabledSortFislds}
            onselect={handleSortFieldSelect}
            label={$t('list_sort_modal_by_update_time')}
          />
        </li>
        {#if sortFileTime}
          <li class="list-item">
            <Radio
              id="list_sort_modal_field_fctime"
              checked={sortField == 'fileCreateTime'}
              name="list_sort_modal_field"
              value="fileCreateTime"
              disabled={disabledSortFislds}
              onselect={handleSortFieldSelect}
              label={$t('list_sort_modal_by_create_time_file')}
            />
          </li>
          <li class="list-item">
            <Radio
              id="list_sort_modal_field_futime"
              checked={sortField == 'fileUpdateTime'}
              name="list_sort_modal_field"
              value="fileUpdateTime"
              disabled={disabledSortFislds}
              onselect={handleSortFieldSelect}
              label={$t('list_sort_modal_by_update_time_file')}
            />
          </li>
          <li class="list-item">
            <Radio
              id="list_sort_modal_field_fsize"
              checked={sortField == 'fileSize'}
              name="list_sort_modal_field"
              value="fileSize"
              disabled={disabledSortFislds}
              onselect={handleSortFieldSelect}
              label={$t('list_sort_modal_by_file_size')}
            />
          </li>
        {/if}
      </ul>
    </section>
    <section>
      <h3 class="title">{$t('list_sort_modal_by_type')}</h3>
      <ul class="list">
        <li class="list-item">
          <Radio
            id="list_sort_modal_type_up"
            checked={sortType == 'up'}
            name="list_sort_modal_type"
            value="up"
            onselect={handleSortTypeSelect}
            label={$t('list_sort_modal_by_up')}
          />
        </li>
        <li class="list-item">
          <Radio
            id="list_sort_modal_type_down"
            checked={sortType == 'down'}
            name="list_sort_modal_type"
            value="down"
            onselect={handleSortTypeSelect}
            label={$t('list_sort_modal_by_down')}
          />
        </li>
        <li class="list-item">
          <Radio
            id="list_sort_modal_type_random"
            checked={sortType == 'random'}
            name="list_sort_modal_type"
            value="random"
            onselect={handleSortTypeSelect}
            label={$t('list_sort_modal_by_random')}
          />
        </li>
      </ul>
    </section>
    <div class="footer">
      <Btn onclick={closeModal}>{$t('btn_cancel')}</Btn>
      <Btn disabled={!verify} onclick={handleSort}>{$t('btn_confirm')}</Btn>
    </div>
  </main>
</Modal>

<style lang="less">
  .header {
    flex: none;
    padding: 15px;
    text-align: center;
    h2 {
      color: var(--color-font);
      word-break: break-all;
    }
  }

  .main {
    display: flex;
    flex-flow: column nowrap;
    width: 380px;
    min-height: 0;
    padding: 0 15px;
    // max-height: 100%;
    // overflow: hidden;
  }
  .title {
    padding: 10px 0 8px;
    font-size: 14px;
    color: var(--color-font-label);
  }
  .list {
    display: flex;
    flex-flow: row wrap;
    font-size: 14px;
  }
  .list-item {
    width: (100% / 3);
    padding-left: 10px;
    margin-bottom: 8px;
  }
  .footer {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin: 20px 0 15px auto;

    :global(.btn) {
      min-width: 70px;
    }
  }
</style>
